/* Eatgo's motion families, applied to complete Kumu components. */
(() => {
  'use strict';
  const root=document.documentElement, main=document.querySelector('main');
  const units=[...main.querySelectorAll('[data-entry]')];
  const motion={state:'preparing',groups:[],lenis:null};
  window.kumuMotion=motion;
  function loadTypeSpecimen(){
    if(!window.FontFace)return;
    const face=new FontFace('Kumu Jalnan',`local("Jalnan2"),local("여기어때 잘난체 2"),url("${new URL('assets/fonts/Jalnan2.otf',document.baseURI)}") format("opentype")`,{weight:'400',style:'normal'});
    return face.load().then(loaded=>{
      document.fonts.add(loaded);
      root.dataset.typeSpecimenFont='jalnan2';
    }).catch(error=>{root.dataset.typeSpecimenFont='fallback';console.warn('Kumu type specimen font:',error);});
  }

  if(new URLSearchParams(location.search).has('capture')){
    document.querySelectorAll('img[loading=lazy]').forEach(e=>e.loading='eager');
    loadTypeSpecimen();root.classList.remove('motion-preparing');main.dataset.motion='static-capture';return;
  }
  const original=new Map(units.map(e=>[e,e.style.opacity]));
  const scale=()=>parseFloat(root.style.getPropertyValue('--canvas-scale'))||1;
  const position=e=>Number(e.dataset.motionTop)*scale();
  const entryStart=e=>position(e)-innerHeight+Math.min(180,innerHeight*.18);
  let context,updateScroll,stopPredecode,stopNearbyLayers;
  function prepareNearbyLayers(){
    if(!window.IntersectionObserver)return;
    const observer=new IntersectionObserver(entries=>{
      for(const entry of entries){
        entry.target.style.willChange=entry.isIntersecting?'transform, opacity':'auto';
      }
    },{rootMargin:'500px 0px'});
    units.forEach(unit=>observer.observe(unit));
    return ()=>{observer.disconnect();units.forEach(unit=>unit.style.removeProperty('will-change'));};
  }
  function recordState(element,timeline){
    const progress=timeline.progress();
    const state=progress===1?'entered':progress===0?'idle':'entering';
    if(element.dataset.motionState!==state)element.dataset.motionState=state;
  }
  function predecodeNearViewport(){
    if(!window.IntersectionObserver||!window.requestIdleCallback)return;
    const queue=[];
    let idle=0,decoding=false,stopped=false;
    function schedule(){
      if(stopped||idle||decoding||!queue.length)return;
      idle=requestIdleCallback(async()=>{
        idle=0;
        const image=queue.shift();
        if(image.getBoundingClientRect().bottom<=0){schedule();return;}
        decoding=true;
        image.loading='eager';
        try{await image.decode();}catch{/* Native image loading remains available. */}
        decoding=false;
        schedule();
      });
    }
    const observer=new IntersectionObserver(entries=>{
      for(const entry of entries){
        if(!entry.isIntersecting)continue;
        observer.unobserve(entry.target);
        queue.push(entry.target);
      }
      schedule();
    },{rootMargin:`${Math.min(4000,innerHeight*4)}px 0px`});
    main.querySelectorAll('img[loading="lazy"]').forEach(image=>{if(/\.(webp|png|jpe?g)(?:[?#]|$)/i.test(image.getAttribute('src')||''))observer.observe(image);});
    return ()=>{
      stopped=true;
      observer.disconnect();
      if(idle)cancelIdleCallback(idle);
      queue.length=0;
    };
  }
  function visible(){
    units.forEach(e=>{e.style.opacity=original.get(e);e.style.removeProperty('transform');e.dataset.motionState='entered';});
    units.filter(e=>e.dataset.effect==='bar').forEach(e=>{e.querySelector('.research-bar-fill').style.width='100%';e.querySelector('.research-bar-count').textContent=e.dataset.barTarget+'%';e.querySelector('[data-bar-description]').style.removeProperty('opacity');});
    document.querySelector('.pie-sweep')?.setAttribute('stroke-dashoffset','0');
    document.querySelector('.pie-number').textContent='82%';
    document.querySelector('.research-pie figcaption').style.removeProperty('opacity');
  }
  function fallback(error){
    context?.revert();stopScroll();visible();
    root.classList.remove('motion-preparing');main.dataset.motion='native-fallback';loadTypeSpecimen();
    if(error)console.error('Kumu motion:',error);
  }
  if(!window.gsap||!window.ScrollTrigger||!window.Lenis){fallback();return;}
  const {gsap,ScrollTrigger,Lenis}=window;
  function stopScroll(){
    stopPredecode?.();
    stopNearbyLayers?.();
    if(updateScroll)window.gsap?.ticker.remove(updateScroll);
    motion.lenis?.off('scroll',window.ScrollTrigger?.update);
    motion.lenis?.destroy();
    window.kumuLenis=null;
  }
  function entryTrigger(element,timeline){
    return ScrollTrigger.create({
      // Use a separate exit line so tiny reversals around the entry line cannot flash the content.
      start:()=>position(element)-innerHeight,
      end:()=>entryStart(element),
      onLeave:()=>timeline.play(),
      onLeaveBack:()=>timeline.pause(0,false)
    });
  }
  function setupBar(e,index,name){
    const fill=e.querySelector('.research-bar-fill'),number=e.querySelector('.research-bar-count');
    const description=e.querySelector('[data-bar-description]');
    const target=Number(e.dataset.barTarget),value={progress:0};
    const draw=()=>{
      fill.style.width=(value.progress*100)+'%';
      const text=Math.round(target*value.progress)+'%';
      if(number.textContent!==text)number.textContent=text;
      e.dataset.barProgress=value.progress.toFixed(3);
    };
    draw();
    const tl=gsap.timeline({paused:true,onUpdate(){recordState(e,tl);}});
    tl.to(value,{progress:1,duration:.6,ease:'power1.inOut',onUpdate:draw},index*.15);
    tl.fromTo(description,{opacity:0},{opacity:1,duration:.6,ease:'sine.inOut'},index*.15);
    const trigger=entryTrigger(e,tl);
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
        const delay=name==='strategy-cards'?.35+index*.21:index*(hero?.08:.15);
        const opacity=parseFloat(original.get(e)||'1');
        const tl=gsap.timeline({paused:true,onUpdate(){recordState(e,tl);}});
        if(hero){
          const y=e.dataset.entry==='hero-photo'?100:e.dataset.entry==='hero-project-title'?-100:0;
          tl.fromTo(e,{opacity:0,y},{opacity,y:0,duration:.8,ease:'power1.out'},delay);
        }else if(effect==='popin'){
          tl.fromTo(e,{scale:.75,opacity:0},{scale:1,opacity,duration:.4,ease:'power1.out'},delay)
            .to(e,{scale:1.04,duration:.15,ease:'sine.inOut'}).to(e,{scale:1,duration:.15,ease:'sine.inOut'});
        }else{
          const from={opacity:0},to={opacity,duration:.6,ease:effect==='fade'?'sine.inOut':'power1.out'};
          if(effect==='fadeUp'){from.y=100;to.y=0;}
          if(effect==='slideLeft'||effect==='slideRight'){from.xPercent=effect==='slideLeft'?-25:25;to.xPercent=0;}
          tl.fromTo(e,from,to,delay);
        }
        let trigger=null;
        if(hero){if(window.kumuPreparationExpired)tl.progress(1);else tl.play();}
        else{
          // Recorded source coordinates avoid laying out every masked offscreen section.
          trigger=entryTrigger(e,tl);
        }
        motion.groups.push({name,units:[e],timeline:tl,trigger});
      });
    });
    const figure=document.querySelector('.research-pie'),sweep=figure.querySelector('.pie-sweep');
    const progress={value:0},caption=figure.querySelector('figcaption');
    const count={value:0},number=figure.querySelector('.pie-number');
    const draw=()=>{
      sweep.setAttribute('stroke-dashoffset',String(1-progress.value*.82));
      figure.dataset.pieProgress=(progress.value*82).toFixed(2);
    };
    draw();number.textContent='0%';
    const pie=gsap.timeline({paused:true});
    pie.to(progress,{value:1,duration:.8,ease:'sine.inOut',onUpdate:draw},0);
    // Show white copy after the brown sector reaches its location, then count at a readable pace.
    pie.fromTo(caption,{opacity:0},{opacity:1,duration:.25,ease:'sine.inOut'},.55);
    pie.to(count,{value:82,duration:.6,ease:'power1.out',onUpdate(){
      const text=Math.round(count.value)+'%';if(number.textContent!==text)number.textContent=text;
    }},.55);
    const trigger=entryTrigger(figure,pie);
    motion.groups.push({name:'research-pie-fill',units:[figure],timeline:pie,trigger});
  }
  async function init(){
    try{
      gsap.registerPlugin(ScrollTrigger);
      ScrollTrigger.config({ignoreMobileResize:true});
      motion.lenis=new Lenis({smoothWheel:true,lerp:0.08,respectReducedMotion:false});
      window.kumuLenis=motion.lenis;
      motion.lenis.on('scroll',ScrollTrigger.update);
      updateScroll=time=>motion.lenis.raf(time*1000);
      gsap.ticker.add(updateScroll);
      gsap.ticker.lagSmoothing(0);
      root.dataset.scrollEngine='lenis';root.dataset.scrollLerp='0.08';
      const specimenReady=loadTypeSpecimen();
      await document.fonts.ready;
      await Promise.allSettled([specimenReady,...[...document.querySelectorAll('.hero-sec img')].map(e=>e.decode())]);
      // The scroll engine is already running while first-visit media finishes loading.
      root.classList.remove('motion-preparing');
      context=gsap.context(entries,main);
      root.classList.add('js-ready');main.dataset.motion='ready';motion.state='ready';main.dataset.motionReadyMs=Math.round(performance.now());main.dataset.preparation=window.kumuPreparationExpired?'late-ready':'ready';
      ScrollTrigger.refresh();
      stopPredecode=predecodeNearViewport();
      stopNearbyLayers=prepareNearbyLayers();
      if(location.hash){const target=document.querySelector(location.hash);if(target)motion.lenis.scrollTo(Number(target.dataset.motionTop??target.offsetTop)*scale(),{immediate:true});}
    }catch(error){fallback(error);}
  }
  document.addEventListener('kumu:reveal-target',event=>{
    const section=event.detail.closest('section');
    motion.groups.filter(g=>!section||g.units.some(e=>section.contains(e))).forEach(g=>g.timeline.progress(1));
  });
  window.addEventListener('pagehide',event=>{if(!event.persisted){context?.revert();stopScroll();}});
  init();
})();
