# 잇고 기준 스크롤 인터랙션

사용자 지정 레퍼런스 https://r00neyj.github.io/Eatgo_Process/ 의 실제 HTML과 JavaScript를 확인했다. 단순 일회성 opacity 등장 대신 아래 효과·시점·복귀 규칙을 쿠무의 완성된 구성에 대응한다. 레퍼런스의 로고 조각별 blur/scale과 curtain은 사용자가 거부했으므로 적용하지 않는다.

| 쿠무 구성 | 레퍼런스에서 가져온 동작 |
|---|---|
| Hero | 사진 y 100→0, 설명 y -100→0, 1초 power1.out. 정보·툴·워드마크는 완성된 구성의 순차 fade |
| 섹션 label / 전략 원형 카드 | popin: scale .75·opacity 0→scale 1→1.04→1, scrub 1 |
| 제목·설명·질문·서체 | fade: opacity 0→1, scrub 1 |
| 문제 카드·기기 목업·화면·적용 사진·Flow | fadeUp: y 100→0·opacity 0→1, .6초 power1.out, 같은 행 200ms 간격 |
| 막대 행·화면 annotation | slideLeft/Right: 구성 전체가 폭의 ±25%→0·opacity 0→1, scrub 1 |
| Tool·전체 로고·팔레트 | .6초 순차 fade. 테두리·도형·글자 분리 없음, 마스크 채움 없음. 팔레트는 행 제목 다음 왼쪽부터 |
| 원그래프 | 질문이 화면 중앙에 오면 시작, 화면 높이 30%를 스크롤하는 동안 시계 방향 0→82%, scrub 1. 수치는 별도 1.8초 counter |
| 전략 카드 hover | 레퍼런스 up 효과와 같은 -0.5vw(1920 기준 -9.6px), .3초. scroll scale과 독립된 CSS translate |

일반 트리거는 top bottom→bottom 75%, toggleActions play none none reverse. 긴 화면 이미지는 첫 650px 구간에서 등장을 완성해 읽기 전에 전체 화면을 볼 수 있도록 한다. 로고와 팔레트는 같은 행의 첫 구성 위치에서 순차 재생한다. 역방향에서는 각 구성과 차트가 복귀한다.

## 그래프와 성능

파이는 이미지 조각 없이 중심 (140,140), 반지름 140의 배경 원과 82% SVG 부채꼴로 그린다. r 70·stroke-width 140의 원형 마스크 dashoffset으로 시계 방향 채움을 제어하며, 두 원의 외곽 반지름이 같다. 흰색 caption이 빈 영역에 걸쳐 반쪽만 보이지 않도록 해당 위치가 채워진 뒤 전체를 fade한다. 접근성 설명은 최종 82%를 제공한다.

102개 등장 구성을 유지하면서, 68개 전체 섹션 크기 wrapper를 콘텐츠 경계+여백 크기로 줄였다. wrapper 면적 합은 328,773,120→21,947,526px²(93.3% 감소). 내부 좌표 plane은 원본 배치를 보존하고 바깥 wrapper가 paint를 제한한다. 단일 히어로 직사각형 중복 마스크 40개를 제거했다. 필수 이미지 투명도/크롭 마스크는 유지한다.

모든 CSS 마스크를 getComputedStyle로 찾고 별도 Image로 decode하던 선처리를 제거했다. 첫 화면만 준비를 기다리며 나머지는 native lazy image, content-visibility:auto를 사용한다. ScrollTrigger는 저장된 원본 좌표×PC 배율을 사용해 화면 밖 콘텐츠의 레이아웃을 강제하지 않는다. smooth .75의 ScrollSmoother 하나만 사용한다. 별도 스크롤 RAF 루프나 중복 스크롤 라이브러리는 없다.

정적 검수 모드 ?capture=1은 content-visibility와 lazy 로딩을 해제해 원본 크기 1920×23,132 전체를 비교한다. 모션 초기화 실패 시 내용·82% 파이와 기본 스크롤을 복구한다. 파비콘은 빈 data URL로 유지하고 Figma 외부 링크는 UI/README에 표시하지 않는다.

검수: 12개 섹션의 전후 전체 캡처 비교, 파이 중간/완료/역방향 상태, 로고·툴 하위 요소에 개별 transform·opacity 변경이 없는지, 동일 viewport의 실제 입력 전후 프레임 샘플을 확인한다. 성능 수치는 실행 환경에 따라 달라지며 전체 기기의 무지연을 보장하는 수치로 사용하지 않는다.
