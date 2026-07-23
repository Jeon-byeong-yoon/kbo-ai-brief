import datetime
import json
from utils import logger, request_with_retry
from db import get_db_connection, get_team_mapping

NAVER_SCHEDULE_API = "https://api-gw.sports.naver.com/schedule/games"
NAVER_GAME_DETAIL_API = "https://api-gw.sports.naver.com/game"

def get_status_mapping(naver_state):
    if naver_state == "BEFORE":
        return "SCHEDULED"
    elif naver_state == "RUNNING":
        return "LIVE"
    elif naver_state == "AFTER":
        return "FINAL"
    elif "CANCEL" in naver_state or "POSTPONED" in naver_state:
        return "CANCELLED"
    return "SCHEDULED"

def parse_inning_scores(naver_inning_scores):
    """네이버 이닝 스코어 리스트를 파싱하여 {home: [], away: []} 형태로 리턴"""
    home_scores = []
    away_scores = []
    
    # 네이버 이닝 스코어 구조는 보통 [{inning: 1, homeScore: 2, awayScore: 1}, ...]
    for score in naver_inning_scores:
        h = score.get("homeScore")
        a = score.get("awayScore")
        # 경기가 취소되거나 이닝 점수가 공백이면 무시
        if h is not None and a is not None:
            home_scores.append(int(h))
            away_scores.append(int(a))
            
    return {"home": home_scores, "away": away_scores}

