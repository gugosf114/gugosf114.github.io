/* Shared image-count-driven controller for the standardized hero. */
(() => {
  const hero=document.querySelector('[data-standard-hero]');
  if(!hero)return;
  const viewport=hero.querySelector('.carousel-track-container');
  const track=hero.querySelector('.carousel-track');
  const originals=[...track.children].filter(el=>el.classList.contains('carousel-slide'));
  const controls=hero.querySelector('.hero-dots');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  // Four copies on either side keep the four-panel desktop loop filled.
  const leading=4,total=originals.length;
  if(!total)return;
  let index=0,moving=false,paused=false,visible=true,ready=false;
  let timer,settleTimer,touch=null,resumeAfter=0;
  const mod=value=>(value%total+total)%total;
  const slots=()=>parseInt(getComputedStyle(hero).getPropertyValue('--hero-slots'))||4;
  const copy=source=>{const node=source.cloneNode(true);node.setAttribute('aria-hidden','true');node.querySelectorAll('[id]').forEach(el=>el.removeAttribute('id'));return node;};
  const prefix=Array.from({length:leading},(_,i)=>copy(originals[mod(i-leading)]));
  const suffix=Array.from({length:leading},(_,i)=>copy(originals[i%total]));
  track.replaceChildren(...prefix,...originals,...suffix);
  track.querySelectorAll('img').forEach(image=>{image.loading='eager';image.decoding='async';image.draggable=false;});

  function button(label,text,handler,className='standard-hero-control') {
    const b=document.createElement('button');b.type='button';b.className=className;b.setAttribute('aria-label',label);b.textContent=text;b.addEventListener('click',handler);return b;
  }
  const previous=button('Previous carousel image','‹',()=>go(index-1,true));
  const next=button('Next carousel image','›',()=>go(index+1,true));
  const pause=button('Pause carousel','Pause',()=>{paused=!paused;pauseLabel();schedule();},'standard-hero-control standard-hero-pause');
  const dots=originals.map((slide,i)=>button('Show carousel image '+(i+1)+' of '+total,'',()=>go(i,true),'hero-dot'));
  controls.replaceChildren(previous,...dots,next,pause);
  controls.setAttribute('aria-label','Carousel controls');
  function pauseLabel(){pause.textContent=paused?'Play':'Pause';pause.setAttribute('aria-label',paused?'Play carousel':'Pause carousel');pause.setAttribute('aria-pressed',String(paused));}
  function mark(){dots.forEach((dot,i)=>{dot.classList.toggle('active',i===mod(index));dot.setAttribute('aria-pressed',String(i===mod(index)));});}
  function position(animate=false){
    track.style.transition=animate&&!reduced.matches?'transform 650ms cubic-bezier(.25,.7,.25,1)':'none';
    track.style.transform=`translate3d(${-(leading+index)*viewport.clientWidth/slots()}px,0,0)`;
  }
  function settle(){clearTimeout(settleTimer);index=mod(index);moving=false;position();mark();}
  function schedule(){
    clearTimeout(timer);
    if(!ready||document.hidden||!visible)return;
    timer=setTimeout(()=>{
      if(!paused&&!moving&&Date.now()>=resumeAfter)go(index+1);
      else schedule();
    },3000);
  }
  function go(target,manual=false){
    if(!ready||moving||target===index)return;
    index=target;if(manual)resumeAfter=Date.now()+6000;
    moving=!reduced.matches;position(true);mark();
    if(moving)settleTimer=setTimeout(settle,750);else settle();
    schedule();
  }
  track.addEventListener('transitionend',event=>{if(event.target===track&&event.propertyName==='transform')settle();});

  function size(){
    const header=document.querySelector('header');
    if(header)hero.parentElement.style.setProperty('--site-nav-height',header.getBoundingClientRect().height+'px');
    settle();
  }
  new ResizeObserver(size).observe(viewport);
  const header=document.querySelector('header');if(header)new ResizeObserver(size).observe(header);
  reduced.addEventListener('change',()=>{settle();schedule();});
  hero.addEventListener('pointerdown',e=>{if(e.target.closest('a,button,input'))return;touch={x:e.clientX,y:e.clientY};},{passive:true});
  hero.addEventListener('pointerup',e=>{if(!touch)return;const dx=e.clientX-touch.x,dy=e.clientY-touch.y;touch=null;if(Math.abs(dx)>40&&Math.abs(dx)>Math.abs(dy)*1.3)go(index+(dx<0?1:-1),true);},{passive:true});
  hero.addEventListener('pointercancel',()=>{touch=null;},{passive:true});
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;schedule();},{threshold:.05}).observe(hero);
  document.addEventListener('visibilitychange',()=>{schedule();});
  pauseLabel();mark();size();
  Promise.all(originals.map(slide=>slide.querySelector('img').decode().catch(()=>{}))).then(()=>{ready=true;schedule();});
})();
