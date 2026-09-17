const assets={
  characters:['character-original.webp','Character birthday cakes'],
  social:['social-original.webp','Social-media logo cookies'],
  sculpted:['sculpted.webp','Sculpted handbag and puzzle-cube cakes'],
  celebration:['celebration.webp','Custom celebration cakes'],
  wedding:['wedding.webp','Wedding cake with pink sugar flowers'],
  pops:['pops.webp','Branded and unicorn cake pops'],
  corporatePops:['corporate-pops.webp','Branded cake-pop display'],
  meta:['meta-nestle-group.svg','Meta and Nestlé printed logo cookie'],
  prism:['prism-group.svg','Prism corporate celebration cookie'],
  structure:['structure-group.svg','Structure Therapeutics milestone cookie'],
  baby:['baby.svg','Personalized baby birthday photo cookie'],
};
const pages={
  home:{title:'Custom Cakes, Cookies & Cake Pops',description:'Made by hand. Made for your moment.',items:['characters','social','celebration','sculpted','pops','wedding','prism'],primary:['Request an Order','order-form.html'],secondary:['View Our Work','gallery.html'],section:'Made for your moments.',detail:'From a favorite face on a cookie to a cake they’ll never forget.'},
  about:{title:'About My Baking Creations',description:'A family bakery. A personal touch. Since 2012.',items:['characters','social','sculpted','pops','celebration'],primary:['Meet our bakery','about.html'],secondary:['View our work','gallery.html'],section:'Meet Yana.',detail:'The baker and cake artist behind My Baking Creations.'},
  gallery:{title:'Our Gallery',description:'A little inspiration for your next celebration.',items:['characters','social','celebration','pops','sculpted','wedding','prism','structure'],primary:['Explore the gallery','gallery.html'],secondary:['Create your cookies','buy-now.html'],section:'Explore our work.',detail:'Cakes, cookies and cake pops, each made for someone’s occasion.'},
  cakes:{title:'Custom Cakes',description:'Your idea, brought to life in cake.',items:['characters','celebration','sculpted','wedding'],primary:['Plan your cake','order-form.html'],secondary:['Browse cakes','gallery-cakes.html'],section:'Find your cake.',detail:'Sculpted celebrations, beautiful wedding cakes and personal favorites.'},
  corporate:{title:'Made for Your Company',description:'Your brand. Your team. A memorable way to celebrate.',items:['meta','corporatePops','structure','prism'],primary:['Plan a corporate order','corporate-order.html'],secondary:['Design logo cookies','buy-now.html'],section:'Made for your team.',detail:'For welcomes, milestones, launches and a well-earned thank you.'},
};
const $=id=>document.getElementById(id);
const root=$('standardHero'),viewport=$('heroViewport'),track=$('heroTrack');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let items=[],index=0,leading=3,visible=3,moving=false,paused=reduced.matches,hovered=false,resumeAfter=0,timer,version=0;
const loaded=new Map();
function loadAsset(id){
  if(!loaded.has(id))loaded.set(id,new Promise(resolve=>{const im=new Image();im.onload=()=>resolve(true);im.onerror=()=>resolve(false);im.src='images/hero-preview/'+assets[id][0];}));
  return loaded.get(id);
}
function modulo(n){return (n%items.length+items.length)%items.length;}
function place(animate=false){
  track.style.transition=animate&&!reduced.matches?'transform 650ms cubic-bezier(.25,.7,.25,1)':'none';
  track.style.transform=`translate3d(${-(leading+index)*viewport.clientWidth/visible}px,0,0)`;
}
function mark(){
  const current=modulo(index);
  [...$('heroPagination').children].forEach((dot,i)=>dot.setAttribute('aria-pressed',String(i===current)));
  $('heroCount').textContent=String(current+1).padStart(2,'0')+' / '+String(items.length).padStart(2,'0');
}
function schedule(){
  clearTimeout(timer);timer=setTimeout(()=>{
    if(!paused&&!hovered&&!document.hidden&&Date.now()>=resumeAfter&&!moving)move(index+1);
    else schedule();
  },4000);
}
function settle(){
  if(!items.length)return;
  index=modulo(index);moving=false;place(false);mark();
}
track.addEventListener('transitionend',event=>{if(event.target===track&&event.propertyName==='transform')settle();});
function move(next,manual=false){
  if(!items.length||moving)return;
  if(next===index){schedule();return;}
  index=next;if(manual)resumeAfter=Date.now()+6500;
  moving=!reduced.matches;place(true);mark();
  if(!moving)settle();
  if(manual)$('heroStatus').textContent=assets[items[modulo(index)]][1];
  schedule();
}
function build(){
  moving=false;visible=parseInt(getComputedStyle(root).getPropertyValue('--hero-visible'))||3;leading=visible;
  track.replaceChildren();
  for(let position=-leading;position<items.length+leading;position++){
    const real=modulo(position),id=items[real],panel=document.createElement('div');panel.className='hero-panel';
    if(position<0||position>=items.length)panel.setAttribute('aria-hidden','true');
    const image=document.createElement('img');image.src='images/hero-preview/'+assets[id][0];image.alt=assets[id][1];image.width=900;image.height=600;image.draggable=false;
    panel.append(image);track.append(panel);
  }
  place(false);mark();
}
async function choosePage(name){
  const config=pages[name]||pages.home,current=++version;
  clearTimeout(timer);root.setAttribute('aria-busy','true');
  const ready=await Promise.all(config.items.map(loadAsset));
  if(current!==version)return;
  items=config.items.filter((_,i)=>ready[i]);
  if(!items.length){root.removeAttribute('aria-busy');$('heroStatus').textContent='The sample photos could not load. Please refresh.';return;}
  index=0;$('heroTitle').textContent=config.title;$('heroDescription').textContent=config.description;
  for(const [id,data] of [['heroPrimary',config.primary],['heroSecondary',config.secondary]]){$(id).textContent=data[0];$(id).href=data[1];}
  $('sectionTitle').textContent=config.section;$('sectionDescription').textContent=config.detail;
  $('pagePreview').value=name;
  document.querySelectorAll('[data-page]').forEach(button=>{if(button.dataset.page===name)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');});
  $('heroPagination').replaceChildren();
  items.forEach((id,i)=>{const dot=document.createElement('button');dot.type='button';dot.setAttribute('aria-label','Show '+assets[id][1]);dot.addEventListener('click',()=>move(i,true));$('heroPagination').append(dot);});
  build();root.removeAttribute('aria-busy');schedule();
  const url=new URL(location.href);url.searchParams.set('page',name);history.replaceState(null,'',url);
}
$('heroPrevious').addEventListener('click',()=>move(index-1,true));
$('heroNext').addEventListener('click',()=>move(index+1,true));
function pauseLabel(){$('heroPause').textContent=paused?'Play':'Pause';$('heroPause').setAttribute('aria-pressed',String(paused));}
$('heroPause').addEventListener('click',()=>{paused=!paused;if(!paused)hovered=false;pauseLabel();schedule();});pauseLabel();
root.addEventListener('pointerenter',event=>{if(event.pointerType==='mouse')hovered=true;});
root.addEventListener('pointerleave',()=>{hovered=false;});
let touchStart=null;
root.addEventListener('pointerdown',event=>{if(event.target.closest('a,button,select'))return;touchStart={x:event.clientX,y:event.clientY};resumeAfter=Date.now()+8000;},{passive:true});
root.addEventListener('pointerup',event=>{if(!touchStart)return;const dx=event.clientX-touchStart.x,dy=event.clientY-touchStart.y;touchStart=null;if(Math.abs(dx)>40&&Math.abs(dx)>Math.abs(dy)*1.3)move(index+(dx<0?1:-1),true);},{passive:true});
root.addEventListener('pointercancel',()=>{touchStart=null;},{passive:true});
new ResizeObserver(()=>{if(items.length){index=modulo(index);build();}}).observe(viewport);
document.addEventListener('visibilitychange',()=>{if(document.hidden)clearTimeout(timer);else schedule();});
reduced.addEventListener('change',()=>{paused=reduced.matches;pauseLabel();settle();schedule();});
$('pagePreview').addEventListener('change',event=>choosePage(event.target.value));
document.querySelectorAll('[data-page]').forEach(button=>button.addEventListener('click',()=>choosePage(button.dataset.page)));
const first=new URLSearchParams(location.search).get('page');choosePage(pages[first]?first:'home');
