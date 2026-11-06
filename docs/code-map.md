# 코드맵

먼저 `index.html`의 섹션 구성 → `css/common.css`의 공통 디자인 → `css/layout.css`의 Figma 좌표 → `js/script.js`의 모션 순서로 읽습니다.

실행 진입점은 `index.html`이며 5개 스크립트를 head에서 defer 순서로 요청합니다. 로컬에서 `node serve.mjs`로 확인합니다. 원격 저장소는 https://github.com/tnfh23-web/Kumu_Process 이며, GitHub Pages의 `main` 브랜치 루트를 배포 대상으로 사용합니다. 별도 빌드·서버 API·데이터베이스·인증·사용자 데이터 저장 기능은 없습니다.

| 파일 | 역할 | 연결되는 파일·기능 | 수정할 때 |
|---|---|---|---|
| `index.html` | 원본 순서의 12개 섹션, 102개 명시적 등장 구성·원본 트리거 좌표·실제 경계 wrapper, 직접 그린 SVG 파이, 접근성 링크와 빈 파비콘 지정 | 모든 CSS와 JS, assets | 문구·콘텐츠·이미지·섹션 구조 변경 |
| `css/style.css` | CSS 파일을 순서대로 불러오는 진입점 | lenis → fonts → reset → common → layout → responsive | 스타일 구성 변경 |
| `css/fonts.css` | 로컬 Pretendard Variable 로딩, 왼쪽 잘난체 샘플 범위와 Aa 기준선 보정 | assets/fonts | 웹 글꼴 변경 |
| `css/reset.css` | 기본 여백과 요소 규칙, 최소 PC 폭, 키보드 포커스 | 전체 화면 | 브라우저 기본 스타일 문제 수정 |
| `css/common.css` | PC 캔버스, 경계 제한 wrapper/내부 좌표 plane, native document 흐름, SVG 파이, TOP 버튼 스타일 | index.html, js/common.js | 전체 색·공통 요소·원본 보정 변경 |
| `css/layout.css` | Figma의 배치·크기·마스크·텍스트 스타일을 변환한 좌표 규칙 | index.html의 g 클래스와 노드 ID | 특정 원본 요소의 위치·비율 변경 |
| `css/responsive.css` | PC 단일 구성을 명시하고 인쇄 시 스크롤 변형 해제 | 전체 화면 | 인쇄와 표시 정책 변경 |
| `js/common.js` | PC 캔버스 배율, 앵커·TOP·키보드 탐색, resize 새로 계산 | Lenis, script.js 이벤트 | 탐색·스크롤 이동·크기 계산 변경 |
| `js/script.js` | 잇고의 fade/fadeUp/popin/좌우 slide, scroll scrub·역방향 복귀, SVG 파이 scroll 채움·counter, native 막대 width·counter 동기화, 잘난체 FontFace 비동기 등록, 스무딩·복구 | GSAP/ScrollTrigger + Lenis, data-entry/data-entry-batch/data-entry-order | 등장 순서·수치·트리거·연출 변경 |
| `js/vendor/gsap.min.js` | GSAP 3.13.0 애니메이션 코어 | script.js | GSAP와 ScrollTrigger를 함께 검증 |
| `js/vendor/ScrollTrigger.min.js` | GSAP 3.13.0 스크롤 진입 감지 | script.js, Lenis | GSAP와 ScrollTrigger를 함께 검증 |
| `js/vendor/lenis.min.js` | Lenis 1.3.27, smoothWheel·lerp .08 | script.js의 단일 GSAP ticker | Lenis 공식 버전 변경 때 |
| `css/lenis.css` | Lenis 1.3.27 권장 높이·스크롤 상태 스타일 | style.css, lenis.min.js | Lenis와 함께 변경 때 |
| `serve.mjs` | 외부 의존성 없는 로컬 정적 서버, 127.0.0.1:4173 | index.html과 로컬 자산 | 로컬 포트·파일 제공 방식 변경 |
| `scripts/verify.mjs` | 로컬 자산 존재·파일 크기·12개 섹션·원본 높이·임시 URL 잔존 검사 | HTML, CSS, JS, assets | 자산·구조 계약 변경 |

## 사용자의 동작과 처리 흐름

