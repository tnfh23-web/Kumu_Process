# Lenis와 빠른 잇고 기준 인터랙션

사용자 정정에 따라 스크롤은 Lenis 1.3.27 하나로 구동한다. GSAP/ScrollTrigger는 3.13.0이다. Lenis 설정은 `new Lenis({smoothWheel:true, lerp:0.08})`, `lenis.on('scroll', ScrollTrigger.update)`, GSAP ticker의 `lenis.raf(time*1000)`, `gsap.ticker.lagSmoothing(0)`이다. autoRaf와 별도 RAF는 사용하지 않는다. 해제 시 자신의 ticker callback 제거, scroll 이벤트 해제, lenis.destroy를 수행한다. 전체 문서가 transform되는 wrapper는 없다.

레퍼런스: https://r00neyj.github.io/Eatgo_Process/ 의 .6초 fadeUp과 순차 등장. 사용자 요청에 따라 차트 완성을 빠르게 하고 스크롤 보간과 scrub 지연이 겹쳐 느려지는 부분을 줄였다. 로고 조각별 blur/scale과 curtain은 적용하지 않는다.

| 구성 | 동작 |
|---|---|
| Hero | 사진 y100→0, 설명 y-100→0, .8초 power1.out. 정보·툴·워드마크는 완성된 구성으로 순차 fade |
| label / 원형 전략 카드 | popin scale .75→1(.4초)→1.04(.15초)→1(.15초), scrub .25 |
| 제목·본문·질문·서체 | 전체 opacity 0→1, scrub .25 |
| 문제 카드·기기 목업·화면·적용 사진·Flow | 전체 y100→0·opacity 0→1, .6초 power1.out, 행 간격 .12초 |
| 화면 annotation | 좌/우 폭의 ±25%→0·opacity 0→1, scrub .25 |
| Tool·로고·팔레트 | 테두리·도형·문구를 완성된 구성으로 .6초 fade. 같은 행은 .12초 간격, 왼쪽부터 |
| 리서치 막대 | 질문 중앙 진입 후 왼쪽 고정 width 0→원본 길이와 0→37/28/21/14% 카운트를 같은 progress로 .6초에 완성. 행 간격 .12초. 숫자는 끝을 따라가고 설명은 제자리 fade |
| 원그래프 | 같은 중심·반지름 140의 native SVG 원/82% 부채꼴. 30vh 스크롤로 시계 방향 채움(scrub .25), 숫자는 .6초 counter. 빈 곳에 흰 문구가 걸리지 않게 채워진 뒤 caption fade |
| 전략 카드 hover | scroll scale과 별개로 translate y -9.6px, .3초 |

일반 트리거는 top bottom→bottom 75%, toggleActions play none none reverse다. 긴 화면은 첫 650px에서 등장을 완성한다. 역방향에는 효과가 복귀하고, 앵커/키보드 탐색 시 대상 구성을 완성해 접근을 보장한다. 5초 visibility failsafe 후에도 늦게 준비된 모션이 시작되며 늦은 첫 화면은 완성 상태로 유지한다. 실패 시 기본 스크롤·완성 차트·본문이 남는다.

## 목업 렌더링

전체 섹션 크기로 잡던 wrapper는 앞선 수정에서 실제 경계로 제한했다. 이번에는 30개 이미지 컨테이너의 RGB 원본과 alpha/luminance 마스크를 미리 합쳐 24개 무손실 투명 WebP로 연결했다. 필수 투명도·크롭과 원본 배치는 유지한다. 단색/둥근 SVG 배경 11곳은 같은 색·크기의 CSS로 바꿨다. native 문서 스크롤에서는 content-visibility:auto의 큰 섹션 활성화를 사용하지 않으며 브라우저의 기본 culling과 native lazy image를 사용한다.

## 첫 방문과 새로고침

Lenis는 폰트·히어로 decode를 기다리기 전에 시작한다. 이미지 디코드는 화면 높이 4배(최대 4000px) 근처에서 idle에 한 장씩 처리하며 WebP·PNG·JPEG만 수동 큐에 포함한다. 500px 안의 구성만 합성 레이어를 준비하고 벗어나면 해제한다. wrapper는 paint 경계를 제한한다. 잘난체는 첫 모션 설정 전에 준비해 중간 스크롤 중 글꼴 교체를 피한다. 고정 tween은 resize refresh 때 invalidate하지 않는다. 모든 이미지에 async decode를 명시한다. 모션의 시간·배치·이미지 치수는 유지한다.

1920×1080 인앱 브라우저에서 로컬 자산 URL을 새로 만들어 첫 방문을 검사하고 같은 URL을 새로고침했다. 각 휠 입력 뒤 1.6초 RAF 표본을 수집하고 화면/AX 수집은 표본 종료 후 수행했다. 2페이지 입력 9회로 전체를 통과했을 때 첫 방문 최대17~19ms, 새로고침 최대17~21ms, 50ms 초과0회였다. 4페이지씩 한 번에 넘기는 별도 입력에서는 83~233ms 단발 프레임도 관측해 모든 입력·기기의 무지연으로 일반화하지 않는다. 외부 CDN의 완전히 비어 있는 캐시는 이 로컬 자산 검사와 구분한다.

## 이전 확인 근거

1280×720 PC 브라우저에서 GUI 시작→20회 동일 .35페이지 휠 입력으로 메인 화면까지 비교했다. 이전 버전 d46d526의 50ms 초과 프레임 55회/평균26.09ms/최대897.3ms, 수정 후 1회/평균16.89ms/최대100ms를 기록했다. 실행 환경·캐시·진입 상태에 따라 수치는 달라지며 모든 기기의 무지연을 보장하지 않는다. 원본과 미리 합친 자산의 전체 비교는 1280×15,421px 정적 캡처로 수행했다. 레이아웃·텍스트는 유지하며 이미지 리샘플링·투명도·둥근 모서리에서 소폭 픽셀 차이가 있다. 원본 1920×23,132의 ?capture=1도 유지한다.

## 2026-11-08 최종 스크롤 정책

사용자 최종 요청으로 큰 휠 입력의 native 전환과 방향 반전 보정을 제거했다. 큰 입력·작은 입력 모두 smoothWheel:true, lerp:.08의 기본 Lenis를 사용하며 virtualScroll 콜백·휠 거리 변환·반전 시 scrollTo 호출은 없다. 단일 GSAP ticker와 기존 등장 시작 위치·차트·역스크롤 연출은 유지한다.

메인 화면 목업의 정적인 CSS polygon 잘림은 같은 1112×3722 RGBA에 반영한 lossless WebP로 유지한다(1,433,252 → 1,426,474 bytes). 125% 캡처의 해당 섹션 전후 픽셀 차이는 0이었다. 앞선 native burst 비교 수치는 최종 입력 방식의 검증 결과로 사용하지 않는다.
