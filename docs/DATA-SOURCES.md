# 데이터 출처 — 네이버 스포츠 API

이 앱의 경기·순위·선수 데이터는 전부 네이버 스포츠의 비공개 API에서 온다.
문서가 없어서 동작을 직접 확인해 가며 쓰고 있다. **함정이 몇 개 있어서 여기 적어 둔다.**

기본 주소는 `https://api-gw.sports.naver.com` 이고, 요청에 브라우저 `User-Agent` 와
`Referer: https://sports.naver.com/` 를 붙인다.

## 일정

```
GET /schedule/games?fromDate={YYYY-MM-DD}&toDate={YYYY-MM-DD}&upperCategoryId=kbaseball&size={n}
```

**`?date=` 파라미터는 무시된다.** 어떤 날짜를 넣어도 항상 "오늘" 경기를 돌려준다.
이것 때문에 날짜를 바꿔도 경기 목록이 그대로인 버그가 있었다. 특정 날짜를 받으려면
`fromDate`/`toDate` 에 같은 날짜를 넣는다.

- **`size` 를 반드시 준다.** 빠뜨리면 앞쪽 몇 건만 온다. 하루는 `size=50`,
  한 달은 `size=300` 이면 충분하다.
- **범위가 한 달을 크게 넘으면 조용히 잘린다.** 오류가 아니라 빈 배열이나 몇 건만
  돌려준다. 시즌 전체가 필요하면 월 단위로 나눠서 부른다.
- 응답의 `games[]` 에는 KBO 외 카테고리도 섞여 오므로 `categoryId === 'kbo'` 로 거른다.
- 각 경기에 `gameDate`, `statusCode`(`BEFORE`/`RESULT`/`CANCEL` 등), 점수,
  `awayTeamEmblemUrl`/`homeTeamEmblemUrl` 이 들어 있다.
  **요청 날짜를 그대로 쓰지 말고 응답의 `gameDate` 를 쓴다.**

경기 상세는 `GET /schedule/games/{gameId}` 이고, 별도로 아래가 있다.

| 경로 | 내용 |
| --- | --- |
| `/schedule/games/{gameId}/preview` | 경기 프리뷰 (아래 참고) |
| `/schedule/games/{gameId}/record` | 경기 기록 |
| `/schedule/games/{gameId}/lineup` | 라인업 |

### `/preview` 의 `previewData`

프리뷰 화면을 만드는 데 필요한 게 거의 다 들어 있다.

- `awayTopPlayer` / `homeTopPlayer` — 팀별 주목 타자.
  `playerInfo`(이름·등번호·투타·생년·체격), `currentSeasonStats`(타율·안타·홈런·타점·출루율),
  `currentSeasonStatsOnOpponents`(상대 팀 상대 성적), `recentFiveGamesStats`(최근 5경기),
  **`hotColdZone`(존 13개, 존별 타율과 단계)**
- `awayStarter` / `homeStarter` — 선발 투수. 시즌 성적, 상대 팀 상대 성적,
  `currentPitKindStats`(구종별 구사율·구속)
- `seasonVsResult` — **두 팀의 당해 시즌 상대전적** (`aw`/`al`/`ad`, `hw`/`hl`/`hd`)
- `awayTeamPreviousGames` / `homeTeamPreviousGames` — 최근 5경기 결과
- `awayStandings` / `homeStandings` — 순위·승률·팀 타율·팀 평균자책

예정 경기뿐 아니라 **이미 끝난 경기에도 데이터가 있다**(경기 전 시점 기준).

**`hotColdZone` 의 zone 번호**는 1~9 가 스트라이크 존 3×3 을 왼쪽 위부터 읽는
순서, 10~13 이 존 바깥 네 구석(좌상·우상·좌하·우하)이다. 문서가 없어 값으로
확인했다 — 한가운데인 zone 5 의 타율이 가장 높게 나오고, 네이버 프리뷰 화면과
숫자 배치가 그대로 일치한다. `hraStep` 은 1(낮음)~5(높음) 단계이며 문자열로 온다.

## 팀 기록

```
GET /statistics/categories/kbo/seasons/{year}/teams
```

**2008 시즌부터 데이터가 있다.** 2005~2007 은 200 을 주지만 빈 배열이고,
2004 이하는 `400 INVALID_PARAMETER` 다.

