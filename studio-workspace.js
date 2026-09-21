(() => {
  const root=document.getElementById('studioAtelier');
  if(!root)return;
  const $=id=>document.getElementById(id);
  const endpoint='https://us-central1-bakers-agent.cloudfunctions.net/mbc-cake-design-v1';
  const sprite='images/design-studio/yana-examples.png';
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const examples=[
  {
    "name": "A little house. Entirely cake.",
    "alt": "AI example inspired by Yana's sculpted mushroom-house cake",
    "palette": [
      "#e33b36",
      "#9fd533",
      "#e6b854"
    ],
    "prompt": "A sculpted mushroom-house cake inspired by handcrafted storybook fondant cakes. A vivid red domed mushroom cap with ivory spots sits on a cream cottage stem, with a tiny wood-textured golden arched door, windows, climbing flowers and leaves. A grassy green round cakeboard has a winding stone path. Show the entire sculpted cake, not a tiered cake with a mushroom decoration. Clean white studio background, realistic edible fondant craftsmanship."
  },
  {
    "name": "Ramen. Plot twist: cake.",
    "alt": "AI example inspired by Yana's realistic ramen-bowl cake",
    "palette": [
      "#513829",
      "#e6b150",
      "#6e993d"
    ],
    "prompt": "A realistic food-illusion cake sculpted as a dark brown ramen bowl. The bowl and all toppings are edible cake and fondant: golden piped noodles, realistic fondant sliced egg halves, roast-style fondant topping, small green peas and scallions. Place on a wood-look fondant board with two small fondant fortune cookies. Achievable handmade bakery craftsmanship, photographed as one whole cake against a clean white background. No conventional tiered cake underneath."
  },
  {
    "name": "One small bite for mankind.",
    "alt": "AI example inspired by Yana's astronaut and moon birthday cake",
    "palette": [
      "#959c9e",
      "#198dca",
      "#ebc836"
    ],
    "prompt": "A space-themed birthday cake sculpted as a gray cratered moon dome, with a cheerful blue-suited fondant astronaut in front. A blue-and-red rocket rises from tiny white fondant cloud puffs on top, surrounded by a few yellow fondant stars. Matching gray moon-surface round cakeboard. Preserve the moon-dome silhouette rather than making a conventional tiered cake. Photorealistic, achievable handmade fondant details, whole cake on clean white background. Do not add a name or age unless requested."
  }
];
  let mode='idea',example=0,active=-1,busy=false,comparing=false,tiers=2;
  let build={steps:[],step:0,data:[],config:null,approved:false};
  const versions=[];
  const frame=$('atelierCakeFrame'),cake=$('atelierCake');
  const clone=value=>JSON.parse(JSON.stringify(value));
  const controls=[...root.querySelectorAll('button,input,select,textarea')];
  let disabledBefore=new Map();
  function announce(text){$('atelierAnnouncement').textContent=text;}
  function error(text){$('atelierError').textContent=text;$('atelierError').hidden=!text;if(text)announce(text);}
  function entrance(){if(!reduced.matches)frame.animate([{opacity:.3,transform:'translateY(6px)'},{opacity:1,transform:'translateY(0)'}],{duration:380,easing:'cubic-bezier(.2,.7,.3,1)'});}
  function palette(colors,label){
    const holder=$('atelierPalette');holder.replaceChildren();holder.setAttribute('aria-label',label);
    const text=document.createElement('span');text.textContent='Palette';holder.append(text);
    for(const color of colors){const dot=document.createElement('i');dot.style.setProperty('--swatch',color);dot.title=color;holder.append(dot);}
  }
  function imagePalette(){
    if(active<0||comparing)return;
    try{
      const c=document.createElement('canvas');c.width=c.height=64;const ctx=c.getContext('2d');ctx.drawImage(cake,0,0,64,64);
      const data=ctx.getImageData(0,0,64,64).data,counts=new Map();
      for(let i=0;i<data.length;i+=4){const rgb=[data[i],data[i+1],data[i+2]];if(Math.min(...rgb)>232||Math.max(...rgb)<45)continue;const key=rgb.map(v=>Math.min(255,Math.round(v/24)*24)).join(',');counts.set(key,(counts.get(key)||0)+1);}
      const selected=[];
      for(const [key] of [...counts].sort((a,b)=>b[1]-a[1])){const rgb=key.split(',').map(Number);if(selected.every(prev=>Math.hypot(...rgb.map((n,i)=>n-prev[i]))>58))selected.push(rgb);if(selected.length===5)break;}
      palette(selected.map(rgb=>'#'+rgb.map(n=>n.toString(16).padStart(2,'0')).join('')),'Colors sampled from your generated cake');
    }catch{palette([],'Color palette unavailable');}
  }
  cake.addEventListener('load',imagePalette);
  function paint(index=active){
    const version=versions[index];frame.classList.toggle('atelier-example',!version);
    if(version){cake.src=version.image;cake.alt='Your generated cake design, version '+(index+1);$('atelierStatus').textContent=comparing?'Before':'Your design';$('atelierCaption').textContent='Your cake, version '+(index+1);$('atelierImageNote').textContent=version.label;}
    else{frame.style.setProperty('--example',example);cake.src=sprite;cake.alt=examples[example].alt;$('atelierStatus').textContent='AI example';$('atelierCaption').textContent=examples[example].name;$('atelierImageNote').textContent='Inspired by Yana’s actual cake work.';palette(examples[example].palette,'Colors in this AI example');}
  }
  function sync(){
    const has=active>=0;
    $('atelierEditPanel').hidden=!has;$('atelierFresh').hidden=!has;$('atelierFinish').hidden=!has;
    $('atelierBrief').readOnly=has;
    $('atelierGenerate').querySelector('span').textContent=busy?'Creating…':has?'Make this change':'Create my cake';
    $('atelierBefore').disabled=busy||!has||versions[active].parent<0;
    $('atelierHistoryArea').hidden=!versions.length;
    root.querySelectorAll('[data-example]').forEach(b=>b.setAttribute('aria-pressed',String(!has&&Number(b.dataset.example)===example)));
    renderHistory();
  }
  function renderHistory(){
    const list=$('atelierHistory');list.replaceChildren();
    versions.forEach((v,i)=>{const b=document.createElement('button');b.type='button';b.disabled=busy;b.setAttribute('aria-pressed',String(i===active));b.setAttribute('aria-label','Return to version '+(i+1)+': '+v.label);const im=document.createElement('img');im.src=v.image;im.alt='';const label=document.createElement('span');label.textContent='V'+(i+1);b.append(im,label);b.addEventListener('click',()=>{if(busy)return;active=i;comparing=false;$('atelierBrief').value=v.description;if(v.build){build=clone(v.build);renderStep();}paint();sync();entrance();});list.append(b);});
  }
  function setBusy(value){
    busy=value;root.setAttribute('aria-busy',String(value));$('atelierWorking').hidden=!value;
    if(value){disabledBefore=new Map(controls.map(el=>[el,el.disabled]));controls.forEach(el=>{if(el.id!=='atelierExpand'&&el.id!=='atelierChat')el.disabled=true;});}
    else{controls.forEach(el=>el.disabled=disabledBefore.get(el)||false);}
    sync();
  }
  async function generate(description,instruction,label,buildSnapshot=null){
    if(busy)return false;
    if(description.trim().length<5){error('Tell us a little more about the cake you have in mind.');return false;}
    if(description.length>12000){error('That brief is getting long. Shorten it a little before continuing.');return false;}
    const parent=active,reference=versions[parent]?.image;
    const editing=!!reference&&!!instruction;
    error('');setBusy(true);announce(editing?'Making your requested change.':'Creating your cake.');
    const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),150000);
    try{
      const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},signal:controller.signal,body:JSON.stringify({description,productType:'cake',operation:editing?'edit':'generate',referenceImage:editing?reference:null,editInstruction:editing?instruction:''})});
      const data=await response.json();
      if(!response.ok||!data.image)throw new Error(data.error||'The cake could not be drawn just now. Please try again.');
      if(!/^data:image\/(png|jpeg|webp);base64,/.test(data.image))throw new Error('The picture could not be opened. Please try again.');
      versions.push({image:data.image,description,label,parent:editing?parent:-1,build:buildSnapshot});active=versions.length-1;
      $('atelierBrief').value=description;$('atelierChange').value='';paint();entrance();announce('Your new cake design is ready.');return true;
    }catch(e){error(e.name==='AbortError'?'That design took longer than expected. Your previous version is still here.':navigator.onLine===false?'You appear to be offline. Reconnect and try again.':e.message||'Please try again.');return false;}
    finally{clearTimeout(timeout);setBusy(false);}
  }
  function selectMode(next){
    if(busy)return;mode=next;
    root.querySelectorAll('[data-mode]').forEach(b=>{const yes=b.dataset.mode===mode;b.setAttribute('aria-selected',String(yes));b.tabIndex=yes?0:-1;});
    $('atelierIdea').hidden=mode!=='idea';$('atelierBuild').hidden=mode!=='build';error('');
  }
  root.querySelectorAll('[data-mode]').forEach(button=>{button.addEventListener('click',()=>selectMode(button.dataset.mode));button.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();selectMode(e.key==='Home'?'idea':e.key==='End'?'build':mode==='idea'?'build':'idea');root.querySelector('[data-mode="'+mode+'"]').focus();});});
  root.querySelectorAll('[data-example]').forEach(button=>button.addEventListener('click',()=>{if(busy)return;example=Number(button.dataset.example);active=-1;comparing=false;$('atelierBrief').value=examples[example].prompt;error('');paint();sync();entrance();}));
  $('atelierUseExample').addEventListener('click',()=>{active=-1;$('atelierBrief').value=examples[example].prompt;paint();sync();$('atelierBrief').focus({preventScroll:true});});
  $('atelierFresh').addEventListener('click',()=>{active=-1;$('atelierBrief').value='';$('atelierChange').value='';paint();sync();$('atelierBrief').focus({preventScroll:true});});
  root.querySelectorAll('[data-change]').forEach(b=>b.addEventListener('click',()=>{$('atelierChange').value=b.dataset.change;$('atelierChange').focus({preventScroll:true});}));
  $('atelierGenerate').addEventListener('click',async()=>{
    const change=$('atelierChange').value.trim();
    if(active>=0&&!change){error('Tell us what you would like to change.');$('atelierChange').focus();return;}
    const description=active>=0?versions[active].description+'\nRequested change: '+change:$('atelierBrief').value.trim();
    await generate(description,active>=0?change:'',active>=0?change.slice(0,55):'Your first idea');
  });
  function compare(on){if(active<0||busy||versions[active].parent<0)return;comparing=on;$('atelierBefore').setAttribute('aria-pressed',String(on));paint(on?versions[active].parent:active);}
  const before=$('atelierBefore');
  before.addEventListener('pointerdown',e=>{before.setPointerCapture(e.pointerId);compare(true);});
  ['pointerup','pointercancel','lostpointercapture','blur'].forEach(event=>before.addEventListener(event,()=>compare(false)));
  before.addEventListener('keydown',e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();compare(true);}});
  before.addEventListener('keyup',e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();compare(false);}});
  window.addEventListener('blur',()=>compare(false));
  $('atelierExpand').addEventListener('click',()=>{const copy=frame.cloneNode(true);copy.removeAttribute('id');copy.querySelector('img').removeAttribute('id');$('atelierViewerContent').replaceChildren(copy);$('atelierViewer').showModal();});
  $('atelierViewerClose').addEventListener('click',()=>$('atelierViewer').close());
  $('atelierViewer').addEventListener('click',e=>{if(e.target===$('atelierViewer'))$('atelierViewer').close();});
  root.querySelectorAll('[data-tiers]').forEach(b=>b.addEventListener('click',()=>{tiers=Number(b.dataset.tiers);root.querySelectorAll('[data-tiers]').forEach(x=>x.setAttribute('aria-pressed',String(Number(x.dataset.tiers)===tiers)));}));
  $('atelierStartBuild').addEventListener('click',()=>{
    const config={tiers,shape:$('atelierShape').value,board:$('atelierBoard').value,topper:$('atelierTopper').checked,writing:$('atelierWriting').checked};
    const steps=[];
    if(config.board==='premium')steps.push({title:'Give it a good foundation.',target:'the cakeboard',help:'Describe the color, finish, and any edging on the board.',placeholder:'Ivory fondant, a fine gold edge, a blush ribbon…'});
    for(let i=1;i<=tiers;i++){const where=tiers===1?'the cake':i===1?'the bottom tier':i===tiers?'the top tier':'the middle tier';steps.push({title:tiers===1?'The cake, your way.':i===1?'Start at the bottom.':i===tiers?'Top it off.':'Meet in the middle.',target:where,help:'Choose the colors, icing, and decorations for '+where+'.',placeholder:'Ivory buttercream, blush sugar roses, a little gold leaf…'});}
    if(config.topper)steps.push({title:'A finishing flourish.',target:'the cake topper',help:'A figure, flowers, or something wonderfully unexpected.',placeholder:'Two tiny fondant dogs sitting together…'});
    if(config.writing)steps.push({title:'Say it with frosting.',target:'the writing',help:'Tell us the exact words, color, and where you want them.',placeholder:'Happy Birthday, Alex! In small gold letters on the board.'});
    build={config,steps,step:0,data:[],approved:false};$('atelierBuildSetup').hidden=true;$('atelierBuildSteps').hidden=false;renderStep();
  });
  function renderStep(){
    if(!build.steps.length)return;
    const step=build.steps[build.step];$('atelierStepCount').textContent='Step '+(build.step+1)+' of '+build.steps.length;$('atelierStepTitle').textContent=step.title;$('atelierStepHelp').textContent=step.help;$('atelierStepBrief').placeholder=step.placeholder;$('atelierStepBrief').value=build.data[build.step]||'';
    $('atelierStepDots').replaceChildren(...build.steps.map((_,i)=>{const dot=document.createElement('i');if(i<=build.step)dot.className='done';return dot;}));
    $('atelierNextStep').hidden=!build.approved;$('atelierNextStep').textContent=build.step===build.steps.length-1?'Keep this design':'Keep it & continue';
  }
  $('atelierChangeSetup').addEventListener('click',()=>{$('atelierBuildSetup').hidden=false;$('atelierBuildSteps').hidden=true;});
  $('atelierStepBrief').addEventListener('input',()=>{build.approved=false;$('atelierNextStep').hidden=true;});
  $('atelierBuildGenerate').addEventListener('click',async()=>{
    const brief=$('atelierStepBrief').value.trim();if(brief.length<5){error('Add a few details about this part of your cake.');return;}
    build.data[build.step]=brief;build.data.length=build.step+1;
    const description='One complete custom '+build.config.shape+' cake with '+build.config.tiers+' tier(s), on a '+build.config.board+' cakeboard. '+build.steps.slice(0,build.step+1).map((step,i)=>step.target+': '+(build.data[i]||'')).join('. ')+'. Photograph the whole cake against a clean white background.';
    const instruction='Update only '+build.steps[build.step].target+': '+brief+'. Keep every other approved detail unchanged.';
    const snapshot=clone(build);snapshot.approved=true;
    const success=await generate(description,active>=0?instruction:'',build.steps[build.step].target,snapshot);
    if(success){build.approved=true;$('atelierNextStep').hidden=false;}
  });
  $('atelierNextStep').addEventListener('click',()=>{
    if(!build.approved)return;
    if(build.step===build.steps.length-1){selectMode('idea');$('atelierChange').placeholder='Anything else? Your cake is ready to save, or make one more change.';announce('Your cake is ready to save.');return;}
    build.step++;build.approved=false;renderStep();
  });
  let pdfPromise;
  function pdfLibrary(){
    if(window.jspdf)return Promise.resolve(window.jspdf.jsPDF);
    if(!pdfPromise)pdfPromise=new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';script.onload=()=>window.jspdf?resolve(window.jspdf.jsPDF):reject(new Error('The download tool could not load.'));script.onerror=()=>reject(new Error('The download tool could not load.'));document.head.append(script);}).catch(e=>{pdfPromise=null;throw e;});
    return pdfPromise;
  }
  $('atelierSave').addEventListener('click',async()=>{
    if(active<0)return;const version=versions[active],button=$('atelierSave');button.disabled=true;error('');
    try{
      const PDF=await pdfLibrary(),doc=new PDF();doc.setTextColor(98,45,43);doc.setFontSize(20);doc.text('Your cake design',18,23);doc.setFontSize(10);doc.text('My Baking Creations - AI concept for inspiration',18,32);
      const props=doc.getImageProperties(version.image);const width=Math.min(174,150*props.width/props.height),height=width*props.height/props.width;doc.addImage(version.image,version.image.includes('image/jpeg')?'JPEG':'PNG',(210-width)/2,42,width,height);
      let y=42+height+14;doc.setFontSize(11);const lines=doc.splitTextToSize(version.description.replace(/[\u2018\u2019]/g,"'").replace(/[\u201c\u201d]/g,'"'),174);
      for(const line of lines){if(y>273){doc.addPage();y=22;}doc.text(line,18,y);y+=6;}
      doc.save('my-baking-creations-cake-design.pdf');announce('Your design and notes have been saved.');
    }catch(e){error(e.message);}finally{button.disabled=false;}
  });
  $('atelierChat').addEventListener('click',()=>document.getElementById('chatbot-toggle')?.click());
  new IntersectionObserver(entries=>document.body.classList.toggle('atelier-in-view',entries[0].isIntersecting),{threshold:0}).observe(root);
  const header=document.querySelector('header');
  if(header){const size=()=>root.style.setProperty('--atelier-nav',header.getBoundingClientRect().height+'px');new ResizeObserver(size).observe(header);size();}
  paint();sync();
  document.fonts.ready.then(()=>{if(location.hash==='#studioAtelier')root.scrollIntoView({block:'start',behavior:'instant'});});
})();
