import os
import urllib.parse
import pymysql
from dotenv import load_dotenv
from utils import logger

# 프로젝트 루트 경로의 .env.local 로드
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
env_path = os.path.join(base_dir, ".env.local")
if os.path.exists(env_path):
    load_dotenv(env_path)
else:
    load_dotenv() # .env 로드 fallback

def get_db_connection():
    """DATABASE_URL 환경 변수를 분석하여 pymysql connection 객체를 리턴"""
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        raise ValueError("DATABASE_URL 환경변수가 존재하지 않습니다.")
    
    # mysql://user:pass@host:port/db 파싱
    parsed = urllib.parse.urlparse(db_url)
    
    if parsed.scheme != "mysql":
        raise ValueError("MySQL DATABASE_URL 스키마가 아닙니다.")
        
    username = parsed.username
    password = parsed.password
    hostname = parsed.hostname
    port = parsed.port or 3306
    # /database_name 에서 첫 슬래시 제거
    db_name = parsed.path.lstrip("/")
    
    # 쿼리 스트링 제거 (ssl 등)
    if "?" in db_name:
        db_name = db_name.split("?")[0]

    return pymysql.connect(
        host=hostname,
        user=username,
        password=password,
        database=db_name,
        port=port,
        charset="utf8mb4",
        cursorclass=pymysql.cursors.DictCursor
    )

def get_team_mapping(conn):
    """팀 이름 -> ID 매핑 딕셔너리 리턴 (예: {'LG': 1, 'KIA': 10})"""
    with conn.cursor() as cursor:
        cursor.execute("SELECT id, name, short_name FROM teams")
        rows = cursor.fetchall()
        
        mapping = {}
        for row in rows:
            # KIA 타이거즈 -> 10, KIA -> 10 둘 다 매핑 가능하게 처리
            mapping[row['short_name']] = row['id']
            mapping[row['name']] = row['id']
        return mapping
