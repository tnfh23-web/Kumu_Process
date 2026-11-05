/* Complete components fade in reading order. Only the survey pie fills. */
(() => {
  'use strict';
  const root=document.documentElement;
  const main=document.querySelector('main');
  const all=selector=>[...main.querySelectorAll(selector)];
  const motion={state:'preparing',groups:[],smoother:null,errors:[]};
  const inlineOpacities=new Map();
  window.kumuMotion=motion;
  const capture=new URLSearchParams(location.search).has('capture');
  if(capture){root.classList.remove('motion-preparing');main.dataset.motion='static-capture';motion.state='static-capture';return;}
  function restoreOpacity(unit){
    if(!inlineOpacities.has(unit))return;
    const value=inlineOpacities.get(unit);
    if(value)unit.style.opacity=value;else unit.style.removeProperty('opacity');
  }
  function fallback(error){
    root.classList.remove('motion-preparing');
    motion.groups.forEach(group=>{group.timeline.progress(1);group.trigger?.kill();});
    all('[data-entry]').forEach(unit=>{restoreOpacity(unit);unit.dataset.motionState='entered';});
    all('.research-pie').forEach(figure=>{
      figure.querySelector('.pie-sector').setAttribute('d',sectorPath(82));
      figure.querySelector('.pie-number').textContent='82%';
      figure.querySelector('figcaption').style.removeProperty('opacity');
    });
    motion.smoother?.kill();
    main.dataset.motion='native-fallback';motion.state='native-fallback';
    if(error){motion.errors.push(String(error));console.error('Kumu motion:',error);}
  }
  if(!window.gsap||!window.ScrollTrigger||!window.ScrollSmoother){fallback();return;}
  const {gsap,ScrollTrigger,ScrollSmoother}=window;
  let context;
  let disposed=false;
  const maskCache=new Map();
  function mediaReady(units){
    const images=new Set();const masks=new Set();
    units.forEach(unit=>{
      if(unit.tagName==='IMG')images.add(unit);
      unit.querySelectorAll('img').forEach(image=>images.add(image));
      [unit,...unit.querySelectorAll('[style*="mask-image"]')].forEach(element=>{
        for(const match of getComputedStyle(element).maskImage.matchAll(/url\(["']?([^"')]+)["']?\)/g))masks.add(match[1]);
      });
    });
    const promises=[...images].map(image=>image.decode());
    masks.forEach(url=>{
      if(!maskCache.has(url)){
        const image=new Image();image.src=url;
        maskCache.set(url,image.decode().catch(()=>{}));
      }
      promises.push(maskCache.get(url));
    });
    return Promise.allSettled(promises);
  }
  function sectorPath(percent){
    if(percent<=0)return 'M 140 140 L 140 0 Z';
    const angle=Math.PI*2*percent/100;
    const x=140+Math.sin(angle)*140;
    const y=140-Math.cos(angle)*140;
    return `M 140 140 L 140 0 A 140 140 0 ${percent>50?1:0} 1 ${x.toFixed(6)} ${y.toFixed(6)} Z`;
  }
  function addPie(timeline,figure,at){
    const path=figure.querySelector('.pie-sector');
    const number=figure.querySelector('.pie-number');
    const caption=figure.querySelector('figcaption');
    const progress={value:0};
    function draw(){
      path.setAttribute('d',sectorPath(progress.value));
      number.textContent=Math.round(progress.value)+'%';
      figure.dataset.pieProgress=progress.value.toFixed(3);
    }
    draw();gsap.set(caption,{opacity:0});
    timeline.to(progress,{value:82,duration:1.45,ease:'power1.out',onUpdate:draw,onComplete(){progress.value=82;draw();}},at+.12);
    timeline.to(caption,{opacity:1,duration:.35,ease:'none'},at+.55);
  }
  function setupEntries(){
    const batches=new Map();
    all('[data-entry]').forEach(unit=>{
      const key=unit.dataset.entryBatch||unit.dataset.entry;
      if(!batches.has(key))batches.set(key,[]);
      batches.get(key).push(unit);
    });
    batches.forEach((units,name)=>{
      units.sort((a,b)=>Number(a.dataset.entryOrder)-Number(b.dataset.entryOrder));
      const anchor=units[0].querySelector(':scope > .entry-anchor')||units[0];
      const timeline=gsap.timeline({paused:true});
      units.forEach((unit,index)=>{
        inlineOpacities.set(unit,unit.style.opacity);
        const opacity=parseFloat(getComputedStyle(unit).opacity);
        const targetOpacity=Number.isFinite(opacity)?opacity:1;
        const delay=index*(name==='hero-opening'?.11:.16);
        unit.dataset.motionState='idle';
        gsap.set(unit,{opacity:0});
        timeline.to(unit,{
          opacity:targetOpacity,duration:.65,ease:'power1.out',
          onStart(){unit.dataset.motionState='entering';},
          onComplete(){unit.dataset.motionState='entered';restoreOpacity(unit);}
        },delay);
        if(unit.matches('.research-pie'))addPie(timeline,unit,delay);
      });
      const group={name,timeline,units,trigger:null,ready:false,requested:false};motion.groups.push(group);
      const play=()=>{group.requested=true;if(group.ready&&!disposed&&motion.state!=='native-fallback')timeline.play();};
      mediaReady(units).then(()=>{group.ready=true;if(group.requested&&!disposed&&motion.state!=='native-fallback')timeline.play();});
      if(anchor.getBoundingClientRect().top<window.innerHeight*.88)play();
      else group.trigger=ScrollTrigger.create({trigger:anchor,start:'top 88%',onEnter:play,once:true});
    });
  }
  function revealTarget(target){
    const section=target.closest('section');
    motion.groups.filter(group=>!section||group.units.some(unit=>section.contains(unit))).forEach(group=>group.timeline.progress(1));
  }
  async function init(){
    try{
      await document.fonts.ready;
      await Promise.allSettled(all('.hero-sec img').map(image=>image.decode()));
      if(window.kumuPreparationExpired){fallback();return;}
      // Remove the bootstrap class and set timeline starts within the same task.
      root.classList.remove('motion-preparing');
      gsap.registerPlugin(ScrollTrigger,ScrollSmoother);
      ScrollTrigger.config({ignoreMobileResize:true});
      motion.smoother=ScrollSmoother.get()||ScrollSmoother.create({wrapper:'#smooth-wrapper',content:'#smooth-content',smooth:1.05,smoothTouch:.1,effects:false});
      context=gsap.context(setupEntries,main);
      root.classList.add('js-ready');main.dataset.motion='ready';motion.state='ready';
      ScrollTrigger.refresh();
      if(document.readyState!=='complete')window.addEventListener('load',()=>ScrollTrigger.refresh(),{once:true});
      if(location.hash){const target=document.querySelector(location.hash);if(target){revealTarget(target);motion.smoother.scrollTo(target,false,'top top');}}
    }catch(error){context?.revert();fallback(error);}
  }
  document.addEventListener('kumu:reveal-target',event=>revealTarget(event.detail));
  window.addEventListener('pagehide',event=>{if(!event.persisted){disposed=true;context?.revert();motion.smoother?.kill();}});
  init();
})();
