# 배포

**Vercel 에 호스팅하고, GitHub Actions 는 검증만 맡는다.** 2026-09-28 에 정했다.

취업용 포트폴리오라는 점이 기준이었다. 이력서의 링크가 죽어 있는 것이 가장 나쁘므로
"안 죽고 돈 안 드는 것"을 화려한 구성보다 앞에 뒀다. 프론트엔드 기준으로 Next.js +
Vercel 은 표준 조합이라 설명할 거리도 따로 필요 없다. 인프라 직무를 노린다면
Docker + Railway 쪽이 대화거리를 더 만들지만, 그건 이 프로젝트의 목적이 아니다.

둘을 섞지 않은 이유도 있다. 배포 권한을 Actions 에 주지 않아도 되고, 검증이 실패해도
Vercel 프리뷰는 따로 떠서 화면은 볼 수 있다.

## 먼저: GitHub Pages 로는 안 된다

빌드 결과를 보면 이유가 분명하다.

```
Route (app)
┌ ○ /
├ ○ /_not-found
├ ƒ /api/ai-brief
├ ƒ /api/games
├ ƒ /api/games/[id]
├ ƒ /api/games/[id]/pitches
├ ƒ /api/games/[id]/preview
├ ƒ /api/players
├ ƒ /api/players/[id]
├ ƒ /api/players/search
├ ƒ /api/predictions/[year]
├ ƒ /api/schedule
├ ƒ /api/seasons/[year]
├ ƒ /api/seasons/[year]/head-to-head
├ ƒ /api/seasons/[year]/rank-history
├ ƒ /api/standings
├ ƒ /api/teams/[code]
├ ○ /compare
├ ƒ /games/[id]
├ ƒ /players/[id]
├ ○ /predictions
├ ○ /records
└ ƒ /teams/[code]

○  (Static)   미리 만들어 둔 정적 파일
ƒ  (Dynamic)  요청이 올 때 서버에서 렌더링
```

API 라우트가 전부 `ƒ` 다. 이들이 네이버 스포츠 API 를 호출하고 OpenAI 를 부르는 게
이 앱의 핵심이므로, 정적 파일만 올리는 GitHub Pages 에서는 기능 대부분이 죽는다.
`output: 'export'` 로 정적화하면 API 라우트가 통째로 사라진다.

따라서 역할을 나눠서 본다.

| | 역할 |
| --- | --- |
| GitHub Actions | 빌드·타입체크·배포를 실행하는 자동화 |
| 호스팅 | Node.js 를 실행할 수 있는 곳이 따로 필요 |

## 호스팅 선택지

| 후보 | 난이도 | 비고 |
| --- | --- | --- |
| **Vercel** | 가장 쉬움 | Next.js 를 만든 곳. GitHub 연결만으로 push 마다 자동 배포, PR 프리뷰 제공 |
| Cloudflare Workers | 중간 | `@opennextjs/cloudflare` 어댑터 필요 |
| Railway · Render · Fly.io | 중간 | Docker 또는 Node 빌드팩 |
| AWS · 직접 서버 | 어려움 | `output: 'standalone'` + 컨테이너 구성 |

개인 프로젝트 규모에서는 Vercel 이 가장 부담이 적다. Actions 를 쓰더라도 배포는
Vercel 에 맡기고 Actions 는 검증용으로 두는 조합이 깔끔하다.

## 진행 순서

1. **빌드 통과 확인** — 완료
2. **호스팅 결정** — 완료. Vercel
3. **Actions 워크플로 작성** — 완료. `.github/workflows/ci.yml` 에서
   `npm ci` → 타입체크 → `npm test` → `npm run build` 를 돌린다
4. **Vercel 연결** — 남음. 아래 "직접 해야 하는 것" 참고
5. **환경변수 등록** — 남음. `OPENAI_API_KEY`
6. **배포 후 네이버 API 소통 확인** — 남음. 아래 참고

## 직접 해야 하는 것

코드로 끝나지 않는 부분이다. 브라우저에서 계정을 연결해야 한다.