def update_live_scores():
    logger.info("⏱️ 준실시간 스코어 갱신 수집 시작...")
    
    today = datetime.date.today().strftime("%Y-%m-%d")
    
    # 1. 오늘 날짜의 네이버 일정 API 호출하여 실시간 gameId 목록 가져오기
    params = {
        "date": today,
        "upperCategoryId": "kbaseball"
    }
    
    try:
        response = request_with_retry(NAVER_SCHEDULE_API, params=params)
        data = response.json()
    except Exception as e:
        logger.error(f"네이버 API 호출 실패: {e}")
        return
        
    games_list = data.get("result", {}).get("games", [])
    # KBO 정규리그 경기만 추려내기
    today_games = [g for g in games_list if g.get("gameDate") == today and g.get("categoryId") == "kbo"]
    
    if not today_games:
        logger.info("오늘 예정된 KBO 경기가 없습니다.")
        return

    # DB 연결
    conn = get_db_connection()
    try:
        team_map = get_team_mapping(conn)
        
        for tg in today_games:
            game_id_str = tg.get("gameId") # 예: "20260706LGDOB0"
            away_team_name = tg.get("awayTeamName")
            home_team_name = tg.get("homeTeamName")
            
            away_team_id = team_map.get(away_team_name)
            home_team_id = team_map.get(home_team_name)
            
            if not away_team_id or not home_team_id:
                continue

            # 경기 시작 전인 경우 (상세 중계방이 아직 404를 내므로 상세 API 호출하지 않음)
            naver_state = tg.get("state", "BEFORE")
            if naver_state == "BEFORE":
                with conn.cursor() as cursor:
                    cursor.execute("""
                        UPDATE games 
                        SET status = 'SCHEDULED', updated_at = NOW()
                        WHERE game_date = %s AND home_team_id = %s AND away_team_id = %s
                    """, (today, home_team_id, away_team_id))
                logger.info(f"⏳ 경기 시작 전 상태 동기화 완료: {away_team_name} vs {home_team_name}")
                continue
                
            # 2. 개별 경기 상세 API 호출하여 실시간 상세 데이터 로드 (LIVE / FINAL 상태일 때만)
            detail_url = f"{NAVER_GAME_DETAIL_API}/{game_id_str}"
            try:
                detail_resp = request_with_retry(detail_url)
                detail_data = detail_resp.json()
            except Exception as e:
                logger.warning(f"경기 상세 조회 실패 ({game_id_str}): {e}")
                continue
                
            # 상세 데이터 파싱
            game_info = detail_data.get("result", {}).get("gameInfo", {})
            if not game_info:
                continue
                
            # 경기 상태 갱신
            status = get_status_mapping(game_info.get("state", "BEFORE"))
            current_inning = game_info.get("inning", "") # 예: "7회초"
            
            # 스코어, 안타, 에러, 볼넷 (기본 요약 스탯)
            # 네이버 상세 정보 내의 home, away 정보 파싱
            home_detail = game_info.get("home", {})
            away_detail = game_info.get("away", {})
            
            home_score = int(home_detail.get("score", 0) or 0)
            away_score = int(away_detail.get("score", 0) or 0)
            
            home_hits = int(home_detail.get("hit", 0) or 0)
            away_hits = int(away_detail.get("hit", 0) or 0)
            
            home_errors = int(home_detail.get("error", 0) or 0)
            away_errors = int(away_detail.get("error", 0) or 0)
            
            home_walks = int(home_detail.get("fourball", 0) or 0)
            away_walks = int(away_detail.get("fourball", 0) or 0)
            
            # 이닝별 점수 파싱
            inning_scores_raw = game_info.get("inningScores", [])
            parsed_scores = parse_inning_scores(inning_scores_raw)
            inning_scores_json = json.dumps(parsed_scores) if parsed_scores["home"] else None
            
            # DB Upsert (기존 경기가 있으면 정보 갱신)
            with conn.cursor() as cursor:
                # DB의 game 조회
                cursor.execute("""
                    SELECT id FROM games 
                    WHERE game_date = %s 
                      AND home_team_id = %s 
                      AND away_team_id = %s
                """, (today, home_team_id, away_team_id))
                existing_game = cursor.fetchone()
                
                if existing_game:
                    # 데이터 업데이트
                    update_sql = """
                        UPDATE games 
                        SET status = %s,
                            current_inning = %s,
                            home_score = %s,
                            away_score = %s,
                            home_hits = %s,
                            away_hits = %s,
                            home_errors = %s,
                            away_errors = %s,
                            home_walks = %s,
                            away_walks = %s,
                            inning_scores = %s,
                            last_updated_at = NOW(),
                            updated_at = NOW()
                        WHERE id = %s
                    """
                    cursor.execute(update_sql, (
                        status, current_inning, home_score, away_score,
                        home_hits, away_hits, home_errors, away_errors,
                        home_walks, away_walks, inning_scores_json,
                        existing_game["id"]
                    ))
                    logger.info(f"⚡ 실시간 스코어 동기화 완료 (ID: {existing_game['id']}): "
                                f"{away_team_name} {away_score} - {home_score} {home_team_name} | 이닝: {current_inning}")
                else:
                    # 만약 스케줄러 누락으로 경기가 없으면 신규 추가
                    insert_sql = """
                        INSERT INTO games (
                            game_date, start_time, stadium, home_team_id, away_team_id, status,
                            current_inning, home_score, away_score, home_hits, away_hits,
                            home_errors, away_errors, home_walks, away_walks, inning_scores,
                            last_updated_at, created_at, updated_at
                        ) VALUES (
                            %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW(), NOW()
                        )
                    """
                    cursor.execute(insert_sql, (
                        today, tg.get("gameTime", "18:30"), tg.get("stadium", "잠실"),
                        home_team_id, away_team_id, status, current_inning,
                        home_score, away_score, home_hits, away_hits,
                        home_errors, away_errors, home_walks, away_walks,
                        inning_scores_json
                    ))
                    logger.info(f"🆕 새로운 경기 발견 및 실시간 갱신: {away_team_name} vs {home_team_name}")
                    
        conn.commit()
        logger.info("✅ 준실시간 스코어 갱신 완료")
        
    except Exception as e:
        logger.error(f"실시간 갱신 처리 실패: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    update_live_scores()
