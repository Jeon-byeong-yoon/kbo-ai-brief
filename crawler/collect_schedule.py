import datetime
import json
from utils import logger, request_with_retry
from db import get_db_connection, get_team_mapping

NAVER_SCHEDULE_API = "https://api-gw.sports.naver.com/schedule/games"

def fetch_and_save_schedule(target_date=None):
    """특정 날짜(YYYY-MM-DD) 또는 오늘 날짜의 경기 일정을 수집하고 DB에 저장"""
    if target_date is None:
        target_date = datetime.date.today().strftime("%Y-%m-%d")
        
    logger.info(f"📅 KBO 경기 일정 수집 시작 ({target_date})...")
    
    # 1. 네이버 야구 일정 API 호출
    params = {
        "date": target_date,
        "upperCategoryId": "kbaseball"
    }
    
    try:
        response = request_with_retry(NAVER_SCHEDULE_API, params=params)
        data = response.json()
    except Exception as e:
        logger.error(f"네이버 API 호출 실패: {e}")
        return

    # 2. 경기 데이터 파싱 및 필터링
    games_list = data.get("result", {}).get("games", [])
    if not games_list:
        logger.info(f"{target_date} 해당 날짜에 등록된 경기 일정이 없습니다.")
        return

    # DB 연결
    conn = get_db_connection()
    try:
        team_map = get_team_mapping(conn)
        target_games = []
        
        for game in games_list:
            # gameDate는 '2026-07-06' 포맷
            game_date_str = game.get("gameDate")
            if game_date_str != target_date:
                continue # 대상 날짜 경기만 필터링
                
            # KBO 한국 프로야구 정규리그 경기만 필터링 (해외야구, 친선전, 타스포츠 스킵)
            if game.get("categoryId") != "kbo":
                continue
                
            game_id_str = game.get("gameId") # 예: "20260706LGDOB0"
            start_time = game.get("gameTime", "18:30")
            stadium = game.get("stadium", "잠실")
            
            away_team_name = game.get("awayTeamName")
            home_team_name = game.get("homeTeamName")
            
            away_team_id = team_map.get(away_team_name)
            home_team_id = team_map.get(home_team_name)
            
            if not away_team_id or not home_team_id:
                logger.warning(f"팀 ID 매핑 누락: Away={away_team_name}({away_team_id}), Home={home_team_name}({home_team_id})")
                continue
                
            # 상태 변환
            naver_state = game.get("state", "BEFORE")
            if naver_state == "BEFORE":
                status = "SCHEDULED"
            elif naver_state == "RUNNING":
                status = "LIVE"
            elif naver_state == "AFTER":
                status = "FINAL"
            elif "CANCEL" in naver_state or "POSTPONED" in naver_state:
                status = "CANCELLED"
            else:
                status = "SCHEDULED"
                
            home_score = int(game.get("homeTeamScore", 0) or 0)
            away_score = int(game.get("awayTeamScore", 0) or 0)
            
            target_games.append({
                "game_date": game_date_str,
                "start_time": start_time,
                "stadium": stadium,
                "home_team_id": home_team_id,
                "away_team_id": away_team_id,
                "status": status,
                "home_score": home_score,
                "away_score": away_score
            })
            
        logger.info(f"파싱 완료: {len(target_games)}개 경기 대상")
        
        # 3. DB 저장
        with conn.cursor() as cursor:
            for g in target_games:
                # 동일한 날짜에 동일 매치업이 있는지 조회
                select_sql = """
                    SELECT id FROM games 
                    WHERE game_date = %(game_date)s 
                      AND home_team_id = %(home_team_id)s 
                      AND away_team_id = %(away_team_id)s
                """
                cursor.execute(select_sql, g)
                existing = cursor.fetchone()
                
                if existing:
                    # 기존 경기가 존재하면 상태와 점수 업데이트
                    update_sql = """
                        UPDATE games 
                        SET status = %(status)s,
                            home_score = %(home_score)s,
                            away_score = %(away_score)s,
                            updated_at = NOW()
                        WHERE id = %s
                    """
                    cursor.execute(update_sql, (g["status"], g["home_score"], g["away_score"], existing["id"]))
                    logger.info(f"🔄 기존 경기 업데이트 (ID: {existing['id']}): {g['away_team_id']} vs {g['home_team_id']}")
                else:
                    # 신규 등록
                    insert_sql = """
                        INSERT INTO games (game_date, start_time, stadium, home_team_id, away_team_id, status, home_score, away_score, created_at, updated_at)
                        VALUES (%(game_date)s, %(start_time)s, %(stadium)s, %(home_team_id)s, %(away_team_id)s, %(status)s, %(home_score)s, %(away_score)s, NOW(), NOW())
                    """
                    cursor.execute(insert_sql, g)
                    logger.info(f"🆕 신규 경기 일정 등록: {g['away_team_id']} vs {g['home_team_id']}")
                    
        conn.commit()
        logger.info(f"✅ 경기 일정 {len(target_games)}건 저장 완료")
        
    except Exception as e:
        logger.error(f"경기 일정 DB 저장 오류: {e}")
        conn.rollback()
    finally:
        conn.close()

import sys

if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else None
    fetch_and_save_schedule(target)
