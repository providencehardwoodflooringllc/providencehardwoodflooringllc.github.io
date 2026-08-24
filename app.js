
const menuBtn = document.querySelector('.menu-btn');
const mobile = document.querySelector('.mobile-panel');
if (menuBtn && mobile) {
  menuBtn.addEventListener('click', () => mobile.classList.toggle('open'));
}

(() => {
  const items = document.querySelectorAll(
    '.content-section > .shell, .service-row, .review-card, .finish-card, .contact-aside, .form, .proof, .story'
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
    renderHero();
    renderMaterial();
    renderServices();
    renderRenovation();
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
