import { creations } from './order-studio-creations-data.mjs?v=creations-1';

const $ = id => document.getElementById(id);
const strip=$('creationsStrip'), viewport=$('creationsViewport'), rail=$('creationsRail');
const dialog=$('creationViewer'), photo=$('creationViewerPhoto');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const originals=[];
let paused=false,hovering=false,resumeAfter=0,wrapGrace=0,selected=0,opener=null,resumeFilm=false;

function showPhoto(index,trigger) {
  selected=(index+creations.length)%creations.length;
  const item=creations[selected];
  photo.src=item.photo;photo.alt=item.title+' — actual cookies made by My Baking Creations';
  $('creationViewerTitle').textContent=item.title;
  $('creationViewerCount').textContent=(selected+1)+' of '+creations.length;
  if (!dialog.open) {
    opener=trigger || document.activeElement;
    const video=$('packagingVideo');resumeFilm=!!video && !video.paused;
    video?.pause();dialog.showModal();
  }
}

function card(item,index,copy=false) {
  const button=document.createElement('button');button.type='button';button.className='creation-card';
  button.setAttribute('aria-label','View '+item.title);
  if(copy){button.tabIndex=-1;button.setAttribute('aria-hidden','true');}
  const silhouette=document.createElement('span');silhouette.className='creation-silhouette';
  const image=document.createElement('img');image.src=item.thumbnail;image.alt='';
  image.decoding='async';image.loading=index<4&&!copy?'eager':'lazy';image.style.clipPath=item.clip;
  silhouette.append(image);
  const label=document.createElement('span');label.className='creation-name';label.textContent=item.title;
  button.append(silhouette,label);
  button.addEventListener('click',()=>showPhoto(index,copy?originals[index]:button));
  return button;
}

creations.forEach((item,index)=>{const button=card(item,index);originals.push(button);rail.append(button);});
// Visual copies make the loop continuous; keyboard navigation uses the original fifteen.
const copies=creations.map((item,index)=>card(item,index,true));copies.forEach(button=>rail.append(button));
function loopWidth(){return copies[0].offsetLeft-originals[0].offsetLeft;}
viewport.addEventListener('scroll',()=>{
  const width=loopWidth();if(Date.now()>=wrapGrace && width && viewport.scrollLeft>=width)viewport.scrollLeft-=width;
},{passive:true});
function move(direction) {
  const width=loopWidth();
  if(direction<0 && viewport.scrollLeft<1){wrapGrace=Date.now()+1000;viewport.scrollLeft=width;}
  const step=originals[1].offsetLeft-originals[0].offsetLeft;
  viewport.scrollBy({left:step*direction,behavior:reduced.matches?'auto':'smooth'});
}
$('creationsPrevious').addEventListener('click',()=>{resumeAfter=Date.now()+10000;move(-1);});
$('creationsNext').addEventListener('click',()=>{resumeAfter=Date.now()+10000;move(1);});
// Phone dot bar: one dot per creation, arrows at the ends.
const dotsHost=$('creationsDots'),dots=[];
if(dotsHost){
  creations.forEach((item,index)=>{const d=document.createElement('button');d.type='button';d.tabIndex=-1;d.className='creations-dot';
    d.addEventListener('click',()=>{resumeAfter=Date.now()+10000;viewport.scrollTo({left:originals[index].offsetLeft-originals[0].offsetLeft,behavior:reduced.matches?'auto':'smooth'});});
    dots.push(d);dotsHost.append(d);});
  const syncDots=()=>{const step=originals[1].offsetLeft-originals[0].offsetLeft;if(!step)return;
    const i=Math.round(viewport.scrollLeft/step)%creations.length;dots.forEach((d,k)=>d.classList.toggle('is-active',k===i));};
  viewport.addEventListener('scroll',syncDots,{passive:true});syncDots();
  $('creationsDotPrev').addEventListener('click',()=>{resumeAfter=Date.now()+10000;move(-1);});
  $('creationsDotNext').addEventListener('click',()=>{resumeAfter=Date.now()+10000;move(1);});
}
const phone=matchMedia('(max-width: 760px)');
$('creationsPause').addEventListener('click',()=>{
  paused=!paused;$('creationsPause').textContent=paused?'Play':'Pause';
  $('creationsPause').setAttribute('aria-pressed',String(paused));
  $('creationsPause').setAttribute('aria-label',paused?'Resume creation photos':'Pause creation photos');
});
strip.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')hovering=true;});
strip.addEventListener('pointerleave',()=>{hovering=false;});
viewport.addEventListener('pointerdown',()=>{resumeAfter=Date.now()+10000;},{passive:true});
let lastAuto=Date.now();
setInterval(()=>{
  if(Date.now()-lastAuto<(phone.matches?2500:4000))return;
  if(document.body.dataset.step!=='upload'||document.hidden||dialog.open||paused||hovering||reduced.matches||Date.now()<resumeAfter||viewport.contains(document.activeElement))return;
  lastAuto=Date.now();move(1);
},250);

$('creationViewerClose').addEventListener('click',()=>dialog.close());
$('creationViewerReturn').addEventListener('click',()=>dialog.close());
$('creationViewerPrevious').addEventListener('click',()=>showPhoto(selected-1));
$('creationViewerNext').addEventListener('click',()=>showPhoto(selected+1));
dialog.addEventListener('keydown',e=>{
  if(e.key==='ArrowRight'){e.preventDefault();showPhoto(selected+1);}
  if(e.key==='ArrowLeft'){e.preventDefault();showPhoto(selected-1);}
});
dialog.addEventListener('click',e=>{
  if(e.target!==dialog)return;
  const r=dialog.getBoundingClientRect();
  if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();
});
$('packagingVideo')?.addEventListener('playing',()=>{
  if(dialog.open){resumeFilm=true;$('packagingVideo').pause();}
});
dialog.addEventListener('close',()=>{
  resumeAfter=Date.now()+6000;
  if(resumeFilm && document.body.dataset.step==='upload' && !document.hidden)$('packagingVideo')?.play().catch(()=>{});
  if(opener?.isConnected)opener.focus({preventScroll:true});
});
new MutationObserver(()=>{
  if(document.body.dataset.step!=='upload' && dialog.open)dialog.close();
}).observe(document.body,{attributes:true,attributeFilter:['data-step']});
