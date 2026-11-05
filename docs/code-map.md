# 코드맵

먼저 `index.html`의 섹션 구성 → `css/common.css`의 공통 디자인 → `css/layout.css`의 Figma 좌표 → `js/script.js`의 모션 순서로 읽습니다.

실행 진입점은 `index.html`입니다. 로컬에서 `node serve.mjs`로 확인합니다. 원격 저장소는 https://github.com/tnfh23-web/Kumu_Process 이며, GitHub Pages의 `main` 브랜치 루트를 배포 대상으로 사용합니다. 별도 빌드·서버 API·데이터베이스·인증·사용자 데이터 저장 기능은 없습니다.

| 파일 | 역할 | 연결되는 파일·기능 | 수정할 때 |
|---|---|---|---|
| `index.html` | 원본 순서의 12개 섹션, 선택 가능한 본문, 로고·목업 자산과 접근성 링크 | 모든 CSS와 JS, assets | 문구·콘텐츠·이미지·섹션 구조 변경 |
| `css/style.css` | CSS 파일을 순서대로 불러오는 진입점 | fonts → reset → common → layout → responsive | 스타일 구성 변경 |
| `css/fonts.css` | 로컬 Pretendard Variable 로딩 | assets/fonts | 웹 글꼴 변경 |
| `css/reset.css` | 기본 여백과 요소 규칙, 최소 PC 폭, 키보드 포커스 | 전체 화면 | 브라우저 기본 스타일 문제 수정 |
| `css/common.css` | PC 캔버스, 문제 카드·메인 설명 UI, TOP 버튼과 모션 보조 스타일 | index.html, js/common.js | 전체 색·공통 요소·원본 보정 변경 |
| `css/layout.css` | Figma의 배치·크기·마스크·텍스트 스타일을 변환한 좌표 규칙 | index.html의 g 클래스와 노드 ID | 특정 원본 요소의 위치·비율 변경 |
| `css/responsive.css` | PC 단일 구성을 명시하고 인쇄 시 스크롤 변형 해제 | 전체 화면 | 인쇄와 표시 정책 변경 |
| `js/common.js` | PC 캔버스 배율, 앵커·TOP·키보드 탐색, resize 새로 계산 | ScrollSmoother, script.js 이벤트 | 탐색·스크롤 이동·크기 계산 변경 |
| `js/script.js` | 섹션/행별 등장, 차트와 카운터, 목업·로고, hover, 초기화와 실패 복구 | GSAP 3종, data-copy/data-reveal/data-node-id | 등장 순서·수치·트리거·연출 변경 |
| `js/vendor/gsap.min.js` | GSAP 3.13.0 애니메이션 코어 | script.js | 공식 버전 업데이트 시 3종 함께 변경 |
| `js/vendor/ScrollTrigger.min.js` | GSAP 3.13.0 스크롤 진입 감지 | script.js, ScrollSmoother | 공식 버전 업데이트 시 3종 함께 변경 |
| `js/vendor/ScrollSmoother.min.js` | GSAP 3.13.0 네이티브 스크롤 보간 | common.js, script.js | 공식 버전 업데이트 시 3종 함께 변경 |
| `serve.mjs` | 외부 의존성 없는 로컬 정적 서버, 127.0.0.1:4173 | index.html과 로컬 자산 | 로컬 포트·파일 제공 방식 변경 |
| `scripts/verify.mjs` | 로컬 자산 존재·파일 크기·12개 섹션·원본 높이·임시 URL 잔존 검사 | HTML, CSS, JS, assets | 자산·구조 계약 변경 |

## 사용자의 동작과 처리 흐름

