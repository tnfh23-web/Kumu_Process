# Kumu Process 작업 지침

- 사용자 원본의 구성·비율·색·내용을 유지한다. 새 UI나 반응형 재배치를 임의로 추가하지 않는다.
- 원본은 1920 × 23,132px, 12개 섹션이다. 웹 폰트는 Pretendard다.
- GSAP / ScrollTrigger는 같은 호환 버전을 유지한다. 스크롤은 Lenis 하나로 smoothWheel:true, lerp:0.08을 사용하며 GSAP ticker 하나에서 raf(time*1000), scroll→ScrollTrigger.update, lagSmoothing(0)을 연결하고 cleanup한다. OS 모션 설정을 이유로 사용자가 요청한 연출을 자동으로 끄지 않는다.
- 기능·파일·스타일 변경 후 `docs/code-map.md`와 모션/원본 기록을 검토하고 `node scripts/verify.mjs`를 실행한다.
- 로컬 공통 지침과 코드맵 스킬: `C:\work(pf)\skills-hooks\AGENTS.md`, `C:\work(pf)\skills-hooks\.agents\skills\code-map\SKILL.md`.
- 코드맵 검사: `node C:\work(pf)\skills-hooks\.agents\skills\code-map\scripts\check-code-map.mjs --root .` (PowerShell에서는 경로를 작은따옴표로 감싼다.)
- 원본·캡처·다운로드 중간 파일은 `work/`, `qa/`에 보관한다. 개인정보·인증 정보·임시 Figma URL을 커밋하지 않는다.

- 로고·툴·팔레트는 완성된 구성 단위의 순차 페이드인만 사용한다. 내부 벡터·테두리·색·글자를 따로 움직이거나 mask/clip/scale로 채우지 않는다. 원그래프의 시계 방향 0→82% 채움만 예외다. 다른 콘텐츠는 잇고의 fade(scrub .25), fadeUp(y 100), popin(.75→1.04→1), 좌우 slide를 구성 전체에 적용하며, 스크롤을 되돌리면 복귀한다.
