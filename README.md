# Kumu Process

사람과 반려견이 함께 머무는 카페 **쿠무**의 웹 브랜딩 제작 과정입니다. 기획·리서치·문제 정의부터 브랜딩, 디자인 시스템, 브랜드 목업, 사용자 흐름, 메인/서브 UI까지 한 페이지에 담았습니다.

- 웹: https://tnfh23-web.github.io/Kumu_Process/
- 기존 쿠무 서비스: https://tnfh23-web.github.io/kumu/
- 디자인: https://www.figma.com/design/Rj5QW4oiiAkualsA6idxK2/?node-id=379-164

## 실행

Node.js로 아래 명령을 실행한 뒤 `http://127.0.0.1:4173`을 엽니다.

```sh
node serve.mjs
```

별도 설치·빌드 과정 없이 HTML, CSS, JavaScript로 작동합니다. GitHub Pages는 루트의 `index.html`을 제공합니다.

## 화면과 모션

1920 × 23,132px 원본의 12개 섹션을 기준으로 구현했습니다. 데스크톱에서는 같은 구성의 비율을 유지하며, 모바일·태블릿용 재배치는 포함하지 않습니다. 최소 표시 폭은 1280px입니다.

웹 텍스트는 로컬 Pretendard Variable을 사용합니다. 로고·제품 사진·화면 속 이미지에 포함된 글자는 원본 디자인을 유지합니다. Figma의 이미지, SVG, 분리된 투명도 마스크를 로컬 자산으로 사용하며, 메인 UI의 화면 이미지는 사용자 제공 PNG에서 추출했습니다.

GSAP 3.13.0, ScrollTrigger, ScrollSmoother로 첫 진입과 섹션별 순차 등장, 로고/목업의 마스크 등장, 차트·수치 완성, 원형 카드의 순차 등장과 hover, 부드러운 스크롤을 구현했습니다. 라이브러리 초기화 실패 시 본문을 읽을 수 있는 기본 스크롤을 유지합니다.

참고한 모션: [Eatgo Process](https://r00neyj.github.io/Eatgo_Process/). 쿠무의 배치·이미지·문구는 사용자 원본을 따릅니다.

## 유지보수와 검증

- 파일 역할과 동작 흐름: [docs/code-map.md](docs/code-map.md)
- 원본 기준과 알려진 차이: [design/reference-notes.md](design/reference-notes.md)
- 모션 계획: [design/motion-plan.md](design/motion-plan.md)
- 자산·구조 검사: `node scripts/verify.mjs`
- 정적 시각 비교용 주소: `/?capture=1` (모션과 스무딩을 적용하지 않음)
- QA 캡처와 원본 파일은 로컬 `qa/`, `work/`에 보관하며 저장소에는 올리지 않습니다.

서버·데이터베이스·로그인·외부 API 연결이 없는 정적 소개 페이지입니다.