1. 페이지 열기 → HTML 본문과 로컬 자산 표시 → 폰트/히어로 미디어 준비 → ScrollSmoother 단일 생성 → 각 요소의 원래 화면 위치를 기준으로 등장 그룹 구성 → 첫 화면 재생. 초기화 실패 시 본문과 기본 스크롤을 유지합니다.
2. 스크롤 → 네이티브 scroll 위치를 ScrollSmoother가 보간 → ScrollTrigger가 섹션/행 진입을 감지 → 제목·본문·미디어가 겹치는 간격으로 완성됩니다. 등장 타임라인은 scrub이 아니어서 입력을 멈춰도 끝까지 재생됩니다.
3. 리서치 진입 → 원형 차트 등장 → 막대가 왼쪽에서 성장 → 82/37/28/21/14%로 수치 완성. 원본의 ‘가상의 설문 결과’ 표시는 유지합니다.
4. 전략 원형 카드 hover → 해당 카드 번호가 짧게 이동·회전 → 포인터가 벗어나면 복원합니다. 3개 원은 개별 등장 대상으로 유지합니다.
5. TOP·건너뛰기 선택 → 대상 콘텐츠의 준비 상태 해제 → smoother.scrollTo (실패 시 네이티브 이동) → hash와 키보드 포커스 갱신. 내용·사용자 데이터는 서버로 전송하지 않습니다.
6. `?capture=1` → 정적 비교 모드 → 모션·ScrollSmoother 초기화를 생략하고 원본 크기 전체 캡처를 허용합니다. 실제 모션 검수와 분리합니다.

이미지와 SVG는 `assets/images/`, `assets/icons/`에 있습니다. SVG 내부의 원래 width/height는 보존합니다. PDF에서 유래한 RGB 원본과 회색 투명도 마스크는 luminance로, 단색 벡터 마스크는 alpha로 연결합니다. `work/`와 `qa/`는 원본·캡처·검수 결과를 보관하는 생성 경로이므로 Git과 코드맵 대상에서 제외합니다.

<!-- code-map-review:start -->
{
  "version": 1,
  "files": {
    "css/common.css": "9c978d17096519fc2ac374556f419ea4fd85390bd93c5dbead41b56fb753f08b",
    "css/fonts.css": "6d15c0c12f4c5d87e1b07b7d0807417f1ab68d4865b8ca781dbc9505f9deb1e9",
    "css/layout.css": "fc1462089e3e021bfe532af36906586120b1b8c262cc7089f79cf0576b7b9054",
    "css/reset.css": "add29fe8aeccee71d2e08ef6bf3552e73c77067b83bee84f837b0785bc923556",
    "css/responsive.css": "4de371ea7e646bf817cdb3e80c0dee9090a9042c1a1f6e271038493d24766da2",
    "css/style.css": "324e379ac5d047de274a6cc6c766acb6f6f114d295abfd6a17b8b924fa767950",
    "index.html": "45a1436c09e295a9d92f0a33816c00be6217904f2b0d4e25aee0525a573dbc92",
    "js/common.js": "03f563e91337df51111a49c471dc39ef9f97c9de3c286baf9fd7c6f6ea67fdcf",
    "js/script.js": "002386cab568b6db16dacc4a573ae4e8510e5fa39b1dc22b4becdc94765bfcd4",
    "js/vendor/gsap.min.js": "96c01b81f44a3290e2b4532f55e2c9534b2adc43273a19f3756b2cb41f0fd0b6",
    "js/vendor/ScrollSmoother.min.js": "355efd1f57f43f3db5ca7138579730eaf471a5a803b2896e0a27d67c6e216940",
    "js/vendor/ScrollTrigger.min.js": "308219390e5e3b84cda0c481e70caa9820883ae10bda44e6e9a149a81aac4b3f",
    "scripts/verify.mjs": "6744f0d87e4f7deab82cd35ebbff7c707e0e3cf6e9fc0b1b41c527c3ec6f58cb",
    "serve.mjs": "a1194648f68119a1c51f4e98dea7f2c9679c4b872a741cef6bc32aa31bf92f4d"
  }
}
<!-- code-map-review:end -->


