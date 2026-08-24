
const menuBtn = document.querySelector('.menu-btn');
const mobile = document.querySelector('.mobile-panel');
if (menuBtn && mobile) {
  menuBtn.addEventListener('click', () => mobile.classList.toggle('open'));
}

(() => {
  const items = document.querySelectorAll(
    '.content-section > .shell, .service-row, .review-card, .finish-card, .contact-aside, .form, .proof, .story, .phf-project-photo'
  );
  if (!items.length) return;
  items.forEach(el => el.classList.add('reveal'));
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add('in');
    });
  }, {threshold:.12});
  items.forEach(el => io.observe(el));
})();

(() => {
  if (!document.body.classList.contains('home-v2')) return;

  const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
  const ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
  const nav=document.querySelector('.nav');

  function progress(scene){
    const r=scene.getBoundingClientRect();
    const travel=Math.max(1,scene.offsetHeight-innerHeight);
    return clamp(-r.top/travel);
  }

  // Lightweight synthesized sound design. Browsers only permit audio after a user gesture,
  // so the sound button (or the first pointer/keyboard interaction) unlocks it.
  let phfAudio=null;
  let phfSoundEnabled=false;
  let phfLastUnboxStage=-1;
  let phfLastPortalStage=-1;
  let phfLastProjectStage=-1;
  function getAudio(){
    if(phfAudio)return phfAudio;
    const AC=window.AudioContext||window.webkitAudioContext;
    if(!AC)return null;
    phfAudio=new AC();
    return phfAudio;
  }
  function tone(kind='tick'){
    if(!phfSoundEnabled)return;
    const a=getAudio(); if(!a)return;
    if(a.state==='suspended')a.resume().catch(()=>{});
    const now=a.currentTime;
    const master=a.createGain(); master.gain.setValueAtTime(.0001,now); master.connect(a.destination);
    if(kind==='spin'){
      const o=a.createOscillator(),g=a.createGain(); o.type='triangle'; o.frequency.setValueAtTime(120,now); o.frequency.exponentialRampToValueAtTime(210,now+.16); g.gain.setValueAtTime(.0001,now); g.gain.exponentialRampToValueAtTime(.055,now+.025); g.gain.exponentialRampToValueAtTime(.0001,now+.18); o.connect(g).connect(master); o.start(now);o.stop(now+.2); master.gain.exponentialRampToValueAtTime(.9,now+.02); master.gain.exponentialRampToValueAtTime(.0001,now+.22);
    }else if(kind==='open'){
      const o=a.createOscillator(),g=a.createGain(); o.type='sawtooth'; o.frequency.setValueAtTime(170,now);o.frequency.exponentialRampToValueAtTime(72,now+.24);g.gain.setValueAtTime(.0001,now);g.gain.exponentialRampToValueAtTime(.045,now+.02);g.gain.exponentialRampToValueAtTime(.0001,now+.28);o.connect(g).connect(master);o.start(now);o.stop(now+.3);master.gain.exponentialRampToValueAtTime(.85,now+.02);master.gain.exponentialRampToValueAtTime(.0001,now+.31);
    }else if(kind==='reveal'){
      [330,494,659].forEach((f,i)=>{const o=a.createOscillator(),g=a.createGain();o.type='sine';o.frequency.value=f;const t=now+i*.055;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.035,t+.025);g.gain.exponentialRampToValueAtTime(.0001,t+.42);o.connect(g).connect(master);o.start(t);o.stop(t+.45)});master.gain.exponentialRampToValueAtTime(.8,now+.02);master.gain.exponentialRampToValueAtTime(.0001,now+.65);
    }else{
      const o=a.createOscillator(),g=a.createGain();o.type='sine';o.frequency.value=480;g.gain.setValueAtTime(.02,now);g.gain.exponentialRampToValueAtTime(.0001,now+.09);o.connect(g).connect(master);o.start(now);o.stop(now+.1);master.gain.setValueAtTime(.7,now);master.gain.exponentialRampToValueAtTime(.0001,now+.11);
    }
  }

  const soundBtn=document.querySelector('.phf-sound-toggle');
  if(soundBtn){
    soundBtn.addEventListener('click',()=>{
      phfSoundEnabled=!phfSoundEnabled;
      const a=getAudio(); if(a&&phfSoundEnabled)a.resume().catch(()=>{});
      soundBtn.setAttribute('aria-pressed',String(phfSoundEnabled));
      soundBtn.textContent=phfSoundEnabled?'Sound on':'Sound off';
      soundBtn.setAttribute('aria-label',phfSoundEnabled?'Turn animation sound off':'Turn animation sound on');
      if(phfSoundEnabled)tone('reveal');
    });
  }

  function renderUnbox(){
    const s=document.querySelector('[data-scene="unbox"]');
    if(!s)return;
    const p=progress(s);
    const spin=ease(clamp(p/.48));
    const open=ease(clamp((p-.42)/.28));
    const exit=ease(clamp((p-.78)/.22));
    const lift=ease(clamp((p-.62)/.38));
    const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Closed first, then turns while the scroll builds, then all four top flaps open.
    const turns=reduced?0:(spin*560 + open*80);
    s.style.setProperty('--box-ry',`${-28+turns}deg`);
    s.style.setProperty('--box-rx',`${-12+Math.sin(spin*Math.PI)*10-open*5}deg`);
    s.style.setProperty('--box-rz',`${Math.sin(spin*Math.PI*2)*2.5}deg`);
    s.style.setProperty('--flap-front',`${90-open*202}deg`);
    s.style.setProperty('--flap-back',`${90-open*202}deg`);
    s.style.setProperty('--flap-left',`${-90+open*202}deg`);
    s.style.setProperty('--flap-right',`${-90+open*202}deg`);
    s.style.setProperty('--box-scale',`${1+open*.12-exit*.2}`);
    s.style.setProperty('--box-stage-y',`${5-lift*15}vh`);
    s.style.setProperty('--box-stage-scale',`${1+open*.08-exit*.1}`);
    s.style.setProperty('--box-stage-opacity',`${1-exit}`);
    s.style.setProperty('--box-stage-blur',`${exit*8}px`);
    s.style.setProperty('--box-shadow-scale',`${1+open*.18-exit*.3}`);
    s.style.setProperty('--box-shadow-opacity',`${.72-open*.18-exit*.54}`);
    s.style.setProperty('--box-glow',`${.35+open*.7}`);
    s.style.setProperty('--box-copy-opacity',`${1-clamp((p-.30)/.23)}`);
    s.style.setProperty('--box-copy-y',`${clamp((p-.30)/.23)*-24}px`);
    s.style.setProperty('--unbox-progress',`${p*100}%`);
    document.body.style.setProperty('--unbox-nav-opacity',`${clamp((p-.82)/.15)}`);

    let stage=0, label='SEALED';
    if(p>=.18){stage=1;label='TURNING';}
    if(p>=.46){stage=2;label='OPENING';}
    if(p>=.78){stage=3;label='ENTERING';}
    const stat=s.querySelector('.phf-unbox-status b');
    const num=s.querySelector('.phf-unbox-status span');
    if(stat)stat.textContent=label;
    if(num)num.textContent=String(stage+1).padStart(2,'0');
    if(stage!==phfLastUnboxStage){
      if(stage===1)tone('spin');
      if(stage===2)tone('open');
      if(stage===3)tone('reveal');
      phfLastUnboxStage=stage;
    }
  }

  function renderHero(){
    const s=document.querySelector('[data-scene="hero"]');
    if(!s)return;
    const r=s.getBoundingClientRect();
    const p=clamp(-r.top/Math.max(1,s.offsetHeight-innerHeight));
    s.style.setProperty('--hero-deck-x',`${p*120}px`);
    s.style.setProperty('--hero-deck-y',`${p*62}px`);
    s.style.setProperty('--hero-wave',`${Math.sin(p*Math.PI)*34}px`);
    s.style.setProperty('--hero-light',`${.08+p*.22}`);
    const title=s.querySelector('h1');
    if(title)title.style.transform=`translate3d(0,${p*-22}px,0)`;
  }

  function renderMaterial(){
    const s=document.querySelector('[data-scene="material"]');
    if(!s)return;
    const p=progress(s);
    const pin=s.querySelector('.phf-material-pin');
    if(pin)pin.style.setProperty('--pin-progress',p);
    s.style.setProperty('--material-progress',`${p*100}%`);
    s.style.setProperty('--material-x',`${(p-.5)*80}px`);
    s.style.setProperty('--material-y',`${(p-.5)*-36}px`);
    s.style.setProperty('--material-light',`${-55+p*110}%`);

    const spreads=[1,.72,.42,.08,-.26,-.58,-.9];
    const open=p<.68?ease(p/.68):1-ease((p-.68)/.32);
    spreads.forEach((v,i)=>{
      const n=i+1;
      s.style.setProperty(`--l${n}x`,`${v*open*185}px`);
      s.style.setProperty(`--l${n}y`,`${(i-3)*open*-10}px`);
      s.style.setProperty(`--l${n}z`,`${open*(52+i*15)}px`);
    });

    const notes=[
      s.querySelector('.phf-process-note-a'),
      s.querySelector('.phf-process-note-b'),
      s.querySelector('.phf-process-note-c')
    ];
    [0.2,0.5,0.8].forEach((center,i)=>{
      const note=notes[i];
      if(!note)return;
      const o=clamp(1-Math.abs(p-center)/.16);
      note.style.opacity=o;
      note.style.transform=`translate3d(${(1-o)*24}px,${(1-o)*16}px,0) rotateY(${(1-o)*-5}deg)`;
    });
  }

  function renderServices(){
    document.querySelectorAll('.phf-service-card').forEach((card,i)=>{
      const r=card.getBoundingClientRect();
      const p=clamp((innerHeight-r.top)/(innerHeight+r.height));
      const depth=parseFloat(card.dataset.depth||'.2');
      const tilt=(p-.5)*-6*depth;
      const z=Math.sin(p*Math.PI)*38*depth;
      card.style.transform=`perspective(1100px) translateZ(${z}px) rotateX(${tilt}deg) translateX(${(i-1)*(p-.5)*14}px)`;
    });
  }


  function renderRenovation(){
    const s=document.querySelector('[data-scene="portal"]');
    if(!s)return;
    const p=progress(s);
    const pin=s.querySelector('.phf-portal-pin');
    if(pin)pin.style.setProperty('--pin-progress',p);

    s.style.setProperty('--portal-progress',`${p*100}%`);

    // 0.00 -> 0.14 : exterior settles in
    const settle=ease(clamp(p/.14));
    s.style.setProperty('--outside-scale',`${1.08-settle*.08}`);

    // 0.10 -> 0.28 : door opens
    const door=ease(clamp((p-.10)/.18));
    s.style.setProperty('--entry-door-angle',`${door*-106}deg`);
    s.style.setProperty('--entry-warmth',door);

    // 0.24 -> 0.40 : camera crosses doorway
    const enter=ease(clamp((p-.24)/.16));
    s.style.setProperty('--outside-opacity',`${1-enter}`);
    s.style.setProperty('--room-opacity',enter);
    s.style.setProperty('--room-scale',`${1.18-enter*.18}`);
    s.style.setProperty('--room-y',`${(1-enter)*3.5}vh`);

    // 0.38 -> 0.58 : camera deliberately tilts/downshifts toward floor
    const focus=ease(clamp((p-.38)/.20));
    s.style.setProperty('--camera-drop-y',`${focus*-8}vh`);
    s.style.setProperty('--camera-origin',`${62+focus*20}%`);
    s.style.setProperty('--upper-room-opacity',`${1-focus*.72}`);
    s.style.setProperty('--floor-angle',`${67-focus*9}deg`);
    s.style.setProperty('--floor-zoom',`${1+focus*.16}`);
    s.style.setProperty('--floor-camera-y',`${focus*-9}vh`);
    s.style.setProperty('--floor-vignette',`${focus*.78}`);
    s.style.setProperty('--focus-line-opacity',`${focus*.65}`);

    // 0.50 -> 0.67 : hold on the ugly/crusty old floor
    const oldHold=ease(clamp((p-.50)/.17));
    s.style.setProperty('--old-sat',`${.38-oldHold*.10}`);
    s.style.setProperty('--old-brightness',`${.58-oldHold*.08}`);
    s.style.setProperty('--old-contrast',`${1.12+oldHold*.08}`);
    s.style.setProperty('--old-grime-opacity',`${1}`);

    // 0.65 -> 0.88 : new flooring replaces old from back to front
    const refinish=ease(clamp((p-.65)/.23));
    s.style.setProperty('--refinish-progress',refinish);
    s.style.setProperty('--new-floor-opacity',refinish);
    s.style.setProperty('--new-floor-clip',`${100-refinish*100}%`);
    s.style.setProperty('--old-floor-opacity',`${1-refinish*.94}`);
    s.style.setProperty('--refinish-wave-opacity',`${Math.sin(refinish*Math.PI)}`);

    // 0.84 -> 1.00 : clean glossy finish, brighter light, shine sweep
    const shine=ease(clamp((p-.84)/.16));
    s.style.setProperty('--shine-opacity',shine);
    s.style.setProperty('--shine-x',`${-70+shine*150}%`);
    s.style.setProperty('--room-light-scale',`${.9+shine*.55}`);
    s.style.setProperty('--room-light-opacity',`${.55+shine*.35}`);
    s.style.setProperty('--floor-camera-y',`${-9-focus*0 + shine*-4}vh`);
    s.style.setProperty('--floor-zoom',`${1+focus*.16+shine*.05}`);
    s.style.setProperty('--floor-vignette',`${focus*.78-shine*.28}`);
    s.style.setProperty('--focus-line-opacity',`${Math.max(0,focus*.65-shine*.65)}`);

    // Copy fades away before floor-focused portion.
    const copyFade=1-clamp((p-.22)/.18)*.86;
    s.style.setProperty('--portal-copy-opacity',copyFade);
    s.style.setProperty('--portal-copy-y',`${clamp((p-.22)/.18)*-30}px`);

    const label=s.querySelector('.phf-renovation-step');
    if(label){
      let text='Opening the door';
      if(p>=.24) text='Entering the room';
      if(p>=.40) text='Original worn floor';
      if(p>=.65) text='Restoring the floor';
      if(p>=.88) text='Finished hardwood';
      label.textContent=text;
    }
    let portalStage=0;
    if(p>=.24)portalStage=1;
    if(p>=.40)portalStage=2;
    if(p>=.65)portalStage=3;
    if(p>=.88)portalStage=4;
    if(portalStage!==phfLastPortalStage){
      if(portalStage===1)tone('open');
      if(portalStage===3)tone('spin');
      if(portalStage===4)tone('reveal');
      phfLastPortalStage=portalStage;
    }
  }


  function renderProjectStory(){
    const s=document.querySelector('[data-scene="project-story"]');
    if(!s)return;
    const p=progress(s);
    s.style.setProperty('--project-story-progress',`${p*100}%`);

    const before=s.querySelector('.phf-story-before');
    const middle=s.querySelector('.phf-story-middle');
    const after=s.querySelector('.phf-story-after');

    // Opening beat: the real project first appears as one compact square card.
    // The first part of the scroll opens that card into the existing story layout,
    // then the original BEFORE -> IN PROGRESS -> AFTER sequence continues.
    const intro=ease(clamp(p/.16));
    const isMobile=innerWidth<=760;
    const isTablet=innerWidth<=1050;
    const startW=Math.min(isMobile?210:240,innerWidth*.62);
    const targetW=isMobile?Math.min(innerWidth*.68,330):(isTablet?Math.min(innerWidth*.37,390):Math.min(innerWidth*.31,420));
    const targetH=targetW*4/3;
    const cardW=startW+(targetW-startW)*intro;
    const cardH=startW+(targetH-startW)*intro;
    const targetLeft=isMobile?50:(isTablet?56:52);
    const targetTop=isMobile?45:50;
    const cardLeft=50+(targetLeft-50)*intro;
    const cardTop=50+(targetTop-50)*intro;
    const radius=34+(isMobile?24:30-34)*intro;

    [before,middle,after].forEach(photo=>{
      if(!photo)return;
      photo.style.width=`${cardW}px`;
      photo.style.height=`${cardH}px`;
      photo.style.aspectRatio='auto';
      photo.style.left=`${cardLeft}%`;
      photo.style.top=`${cardTop}%`;
      photo.style.borderRadius=`${radius}px`;
    });
    s.style.setProperty('--story-copy-opacity',clamp((intro-.28)/.72));
    s.style.setProperty('--story-ui-opacity',clamp((intro-.42)/.58));
    s.style.setProperty('--story-box-label-opacity',1-clamp(intro/.72));

    // Long holds at each stage, with smooth cinematic crossfades between them.
    const toMiddle=ease(clamp((p-.34)/.13));
    const toAfter=ease(clamp((p-.64)/.13));

    const beforeOpacity=1-toMiddle;
    const middleOpacity=toMiddle*(1-toAfter);
    const afterOpacity=toAfter;

    if(before){
      before.style.opacity=beforeOpacity;
      before.style.transform=`translate(-50%,-50%) scale(${1.0+intro*.01+p*.01}) translate3d(0,${p*-4}px,0)`;
      before.style.filter=`blur(${toMiddle*1.5}px)`;
    }
    if(middle){
      middle.style.opacity=middleOpacity;
      middle.style.transform=`translate(-50%,-50%) scale(${1.02-toMiddle*.01+toAfter*.006}) translate3d(0,${(1-toMiddle)*8-toAfter*4}px,0)`;
      middle.style.filter=`blur(${Math.abs(.5-middleOpacity)*1.6}px)`;
    }
    if(after){
      after.style.opacity=afterOpacity;
      after.style.transform=`translate(-50%,-50%) scale(${1.015-toAfter*.008}) translate3d(0,${(1-toAfter)*8}px,0)`;
      after.style.filter=`blur(${(1-toAfter)*1.4}px)`;
    }

    let stage=0;
    if(p>=.47)stage=1;
    if(p>=.77)stage=2;
    if(stage!==phfLastProjectStage){
      if(stage===1)tone('open');
      if(stage===2)tone('reveal');
      phfLastProjectStage=stage;
    }
    const titles=['Before.','In progress.','Finished.'];
    const captions=[
      'The room before the transformation begins.',
      'Old material out. New hardwood going in, one section at a time.',
      'The finished floor brings the entire space back together.'
    ];
    const names=['BEFORE','IN PROGRESS','AFTER'];
    const title=s.querySelector('.phf-story-title');
    const caption=s.querySelector('.phf-story-caption');
    const name=s.querySelector('.phf-story-stage-name');
    if(title && title.dataset.stage!=stage){
      title.dataset.stage=stage;
      title.textContent=titles[stage];
      title.animate([{opacity:.25,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],{duration:380,easing:'cubic-bezier(.2,.8,.2,1)'});
    }
    if(caption)caption.textContent=captions[stage];
    if(name)name.textContent=names[stage];
    s.querySelectorAll('.phf-story-dots i').forEach((dot,i)=>dot.classList.toggle('active',i===stage));

    const scroller=s.querySelector('.phf-story-scroll');
    if(scroller)scroller.style.opacity=p>.82?0:.7;
  }

  function renderQuote(){
    const s=document.querySelector('[data-scene="quote"]');
    if(!s)return;
    const p=progress(s);
    const pin=s.querySelector('.phf-quote-pin');
    if(pin)pin.style.setProperty('--pin-progress',p);
    const e=ease(p);
    s.style.setProperty('--quote-tilt',`${54-e*24}deg`);
    s.style.setProperty('--quote-rot',`${-8+e*12}deg`);
    const grid=s.querySelector('.phf-quote-grid');
    if(grid){
      grid.style.opacity=clamp((p-.06)/.18);
      grid.style.transform=`translateY(${(1-e)*18}px)`;
    }
  }

  function renderFinal(){
    const s=document.querySelector('[data-scene="final"]');
    if(!s)return;
    const p=progress(s);
    const pin=s.querySelector('.phf-final-pin');
    if(pin)pin.style.setProperty('--pin-progress',p);
    const e=ease(p);
    s.style.setProperty('--final-orbit',`${e*72}deg`);
    const inner=s.querySelector('.phf-final-inner');
    if(inner){
      inner.style.opacity=clamp((p-.04)/.16);
      inner.style.transform=`scale(${.96+e*.04})`;
    }
  }

  function renderBridges(){
    document.querySelectorAll('.phf-floor-bridge').forEach((bridge,i)=>{
      const r=bridge.getBoundingClientRect();
      const p=clamp((innerHeight-r.top)/(innerHeight+r.height));
      bridge.style.setProperty('--bridge-y',`${(p-.5)*64}px`);
      bridge.style.setProperty('--bridge-r',`${(i%2?-1:1)*(p-.5)*5}deg`);
      bridge.style.setProperty('--bridge-z',`${Math.sin(p*Math.PI)*20}px`);
    });
  }

  let ticking=false;
  function render(){
    ticking=false;
    if(nav)nav.classList.toggle('scrolled',scrollY>50);
    renderUnbox();
    renderHero();
    renderMaterial();
    renderServices();
    renderRenovation();
    renderProjectStory();
    renderQuote();
    renderFinal();
    renderBridges();
  }

  addEventListener('scroll',()=>{
    if(!ticking){
      ticking=true;
      requestAnimationFrame(render);
    }
  },{passive:true});

  addEventListener('resize',render);
  render();
})();

// v13 project-photo lightbox
(()=>{
  const box=document.querySelector('.phf-lightbox');
  if(!box)return;
  const out=box.querySelector('img');
  const close=()=>{box.classList.remove('open');box.setAttribute('aria-hidden','true');document.body.style.overflow=''};
  document.querySelectorAll('.phf-project-photo img').forEach(img=>img.addEventListener('click',()=>{out.src=img.src;out.alt=img.alt;box.classList.add('open');box.setAttribute('aria-hidden','false');document.body.style.overflow='hidden'}));
  box.querySelector('button').addEventListener('click',close);
  box.addEventListener('click',e=>{if(e.target===box)close()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
})();