`result.seasonTeamStats[]` 한 건에 순위표에 필요한 게 다 들어 있다 —
`ranking`, `winGameCount`, `loseGameCount`, `drawnGameCount`, `wra`, `gameBehind`,
`gameCount`, `continuousGameResult`(연속), `lastFiveGames`(최근 5경기),
`offenseHra`(팀 타율), `defenseEra`(팀 평균자책), `offenseOps`, `defenseWhip` 등
공격/수비 세부 지표 전부. `nextScheduleGameId`, `opposingTeamName` 으로 다음 경기도 온다.
`teamImageUrl` 로 구단 엠블럼 URL 도 제공한다.

**`ranking` 은 끝난 시즌이면 포스트시즌까지 반영한 최종 순위다.** 응답의
`gameType` 이 `REGULAR_SEASON` 이어도 그렇다. 2015 시즌을 보면 `ranking` 1 은
한국시리즈 우승팀 두산(79승 65패)이고, 정규시즌 1위인 삼성(88승 56패)은 2 다.
정규시즌 순위표를 그릴 때는 `wra`(승률)로 직접 매겨야 한다. `wra` 와 `gameBehind`
자체는 정규시즌 값이라 정확하다.

## 선수 기록

```
GET /statistics/categories/kbo/seasons/{year}/players?playerType=HITTER
GET /statistics/categories/kbo/seasons/{year}/players?playerType=PITCHER
```

- **`playerType` 은 대문자여야 한다.** `hitter` 처럼 소문자로 주면 400 이다.
  빠뜨려도 400 (`지원하지 않는 playerType 입니다`).
- **2007 시즌부터** 데이터가 있다. 2005 이하는 빈 배열.
- 시즌별 **상위 50명**만 온다.
- **규정 타석·이닝 미달 선수는 `ranking` 이 `null` 로 온다.** 이걸 0 으로 바꿔
  정렬하면 8경기 1안타 타율 1.000 같은 선수가 1위로 올라온다. `isQualified` 로
  거르거나 `ranking` 이 있는 행만 쓴다.
- **`pitcherInning` 은 `"138 2/3"` 같은 문자열이다.** `Number()` 로 바꾸면 NaN 이 된다.
  이닝은 이 분수 표기가 관례이므로 문자열 그대로 쓰는 게 낫다.
- **WAR 은 오래된 시즌에 없다.** 값이 전부 0 으로 오므로 화면에서 칸을 빼는 게 낫다.
- `result.seasonPlayerStats[]` 에 `hitterHra`, `hitterWar`, `hitterOps`,
  `pitcherEra`, `pitcherWhip` 등 지표가 들어 있다. `playerImageUrl` 도 오지만
  위의 이유로 쓰지 않는다.

## 과거 구단명

지난 시즌을 조회하면 그 시절 구단명이 그대로 온다 — 2008~2018 은 `넥센`,
2008~2020 은 `SK`. `teamId` 는 항상 네이버 코드(`WO`, `SK`)로 오지만
`teamShortName` 은 당시 이름이다. `lib/team-assets.ts` 의 별칭 표에 과거 이름을
등록해 같은 프랜차이즈의 현재 구단 엠블럼으로 잇는다.

## 없는 것

- **팀간 상대전적 매트릭스 전용 엔드포인트가 없다.** `teams/vs`, `teams/matchup`
  같은 경로는 존재하지 않는 세그먼트를 무시하고 기본 팀 목록을 돌려준다.
  10팀 전체 매트릭스가 필요하면 시즌 일정을 월 단위로 받아 결과를 집계해야 한다
  (시즌당 8회 요청 — 3월~10월). 두 팀만 필요하면 `previewData.seasonVsResult` 가 있다.
- 2007년 이전 기록. KBO 공식 기록실을 따로 크롤링해야 한다.

## 이미지는 쓰지 않는다

선수 사진(`sports-phinf.pstatic.net/player/kbo/default/{playerCode}.png`)과
구단 엠블럼은 **네이버가 Referer 로 핫링크를 막아 두었다.** 다른 도메인에서
부르면 403 이 온다.

`<img referrerPolicy="no-referrer">` 로 Referer 를 빼면 200 이 오지만, 이건
해결이 아니라 **상대가 의도적으로 걸어둔 접근 제어를 우회하는 것**이다.
그래서 이 앱은 네이버 이미지를 직접 불러오지 않는다. 선수는 구단 배지로,
구단 엠블럼은 `public/teams/` 에 둔 파일로 표시한다.

## 주의

빠르게 연속 호출하면 응답이 불안정해진다(같은 요청이 갑자기 빈 배열을 주는 식).
서버 라우트에서 `next: { revalidate }` 로 캐시를 걸고, 조사용 스크립트에서는
호출 사이에 간격을 둔다.
