# 디자인 시스템

2026-09 전면 개편. 그 전에는 slate-950 배경에 로즈/퍼플 그라디언트와 장식용
이모지를 쓰는 다크 전용 화면이었다. 애플 HIG 와 토스를 레퍼런스로 삼아 밝고
정돈된 쪽으로 다시 잡았고, 라이트·다크 두 모드를 모두 지원한다.

## 원칙

- **흰 바탕에 검정 계열 본문.** 가독성이 먼저다. 그라디언트 배경, 네온 글로우,
  장식용 이모지(⚾🏆⭐🔮📊)는 쓰지 않는다.
- **강조색은 파랑 하나.** 빨강·초록은 LIVE, 연승/연패처럼 의미가 있을 때만 쓴다.
- **아이콘은 선형 SVG.** `src/components/ui/Icons.tsx` 한 곳에 모아 둔다.
  이모지는 플랫폼마다 모양·크기·색이 달라 정렬이 맞지 않고 테마 색도 못 따라간다.
- **숫자는 자릿수를 고정한다.** 승률·승패·스코어·시간 등 기록이 들어가는 칸은
  `font-variant-numeric: tabular-nums` 로 표가 흔들리지 않게 한다.

## 색 토큰

색은 `src/app/globals.css` 에서 CSS 변수로 한 번만 정의하고,
`tailwind.config.ts` 가 그 변수를 시맨틱 이름으로 노출한다. 컴포넌트는
`bg-surface`, `text-fg2`, `border-line` 같은 이름만 쓰므로 **모드별 분기 코드가
없다.**

| 토큰 | 라이트 | 다크 | 쓰임 |
| --- | --- | --- | --- |
| `bg` | `#F6F7F9` | `#0C0D0F` | 페이지 바닥 |
| `surface` | `#FFFFFF` | `#16181B` | 카드 |
| `surface2` | `#F1F3F5` | `#1E2126` | 카드 안 보조 블록 |
| `track` / `thumb` | `#EDEFF2` / `#FFFFFF` | `#202429` / `#31363D` | 세그먼티드 컨트롤 |
| `line` / `hair` | `#E6E8EB` / `#F0F1F3` | `#272A2F` / `#222528` | 테두리 / 표 구분선 |
| `fg` / `fg2` / `fg3` | `#16181B` / `#5A6069` / `#90969E` | `#F1F2F4` / `#9CA2AA` / `#71777F` | 본문 / 보조 / 메타 |
| `accent` | `#1F5FE0` | `#6A9BFF` | 링크·선택·AI |
| `live` / `win` / `lose` | `#E5484D` / `#0E9F6E` / `#E5484D` | `#FF6B6F` / `#3FC98E` / `#FF6B6F` | 상태 표시 |

다크는 애플 HIG 의 base/elevated 2단 배경을 따른다. 바닥(`bg`)보다 카드(`surface`)가
밝아서 그림자 없이도 층이 보인다. 그래서 `--shadow-card` 는 다크에서 `none` 이다.

## 테마 전환

세 가지 상태를 구분한다.

1. **고른 적 없음** — `<html>` 에 `data-theme` 이 없다. CSS 의
   `prefers-color-scheme` 이 시스템 설정을 따른다.
2. **라이트 선택** — `data-theme="light"`.
3. **다크 선택** — `data-theme="dark"`.

선택은 `localStorage` 의 `kbo-theme` 에 남고, `src/app/layout.tsx` 의 `<head>`
인라인 스크립트가 **첫 페인트 전에** `data-theme` 을 심는다. 이게 없으면 다크를
고른 사용자에게 흰 화면이 한 프레임 번쩍인다.

> `THEME_STORAGE_KEY` 는 `src/lib/theme.ts` 에 있다. `'use client'` 가 붙은
> 모듈에서 서버 컴포넌트로 상수를 import 하면 값이 아니라 클라이언트 참조가
> 넘어와 `undefined` 가 된다. 실제로 `localStorage.getItem(undefined)` 가 렌더된
> 적이 있어서 별도 모듈로 분리했다.

## 크기 규칙

- **모서리 반경 3단계만.** 카드 16 (`rounded-card`), 컨트롤 9~11
  (`rounded-control`), 칩 6~8 (`rounded-chip`).
- **컨테이너 폭** `max-w-shell` = 1200px. 헤더 높이 60px.
- **타이포** 21/700/-.035em (요약 헤드라인) · 15/700/-.025em (섹션 제목) ·
  14.5/650/-.02em (구단명) · 13.5/400 (본문) · 12/400 (메타).
