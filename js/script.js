/* Eatgo's motion families, applied to complete Kumu components. */
(() => {
  'use strict';
  const root=document.documentElement, main=document.querySelector('main');
  const units=[...main.querySelectorAll('[data-entry]')];
  const motion={state:'preparing',groups:[],smoother:null};
  window.kumuMotion=motion;
  if(new URLSearchParams(location.search).has('capture')){
    document.querySelectorAll('img[loading=lazy]').forEach(e=>e.loading='eager');
    root.classList.remove('motion-preparing');main.dataset.motion='static-capture';return;
  }
  const original=new Map(units.map(e=>[e,e.style.opacity]));
  const scale=()=>parseFloat(root.style.getPropertyValue('--canvas-scale'))||1;
  const position=e=>Number(e.dataset.motionTop)*scale();
  const height=e=>Math.min(Number(e.dataset.motionHeight),650)*scale();
  let context;
  function visible(){
    units.forEach(e=>{e.style.opacity=original.get(e);e.style.removeProperty('transform');e.dataset.motionState='entered';});
    units.filter(e=>e.dataset.effect==='bar').forEach(e=>{e.querySelector('.research-bar-fill').style.width='100%';e.querySelector('.research-bar-count').textContent=e.dataset.barTarget+'%';e.querySelector('[data-bar-description]').style.removeProperty('opacity');});
    document.querySelector('.pie-sweep')?.setAttribute('stroke-dashoffset','0');
    document.querySelector('.pie-number').textContent='82%';
    document.querySelector('.research-pie figcaption').style.removeProperty('opacity');
  }
  function fallback(error){
    context?.revert();motion.smoother?.kill();visible();
    root.classList.remove('motion-preparing');main.dataset.motion='native-fallback';
    if(error)console.error('Kumu motion:',error);
  }
  if(!window.gsap||!window.ScrollTrigger||!window.ScrollSmoother){fallback();return;}
  const {gsap,ScrollTrigger,ScrollSmoother}=window;
  function setupBar(e,index,name){
    const fill=e.querySelector('.research-bar-fill'),number=e.querySelector('.research-bar-count');
    const description=e.querySelector('[data-bar-description]');
    const target=Number(e.dataset.barTarget),value={progress:0};
    const question=document.querySelector('[data-entry="research-question-left"]');
    const draw=()=>{
      fill.style.width=(value.progress*100)+'%';
      const text=Math.round(target*value.progress)+'%';
      if(number.textContent!==text)number.textContent=text;
      e.dataset.barProgress=value.progress.toFixed(3);
    };
    draw();
    const tl=gsap.timeline({paused:true,onUpdate(){e.dataset.motionState=tl.progress()===1?'entered':tl.progress()===0?'idle':'entering';}});
    tl.to(value,{progress:1,duration:1.8,ease:'power1.out',onUpdate:draw},index*.2);
    tl.fromTo(description,{opacity:0},{opacity:1,duration:.6,ease:'none'},index*.2);
    const trigger=ScrollTrigger.create({animation:tl,start:()=>position(question)-innerHeight*.5,toggleActions:'play none none reverse'});
    motion.groups.push({name,units:[e],timeline:tl,trigger});
  }
  function entries(){
    const batches=new Map();
    units.forEach(e=>{const key=e.dataset.entryBatch||e.dataset.entry;if(!batches.has(key))batches.set(key,[]);batches.get(key).push(e);});
    batches.forEach((elements,name)=>{
      elements.sort((a,b)=>+a.dataset.entryOrder-+b.dataset.entryOrder);
      elements.forEach((e,index)=>{
        const effect=e.dataset.effect||'fade',hero=name==='hero-opening';
        if(effect==='bar'){setupBar(e,index,name);return;}
        const plain=name.startsWith('palette-')||/identity-(primary-logo|logotype|brandmark|submark)|hero-(tools|wordmark)/.test(e.dataset.entry);
        const scrub=!hero&&!plain&&effect!=='fadeUp';
        const delay=index*(hero?.11:.2);
        const opacity=parseFloat(original.get(e)||'1');
        const tl=gsap.timeline({paused:true,onUpdate(){const p=tl.progress();e.dataset.motionState=p===1?'entered':p===0?'idle':'entering';}});
        if(hero){
          const y=e.dataset.entry==='hero-photo'?100:e.dataset.entry==='hero-project-title'?-100:0;
          tl.fromTo(e,{opacity:0,y},{opacity,y:0,duration:1,ease:'power1.out'},delay);
        }else if(effect==='popin'){
          tl.fromTo(e,{scale:.75,opacity:0},{scale:1,opacity,duration:.6,ease:'none'},delay)
            .to(e,{scale:1.04,duration:.5,ease:'none'}).to(e,{scale:1,duration:.5,ease:'none'});
        }else{
          const from={opacity:0},to={opacity,duration:.6,ease:effect==='fadeUp'?'power1.out':'none'};
          if(effect==='fadeUp'){from.y=100;to.y=0;}
          if(effect==='slideLeft'||effect==='slideRight'){from.xPercent=effect==='slideLeft'?-25:25;to.xPercent=0;}
          tl.fromTo(e,from,to,delay);
        }
        let trigger=null;
        if(hero){if(window.kumuPreparationExpired)tl.progress(1);else tl.play();}
        else{
          // Recorded source coordinates avoid laying out every masked offscreen section.
          const triggerElement=plain?elements[0]:e;
          trigger=ScrollTrigger.create({animation:tl,start:()=>position(triggerElement)-innerHeight,
            end:()=>position(triggerElement)+height(triggerElement)-innerHeight*.75,
            scrub:scrub?1:false,toggleActions:'play none none reverse',invalidateOnRefresh:true});
        }
        motion.groups.push({name,units:[e],timeline:tl,trigger});
      });
    });
    const figure=document.querySelector('.research-pie'),sweep=figure.querySelector('.pie-sweep');
    const question=document.querySelector('[data-entry="research-question-left"]');
    const progress={value:0},caption=figure.querySelector('figcaption');
    const draw=()=>{sweep.setAttribute('stroke-dashoffset',String(1-progress.value*.82));figure.dataset.pieProgress=(progress.value*82).toFixed(2);caption.style.opacity=Math.max(0,Math.min(1,(progress.value-.72)/.12));};
    draw();
    gsap.to(progress,{value:1,ease:'none',onUpdate:draw,scrollTrigger:{start:()=>position(question)-innerHeight*.5,end:()=>position(question)-innerHeight*.2,scrub:1}});
    const count={value:0},number=figure.querySelector('.pie-number');
    gsap.to(count,{value:82,duration:1.8,ease:'none',onUpdate(){number.textContent=Math.round(count.value)+'%';},scrollTrigger:{start:()=>position(question)-innerHeight*.5,toggleActions:'play none none reverse'}});
  }
  async function init(){
    try{
      await document.fonts.ready;
      await Promise.allSettled([...document.querySelectorAll('.hero-sec img')].map(e=>e.decode()));
      // The five-second visibility failsafe must never disable late-loading motion.
      gsap.registerPlugin(ScrollTrigger,ScrollSmoother);
      ScrollTrigger.config({ignoreMobileResize:true});
      motion.smoother=ScrollSmoother.get()||ScrollSmoother.create({wrapper:'#smooth-wrapper',content:'#smooth-content',smooth:.75,smoothTouch:0,effects:false});
      root.classList.remove('motion-preparing');
      context=gsap.context(entries,main);
      root.classList.add('js-ready');main.dataset.motion='ready';motion.state='ready';main.dataset.motionReadyMs=Math.round(performance.now());main.dataset.preparation=window.kumuPreparationExpired?'late-ready':'ready';
      ScrollTrigger.refresh();
      if(location.hash){const target=document.querySelector(location.hash);if(target)motion.smoother.scrollTo(target.offsetTop*scale(),false);}
    }catch(error){fallback(error);}
  }
  document.addEventListener('kumu:reveal-target',event=>{
    const section=event.detail.closest('section');
    motion.groups.filter(g=>!section||g.units.some(e=>section.contains(e))).forEach(g=>g.timeline.progress(1));
  });
  window.addEventListener('pagehide',event=>{if(!event.persisted){context?.revert();motion.smoother?.kill();}});
  init();
})();
