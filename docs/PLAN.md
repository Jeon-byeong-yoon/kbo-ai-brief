# KBO AI Brief — 전체 프로젝트 계획서

> **프로젝트명**: KBO AI Brief  
> **버전**: v1.0  
> **작성일**: 2026-07-06  
> **목적**: KBO 경기 데이터 + AI 프리뷰/리뷰 웹앱 MVP 구축  
> **성격**: 개인 포트폴리오용 사이드 프로젝트

---

## 목차

1. [프로젝트 목표](#1-프로젝트-목표)
2. [기술 스택](#2-기술-스택)
3. [디렉토리 구조](#3-디렉토리-구조)
4. [데이터베이스 설계](#4-데이터베이스-설계)
5. [API 설계](#5-api-설계)
6. [프론트엔드 화면 구조](#6-프론트엔드-화면-구조)
7. [디자인 시스템](#7-디자인-시스템)
8. [Python 크롤러 구조](#8-python-크롤러-구조)
9. [단계별 작업 계획](#9-단계별-작업-계획)
10. [실행 방법](#10-실행-방법)
11. [MVP 이후 확장 계획](#11-mvp-이후-확장-계획)

---

## 1. 프로젝트 목표

### 핵심 컨셉

| 기능 | 설명 |
|---|---|
| 오늘 경기 목록 | 오늘 열리는 KBO 경기 목록 표시 |
| 팀 순위 | 현재 시즌 KBO 팀 순위 및 최근 흐름 |
| AI 프리뷰 | 경기 시작 전, AI가 관전 포인트 요약 |
| AI 리뷰 | 경기 종료 후, AI가 흐름과 승부처 요약 |
| 준실시간 스코어 | 실시간 중계 대신 2분 단위 스코어 갱신 |

### MVP 완료 기준

- [ ] 오늘 경기 목록이 보인다
- [ ] 팀 순위가 보인다
- [ ] 경기 상세 화면이 있다
- [ ] AI 경기 프리뷰를 생성하고 저장할 수 있다
- [ ] 경기 종료 후 AI 리뷰를 생성하고 저장할 수 있다
- [ ] 경기 중 스코어를 2분 단위로 갱신하는 구조가 있다
- [ ] 모든 데이터는 DB를 거쳐 프론트에 표시된다

### MVP에서 제외하는 기능

- 실시간 타석별 / 투구별 데이터
- 볼카운트, 구종, 구속, 타구 방향
- 직접 머신러닝 모델 학습
- 관심 팀 / 선수 검색

---

## 2. 기술 스택

### 프론트엔드

| 기술 | 용도 |
|---|---|
| Next.js 14 (App Router) | 프레임워크 |
| TypeScript | 타입 안전성 |
| Tailwind CSS | 스타일링 |

### 백엔드

| 기술 | 용도 |
|---|---|
| Next.js API Routes | REST API |
| Prisma ORM | DB 연결 |

### 데이터베이스

| 기술 | 용도 |
|---|---|
| MySQL 8.0 | 메인 DB |
| Docker Compose | 로컬 개발 환경 |

### AI

| 기술 | 용도 |
|---|---|
| OpenAI API (gpt-4o-mini) | 텍스트 요약/분석 |
| DB 캐싱 | AI 응답 재사용으로 비용 절감 |

### 데이터 수집

| 기술 | 용도 |
|---|---|
| Python + requests | HTTP 요청 |
| BeautifulSoup | HTML 파싱 |
| Playwright (선택) | 동적 렌더링 페이지 |

### 배포 (MVP 이후)

| 서비스 | 용도 |
|---|---|
| Vercel | 프론트엔드 |
| Railway | MySQL |

---

## 3. 디렉토리 구조

```
kbo-ai-brief/
├── docs/                               ← 프로젝트 문서 (현재 파일 위치)
│   ├── PLAN.md                         ← 전체 계획서 (이 파일)
│   ├── DB_DESIGN.md                    ← DB 설계 상세
│   ├── API_DESIGN.md                   ← API 설계 상세
│   └── CRAWLER.md                      ← 크롤러 설계
├── src/
│   ├── app/
│   │   ├── page.tsx                    # 홈 화면 (/)
│   │   ├── layout.tsx                  # 루트 레이아웃
│   │   ├── globals.css                 # 글로벌 스타일
│   │   ├── games/
│   │   │   └── [id]/
│   │   │       └── page.tsx            # 경기 상세 (/games/:id)
│   │   ├── standings/
│   │   │   └── page.tsx                # 팀 순위 (/standings)
│   │   └── api/
│   │       ├── games/
│   │       │   ├── today/
│   │       │   │   └── route.ts        # GET /api/games/today ✅
│   │       │   └── [id]/
│   │       │       ├── route.ts        # GET /api/games/:id ✅
│   │       │       ├── ai-preview/
│   │       │       │   └── route.ts    # POST /api/games/:id/ai-preview ✅
│   │       │       └── ai-review/
│   │       │           └── route.ts    # POST /api/games/:id/ai-review ✅
│   │       └── standings/
│   │           └── route.ts            # GET /api/standings ✅
│   ├── components/
│   │   ├── ui/
│   │   │   ├── StatusBadge.tsx         # 경기 상태 배지
│   │   │   ├── TeamLogo.tsx            # 팀 로고/약칭
│   │   │   └── LoadingSpinner.tsx      # 로딩 스피너
│   │   ├── game/
│   │   │   ├── GameCard.tsx            # 경기 카드 (홈 화면)
│   │   │   ├── ScoreBoard.tsx          # 큰 스코어 표시
│   │   │   ├── InningScoreTable.tsx    # 이닝별 점수표
│   │   │   └── AiContent.tsx           # AI 프리뷰/리뷰 섹션
│   │   └── standings/
│   │       └── StandingsTable.tsx      # 순위표
│   ├── lib/
│   │   ├── prisma.ts                   # Prisma 싱글톤 ✅
│   │   └── openai.ts                   # OpenAI 싱글톤 ✅
│   └── types/
│       └── index.ts                    # 도메인 타입 정의 ✅
├── prisma/
│   ├── schema.prisma                   # DB 스키마 ✅
│   └── seed.ts                         # 더미 데이터 ✅
├── crawler/
│   ├── db.py                           # MySQL 연결
│   ├── utils.py                        # 공통 유틸
│   ├── collect_schedule.py             # 경기 일정 수집
│   ├── collect_standings.py            # 팀 순위 수집
│   ├── collect_game_scores.py          # 경기 중 스코어 갱신
│   └── requirements.txt
├── docker/
│   └── mysql/
│       └── init.sql                    # DB 초기화 ✅
├── docker-compose.yml                  # MySQL Docker 설정 ✅
├── .env.local                          # 환경변수 (git 제외) ✅
├── .env.example                        # 환경변수 예시 ✅
└── README.md                           # 프로젝트 소개 (예정)
```

> ✅ = 구현 완료

---

## 4. 데이터베이스 설계

### teams

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | INT PK AUTO_INCREMENT | 팀 ID |
| name | VARCHAR(50) | 팀 풀네임 (예: LG 트윈스) |
| short_name | VARCHAR(10) | 줄임 이름 (예: LG) |
| logo_url | VARCHAR(255) NULL | 팀 로고 URL |
| created_at | DATETIME | 생성일 |
| updated_at | DATETIME | 수정일 |

### games

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | INT PK AUTO_INCREMENT | 경기 ID |
| game_date | DATE | 경기 날짜 |
| start_time | VARCHAR(10) | 시작 시간 (예: 18:30) |
| stadium | VARCHAR(100) | 구장명 |
| home_team_id | INT FK → teams | 홈팀 |
| away_team_id | INT FK → teams | 원정팀 |
| status | ENUM | SCHEDULED / LIVE / FINAL / CANCELLED / POSTPONED |
| current_inning | VARCHAR(20) NULL | 현재 이닝 (예: 7회초) |
| home_score | INT DEFAULT 0 | 홈팀 점수 |
| away_score | INT DEFAULT 0 | 원정팀 점수 |
| home_hits | INT DEFAULT 0 | 홈팀 안타 |
| away_hits | INT DEFAULT 0 | 원정팀 안타 |
| home_errors | INT DEFAULT 0 | 홈팀 실책 |
| away_errors | INT DEFAULT 0 | 원정팀 실책 |
| home_walks | INT DEFAULT 0 | 홈팀 볼넷 |
| away_walks | INT DEFAULT 0 | 원정팀 볼넷 |
| inning_scores | JSON NULL | 이닝별 점수 `{home:[],away:[]}` |
| last_updated_at | DATETIME NULL | 마지막 갱신 시각 |
| created_at | DATETIME | 생성일 |
| updated_at | DATETIME | 수정일 |

### standings

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | INT PK AUTO_INCREMENT | |
| team_id | INT FK UNIQUE(team_id, season) | 팀 |
| season | INT | 시즌 연도 |
| rank | INT | 순위 |
| games_played | INT | 경기 수 |
| wins | INT | 승 |
| losses | INT | 패 |
| draws | INT | 무 |
| win_rate | FLOAT | 승률 |
| games_behind | FLOAT | 게임차 |
| last_10 | VARCHAR(30) NULL | 최근 10경기 (예: 6승3패1무) |
| created_at / updated_at | DATETIME | |

### team_stats

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | INT PK AUTO_INCREMENT | |
| team_id | INT FK UNIQUE(team_id, season) | 팀 |
| season | INT | 시즌 |
| batting_average | FLOAT | 팀 타율 |
| era | FLOAT | 팀 평균자책점 |
| runs | INT | 득점 |
| hits | INT | 안타 |
| home_runs | INT | 홈런 |
| stolen_bases | INT | 도루 |

### ai_previews / ai_reviews

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | INT PK AUTO_INCREMENT | |
| game_id | INT FK UNIQUE | 경기 (game당 1개) |
| content | TEXT | JSON 형태 AI 응답 |
| model_name | VARCHAR(50) | 사용 모델명 |
| generated_at | DATETIME | 생성 시각 |
| created_at / updated_at | DATETIME | |

---

## 5. API 설계

### `GET /api/games/today`

오늘 날짜 기준 경기 목록 반환

**응답 예시**
```json
{
  "date": "2026-07-06",
  "games": [
    {
      "id": 1,
      "gameDate": "2026-07-06",
      "startTime": "14:00",
      "stadium": "광주-기아 챔피언스 필드",
      "homeTeam": { "id": 10, "name": "KIA 타이거즈", "shortName": "KIA", "logoUrl": null },
      "awayTeam": { "id": 9, "name": "삼성 라이온즈", "shortName": "삼성", "logoUrl": null },
      "status": "FINAL",
      "currentInning": "경기 종료",
      "homeScore": 7,
      "awayScore": 3,
      "lastUpdatedAt": "2026-07-06T08:45:00.000Z",
      "hasAiPreview": false,
      "hasAiReview": true
    }
  ]
}
```

---

### `GET /api/games/:id`

특정 경기 상세 + 팀 순위 + AI 프리뷰/리뷰

**추가 반환 필드**
- `homeHits`, `awayHits`, `homeErrors`, `awayErrors`, `homeWalks`, `awayWalks`
- `inningScores: { home: number[], away: number[] }`
- `homeStanding`, `awayStanding` (팀 순위 정보)
- `aiPreview`, `aiReview` (AI 내용, null이면 미생성)

---

### `GET /api/standings`

현재 시즌 팀 순위 반환

**응답 예시**
```json
{
  "season": 2026,
  "standings": [
    {
      "rank": 1,
      "team": { "id": 10, "name": "KIA 타이거즈", "shortName": "KIA" },
      "gamesPlayed": 70,
      "wins": 42,
      "losses": 27,
      "draws": 1,
      "winRate": 0.609,
      "gamesBehind": 0,
      "last10": "7승3패"
    }
  ]
}
```

---

### `POST /api/games/:id/ai-preview`

AI 경기 프리뷰 생성

| 동작 | 조건 |
|---|---|
| DB 캐시 반환 | 이미 생성된 프리뷰가 있을 때 |
| 새로 생성 | 프리뷰가 없거나 `?force=true` |
| 오류 | 경기 상태가 FINAL일 때 |
| fallback | OpenAI 키 미설정 시 더미 응답 반환 |

**AI 응답 JSON 구조**
```json
{
  "summary": "경기 한줄 요약",
  "watchPoints": ["관전포인트1", "관전포인트2", "관전포인트3"],
  "variables": ["변수1", "변수2"],
  "watchPlayer": "오늘 경기에서 주목할 선수 또는 볼거리"
}
```

---

### `POST /api/games/:id/ai-review`

AI 경기 리뷰 생성

| 동작 | 조건 |
|---|---|
| DB 캐시 반환 | 이미 생성된 리뷰가 있을 때 |
| 새로 생성 | 리뷰가 없거나 `?force=true` |
| 오류 | 경기 상태가 FINAL이 아닐 때 |
| fallback | OpenAI 키 미설정 시 더미 응답 반환 |

**AI 응답 JSON 구조**
```json
{
  "summary": "경기 한줄 요약",
  "keyMoment": "승부처 설명",
  "impressivePlayer": "인상적인 선수/활약 설명",
  "gameFlow": {
    "winner": "승리팀 경기 흐름",
    "loser": "패배팀 경기 흐름"
  },
  "nextWatch": "다음 경기에서 볼 만한 포인트"
}
```

---

## 6. 프론트엔드 화면 구조

### 홈 화면 `GET /`

```
┌─────────────────────────────┐
│  ⚾ KBO AI Brief             │ ← Header + 네비게이션
├─────────────────────────────┤
│  2026년 7월 6일 오늘의 경기  │ ← 날짜 헤더
│                             │
│  ┌─────────────────────┐    │
│  │ KIA  7 - 3  삼성    │    │ ← 경기 카드 (FINAL)
│  │ 광주 / 14:00   [종료]│    │
│  │ [AI 리뷰 보기 →]    │    │
│  └─────────────────────┘    │
│                             │
│  ┌─────────────────────┐    │
│  │ SSG  4 - 5  KT      │    │ ← 경기 카드 (LIVE 🔴)
│  │ 인천 / 18:00  [진행중]│   │
│  │ 7회초 / 갱신 2분전   │    │
│  └─────────────────────┘    │
│                             │
│  [순위 더보기 →]             │ ← 팀 순위 미리보기 (상위 5팀)
└─────────────────────────────┘
```

---

### 경기 상세 `GET /games/:id`

```
┌─────────────────────────────┐
│  LG 트윈스  vs  두산 베어스  │ ← 팀명
│    0    :    0              │ ← 스코어 (크게)
│    [경기 전] 18:30 잠실      │ ← 상태 + 시간 + 구장
├─────────────────────────────┤
│  이닝별 점수 (진행중/종료 시) │
│  1 2 3 4 5 6 7 8 9 | R H E │
│  0 0 0 0 - - - - - | 0 0 0 │
│  0 0 0 0 - - - - - | 0 0 0 │
├─────────────────────────────┤
│  팀 정보                    │
│  LG: 2위 (40승 29패) 6승4패  │
│  두산: 7위 (32승 37패) 3승7패│
├─────────────────────────────┤
│  🤖 AI 경기 프리뷰           │ ← AI 섹션
│  [AI 프리뷰 생성하기]        │
│  또는 생성된 프리뷰 내용 표시 │
├─────────────────────────────┤
│  📊 AI 경기 리뷰 (종료 시)   │
│  (경기 종료 후 표시)         │
└─────────────────────────────┘
```

---

### 팀 순위 `GET /standings`

```
┌──────────────────────────────────────────────┐
│  2026 KBO 팀 순위                             │
├──┬──────────┬────┬──┬──┬──┬──────┬────┬──────┤
│순위│팀명    │경기│승│패│무│승률  │게임차│최근10│
├──┼──────────┼────┼──┼──┼──┼──────┼────┼──────┤
│ 1│KIA 🏆   │ 70 │42│27│ 1│.609  │  - │7승3패│
│ 2│LG       │ 70 │40│29│ 1│.580  │  2 │6승4패│
│ 3│삼성      │ 70 │38│31│ 1│.551  │  4 │5승5패│
└──┴──────────┴────┴──┴──┴──┴──────┴────┴──────┘
```

---

## 7. 디자인 시스템

### 컬러 팔레트

| 역할 | CSS 변수 | 색상값 |
|---|---|---|
| 배경 (Primary) | `--bg-primary` | `#0B0F1A` (딥 네이비) |
| 카드 배경 | `--bg-card` | `#141929` |
| 포인트 컬러 | `--accent` | `#F59E0B` (앰버) |
| 텍스트 Primary | `--text-primary` | `#F1F5F9` |
| 텍스트 Secondary | `--text-secondary` | `#94A3B8` |
| 테두리 | `--border` | `#1E2A40` |
| LIVE 배지 | `--status-live` | `#EF4444` |
| FINAL 배지 | `--status-final` | `#6B7280` |
| SCHEDULED 배지 | `--status-scheduled` | `#3B82F6` |
| 승리 색상 | `--win-color` | `#22C55E` |
| 패배 색상 | `--loss-color` | `#EF4444` |

### 폰트

| 용도 | 폰트 |
|---|---|
| 한국어 텍스트 | Noto Sans KR (Google Fonts) |
| 숫자 / 영문 | Inter (Google Fonts) |

### 컴포넌트 스타일 원칙

- **카드**: `border-radius: 12px`, subtle border, hover 시 살짝 올라오는 효과 (`translateY(-2px)`)
- **배지**: 상태별 색상, LIVE는 `animate-pulse` 효과
- **AI 섹션**: 별도 카드 + 그라데이션 배경 (`linear-gradient(135deg, ...)`)
- **스코어**: 큰 폰트 (`font-size: 4rem`), 굵게
- **반응형**: 모바일 우선 (`max-width: 768px` 기준)

---

## 8. Python 크롤러 구조

### 파일 구성

```
crawler/
├── db.py                 # MySQL 연결 (pymysql + connection pool)
├── utils.py              # 지수 백오프, 로깅, 에러 핸들링
├── collect_schedule.py   # 오늘 경기 일정 수집
├── collect_standings.py  # 팀 순위 수집
├── collect_game_scores.py# 경기 중 스코어 갱신
└── requirements.txt
```

### 수집 주기

| 시점 | 파일 | 수집 내용 |
|---|---|---|
| 매일 오전 9시 | `collect_schedule.py` | 오늘 경기 일정 + 전날 결과 |
| 매일 오전 9시 | `collect_standings.py` | 팀 순위 업데이트 |
| 경기 시작 1시간 전 | `collect_schedule.py` | 경기 정보 재확인 |
| 경기 중 | `collect_game_scores.py` | 2분마다 스코어 / 이닝 / 상태 갱신 |
| 경기 종료 후 | `collect_game_scores.py` | 최종 결과 저장 → status = FINAL |

### 수집 대상 (MVP)

**경기 중 갱신**
- `status` (경기 상태)
- `current_inning` (현재 이닝)
- `home_score` / `away_score` (점수)
- `home_hits` / `away_hits` (안타)
- `home_errors` / `away_errors` (실책)
- `home_walks` / `away_walks` (볼넷)
- `last_updated_at` (갱신 시각)

**처음부터 수집하지 않는 데이터**
- 실시간 타석별 결과
- 볼카운트, 구종, 구속
- 타구 방향, 투구별 데이터

### 주의사항

- 과도한 요청 금지: 최소 2분 간격
- 수집 실패 시 서버 전체가 죽지 않도록 try/except 처리
- `last_updated_at` 저장으로 프론트에서 갱신 시각 표시
- 같은 날짜 + 같은 팀 매치업 중복 저장 방지 (upsert 방식)

---

## 9. 단계별 작업 계획

### ✅ Step 0 — 프로젝트 초기화 (완료)

| 작업 | 상태 |
|---|---|
| Next.js 14 프로젝트 생성 (App Router, TypeScript, Tailwind) | ✅ |
| Docker Compose MySQL 8.0 설정 | ✅ |
| Prisma 스키마 (6개 테이블) | ✅ |
| 더미 데이터 Seed (KBO 10팀 + 오늘 경기 5게임) | ✅ |
| 환경변수 파일 (.env.local, .env.example) | ✅ |
| Prisma 싱글톤 클라이언트 | ✅ |
| OpenAI 싱글톤 클라이언트 | ✅ |
| TypeScript 타입 정의 | ✅ |
| `GET /api/games/today` | ✅ |
| `GET /api/games/[id]` | ✅ |
| `POST /api/games/[id]/ai-preview` | ✅ |
| `POST /api/games/[id]/ai-review` | ✅ |
| `GET /api/standings` | ✅ |

---

### ✅ Step 1 — Docker MySQL 기동 & DB 마이그레이션 (완료)

```bash
# MySQL 컨테이너 실행
docker compose up -d

# Prisma 스키마 DB에 적용
npx prisma db push

# 더미 데이터 삽입
npm run db:seed

# Prisma Studio로 데이터 확인 (선택)
npx prisma studio
```

---

### ✅ Step 2 — 글로벌 스타일 & 레이아웃 (완료)

| 파일 | 내용 |
|---|---|
| `src/app/globals.css` | CSS 변수, 다크 테마, 폰트, 공통 애니메이션 |
| `src/app/layout.tsx` | 루트 레이아웃, Header, 네비게이션 |

---

### ✅ Step 3 — 공통 UI 컴포넌트 (완료)

| 파일 | 내용 |
|---|---|
| `StatusBadge.tsx` | SCHEDULED/LIVE/FINAL/CANCELLED 배지, LIVE는 펄스 |
| `LoadingSpinner.tsx` | 로딩 스피너 |
| `TeamLogo.tsx` | 팀 약칭 표시 (로고 없을 경우 약칭 뱃지) |

---

### ✅ Step 4 — 경기 관련 컴포넌트 (완료)

| 파일 | 내용 |
|---|---|
| `GameCard.tsx` | 홈 화면용 경기 카드 (상태별 스타일 분기) |
| `ScoreBoard.tsx` | 큰 스코어 + 팀명 헤더 |
| `InningScoreTable.tsx` | 이닝별 R/H/E 점수표 |
| `AiContent.tsx` | AI 프리뷰/리뷰 표시 + 생성 버튼 |

---

### ✅ Step 5 — 순위 컴포넌트 (완료)

| 파일 | 내용 |
|---|---|
| `StandingsTable.tsx` | 팀 순위표 (순위/팀/경기수/승/패/무/승률/게임차/최근10) |

---

### ✅ Step 6 — 페이지 구현 (완료)

| 파일 | 내용 |
|---|---|
| `app/page.tsx` | 홈 화면: 오늘 경기 카드 + 순위 미리보기 |
| `app/games/[id]/page.tsx` | 경기 상세: 스코어보드 + 팀 정보 + AI 섹션 |
| `app/standings/page.tsx` | 팀 순위: 전체 순위표 |

---

### 🔲 Step 7 — Python 크롤러 골격

| 파일 | 내용 |
|---|---|
| `crawler/db.py` | MySQL 연결 (pymysql) |
| `crawler/utils.py` | 지수 백오프, 로깅 |
| `crawler/collect_schedule.py` | 경기 일정 수집 구조 |
| `crawler/collect_standings.py` | 팀 순위 수집 구조 |
| `crawler/collect_game_scores.py` | 경기 중 스코어 갱신 구조 |
| `crawler/requirements.txt` | 패키지 목록 |

---

### 🔲 Step 8 — README 작성

- 프로젝트 소개
- 실행 방법 (Docker + npm)
- 환경변수 설정 가이드
- API 엔드포인트 목록
- 스크린샷 (완성 후 추가)

---

## 10. 실행 방법

### 사전 준비

- Docker Desktop 설치
- Node.js 18+ 설치
- Python 3.10+ (크롤러 사용 시)
- OpenAI API Key (AI 기능 사용 시)

### 로컬 실행

```bash
# 1. 프로젝트 클론
git clone <repo-url>
cd kbo-ai-brief

# 2. 환경변수 설정
cp .env.example .env.local
# .env.local 에서 OPENAI_API_KEY 입력

# 3. Docker MySQL 실행
docker compose up -d

# 4. 의존성 설치
npm install

# 5. DB 스키마 적용
npx prisma db push

# 6. 더미 데이터 삽입
npm run db:seed

# 7. 개발 서버 실행
npm run dev
```

브라우저에서 `http://localhost:3000` 접속

### 환경변수 설명

| 변수 | 설명 | 필수 |
|---|---|---|
| `DATABASE_URL` | MySQL 연결 URL | ✅ |
| `OPENAI_API_KEY` | OpenAI API Key | ❌ (없으면 더미 응답) |
| `OPENAI_MODEL` | 사용할 모델 (기본: gpt-4o-mini) | ❌ |
| `NEXT_PUBLIC_POLL_INTERVAL` | 폴링 간격 ms (기본: 120000) | ❌ |

---

## 11. MVP 이후 확장 계획

| 기능 | 설명 |
|---|---|
| 관심 팀 설정 | 사용자가 팀 선택, 홈 화면 상단 고정 |
| 실제 KBO 크롤러 | Python 스크립트로 실제 데이터 수집 |
| 선수 검색 | 선수 이름으로 검색, 기본 스탯 조회 |
| 선수 비교 | 두 선수 스탯 나란히 비교 |
| 팀별 흐름 그래프 | 최근 N경기 득점 추이 시각화 |
| 단순 승부 예측 | 팀 스탯 기반 단순 점수 계산 |
| 야구 초보 모드 | 야구 용어 설명 팝업 |
| 경기 알림 | 경기 전/후 브라우저 알림 |
| PWA 변환 | 모바일 앱처럼 설치 가능 |
| Vercel + Railway 배포 | 실서비스 배포 |
