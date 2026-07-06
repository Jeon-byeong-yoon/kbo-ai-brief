import datetime
from utils import logger, request_with_retry
from db import get_db_connection, get_team_mapping

# 네이버 KBO 팀 순위 통계 API
STANDINGS_API_URL = "https://api-gw.sports.naver.com/statistics/categories/kbo/seasons/{year}/teams"

def fetch_and_save_standings():
    current_year = datetime.datetime.now().year
    url = STANDINGS_API_URL.format(year=current_year)
    
    logger.info(f"🏆 네이버 API 기반 KBO 팀 순위 수집 시작 ({current_year} 시즌)...")
    
    # 1. API 데이터 가져오기
    try:
        response = request_with_retry(url)
        data = response.json()
    except Exception as e:
        logger.error(f"네이버 API 로드 실패: {e}")
        return
        
    team_stats = data.get("result", {}).get("seasonTeamStats", [])
    if not team_stats:
        logger.error("순위 데이터가 비어 있습니다.")
        return
        
    # DB 연결
    conn = get_db_connection()
    try:
        team_map = get_team_mapping(conn)
        standings_data = []
        
        for t in team_stats:
            team_short_name = t.get("teamShortName") # 예: "LG"
            
            rank = int(t.get("rank", 0))
            games_played = int(t.get("gameCount", 0))
            wins = int(t.get("won", 0))
            losses = int(t.get("lost", 0))
            draws = int(t.get("drawn", 0))
            win_rate = float(t.get("winRate", 0.0))
            
            # 게임차 (문자열이거나 수치)
            gb_val = t.get("gameBehind", 0.0)
            try:
                games_behind = float(gb_val)
            except:
                games_behind = 0.0
                
            # 최근 10경기 흐름 (네이버 API: "7승3패0무" 형태)
            last_10 = t.get("last10", "")
            if last_10:
                # 가독성을 위해 "7승3패0무" -> "7승3패" 또는 무승부가 있으면 "7승3패1무" 형태로 다듬기
                parts = last_10.split("무")
                w_l = parts[0]
                if len(parts) > 1 and parts[1] != "":
                    # 무승부가 0이 아니면 무승부 표시 유지
                    draw_cnt = int(parts[1].replace("무", "").strip() or 0)
                    if draw_cnt > 0:
                        last_10 = f"{w_l}무"
                    else:
                        last_10 = w_l # 0무면 "7승3패"
            
            team_id = team_map.get(team_short_name)
            if not team_id:
                logger.warning(f"팀 ID 매핑 누락: {team_short_name}")
                continue
                
            standings_data.append({
                "team_id": team_id,
                "season": current_year,
                "rank": rank,
                "games_played": games_played,
                "wins": wins,
                "losses": losses,
                "draws": draws,
                "win_rate": win_rate,
                "games_behind": games_behind,
                "last_10": last_10
            })
            
        # DB 저장 (Upsert)
        with conn.cursor() as cursor:
            for s in standings_data:
                sql = """
                    INSERT INTO standings (team_id, season, `rank`, games_played, wins, losses, draws, win_rate, games_behind, last_10, updated_at)
                    VALUES (%(team_id)s, %(season)s, %(rank)s, %(games_played)s, %(wins)s, %(losses)s, %(draws)s, %(win_rate)s, %(games_behind)s, %(last_10)s, NOW())
                    ON DUPLICATE KEY UPDATE
                        `rank` = VALUES(`rank`),
                        games_played = VALUES(games_played),
                        wins = VALUES(wins),
                        losses = VALUES(losses),
                        draws = VALUES(draws),
                        win_rate = VALUES(win_rate),
                        games_behind = VALUES(games_behind),
                        last_10 = VALUES(last_10),
                        updated_at = NOW()
                """
                cursor.execute(sql, s)
        conn.commit()
        logger.info(f"✅ KBO 팀 순위 {len(standings_data)}개 구단 동기화 완료")
        
    except Exception as e:
        logger.error(f"순위 DB 저장 오류: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    fetch_and_save_standings()