1. [vercel.com](https://vercel.com) 에 GitHub 계정으로 로그인
2. **Add New → Project** 에서 이 저장소를 고른다. Next.js 는 자동으로 인식되므로
   빌드 설정을 건드릴 것이 없다
3. **Environment Variables** 에 `OPENAI_API_KEY` 를 넣는다.
   없어도 AI 브리핑만 빠지고 나머지는 동작한다
4. **Deploy** 를 누른다
5. GitHub 저장소의 **Settings → Secrets and variables → Actions** 에도
   `OPENAI_API_KEY` 를 넣는다. Actions 의 빌드 단계에서 쓴다

이후 `main` 에 push 하면 Vercel 이 배포하고, 다른 브랜치나 PR 은 프리뷰 URL 이
따로 생긴다.

## 배포 전에 풀어야 할 것

### 네이버 API 가 클라우드 IP 를 막을 수 있다

이 앱의 모든 데이터는 네이버 스포츠의 **비공개 API** 에서 오고, 호출은 서버에서
나간다. 로컬 IP 에서는 문제없지만 데이터센터 IP 는 차단될 수 있다. 실제로 네이버는
이미지에 Referer 기반 핫링크 차단을 걸어 두고 있어서(`docs/DATA-SOURCES.md` 참고)
IP 기반 제한도 있을 수 있다고 본다.

**배포 후 가장 먼저 확인할 항목이다.** 막히면 응답을 캐시해 호출 자체를 줄이거나,
별도 프록시를 두는 방법을 검토해야 한다.

### 캐시 동작 확인

`next: { revalidate }` 는 "N초마다 갱신" 이 아니라 stale-while-revalidate 다. 기한이
지나도 들어온 요청에게는 낡은 값을 주고 갱신은 뒤에서 돈다. 개발 서버를 오래 띄워
뒀을 때 11일 전 순위가 나온 것도 이 때문이다.

프로덕션에서는 오히려 더 커진다. 캐시가 재시작을 넘어 살아남고, 인스턴스가 여러 개면
각자 자기 캐시를 들고 있어서 인스턴스마다 다른 숫자가 나올 수 있다. 위에 CDN 이
얹히면 한 겹 더 생긴다.

대응은 두 단계로 나눠 뒀다.

1. **드러내기 (적용됨)** — 우승 확률 응답에 `dataAsOf` 와 `staleDays` 를 넣어 화면에
   데이터 기준일을 띄운다. 밀리면 경고가 뜬다. 계산 시각(`generatedAt`)은 매 요청 새로
   찍히므로 신선도 지표가 될 수 없다. 둘을 구분해서 보여준다.
2. **없애기 (배포 때)** — fetch 에 `next: { tags: [...] }` 를 달고, 경기가 끝난 뒤
   GitHub Actions 에서 `revalidateTag` 를 호출하는 라우트를 친다. 잔여 경기 일정도
   이때 같이 갱신되므로 "경기 끝나는 날 기준" 갱신과 맞아떨어진다.

`cache: 'no-store'` 로 전부 돌리는 방법도 있지만, 한 화면을 그릴 때 네이버를 여러 번
때리게 되므로 위 2번을 먼저 본다.

캐시 주기는 그 뒤에 `src/lib/naver.ts` 의 `REVALIDATE` 로 모았다. **끝난 시즌과 끝난
경기는 더 바뀌지 않으므로 30일**로 늘렸고 진행 중인 것만 짧게 둔다. 호출이 줄어든
만큼 아래의 IP 차단 위험도 함께 줄었다.

### 비공개 API 의존이라는 전제

규격이 바뀌면 조용히 깨진다. 배포한다면 주요 API 응답을 주기적으로 점검하는 장치가
있으면 좋다.

## 라이선스 측면

구단 엠블럼은 각 구단 등록상표다. 지금은 비상업적 사용을 전제로 넣었으므로,
공개 배포하고 수익이 붙는다면 별도 라이선스가 필요하다.
자세한 내용은 `public/teams/README.md` 에 있다.