- **표는 최소 폭을 준다.** `table-fixed w-full` 만 쓰면 좁은 화면에서 표가
  넘치지 않고 팀 이름 칸이 뭉개진다. `min-w-[…]` 를 줘서 스크롤 컨테이너 안에서
  가로로 넘치게 한다.

## 구단 엠블럼

구단 식별 정보의 단일 출처는 `src/lib/team-assets.ts` 다. 화면 쪽은 구단 코드만
넘기고, 색과 이미지는 여기서 찾는다.

개편 전에는 각 API 라우트와 `mock-data.ts` 가
`logoBg: 'bg-rose-950 border-rose-600 text-rose-300'` 처럼 **다크 전용 Tailwind
클래스 문자열을 응답에 직접 담고** 있었다. 그래서 라이트 모드가 애초에 성립할 수
없었고, 색을 바꾸려면 응답을 만드는 쪽을 전부 고쳐야 했다.

- `findTeam()` 은 내부 코드(`LG`, `DOOSAN`), 네이버 스포츠 코드(`OB`, `WO`, `HH`),
  한글 이름 중 어느 것으로 들어와도 같은 구단을 찾는다.
- `TeamBadge` 는 로고 이미지가 있으면 그대로 쓰고, 없거나 로드에 실패하면
  구단 상징색 배지로 떨어진다.
- 엠블럼에는 배경 칩을 깔지 않는다. 구단 공식 엠블럼은 자기 색과 형태를 다 갖고
  있어서 라이트·다크 배경 모두에서 그대로 읽힌다.
- 엠블럼에 구단명 텍스트가 들어 있어 아주 작게 쓰면 안 읽힌다. **표 안에서도
  24~26px 아래로 내리지 않는다.**
- **파일을 교체할 때는 `TEAM_LOGO_VERSION` 을 올린다.** 이름이 같은 파일의 내용만
  바꾸면 브라우저가 캐시된 옛 이미지를 계속 내준다. 실제로 확장자가 바뀐 7개
  구단만 갱신되고 `ssg/hanwha/kiwoom` 세 개가 옛 이미지로 남은 적이 있다.

에셋 출처와 라이선스는 `public/teams/README.md` 와 `public/teams/CREDITS.json`
참고. **퍼블릭 도메인이 아니라 각 구단 등록상표**이므로, 수익이 붙는 서비스로
운영하려면 정식 라이선스가 필요하다. `logo` 를 전부 `null` 로 되돌리면 구단
상징색 배지로 표시되고 화면 구조는 그대로다.

## 이번 개편에서 같이 고친 것

- API 응답 문자열 안에 박혀 있던 장식용 이모지 14곳 제거 (`🔮`, `📊`, `🏆`).
- AI 모달: Esc·배경 클릭으로 닫기, 열려 있는 동안 배경 스크롤 잠금.
  이전에는 X 버튼으로만 닫혔다.
- 중계 채널 `KBS N SPORTS^SBS SPORTS` → `KBS N SPORTS · SBS SPORTS` 로 분리.
- 헤더 날짜 선택을 좁은 화면에서 둘째 줄로 내려 모바일에서도 쓸 수 있게 했다.

## 남아 있는 문제 (이번 개편 범위 밖, 이전부터 있던 것)

- `npm run build` 가 타입체크에서 실패한다.
  `prisma.config.ts:1` → `Cannot find module 'prisma/config'`. prisma 패키지가
  설치돼 있지 않다. 컴파일 자체는 통과한다.
- `/games/[id]` 상세가 실제 경기로는 열리지 않는다. 목록 API 는 네이버
  ID(`20260916SSOB02026`)를 주는데 `src/app/api/games/[id]/route.ts` 는
  `game-20260723-1` 같은 하드코딩 목업 ID 만 알고 있다.
- `/standings` 페이지가 500. `src/lib/prisma.ts` 가 Phase 1 더미라 `null` 이다.
- `src/lib/openai.ts:9` 에 `dangerouslyAllowSVG: true` — next/image 옵션이 OpenAI
  클라이언트 설정에 잘못 들어가 있어 타입 에러가 난다.
- 안 쓰이는 레거시 컴포넌트가 남아 있다: `ui/TeamLogo`, `ui/StatusBadge`,
  `ui/LoadingSpinner`, `game/GameCard`, `game/AiContent`. 이미 없어진 CSS
  클래스를 참조한다.
- eslint 가 설치돼 있지 않고, `next lint` 는 Next 16 에서 제거됐다.
