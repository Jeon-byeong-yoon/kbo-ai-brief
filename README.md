# ⚾ KBO AI Brief

> KBO 경기 정보 + AI 프리뷰/리뷰 웹앱

KBO 경기 데이터를 수집하고, 경기 전후에 AI가 관전 포인트와 경기 흐름을 요약해주는 **준실시간 KBO 경기 정보 웹앱**입니다.

개인 포트폴리오용 사이드 프로젝트입니다.

---

## 주요 기능

| 기능 | 설명 |
|---|---|
| 📅 오늘 경기 목록 | 오늘 열리는 KBO 경기 목록 및 실시간 상태 표시 |
| 🏆 팀 순위 | 현재 시즌 KBO 팀 순위 및 최근 10경기 흐름 |
| 🤖 AI 경기 프리뷰 | 경기 시작 전, AI가 관전 포인트 3개 + 변수 2개 요약 |
| 📊 AI 경기 리뷰 | 경기 종료 후, AI가 흐름·승부처·인상적인 활약 요약 |
| ⏱️ 준실시간 스코어 | 경기 중 2분 단위로 스코어 자동 갱신 |

---

## 기술 스택

| 레이어 | 기술 |
|---|---|
| 프론트엔드 | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| 백엔드 | Next.js API Routes |
| ORM | Prisma |
| 데이터베이스 | MySQL 8.0 (Docker) |
| AI | OpenAI API (gpt-4o-mini) |
| 크롤러 | Python (requests + BeautifulSoup) |

---

## 실행 방법

### 사전 준비

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) 설치
- Node.js 18+ 설치
- OpenAI API Key (없으면 더미 응답으로 동작)

### 로컬 실행

```bash
# 1. 환경변수 설정
cp .env.example .env.local
# .env.local에서 OPENAI_API_KEY 입력 (선택)

# 2. Docker MySQL 실행
docker compose up -d

# 3. 의존성 설치
npm install

# 4. DB 스키마 적용
npx prisma db push

# 5. 더미 데이터 삽입
npm run db:seed

# 6. 개발 서버 실행
npm run dev
```

브라우저에서 `http://localhost:3000` 접속

---

## 환경변수

`.env.example` 파일을 복사해서 `.env.local`을 만들고 아래 값을 설정하세요.

| 변수 | 설명 | 필수 |
|---|---|---|
| `DATABASE_URL` | MySQL 연결 URL | ✅ |
| `OPENAI_API_KEY` | OpenAI API Key | ❌ (없으면 더미 응답) |
| `OPENAI_MODEL` | 사용 모델 (기본: gpt-4o-mini) | ❌ |
| `NEXT_PUBLIC_POLL_INTERVAL` | 폴링 간격 ms (기본: 120000) | ❌ |

---

## API 엔드포인트

| 메서드 | 경로 | 설명 |
|---|---|---|
| GET | `/api/games/today` | 오늘 경기 목록 |
| GET | `/api/games/:id` | 경기 상세 정보 |
| GET | `/api/standings` | 팀 순위 |
| POST | `/api/games/:id/ai-preview` | AI 프리뷰 생성 |
| POST | `/api/games/:id/ai-review` | AI 리뷰 생성 |

---

## 프로젝트 구조

```
kbo-ai-brief/
├── docs/PLAN.md          # 전체 프로젝트 계획서
├── src/app/              # Next.js 페이지 & API Routes
├── src/components/       # UI 컴포넌트
├── src/lib/              # Prisma, OpenAI 클라이언트
├── src/types/            # TypeScript 타입 정의
├── prisma/               # DB 스키마 & 시드 데이터
├── crawler/              # Python 데이터 수집 스크립트
└── docker-compose.yml    # MySQL Docker 설정
```

---

## 로드맵

- [x] 프로젝트 초기 설정 (Next.js + Prisma + MySQL)
- [x] API 설계 및 구현
- [ ] 프론트엔드 UI 구현
- [ ] Python 크롤러 연결
- [ ] 실서비스 배포 (Vercel + Railway)
- [ ] 관심 팀 기능
- [ ] PWA 변환

---

## 라이선스

MIT License
