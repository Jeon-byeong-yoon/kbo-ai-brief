# ⚾ KBO AI Brief - 준실시간 KBO 야구 정보 & AI 관전 포인트

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react&logoColor=white" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/OpenAI-GPT--4o-412991?style=for-the-badge&logo=openai&logoColor=white" alt="OpenAI" />
</p>

> **KBO 리그 실제 정규시즌 실시간 팀 순위, 경기 스코어보드, 1~9회 이닝별 점수판 전광판, 네이버 스포츠 기반 주요 선수 세부 기록 및 OpenAI GPT-4o 기반 경기 프리뷰/리뷰 요약을 제공하는 현대적인 야구 정보 대시보드 웹 애플리케이션입니다.**

---

## 🌟 주요 핵심 기능 (Phase 1 & Phase 2 Completed)

### 1. ⚾ 경기 상세 페이지 (`/games/[id]`) 및 1~9회 이닝별 점수판
- **전광판 스코어보드**: 1회부터 9회(연장 12회)까지 이닝별 득점표 렌더링.
- **R/H/E/B 통계**: **R(득점), H(안타), E(실책), B(사사구)** 전용 스코어 컬럼 표출.
- **3대 상세 분석 탭**:
  - `[🤖 GPT-4o AI 심층 리포트]`: GPT-4o 야구 전문 관전 포인트 & 리뷰
  - `[⚾ 투수/타자 라인업]`: 1번부터 9번 타자까지 선발 포지션, 타율, 안타, 타점 수치
  - `[⚔️ 상대 전적]`: 2026 정규시즌 두 팀의 구단 간 상대 전적 수치

### 2. 🔮 AI 프리뷰 — 키플레이어 비교 & HOT/COLD ZONE
- **각 팀 최근 흐름이 좋은 타자 한 명씩** 뽑아 나란히 비교 (타율·안타·홈런·타점)
- **상대 팀 상대 성적**과 **최근 5경기** 성적을 함께 표시
- **HOT & COLD ZONE**: 스트라이크 존 3×3 + 바깥 4구석, 존별 타율을 색 단계로
- 시즌 상대전적, 선수 프로필 사진 포함
- OpenAI 기반 관전 포인트 / 경기 요약 브리핑도 함께
### 3. 🏆 2026 KBO 실제 정규시즌 실시간 팀 순위 연동
- **실시간 네이버 KBO API 연동**: `https://api-gw.sports.naver.com/statistics/categories/kbo/seasons/2026/teams` API 기반 10개 구단 최신 순위 연동.
- **실제 1위 팀 및 성적 매핑**: **삼성 라이온즈 (1위 54승 34패)**, KT 위즈 (2위 51승 35패 7연승), LG 트윈스 (3위 52승 38패) 등 100% 오차 없는 실제 수치 렌더링.
- **순위 변동 & 포스트시즌 진출권**: 전날 대비 순위 변동 수치(▲/▼/-) 및 1~5위 포스트시즌 진출권 가시화.

### 4. ⭐ 관심 구단 (MY 팀) 선택 & 경기 최상단 핀 고정
- **상단 헤더 선호 구단 지정**: `삼성 라이온즈`, `한화 이글스`, `LG 트윈스`, `KIA 타이거즈` 등 관심 구단을 선택 가능.
- **최상단 핀 고정 알고리즘**: 선택된 MY 팀의 경기가 대시보드 목록 맨 위로 자동 정렬.
- **LocalStorage 동기화**: 브라우저를 재방문해도 지정한 MY 팀 선호 설정이 지속 유지.

### 5. 📅 날짜별 경기 일정 & 30초 실시간 자동 갱신 (LIVE)
- **월 단위 날짜 스트립**: 좌우로 달을 이동하며 날짜를 고르면 그 날짜의 경기로 바뀝니다
- **경기 유무 표시**: 경기가 있는 날은 점으로, 없는 날(월요일·비시즌)은 흐리게 표시
- **과거·미래 모두**: 지난 날짜는 실제 스코어와 종료 상태, 앞 날짜는 선발 대진
- 30초마다 자동 갱신
### 6. ⭐ 네이버 스포츠 기준 주요 선수 세부 기록 (Top 5 랭킹)
- **투수 지표 랭킹**: 양현종, 류현진, 원태인, 김광현, 곽빈 (ERA, 승/패/세, WHIP, 삼진, WAR)
- **타자 지표 랭킹**: 김도영(38홈런/109타점/WAR 8.32), 구자욱, 노시환, 최정, 박해민 (AVG, HR, RBI, OPS, WAR)

### 7. 📚 기록실 (`/records`) — 2008~2026 연도별 기록
- **연도 네비게이터**: 2008 시즌부터 현재까지 이동 (URL 의 `?year=` 로 공유 가능)
- **4개 탭**: 팀 순위 / 팀 기록 / 타자 기록 / 투수 기록
- **정규시즌 순위와 최종 순위를 함께 표시**: 끝난 시즌은 포스트시즌 결과가 반영된 최종 순위를 별도 칸으로
- 과거 구단명(넥센·SK)도 같은 프랜차이즈의 현재 엠블럼으로 연결

---

## 🎨 디자인 (라이트 / 다크)

애플 HIG 와 토스를 레퍼런스로 삼은 밝고 정돈된 화면이며, 헤더 오른쪽 해·달
버튼으로 라이트·다크를 전환한다. 고른 적이 없으면 시스템 설정을 따른다.

색은 `src/app/globals.css` 에 CSS 변수로 한 번만 정의하고 컴포넌트는 시맨틱
클래스(`bg-surface`, `text-fg2`)만 쓰므로 모드별 분기 코드가 없다. 구단 엠블럼은
`src/lib/team-assets.ts` 한 곳에서 관리하고, 파일이 없으면 구단 상징색 배지로
자동으로 떨어진다.

토큰 표, 크기 규칙, 엠블럼 교체 절차, 남아 있는 문제는 **[docs/DESIGN.md](docs/DESIGN.md)**
에 정리돼 있다. 에셋 출처와 라이선스는 [public/teams/README.md](public/teams/README.md) 참고.

데이터가 어디서 오는지와 네이버 API 의 함정들은 **[docs/DATA-SOURCES.md](docs/DATA-SOURCES.md)** 에 있다.

---

## 🏗️ 시스템 데이터 파이프라인 (Data Architecture)

```mermaid
graph TD
    A[네이버 스포츠 KBO 실시간 API] -->|API Fetching| B[Next.js API Routes /api/standings, /api/games, /api/players]
    B -->|JSON Response| C[React 19 Dashboard App Component]
    C -->|클릭 라우팅| D[경기 상세 페이지 /games/id]
    D -->|1~9회 이닝 점수판| E[R/H/E/B 및 1~9번 선발 라인업 표출]
    C -->|AI Briefing Trigger| F[OpenAI GPT-4o API Route /api/ai-brief]
    F -->|JSON Briefing| G[AIBriefModal 실시간 팝업 표출]
    C -->|30초 자동 Polling| H[대시보드 UI 실시간 렌더링 & MY팀 핀고정]
```

---

## 🚀 로컬 실행 방법 (Quick Start)

### 1. Repository 클론 및 패키지 설치
```bash
# dependencies 설치
npm install
```

### 2. 환경 변수 설정 (`.env.local`)
```env
OPENAI_API_KEY=sk-proj-your-actual-api-key-here
```

### 3. 로컬 개발 서버 가동
```bash
npm run dev
```

### 4. 브라우저 접속
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 📝 라이선스 (License)
MIT License © 2026 KBO AI Brief Team. All rights reserved.
