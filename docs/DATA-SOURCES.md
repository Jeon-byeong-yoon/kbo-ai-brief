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
| `/schedule/games/{gameId}/relay` | 실시간 중계 (아래 참고) |
| `/schedule/games/{gameId}/record` | 경기 기록 |
| `/schedule/games/{gameId}/lineup` | 라인업 |

경기 헤더(`/schedule/games/{gameId}`)에는 `awayTeamScoreByInning`(아직 안 친 이닝은
`"-"`), `awayTeamRheb`(`[득점, 안타, 실책, 사사구]`), `winPitcherName`,
`losePitcherName`, `weatherInfo` 가 들어 있다.

### `/relay` 의 `textRelayData` — 실시간 경기 상황

- `currentGameState` — **투구마다 갱신된다.** `ball`·`strike`·`out`(볼카운트),
  `base1`·`base2`·`base3`(주자), `pitcher`·`batter`(선수 코드), 양 팀 R/H/E/B
- `homeOrAway` — 지금 공격 중인 쪽 (`0` 원정, `1` 홈)
- `homeLineup`/`awayLineup` — `batter[]` 는 타순·포지션·오늘 성적·시즌 타율·
  해당 투수 상대 타율, `pitcher[]` 는 이닝·투구수·탈삼진·자책·시즌 ERA
- `pitcherVsBatterCareerStats` — 지금 맞붙은 투수와 타자의 통산 전적 문구
- `lastValidMetricOption` — 네이버가 계산한 **실시간 승리 확률**
- `textRelays[]` — 이닝별 텍스트 중계

**타순의 `seqno` 는 1부터 시작한다는 보장이 없다.** 어떤 팀은 2부터 시작한다.
교체 선수까지 함께 오므로 같은 타순 번호가 여러 번 나오는데, 선발을 가릴 때는
절대값이 아니라 **타순별로 `seqno` 가 가장 작은 선수**를 봐야 한다.

진행 중인 경기는 캐시하면 안 된다(`cache: 'no-store'`). 끝난 경기는 더 이상
바뀌지 않는다.

### `/relay` 의 `ptsOptions` — 투구 추적 데이터

구장에서 측정한 투구 추적 값이다. 추정이 아니다. **2017년 경기부터 있다**
(2014·2015·2016년 경기는 빈 배열이었다).

| 필드 | 뜻 |
| :--- | :--- |
| `pitchId` | 투구 식별자. 경기 안에서 유일하다 |
| `ballcount` | 이 타석의 몇 번째 공인지 |
| `x0`, `y0`, `z0` | 릴리스 지점 (ft). `y0` 는 보통 55 |
| `vx0`, `vy0`, `vz0` | 릴리스 시점 속도 (ft/s). 타자 쪽이 y 감소 방향이라 `vy0` 는 음수 |
| `ax`, `ay`, `az` | 가속도 (ft/s^2) |
| `crossPlateX` | 홈플레이트 통과 지점의 좌우 (ft) |
| `crossPlateY` | **높이가 아니다.** 측정 기준이 되는 y 위치로, 항상 0.7083 |
| `topSz`, `bottomSz` | 그 타자의 스트라이크존 위/아래 끝 (ft) |
| `stance` | 타석 방향. `L` 이면 좌타 |

**구속** 은 속도 벡터의 크기다.

```
km/h = sqrt(vx0^2 + vy0^2 + vz0^2) x 0.3048 x 3.6
```

**통과 높이는 직접 계산해야 한다.** 좌우(`crossPlateX`)는 주지만 높이는 없다.
등가속도 운동으로 `crossPlateY` 에 도달하는 시각 t 를 구하고 그때의 z 를 쓴다.

```
y(t) = y0 + vy0 t + ay t^2 / 2 = crossPlateY   ->  t = (-vy0 - sqrt(vy0^2 - 2 ay (y0 - crossPlateY))) / ay
z    = z0 + vz0 t + az t^2 / 2
```

2026-09-24 롯데-LG 329구로 검증했다. 구속 117~157 km/h, 통과 높이 0.58~3.67 ft 로
실제 범위와 맞는다.

**투구 결과는 텍스트에서 가져온다.** `ptsOptions` 에는 결과가 없다. 같은 블록의
`textOptions` 중 `type` 이 1 인 항목이 "3구 볼" 처럼 오는데, 앞의 숫자가
`ballcount` 와 같아서 짝을 맞출 수 있다. 두 경기 604구에서 전부 결합됐다.
어휘는 `볼`, `스트라이크`, `헛스윙`, `파울`, `타격`, `번트파울`, `번트헛스윙` 뿐이다.

