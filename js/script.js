/* Kumu process: independent entry sequences, research chart, and brand media.
   References and verified behavior are documented in design/motion-plan.md. */
(() => {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const node = id => $(`[data-node-id="379:${id}"]`);
  const main = $('.process-canvas');
  const motion = {state:'preparing', groups:[], smoother:null, entries:[], errors:[]};
  window.kumuMotion = motion;
  if(new URLSearchParams(location.search).has('capture')) {
    main.dataset.motion='static-capture';motion.state='static-capture';return;
  }
  if (!window.gsap || !window.ScrollTrigger || !window.ScrollSmoother) {
    main.dataset.motion = 'native-fallback';
    motion.state = 'native-fallback';
    return;
  }
  const {gsap, ScrollTrigger, ScrollSmoother} = window;
  let context;
  function finishAll() {
    motion.groups.forEach(group => { group.timeline.progress(1); group.trigger?.kill(); });
    $$('[data-motion-state]').forEach(el => {el.style.opacity='';el.style.visibility='';el.dataset.motionState='entered';});
  }
  function recover(error) {
    motion.errors.push(String(error));
    context?.revert();
    motion.smoother?.kill();
    finishAll();
    main.dataset.motion='native-fallback';
    motion.state='native-fallback';
    console.error('Kumu motion initialization:',error);
  }
  function prepareCandidates() {
    const candidates = new Set($$('[data-copy],[data-reveal]'));
    $$('[data-name^="image_"],[data-name^="Strategy Card "],[data-node-id]').forEach(el => {
      const style=getComputedStyle(el);
      if(style.display==='contents' || el.matches('section,[data-copy]')) return;
      const r=el.getBoundingClientRect();
      const scale=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--canvas-scale'));
      const w=r.width/scale,h=r.height/scale;
      const media=el.dataset.name?.startsWith('image_');
      const vector=style.display==='flex' && el.querySelector('img') && !el.querySelector('[data-copy]');
      if((media && w>80 && h>65) || (vector && w>8 && h>8 && w*h<1800000) || el.dataset.name?.startsWith('Strategy Card ')) candidates.add(el);
    });
    return [...candidates].filter(el => {
      if(getComputedStyle(el).display==='contents') return false;
      let parent=el.parentElement;
      while(parent && parent!==main) {
        if(candidates.has(parent) && getComputedStyle(parent).display!=='contents') return false;
        parent=parent.parentElement;
      }
      return el.getBoundingClientRect().width>0;
    });
  }
  const chartIds=new Set(['304','305','307','317','318','322','323','327','328','332','333']);
  function chart() {
    const elements=[304,305,307,317,318,322,323,327,328,332,333].map(node).filter(Boolean);
    const tl=gsap.timeline({paused:true,onStart(){elements.forEach(el=>el.dataset.motionState='entering');},onComplete(){elements.forEach(el=>el.dataset.motionState='entered');}});
    gsap.set(elements,{autoAlpha:0});
    tl.fromTo([node(304),node(305)],{scale:.65,autoAlpha:0},{scale:1,autoAlpha:1,duration:1.05,ease:'power3.out',stagger:.12},0);
    [[317,318,37],[322,323,28],[327,328,21],[332,333,14]].forEach(([barId,countId,value],i)=>{
      const bar=node(barId), label=node(countId), number={value:0};
      if(!bar||!label) return;
      label.setAttribute('aria-label',value+'%');
      label.classList.add('chart-count');
      label.textContent='0%';
      tl.fromTo(bar,{scaleX:0,autoAlpha:1},{scaleX:1,duration:.95,transformOrigin:'left center',ease:'power3.out'},.3+i*.16);
      tl.to(label,{autoAlpha:1,duration:.25},.4+i*.16);
      tl.to(number,{value,duration:1.15,ease:'power2.out',onUpdate(){label.textContent=Math.round(number.value)+'%';}},.4+i*.16);
    });
    const count=node(307),percent={value:0};
    count.setAttribute('aria-label','82%');count.textContent='0%';
    tl.to(count,{autoAlpha:1,duration:.3},.35);
    tl.to(percent,{value:82,duration:1.6,ease:'power2.out',onUpdate(){count.textContent=Math.round(percent.value)+'%';}},.35);
    const trigger=ScrollTrigger.create({trigger:node(302),start:'top 78%',animation:tl,toggleActions:'play none none none',once:true});
    motion.groups.push({name:'research-chart',timeline:tl,trigger,elements});
  }
  function setupEntries(candidates) {
    const height=window.innerHeight;
    const sorted=candidates.map(el=>({el,rect:el.getBoundingClientRect()})).sort((a,b)=>a.rect.top-b.rect.top || a.rect.left-b.rect.left);
    const groups=[];
    sorted.forEach(item=>{
      const id=item.el.dataset.nodeId?.split(':')[1];
      if(chartIds.has(id)) return;
      const section=item.el.closest('section');
      let group=groups.at(-1);
      if(!group || group.section!==section || item.rect.top-group.top>Math.min(240,height*.32)) {
        group={section,top:item.rect.top,items:[]};groups.push(group);
      }
      group.items.push(item.el);
    });
    groups.forEach((group,groupIndex)=>{
      const tl=gsap.timeline({paused:true,onStart(){group.items.forEach(el=>el.dataset.motionState='entering');},onComplete(){group.items.forEach(el=>{el.dataset.motionState='entered';el.style.willChange='auto';});}});
      group.items.forEach((el,index)=>{
        const originalOpacity=parseFloat(getComputedStyle(el).opacity)||1;
        const media=el.querySelector('img') || el.tagName==='IMG';
        const kind=el.dataset.reveal;
        const card=el.classList.contains('problem-card') || el.dataset.name?.startsWith('Strategy Card ');
        const delay=Math.min(index*.14,.8)+(parseFloat(el.dataset.delay)||0);
        el.dataset.motionState='idle';el.classList.add('motion-layer');
        const from={autoAlpha:0,y:media?70:32};
        const to={autoAlpha:originalOpacity,y:0,duration:media?1.05:.8,ease:'power3.out'};
        if(card) {from.y=85;from.rotationX=6;to.rotationX=0;to.duration=1.1;}
        if(kind==='note') {from.x=el.classList.contains('left')?-35:35;from.y=0;to.x=0;}
        if(kind==='chevron') {from.y=-16;to.duration=.5;}
        // Image windows and labels use a reveal of their own; body copy remains readable.
        if(media && !card && el.getBoundingClientRect().height<window.innerHeight*1.1) {
          from.clipPath='inset(12% 0% 0% 0%)';to.clipPath='inset(0% 0% 0% 0%)';
        }
        tl.fromTo(el,from,to,delay);
      });
      const name=group.section.id+'-'+groupIndex;
      const g={name,timeline:tl,elements:group.items,trigger:null};
      motion.groups.push(g);
      if(group.top<height*.91) tl.play();
      else g.trigger=ScrollTrigger.create({trigger:group.items[0],start:'top 88%',animation:tl,toggleActions:'play none none none',once:true});
    });
  }
  function hover() {
    $$('[data-name^="Strategy Card "]').forEach(el=>{
      const target=el.querySelector('[data-copy]');
      if(!target) return;
      el.addEventListener('pointerenter',()=>gsap.to(target,{y:-12,rotation:-2,duration:.45,ease:'power3.out',overwrite:'auto'}));
      el.addEventListener('pointerleave',()=>gsap.to(target,{y:0,rotation:0,duration:.55,ease:'power3.out',overwrite:'auto'}));
    });
    // Color samples keep their original geometry and respond as a staggered material strip.
    const swatches=$$('.identity-sec [data-copy]').filter(el=>/^#[0-9a-f]{6}$/i.test(el.textContent.trim()));
    swatches.forEach(el=>{
      el.addEventListener('pointerenter',()=>gsap.to(el,{y:-6,duration:.25,overwrite:'auto'}));
      el.addEventListener('pointerleave',()=>gsap.to(el,{y:0,duration:.3,overwrite:'auto'}));
    });
  }
  async function init() {
    try {
      await document.fonts.ready;
      await Promise.allSettled($$('.hero-sec img').map(img=>img.decode()));
      gsap.registerPlugin(ScrollTrigger,ScrollSmoother);
      ScrollTrigger.config({ignoreMobileResize:true});
      motion.smoother=ScrollSmoother.get() || ScrollSmoother.create({wrapper:'#smooth-wrapper',content:'#smooth-content',smooth:1.05,smoothTouch:.1,effects:false});
      context=gsap.context(()=>{setupEntries(prepareCandidates());chart();hover();},main);
      document.documentElement.classList.add('js-ready');
      main.dataset.motion='ready';motion.state='ready';
      ScrollTrigger.refresh();
      window.addEventListener('load',()=>ScrollTrigger.refresh(),{once:true});
      if(location.hash) {
        const target=$(location.hash);
        if(target) {finishAll();motion.smoother.scrollTo(target,false,'top top');}
      }
    } catch(error) {recover(error);}
  }
  document.addEventListener('kumu:reveal-target',event=>{
    const target=event.detail;
    const section=target.closest('section');
    motion.groups.filter(group=>!section || group.elements.some(el=>section.contains(el))).forEach(group=>group.timeline.progress(1));
  });
  window.addEventListener('pagehide',event=>{
    if(event.persisted) return;
    context?.revert();motion.smoother?.kill();
  });
  init();
})();
