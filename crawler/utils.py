import time
import logging
import requests

# 로깅 설정
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("kbo_crawler")

# 공통 HTTP Headers
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
    "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
}

def request_with_retry(url, method="GET", params=None, json_data=None, retries=3, backoff_in_seconds=2):
    """지수 백오프를 사용하는 HTTP 요청 헬퍼"""
    for i in range(retries):
        try:
            if method.upper() == "GET":
                response = requests.get(url, headers=HEADERS, params=params, timeout=10)
            else:
                response = requests.post(url, headers=HEADERS, json=json_data, timeout=10)
            
            response.raise_for_status()
            return response
        except Exception as e:
            if i == retries - 1:
                logger.error(f"HTTP 요청 실패: {url} | 에러: {e}")
                raise e
            sleep_time = backoff_in_seconds * (2 ** i)
            logger.warn(f"요청 실패 ({e}). {sleep_time}초 후 재시도합니다... ({i+1}/{retries})")
            time.sleep(sleep_time)