#### 경기 전체를 받으려면 이닝 단위로 호출해야 한다

`/relay` 를 그냥 부르면 **최근 12블록만** 온다(블록 하나가 타석 하나다).
`?inning=N` 으로 1부터 `inn` 까지 돌아야 경기 전체가 모인다. 2026-09-24
롯데-LG 에서 9번 호출해 블록 0~100 이 빠짐없이, 중복 없이 모였다.

#### 투수 이름은 등판 순서로 맞춘다

블록의 `currentGameState.pitcher` 는 선수 코드를 주지만, 이 코드는
`homeEntry`/`awayEntry` 의 `pcode` 목록과 **겹치지 않는다**(엔트리는 교체 가능한
선수 명단이다). 이름이 있는 `homeLineup`/`awayLineup` 의 `pitcher[]` 에는 반대로
코드가 없다.

그래서 등판 순서로 짝을 맞춘다. 투수는 한 번 내려가면 다시 오르지 못하므로
순서가 유일하다. 블록의 `homeOrAway` 로 어느 팀이 던지는지 가르고(홈이 공격 중이면
원정이 던진다), 코드가 처음 나타난 순서를 `seqno` 로 정렬한 박스스코어와 zip 한다.
두 경기에서 양 팀 모두 인원수가 정확히 맞았다. 어긋나면 이름을 비우고 등판 순서로만
표시한다.

**응답은 최신 블록이 앞에 온다.** 등판 순서를 얻으려면 뒤집어야 한다.

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
- 기본은 상위 50명이지만 **`pageSize` 로 더 받을 수 있다.** `pageSize=500` 이면
  2026 기준 타자 359명·투수 293명(팀당 24~41명)으로 사실상 전체 로스터가 나온다.
  과거 시즌도 마찬가지다(2015 타자 378명, 2008 타자 273명). `size`·`limit`·`count`
  는 먹지 않고 `pageSize` 만 듣는다. 1000 이상은 400 이다.
- **규정 타석·이닝 미달 선수는 `ranking` 이 `null` 로 온다.** 이걸 0 으로 바꿔
  정렬하면 8경기 1안타 타율 1.000 같은 선수가 1위로 올라온다. `isQualified` 로
  거르거나 `ranking` 이 있는 행만 쓴다.
- **`pitcherInning` 은 `"138 2/3"` 같은 문자열이다.** `Number()` 로 바꾸면 NaN 이 된다.
  이닝은 이 분수 표기가 관례이므로 문자열 그대로 쓰는 게 낫다.
- **WAR 은 오래된 시즌에 없다.** 값이 전부 0 으로 오므로 화면에서 칸을 빼는 게 낫다.
- `result.seasonPlayerStats[]` 에 `hitterHra`, `hitterWar`, `hitterOps`,
  `pitcherEra`, `pitcherWhip` 등 지표가 들어 있다. `playerImageUrl` 도 오지만
  위의 이유로 쓰지 않는다.

## 선수 커리어 — 전용 API 가 없어 연도별 목록에서 모은다

선수 개인 상세 엔드포인트는 전부 막혀 있다.

| 시도 | 결과 |
| :--- | :--- |
| `/statistics/categories/kbo/players/{id}` | HTTP 403 |
| `/statistics/players/{id}` | HTTP 403 |
| `/statistics/categories/kbo/players/{id}/seasons` | 200 이지만 `playerSeasonStats` 가 항상 비어 있다 |
| `/statistics/categories/kbo/teams/{code}/players` | HTTP 403 |

그래서 **2008년부터 올해까지 연도별 선수 목록을 타자·투수 양쪽으로 받아
`playerId` 로 걸러낸다.** `playerId` 는 문자열이고 연도가 바뀌어도 같다
(구자욱 `62404` 를 2015~2026 까지 추적해 확인했다).

호출이 38회라 많아 보이지만 한 번에 0.1초, 전부 합쳐 1.4초 남짓이다(동시 6개 기준).
끝난 시즌은 일주일, 진행 중인 시즌은 10분 캐시한다.

`profile` 필드는 JSON 문자열이라 파싱해야 한다. 이름·팀·포지션·등번호·은퇴 여부가
들어 있다. `image` 키에 선수 사진 URL 도 있지만 **쓰지 않는다**. 네이버가 Referer 로
핫링크를 막아 두었고, 우회하지 않기로 했다.

### 고급 지표는 2017년부터만 있다

WAR, wRC+, wOBA, WPA, BABIP 는 2017년 이후 시즌에만 들어 있다. 그 전 시즌은
`0` 으로 오는데, **이걸 실제 값 0 으로 받으면 안 된다.**