1. 페이지 열기 → HTML·로컬 자산 → 폰트/히어로 이미지 준비 → 단일 Lenis 생성(smoothWheel:true, lerp:.08), GSAP ticker에서 raf(time*1000)·scroll→ScrollTrigger.update·lagSmoothing(0) 연결 → data-entry/data-effect와 순서로 모션 설정 → 첫 화면 재생. 그 뒤 설치된 잘난체2 원본을 FontFace로 별도 로드·등록해 서체 샘플에만 적용하므로 시작 스크롤은 글꼴 다운로드를 기다리지 않습니다. 전체 마스크를 별도 decode하지 않습니다. 5초 visibility failsafe 후에도 늦게 준비된 스크롤 모션을 시작합니다. 실패 시 내용·완성 차트와 기본 스크롤을 복구합니다.
2. 스크롤 → 원본 좌표(data-motion-top/height)×현재 PC 배율로 진입 계산 → 제목·본문 scrub fade, 카드/목업 fadeUp, 원형 카드 popin, 설명 좌우 slide. 역방향에서는 복귀합니다. 긴 이미지의 진입 높이는 650px로 제한합니다.
3. 리서치 질문이 화면 중앙 통과 → 30vh의 스크롤 동안 동일 반지름 SVG 파이를 시계 방향 0→82% 채움(scrub .25) → 별도 .6초 숫자 counter. 막대는 질문 중앙 진입 시 왼쪽 위치를 고정한 채 원본 길이까지 늘어나고 숫자도 0→37/28/21/14%로 함께 증가합니다(.6초, 행 간격 .12초). 숫자는 막대 끝을 따라가며 설명은 제자리 fade입니다.
4. Tool·로고·팔레트는 테두리·배경·글자를 완성된 구성으로 묶어 fade합니다. 팔레트는 행 제목 다음 왼쪽부터 120ms 간격입니다. 하위 벡터·mask는 애니메이션하지 않습니다. 전략 카드 hover translate는 scroll scale과 독립됩니다.
5. Lenis는 전체 페이지를 transform하지 않고 native 문서 스크롤을 사용합니다. 이미지 컨테이너 30곳은 마스크를 미리 합친 무손실 WebP 24개로 교체했고, 단색/둥근 배경 11곳은 CSS입니다. 섹션 content-visibility:auto에 따른 한꺼번에 그리기를 제거했으며 이미지는 native lazy 로딩합니다. 경계가 제한된 wrapper 안의 entry-plane이 원본 Figma 좌표를 보존합니다. 이미지를 기다리려고 전체 페이지의 스타일/마스크를 탐색하지 않습니다.
6. TOP·건너뛰기 → 대상 타임라인 완성 → PC 배율을 반영한 숫자 좌표로 lenis.scrollTo(실패 시 native) → hash·초점 갱신. 내용·사용자 데이터를 외부 전송하지 않습니다. pagehide/unmount 시 자신의 ticker callback을 제거하고 Lenis 이벤트·인스턴스와 context만 정리합니다.
7. ?capture=1 → Lenis/모션 생략, 모든 이미지 eager·모든 섹션 visible → 1920×23,132 정적 비교. 실제 모션·성능 검수는 일반 모드에서 별도로 수행합니다.

이미지와 SVG는 `assets/images/`, `assets/icons/`에 있고 미리 합친 투명 이미지는 `assets/images/optimized/`에 있습니다. SVG 내부의 원래 width/height는 보존합니다. RGB 원본과 회색 투명도 마스크의 luminance, 단색 마스크의 alpha를 오프라인에서 곱해 투명 이미지를 만들었습니다. 원본 자산도 남겨두며 변경하지 않은 작은 벡터의 정적 마스크만 런타임에 유지합니다. `work/`와 `qa/`는 원본·캡처·검수 결과를 보관하는 생성 경로이므로 Git과 코드맵 대상에서 제외합니다.

<!-- code-map-review:start -->
{
  "version": 1,
  "files": {
    "css/common.css": "b40cfde48cdb1218388d443ef554011a33e5ed9833d5f4f352727f1b4dad2c49",
    "css/fonts.css": "dd0f49f79748fa491ce2e09ffdf0fa7ab55cb43b25bdd7b581f5f3d631b8254d",
    "css/layout.css": "fc1462089e3e021bfe532af36906586120b1b8c262cc7089f79cf0576b7b9054",
    "css/lenis.css": "2f668ae84a668327f246faf8a770383a2bf69196d214290fbc4d5548910606c5",
    "css/reset.css": "add29fe8aeccee71d2e08ef6bf3552e73c77067b83bee84f837b0785bc923556",
    "css/responsive.css": "4ba755a207c1ca281a0ee7339bcc6482a29dbc3484887432ba571aa17f77a651",
    "css/style.css": "cb3e53325c5ee3835a8f59f0e6bc1fb676287cea4493db45876697a417cab093",
    "index.html": "7d5d95d591734f00027dd6da8f06fae2743c788d6bfe36236064579afaf8e297",
    "js/common.js": "944b0c2874d8d0c952420153844487d721b3a34a6d8d563a4a793ca4fcd2c565",
    "js/script.js": "fdcc651f59aa96368785e39c81ac6f43ba489c67137b3bb546adbb2c2a8336e4",
    "js/vendor/gsap.min.js": "96c01b81f44a3290e2b4532f55e2c9534b2adc43273a19f3756b2cb41f0fd0b6",
    "js/vendor/lenis.min.js": "80f53e77f1c13e379fc246d2b5e299188e20bcb2b2fe7ebb13e8e8c7563a6da7",
    "js/vendor/ScrollTrigger.min.js": "308219390e5e3b84cda0c481e70caa9820883ae10bda44e6e9a149a81aac4b3f",
    "scripts/verify.mjs": "9043c688d83455e8946c6f81bbf92dd8cae931dd3cdcf844dafe9c4805e8b63c",
    "serve.mjs": "8e21e6ceced867079178215f673e7a06c07f78f7a463ddfbddf24722be712991"
  }
}
<!-- code-map-review:end -->


