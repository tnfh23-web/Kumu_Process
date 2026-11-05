# 코드맵

먼저 `index.html`의 섹션 구성 → `css/common.css`의 공통 디자인 → `css/layout.css`의 Figma 좌표 → `js/script.js`의 모션 순서로 읽습니다.

실행 진입점은 `index.html`입니다. 로컬에서 `node serve.mjs`로 확인합니다. 원격 저장소는 https://github.com/tnfh23-web/Kumu_Process 이며, GitHub Pages의 `main` 브랜치 루트를 배포 대상으로 사용합니다. 별도 빌드·서버 API·데이터베이스·인증·사용자 데이터 저장 기능은 없습니다.

| 파일 | 역할 | 연결되는 파일·기능 | 수정할 때 |
|---|---|---|---|
| `index.html` | 원본 순서의 12개 섹션, 102개 명시적 등장 구성·원본 트리거 좌표·실제 경계 wrapper, 직접 그린 SVG 파이, 접근성 링크와 빈 파비콘 지정 | 모든 CSS와 JS, assets | 문구·콘텐츠·이미지·섹션 구조 변경 |
| `css/style.css` | CSS 파일을 순서대로 불러오는 진입점 | fonts → reset → common → layout → responsive | 스타일 구성 변경 |
| `css/fonts.css` | 로컬 Pretendard Variable 로딩 | assets/fonts | 웹 글꼴 변경 |
| `css/reset.css` | 기본 여백과 요소 규칙, 최소 PC 폭, 키보드 포커스 | 전체 화면 | 브라우저 기본 스타일 문제 수정 |
| `css/common.css` | PC 캔버스, 경계 제한 wrapper/내부 좌표 plane, offscreen paint 생략, SVG 파이, TOP 버튼 스타일 | index.html, js/common.js | 전체 색·공통 요소·원본 보정 변경 |
| `css/layout.css` | Figma의 배치·크기·마스크·텍스트 스타일을 변환한 좌표 규칙 | index.html의 g 클래스와 노드 ID | 특정 원본 요소의 위치·비율 변경 |
| `css/responsive.css` | PC 단일 구성을 명시하고 인쇄 시 스크롤 변형 해제 | 전체 화면 | 인쇄와 표시 정책 변경 |
| `js/common.js` | PC 캔버스 배율, 앵커·TOP·키보드 탐색, resize 새로 계산 | ScrollSmoother, script.js 이벤트 | 탐색·스크롤 이동·크기 계산 변경 |
| `js/script.js` | 잇고의 fade/fadeUp/popin/좌우 slide, scroll scrub·역방향 복귀, SVG 파이 scroll 채움·counter, 스무딩·복구 | GSAP 3종, data-entry/data-entry-batch/data-entry-order | 등장 순서·수치·트리거·연출 변경 |
| `js/vendor/gsap.min.js` | GSAP 3.13.0 애니메이션 코어 | script.js | 공식 버전 업데이트 시 3종 함께 변경 |
| `js/vendor/ScrollTrigger.min.js` | GSAP 3.13.0 스크롤 진입 감지 | script.js, ScrollSmoother | 공식 버전 업데이트 시 3종 함께 변경 |
| `js/vendor/ScrollSmoother.min.js` | GSAP 3.13.0 네이티브 스크롤 보간 | common.js, script.js | 공식 버전 업데이트 시 3종 함께 변경 |
| `serve.mjs` | 외부 의존성 없는 로컬 정적 서버, 127.0.0.1:4173 | index.html과 로컬 자산 | 로컬 포트·파일 제공 방식 변경 |
| `scripts/verify.mjs` | 로컬 자산 존재·파일 크기·12개 섹션·원본 높이·임시 URL 잔존 검사 | HTML, CSS, JS, assets | 자산·구조 계약 변경 |

## 사용자의 동작과 처리 흐름