| 시즌 | 타자 WAR 합 | 투수 WAR 합 |
| :--- | ---: | ---: |
| 2008~2013 | 0.0 | 0.0 |
| 2014~2016 | 0.0 | 110~143 |
| 2017~2026 | 205~239 | 130~150 |

화면에서는 빈 칸(—)으로 두고 이유를 적는다. 우승 확률 모델이 이 값을 어떻게
다루는지는 `docs/PREDICTION.md` 참고.

### `pitcherInning` 은 타입이 섞여 온다

숫자(`155`)로 올 때도 있고 `"138 2/3"` 같은 문자열로 올 때도 있다. 합산하려면
아웃 수로 바꿔야 한다. `Number()` 를 그냥 쓰면 NaN 이 된다.

## 과거 구단명

지난 시즌을 조회하면 그 시절 구단명이 그대로 온다 — 2008~2018 은 `넥센`,
2008~2020 은 `SK`. `teamId` 는 항상 네이버 코드(`WO`, `SK`)로 오지만
`teamShortName` 은 당시 이름이다. `lib/team-assets.ts` 의 별칭 표에 과거 이름을
등록해 같은 프랜차이즈의 현재 구단 엠블럼으로 잇는다.

## 상대전적 — 전용 API 가 없어 일정에서 집계한다

`teams/vs`, `teams/matchup` 같은 경로는 존재하지 않는 세그먼트를 무시하고 기본 팀
목록을 돌려준다. 두 팀만 필요하면 `previewData.seasonVsResult` 가 있지만, 10팀
매트릭스는 시즌 일정을 월 단위로 받아(3~11월, 9회) 직접 집계해야 한다.

문제는 **일정 API 가 시범경기·정규시즌·포스트시즌을 구분해 주지 않는다**는 점이다.
전부 `categoryId: 'kbo'` 로 오고, 구분할 수 있는 필드가 없다
(`reversedHomeAway` 는 항상 `true`, `gameId` 형식도 동일). `gameType` 류의
파라미터도 먹지 않는다. 그냥 다 더하면 2026 기준 종료 694경기가 잡히는데
정규시즌은 634경기다 — 3월 시범경기 60경기가 섞인 것이다. 끝난 시즌이면
10~11월 포스트시즌도 섞인다.

그래서 **순위표의 공식 승·패·무를 정답으로 두고, 팀별 전적이 그것과 정확히 일치하는
연속 구간을 찾는다.** 찾으면 그 구간이 정규시즌이고, 못 찾으면 집계를 포기한다
(틀린 숫자를 보여주는 것보다 낫다). 이 방법은 자체 검증이 되고, 개막일이 해마다
달라도, 2020년처럼 5월에 개막한 시즌도 그대로 잡아낸다.

올스타전처럼 구단이 아닌 팀이 끼는 경기가 섞여 오므로, 양쪽 팀 코드가 모두
순위표에 있는 경기만 남긴 뒤 구간을 찾는다.

## 일자별 순위 — 전용 API 가 없어 일정에서 쌓는다

`/statistics/categories/kbo/seasons/{year}/teams/ranks` 는 200 을 주지만
`teamStats` 가 항상 `null` 이다. `?date=`, `?year=`, `?gameType=` 을 붙여도 같다.

그래서 정규시즌 일정을 날짜순으로 쌓아 직접 만든다. 구간은 상대전적과 같은
`fetchRegularSeasonGames()` 를 쓴다. 하루치 경기를 모두 반영한 뒤 그날의 순위를
기록한다.

### 승률 규정은 시즌마다 다르므로 대조해서 알아낸다

무승부를 승률에 넣을지가 시대마다 달랐다. 최종 성적으로 두 규정을 모두 계산해
네이버가 준 `wra` 와 맞는 쪽을 고른다. 추측하지 않는다.

| 규정 | 식 | 확인된 시즌 |
| :--- | :--- | :--- |
| `exclude-draws` | 승 / (승 + 패) | 2015, 2026 |
| `include-draws` | 승 / (승 + 패 + 무) | 2009 |

2009년에 이게 갈린다. 무승부를 빼면 SK(80승 47패 6무, .630)가 KIA(81승 48패 4무,
.628)를 앞서지만, 실제 그해 1위는 KIA 였다. 무승부를 넣으면 KIA .609, SK .602 로
순서가 맞는다.

동률은 KBO 가 상대전적으로 가리지만 그래프에서는 선을 겹칠 수 없으므로
승수, 패수, 팀 코드 순으로 정해진 대로 가른다.

## 없는 것
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
