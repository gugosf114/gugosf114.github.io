(() => {
 const root=document.querySelector('[data-showcase]');if(!root)return;
 const sources=[...document.getElementById('showcase-source').content.children],scenes=[...root.querySelectorAll('[data-scene]')],total=sources.length;
 const dots=root.querySelector('.showcase-dots'),pause=root.querySelector('[data-pause]'),progress=root.querySelector('.showcase-progress>span');
 let index=0,active=0,paused=false,timer=null,touch=null;
 const mod=n=>(n%total+total)%total;
 function populate(scene,n){scene.replaceChildren(...[n,n+1].map(i=>{const copy=sources[mod(i)].cloneNode(true);copy.querySelectorAll('img').forEach(img=>{img.loading='eager';img.decoding='async';img.draggable=false;});return copy;}));}
 function mark(){dots.querySelectorAll('button').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===index)));root.querySelector('[data-position]').textContent=String(index+1).padStart(2,'0')+' / '+total;root.dataset.currentImage=String(index);}
 function schedule(){clearTimeout(timer);progress.classList.remove('is-timing');if(paused||document.hidden)return;void progress.offsetWidth;progress.classList.add('is-timing');timer=setTimeout(()=>go(index+1),3000);}
 function go(n){index=mod(n);const next=1-active;populate(scenes[next],index);scenes[next].classList.add('is-active');scenes[next].removeAttribute('aria-hidden');scenes[active].classList.remove('is-active');scenes[active].setAttribute('aria-hidden','true');active=next;mark();schedule();}
 sources.forEach((source,i)=>{const b=document.createElement('button');b.type='button';b.setAttribute('aria-label','Show carousel image '+(i+1)+' of '+total);b.addEventListener('click',()=>go(i));dots.append(b);});
 root.querySelector('[data-next]').addEventListener('click',()=>go(index+1));root.querySelector('[data-previous]').addEventListener('click',()=>go(index-1));
 pause.addEventListener('click',()=>{paused=!paused;pause.textContent=paused?'Play':'Pause';pause.setAttribute('aria-label',paused?'Play carousel':'Pause carousel');pause.setAttribute('aria-pressed',String(paused));root.classList.toggle('is-paused',paused);root.querySelector('[data-play-status]').textContent=paused?'Paused':'Playing automatically';schedule();});
 root.querySelector('.showcase-stage').addEventListener('pointerdown',e=>{if(e.target.closest('a,button'))return;touch={x:e.clientX,y:e.clientY};},{passive:true});
 root.addEventListener('pointerup',e=>{if(!touch)return;const x=e.clientX-touch.x,y=e.clientY-touch.y;touch=null;if(Math.abs(x)>40&&Math.abs(x)>Math.abs(y))go(index+(x<0?1:-1));},{passive:true});root.addEventListener('pointercancel',()=>touch=null);
 document.addEventListener('visibilitychange',schedule);
 const header=document.querySelector('body>header');if(header){const size=()=>root.style.setProperty('--showcase-nav',header.getBoundingClientRect().height+'px');new ResizeObserver(size).observe(header);size();}
 populate(scenes[0],0);mark();schedule();
})();