1. 페이지 열기 → HTML·로컬 자산 → 폰트/히어로 이미지 준비 → 단일 ScrollSmoother 생성 → data-entry/data-effect와 순서로 모션 설정 → 첫 화면 재생. 전체 마스크를 별도 decode하지 않습니다. 실패 시 내용과 기본 스크롤을 복구합니다.
2. 스크롤 → 원본 좌표(data-motion-top/height)×현재 PC 배율로 진입 계산 → 제목·본문 scrub fade, 카드/목업 fadeUp, 원형 카드 popin, 설명 좌우 slide. 역방향에서는 복귀합니다. 긴 이미지의 진입 높이는 650px로 제한합니다.
3. 리서치 질문이 화면 중앙 통과 → 30vh의 스크롤 동안 동일 반지름 SVG 파이를 시계 방향 0→82% 채움(scrub 1) → 별도 1.8초 숫자 counter. 막대는 행 전체가 좌측에서 순서대로 등장합니다.
4. Tool·로고·팔레트는 테두리·배경·글자를 완성된 구성으로 묶어 fade합니다. 팔레트는 행 제목 다음 왼쪽부터 200ms 간격입니다. 하위 벡터·mask는 애니메이션하지 않습니다. 전략 카드 hover translate는 scroll scale과 독립됩니다.
5. 화면 밖 섹션은 content-visibility:auto, 이미지는 native lazy 로딩. 경계가 제한된 wrapper 안의 entry-plane이 원본 Figma 좌표를 보존합니다. 이미지를 기다리려고 전체 페이지의 스타일/마스크를 탐색하지 않습니다.
6. TOP·건너뛰기 → 대상 타임라인 완성 → smoother.scrollTo(실패 시 native) → hash·초점 갱신. 내용·사용자 데이터를 외부 전송하지 않습니다.
7. ?capture=1 → ScrollSmoother/모션 생략, 모든 이미지 eager·모든 섹션 visible → 1920×23,132 정적 비교. 실제 모션·성능 검수는 일반 모드에서 별도로 수행합니다.

이미지와 SVG는 `assets/images/`, `assets/icons/`에 있습니다. SVG 내부의 원래 width/height는 보존합니다. PDF에서 유래한 RGB 원본과 회색 투명도 마스크는 luminance로, 단색 벡터 마스크는 alpha로 연결합니다. `work/`와 `qa/`는 원본·캡처·검수 결과를 보관하는 생성 경로이므로 Git과 코드맵 대상에서 제외합니다.

<!-- code-map-review:start -->
{
  "version": 1,
  "files": {
    "css/common.css": "f772fc49dc7292e71d8286ac8bac8ab2e4b9a04b0d77e5814a74aa724342d5a3",
    "css/fonts.css": "6d15c0c12f4c5d87e1b07b7d0807417f1ab68d4865b8ca781dbc9505f9deb1e9",
    "css/layout.css": "fc1462089e3e021bfe532af36906586120b1b8c262cc7089f79cf0576b7b9054",
    "css/reset.css": "add29fe8aeccee71d2e08ef6bf3552e73c77067b83bee84f837b0785bc923556",
    "css/responsive.css": "4de371ea7e646bf817cdb3e80c0dee9090a9042c1a1f6e271038493d24766da2",
    "css/style.css": "4b93cb712424731f2bdd87db4b2d5757873ea28186bc2657451ee3a4a0299c49",
    "index.html": "7510664e05cde1a0af58a24ca06295e9df09ef065759111becd2510043cf7d69",
    "js/common.js": "03f563e91337df51111a49c471dc39ef9f97c9de3c286baf9fd7c6f6ea67fdcf",
    "js/script.js": "a1c604ebaf1d0f8f50499584ea93b8953d72722d77b8be8f4d3471eb0d47c6df",
    "js/vendor/gsap.min.js": "96c01b81f44a3290e2b4532f55e2c9534b2adc43273a19f3756b2cb41f0fd0b6",
    "js/vendor/ScrollSmoother.min.js": "355efd1f57f43f3db5ca7138579730eaf471a5a803b2896e0a27d67c6e216940",
    "js/vendor/ScrollTrigger.min.js": "308219390e5e3b84cda0c481e70caa9820883ae10bda44e6e9a149a81aac4b3f",
    "scripts/verify.mjs": "1f3432cac4d30a7cf0f436b50cb286febf126350935bccef9b7b4a4a803d240d",
    "serve.mjs": "a1194648f68119a1c51f4e98dea7f2c9679c4b872a741cef6bc32aa31bf92f4d"
  }
}
<!-- code-map-review:end -->


