(() => {
  const root=document.getElementById('quotePreview');if(!root)return;
  const $=id=>document.getElementById(id),form=$('quotePreviewForm');
  const products={Cake:{key:'cake',unit:'servings',hint:'How many people should the cake serve?',flavors:['Strawberry Vanilla Cream','Chocolate Mousse','Lemon Orange Cream','Blueberry Lavender Cream']},Cookies:{key:'cookies',unit:'cookies',hint:'How many individual cookies?',flavors:['Vanilla Shortbread','Chocolate Shortbread','Lemon Orange Shortbread','Gingerbread']},'Cake Pops':{key:'pops',unit:'cake pops',hint:'How many individual cake pops?',flavors:['Vanilla','Chocolate']},Cupcakes:{key:'cupcakes',unit:'cupcakes',hint:'How many individual cupcakes?',flavors:['Vanilla','Chocolate']}};
  Object.entries(products).forEach(([name,meta])=>{meta.minimum=name==='Cake'?1:12;if(meta.minimum===12)meta.hint+=' Minimum 12; add any number after that.';});
  let step=0,furthest=0,files=[],fileUrls=[],items={},saveTimer,hydrating=false;
  const emptySketch=()=>({image:'',brief:'',changes:[],change:'',open:false,minimized:false,version:0,attachedVersion:-1,attachedName:'',appliedNote:''});
  let sketch=emptySketch(),sketchBusy=false,sketchUsing=false,sketchController=null,sketchRequest=0;
  let submitting=false,submissionCompleted=false,submissionId='',submissionFingerprint='',referenceCache={key:'',references:[]};
  const fieldIds=['qIdea','qNeedHelp','qBudget','qDiet','qOccasion','qDate','qDateUnsure','qLocation','qName','qEmail','qPhone'];
  const picked=()=>[...form.querySelectorAll('[name="products"]:checked')].map(e=>e.value);
  const fulfillment=()=>form.querySelector('[name="fulfillment"]:checked')?.value||'';
  const node=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
  const today=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};
  $('qDate').min=today();
  function dateLabel(){return $('qDateUnsure').checked||!$('qDate').value?'Date not set yet':new Date($('qDate').value+'T12:00:00').toLocaleDateString('en-US',{weekday:'short',month:'long',day:'numeric',year:'numeric'});}
  function rememberItems(){form.querySelectorAll('[data-quantity]').forEach(e=>{items[e.dataset.quantity]??={};items[e.dataset.quantity].quantity=e.value;});form.querySelectorAll('[data-flavor]').forEach(e=>{items[e.dataset.flavor]??={};items[e.dataset.flavor].flavor=e.value;});}
  function renderProducts(){
    const selection=picked();$('qSelectedDetails').hidden=false;
    $('qSelectedDetails').querySelector('.q-section-heading').hidden=!selection.length;
    $('qQuantities').hidden=!selection.length;
    $('qQuantities').replaceChildren();$('qFlavors').replaceChildren();
    selection.forEach(product=>{
      const meta=products[product],saved=items[product]||{};
      const row=node('div','q-quantity'),label=node('label',null,product==='Cake'?'Cake servings':product);label.htmlFor='qQty-'+meta.key;label.append(node('span',null,meta.hint));
      const input=node('input');input.type='number';input.min=meta.minimum===12?'0':String(meta.minimum);input.step='1';input.inputMode='numeric';input.placeholder='Not sure';input.id='qQty-'+meta.key;input.dataset.quantity=product;input.value=meta.minimum===12?(saved.quantity||'0'):(saved.quantity||'');
      const message=node('p','q-field-error');message.id='qQtyError-'+meta.key;message.hidden=true;input.setAttribute('aria-describedby',message.id);let quantityControl=input;
      if(meta.minimum===12){
        const counter=node('div','q-number'),badge=node('span','q-min-badge','(min)'),arrows=node('div','q-number-arrows');
        const syncMin=()=>{badge.hidden=Number(input.value)!==12;};
        const change=(direction)=>{
          const current=Number(input.value)||0;
          input.value=String(direction>0?(current<12?12:Math.floor(current)+1):(current<=12?0:Math.ceil(current)-1));
          syncMin();input.dispatchEvent(new Event('input',{bubbles:true}));
        };
        for(const [direction,symbol,labelText] of [[1,'▲','Increase '],[-1,'▼','Decrease ']]){
          const button=node('button',null,symbol);button.type='button';button.setAttribute('aria-label',labelText+product.toLowerCase());button.addEventListener('click',()=>change(direction));arrows.append(button);
        }
        input.addEventListener('keydown',event=>{if(event.key==='ArrowUp'||event.key==='ArrowDown'){event.preventDefault();change(event.key==='ArrowUp'?1:-1);}});
        input.addEventListener('input',syncMin);input.addEventListener('wheel',()=>input.blur(),{passive:true});syncMin();counter.append(input,badge,arrows);quantityControl=counter;
      }
      row.append(label,quantityControl,message);$('qQuantities').append(row);
      const flavorLabel=node('label','q-label',product+' flavor');flavorLabel.htmlFor='qFlavor-'+meta.key;const select=node('select');select.id=flavorLabel.htmlFor;select.dataset.flavor=product;
      for(const value of ['Not decided yet',...meta.flavors]){const option=node('option',null,value);option.value=value==='Not decided yet'?'':value;select.append(option);}select.value=saved.flavor||'';$('qFlavors').append(flavorLabel,select);
    });
  }
  function eventState(){
    $('qDate').disabled=$('qDateUnsure').checked;
    const method=fulfillment();$('qPickup').hidden=method!=='Pickup';$('qDelivery').hidden=method!=='Delivery';
    const days=($('qDate').value?new Date($('qDate').value+'T12:00:00').getTime():0)-new Date(today()+'T12:00:00').getTime();
    $('qRush').hidden=$('qDateUnsure').checked||!$('qDate').value||days<0||days>7*86400000;
  }
  function productLines(){return picked().map(p=>{const entry=items[p]||{},amount=entry.quantity&&Number(entry.quantity)>0?entry.quantity+' '+products[p].unit:'quantity to discuss';return p+' — '+amount+(entry.flavor?' · '+entry.flavor:'');});}
  function deliveryLine(){const method=fulfillment();return method==='Pickup'?'Pickup at the Daly City kitchen':method==='Delivery'?'Delivery requested'+($('qLocation').value.trim()?' to '+$('qLocation').value.trim():''):'Pickup or delivery to discuss';}
  function updateSummary(){
    rememberItems();const holder=$('qSummary');holder.replaceChildren();
    if(!picked().length){holder.append(node('p','q-summary-empty','Your choices will appear here as we go.'));
    }else{
      for(const [label,text] of [['Treats',productLines().join('\n')],['Event',[$('qOccasion').value.trim(),dateLabel()].filter(Boolean).join('\n')],['Getting it to you',deliveryLine()]]){const block=node('div','q-summary-item');block.append(node('strong',null,label),node('p',null,text));holder.append(block);}
    }
    renderReview();syncSketch();updateProgress();
  }
  function reviewBlock(title,lines,editStep){
    const section=node('div','q-review-section'),top=node('div','q-review-top'),button=node('button',null,'Edit');button.type='button';button.setAttribute('aria-label','Edit '+title.toLowerCase());button.addEventListener('click',()=>setStep(editStep));top.append(node('h3',null,title),button);section.append(top);
    lines.filter(Boolean).forEach(line=>section.append(node('p',null,line)));return section;
  }
  function renderReview(){
    const order=reviewBlock('Your treats',productLines().concat([$ ('qIdea').value.trim(),$('qNeedHelp').checked?'Please help me choose a design.':'',$('qBudget').value.trim()?'Budget: '+$('qBudget').value.trim():'',$('qDiet').value.trim()?'Dietary notes: '+$('qDiet').value.trim():'']),0);
    if(files.length){const list=node('div','q-review-files');files.forEach((file,i)=>{if(fileUrls[i]){const im=node('img');im.src=fileUrls[i];im.alt=file.name;list.append(im);}else list.append(node('span',null,file.name));});order.append(list);}
    $('qReview').replaceChildren(order,reviewBlock('Your event',[$('qOccasion').value.trim(),dateLabel(),deliveryLine()],1));
  }
  function clearErrors(){root.querySelectorAll('.q-field-error').forEach(e=>e.hidden=true);root.querySelectorAll('[aria-invalid]').forEach(e=>e.removeAttribute('aria-invalid'));$('qFormError').hidden=true;}
  function errorsFor(index){
    const errors=[],add=(id,field,message)=>errors.push({id,field,message,step:index});
    if(index===0){
      if(!picked().length)add('qProductError',form.querySelector('[name="products"]'),'Choose at least one treat to continue.');
      picked().forEach(p=>{const input=$('qQty-'+products[p].key);if(input.validity.badInput||input.value&&!(products[p].minimum===12&&Number(input.value)===0)&&(!Number.isInteger(Number(input.value))||Number(input.value)<products[p].minimum))add('qQtyError-'+products[p].key,input,products[p].minimum===12?'Enter 12 or more, or leave it at 0 if you need help with the quantity.':'Use a whole number above zero, or leave it blank if you’re unsure.');});
      if(picked().length&&!$('qNeedHelp').checked&&!files.length&&$('qIdea').value.trim().length<5)add('qIdeaError',$('qIdea'),'Add a few words, attach a reference, or choose “I’d like help choosing a design.”');
    }else if(index===1){
      if(!$('qDateUnsure').checked&&!$('qDate').value)add('qDateError',$('qDate'),'Choose a date, or select “Date not set yet.”');
      else if(!$('qDateUnsure').checked&&$('qDate').value<today())add('qDateError',$('qDate'),'Choose an upcoming date, or select “Date not set yet.”');
      if(!fulfillment())add('qFulfillmentError',form.querySelector('[name="fulfillment"]'),'Choose pickup, delivery, or “Not sure yet.”');
      if(fulfillment()==='Delivery'&&$('qLocation').value.trim().length<2)add('qLocationError',$('qLocation'),'A delivery city or ZIP code is enough for now.');
    }else{
      if(!$('qName').value.trim())add('qNameError',$('qName'),'Add your name so we know who to contact.');
      if(!$('qEmail').value.trim()||!$('qEmail').checkValidity())add('qEmailError',$('qEmail'),'Enter an email address where we can send your quote.');
    }
    return errors;
  }
  function showErrors(errors){
    setStep(errors[0].step,false);clearErrors();errors.forEach(e=>{const message=$(e.id);message.textContent=e.message;message.hidden=false;e.field.setAttribute('aria-invalid','true');e.field.setAttribute('aria-describedby',e.id);});
    $('qFormError').textContent='Please check the highlighted detail to continue.';$('qFormError').hidden=false;errors[0].field.focus();
  }
  function updateProgress(){
    const selection=picked();
    const fieldsReady=selection.every(product=>$('qQty-'+products[product].key));
    const done=[fieldsReady&&errorsFor(0).length===0,errorsFor(1).length===0,errorsFor(2).length===0];
    const percent=(selection.length?25:0)+(done[0]?25:0)+(done[1]?25:0)+(done[2]?25:0);
    let message='3 quick sections. Everything is on this page.';
    if(percent===100)message='Ready to send. We’ll take it from here.';
    else if(done[0]&&done[1])message=$('qName').value.trim()?'Almost done—just your email.':'Almost done—just your name and email.';
    else if(done[0])message=done[2]?'Just the event details left.':'Your treats are set. Two short sections left.';
    else if(selection.length)message='Good start. Add your idea or a reference.';
    else if(done[2])message='Contact details are in. Choose your treats next.';
    else if(done[1])message='Event details are in. Choose your treats next.';
    if(submitting)message='Sending your request…';
    const text=$('qProgressCopy');if(text.textContent!==message)text.textContent=message;
    const progress=root.querySelector('.q-step-progress');progress.setAttribute('aria-valuenow',String(percent));progress.setAttribute('aria-valuetext',percent+'% complete. '+message);progress.firstElementChild.style.width=percent+'%';
    root.querySelectorAll('[data-step-link]').forEach(button=>{const index=Number(button.dataset.stepLink);button.disabled=submitting;button.classList.toggle('q-done',done[index]);button.querySelector('i').textContent=done[index]?'✓':String(index+1);});
    root.querySelectorAll('[data-step]').forEach(section=>{
      const index=Number(section.dataset.step);section.dataset.complete=String(done[index]);
      section.querySelector('.q-step-count span').textContent=done[index]?['Your treats are set.','Your event details are set.','Ready to send.'][index]:['Choose and describe.','When and where.','Your name and email—the last required details.'][index];
    });
    if(!submitting)$('qNextHint').textContent=percent===100?'Ready to send. No payment required.':'No payment required to request a quote.';
  }
  function setStep(next,focus=true){
    if(focus)clearErrors();step=Math.max(0,Math.min(2,next));furthest=2;
    root.querySelectorAll('[data-step]').forEach(section=>section.hidden=false);
    root.querySelectorAll('[data-step-link]').forEach(button=>{if(Number(button.dataset.stepLink)===step)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current');});
    $('qBack').hidden=true;if(!submitting&&!submissionCompleted)$('qNext').textContent='Send my quote request';
    renderReview();updateProgress();saveSoon();
    if(focus){const heading=root.querySelector('[data-step="'+step+'"] h2');heading.focus({preventScroll:true});heading.closest('section').scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});}
  }
  root.querySelectorAll('[data-step-link]').forEach(button=>button.addEventListener('click',()=>setStep(Number(button.dataset.stepLink))));
  async function postWithTimeout(url, options, timeout=120000) {
    const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),timeout);
    try { return await fetch(url,{...options,signal:controller.signal}); }
    finally { clearTimeout(timer); }
  }
  async function uploadQuoteReferences(requestId) {
    if(!files.length)return [];
    const fileKey=JSON.stringify(files.map(file=>[file.name,file.size,file.lastModified]));
    if(referenceCache.key===fileKey&&referenceCache.references.length===files.length)return referenceCache.references;
    $('qNext').textContent='Uploading references…';$('qNextHint').textContent='Keeping your photos and sketches with your request.';
    const payload=new FormData();payload.set('request_id',requestId);
    files.forEach(file=>payload.append('files',file,file.name));
    const response=await postWithTimeout('https://us-central1-bakers-agent.cloudfunctions.net/mbc-quote-references-v1',{method:'POST',body:payload});
    const result=await response.json();
    if(!response.ok||!result.success||!Array.isArray(result.references)||result.references.length!==files.length)throw new Error(result.error||'Your references could not be uploaded. Please try again; your draft is saved.');
    referenceCache={key:fileKey,references:result.references};await saveNow();return result.references;
  }
  function buildInquiry(references,reference) {
    const selected=picked(),data=new FormData();
    form.querySelectorAll('input[type="hidden"][name]').forEach(input=>data.append(input.name,input.value));
    const name=$('qName').value.trim(),email=$('qEmail').value.trim();
    const date=$('qDateUnsure').checked?'':$('qDate').value;
    let datePart='';if(date)datePart=' - '+new Date(date+'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric'});
    data.set('name',name);data.set('email',email);data.set('phone',$('qPhone').value.trim());
    data.set('subject',(selected.join(' + ')+' Order - '+name+datePart).replace(/[\r\n]+/g,' ').slice(0,250));
    data.set('product_type',selected.join(' + '));data.set('event_date',date);data.set('date_status',date?'Date provided':'Not sure yet');
    data.set('delivery_method',fulfillment());data.set('delivery_city',fulfillment()==='Delivery'?$('qLocation').value.trim():'');
    data.set('delivery_address',fulfillment()==='Delivery'?'Exact address to be confirmed with customer.':'');
    data.set('occasion',$('qOccasion').value.trim());
    data.set('order_details',[$('qIdea').value.trim(),$('qNeedHelp').checked?'Please help me choose a design.':''].filter(Boolean).join('\n'));
    data.set('party_size',selected.includes('Cake')?(items.Cake?.quantity||'Unknown'):'Unknown');
    data.set('quantities',productLines().join('\n'));
    data.set('flavor',selected.length===1?(items[selected[0]]?.flavor||'Not decided yet'):selected.map(p=>p+': '+(items[p]?.flavor||'Not decided yet')).join('\n'));
    data.set('budget',$('qBudget').value.trim());data.set('dietary_notes',$('qDiet').value.trim());data.set('request_reference',reference);
    data.set('reference_files',references.length?references.map((file,index)=>(index+1)+'. '+file.name+'\n'+file.url).join('\n\n'):'No reference files supplied.');
    data.set('redirect','https://mybakingcreations.com/thank-you');
    return data;
  }
  form.addEventListener('submit',async event=>{
    event.preventDefault();if(submitting||submissionCompleted)return;
    rememberItems();const errors=[...errorsFor(0),...errorsFor(1),...errorsFor(2)];
    if(errors.length){showErrors(errors);return;}
    clearErrors();
    const values={};fieldIds.forEach(id=>values[id]=$(id).type==='checkbox'?$(id).checked:$(id).value);
    const fingerprint=JSON.stringify({values,products:picked(),fulfillment:fulfillment(),items,files:files.map(file=>[file.name,file.size,file.lastModified])});
    if(submissionFingerprint!==fingerprint||!submissionId){submissionId=crypto.randomUUID();submissionFingerprint=fingerprint;}
    const reference='MBC-'+submissionId.slice(0,8).toUpperCase();
    const enabledState=new Map([...root.querySelectorAll('input,select,textarea,button')].map(element=>[element,element.disabled]));
    submitting=true;enabledState.forEach((_,element)=>element.disabled=true);await saveNow();
    $('qNext').textContent='Sending your request…';$('qNextHint').textContent='Please keep this page open while we send your details.';
    $('qProgressCopy').textContent='Sending your request…';
    try {
      const references=await uploadQuoteReferences(submissionId);
      $('qNext').textContent='Sending your request…';$('qNextHint').textContent='Your references are ready. Sending the inquiry now.';
      const inquiry=buildInquiry(references,reference);
      const response=await postWithTimeout('https://api.web3forms.com/submit',{method:'POST',headers:{'Accept':'application/json'},body:inquiry},60000);
      const result=await response.json();
      if(!response.ok||!result.success)throw new Error('The inquiry service could not confirm delivery. Your draft is saved—please try again.');
      submissionCompleted=true;clearTimeout(saveTimer);
      try {
        const db=await database();await new Promise((resolve,reject)=>{const tx=db.transaction('drafts','readwrite');tx.objectStore('drafts').delete('current');tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});
      }catch{ /* A local-storage failure must not turn an accepted inquiry into an error. */ }
      try { if(typeof sendConfirmationEmail==='function')sendConfirmationEmail({email:inquiry.get('email'),name:inquiry.get('name'),form_type:'order',product_type:inquiry.get('product_type'),event_date:inquiry.get('event_date')}); }catch{}
      try { if(typeof gtag==='function')gtag('event','generate_lead',{form_type:'order',product_type:inquiry.get('product_type'),transport_type:'beacon',event_id:reference}); }catch{}
      form.hidden=true;$('qComplete').hidden=false;
      location.assign('/thank-you');
    }catch(error){
      $('qFormError').textContent=error.name==='AbortError'?'The connection took too long. Your draft is saved. If you already received a confirmation, please avoid sending again; otherwise try again or call us.':error.message||'We could not send your request. Your draft is saved. Please try again or call (415) 568-8060.';
      $('qFormError').hidden=false;$('qFormError').setAttribute('tabindex','-1');$('qFormError').focus();
    }finally{
      submitting=false;
      enabledState.forEach((disabled,element)=>element.disabled=disabled);
      if(submissionCompleted){$('qNext').disabled=true;$('qNext').textContent='Request sent';}
      else{$('qNext').textContent='Send my quote request';syncSketch();updateProgress();await saveNow();}
    }
  });

  $('qReturn').addEventListener('click',()=>$('qClearDraft').click());
  form.addEventListener('input',()=>{clearErrors();eventState();updateSummary();saveSoon();});
  form.addEventListener('change',event=>{rememberItems();if(event.target.name==='products')renderProducts();clearErrors();eventState();updateSummary();saveSoon();});
  function renderFiles(){
    fileUrls.forEach(url=>{if(url)URL.revokeObjectURL(url);});fileUrls=files.map(file=>/^image\/(png|jpeg|webp|gif|avif|bmp|svg\+xml)$/.test(file.type)?URL.createObjectURL(file):null);$('qPhotoList').replaceChildren();
    files.forEach((file,index)=>{
      const item=node('div','q-photo');if(fileUrls[index]){const image=node('img');image.src=fileUrls[index];image.alt=file.name;image.onerror=()=>{image.replaceWith(node('span',null,'Image file'));};item.append(image);}else item.append(node('span',null,/\.pdf$/i.test(file.name)?'PDF':'Image file'));
      const name=node('small',null,file.name===sketch.attachedName?'AI cake sketch':file.name);name.title=file.name;const remove=node('button',null,'×');remove.type='button';remove.setAttribute('aria-label','Remove '+file.name);remove.addEventListener('click',()=>{files.splice(index,1);renderFiles();updateSummary();saveNow();});item.append(name,remove);$('qPhotoList').append(item);
    });
  }
  async function addFiles(incoming){
    const errors=[];for(const file of incoming){
      if(files.some(f=>f.name===file.name&&f.size===file.size&&f.lastModified===file.lastModified))continue;
      if(files.length>=3){errors.push('You can add up to 3 reference files.');break;}
      if(!file.type.startsWith('image/')&&file.type!=='application/pdf'&&!/\.(heic|heif|pdf)$/i.test(file.name)){errors.push(file.name+': choose an image or PDF.');continue;}
      if(file.size>5*1024*1024){errors.push(file.name+': choose a file smaller than 5 MB.');continue;}
      files.push(file);
    }
    renderFiles();$('qPhotoError').textContent=errors.join(' ');$('qPhotoError').hidden=!errors.length;updateSummary();await saveNow();
  }
  $('qPhotos').addEventListener('change',event=>{addFiles([...event.target.files]);event.target.value='';});
  for(const event of ['dragenter','dragover'])$('qDrop').addEventListener(event,e=>{e.preventDefault();$('qDrop').classList.add('q-dragging');});
  $('qDrop').addEventListener('dragleave',()=>$('qDrop').classList.remove('q-dragging'));
  $('qDrop').addEventListener('drop',event=>{event.preventDefault();$('qDrop').classList.remove('q-dragging');addFiles([...event.dataTransfer.files]);});
  let dbPromise;
  function database(){
    if(!dbPromise)dbPromise=new Promise((resolve,reject)=>{const request=indexedDB.open('mbc-quote-request',1);request.onupgradeneeded=()=>request.result.createObjectStore('drafts');request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});return dbPromise;
  }
  function snapshot(){rememberItems();const values={};fieldIds.forEach(id=>values[id]=$(id).type==='checkbox'?$(id).checked:$(id).value);return {values,products:picked(),fulfillment:fulfillment(),items,files,submissionId,submissionFingerprint,referenceCache,sketch:{...sketch,change:$('qSketchChange').value},step,furthest,savedAt:Date.now()};}
  function saveSoon(){if(hydrating||submissionCompleted)return;clearTimeout(saveTimer);saveTimer=setTimeout(saveNow,350);}
  async function saveNow(){
    if(hydrating||submissionCompleted)return;clearTimeout(saveTimer);
    try{const db=await database();const draft=snapshot();await new Promise((resolve,reject)=>{const tx=db.transaction('drafts','readwrite');tx.objectStore('drafts').put(draft,'current');tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});$('qDraftStatus').textContent='Draft saved in this browser, including your reference files.';}
    catch{$('qDraftStatus').textContent='This browser could not save the draft. Keep this tab open to retain your details.';}
  }
  async function restore(){
    hydrating=true;
    try{const db=await database();const draft=await new Promise((resolve,reject)=>{const request=db.transaction('drafts').objectStore('drafts').get('current');request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});
      if(draft&&Date.now()-draft.savedAt<3*86400000){items=draft.items||{};files=draft.files||[];submissionId=draft.submissionId||'';submissionFingerprint=draft.submissionFingerprint||'';referenceCache=draft.referenceCache||{key:'',references:[]};sketch=Object.assign(emptySketch(),draft.sketch||{});$('qSketchChange').value=sketch.change||'';fieldIds.forEach(id=>{if(draft.values[id]!==undefined){if($(id).type==='checkbox')$(id).checked=!!draft.values[id];else $(id).value=draft.values[id];}});form.querySelectorAll('[name="products"]').forEach(e=>e.checked=draft.products.includes(e.value));form.querySelectorAll('[name="fulfillment"]').forEach(e=>e.checked=e.value===draft.fulfillment);furthest=draft.furthest||0;renderProducts();renderFiles();eventState();setStep(draft.step||0,false);updateSummary();$('qDraftStatus').textContent='Your saved draft is restored.';}
    }catch{}finally{hydrating=false;}
  }
  $('qClearDraft').addEventListener('click',()=>{clearTimeout(saveTimer);submitting=false;submissionCompleted=false;submissionId='';submissionFingerprint='';referenceCache={key:'',references:[]};sketchRequest++;sketchController?.abort();sketchController=null;sketchBusy=false;sketchUsing=false;sketch=emptySketch();form.reset();$('qSketchChange').value='';items={};files=[];furthest=0;renderProducts();renderFiles();eventState();form.hidden=false;$('qComplete').hidden=true;setStep(0);updateSummary();saveNow();});
  function sketchError(message){$('qSketchError').textContent=message;$('qSketchError').hidden=!message;}
  function syncSketch(){
    const cake=picked().includes('Cake'),has=!!sketch.image,attached=!!sketch.attachedName&&files.some(file=>file.name===sketch.attachedName);
    $('qReferenceChoices').hidden=true;
    $('qSketchPanel').hidden=sketchDesktop.matches?!!sketch.minimized:!sketch.open;
    $('qSketchReopen').hidden=!sketchDesktop.matches||!sketch.minimized;
    $('qSketchReopen').firstElementChild.textContent=sketchBusy?'Sketching your cake…':has?'Your cake sketch':'AI cake sketcher';
    $('qDrop').hidden=false;
    $('qUploadChoice').setAttribute('aria-pressed',String(!sketch.open));
    $('qSketchChoice').setAttribute('aria-pressed',String(sketch.open));
    $('qSketchBrief').hidden=has||!cake;
    if(document.activeElement!==$('qSketchIdea'))$('qSketchIdea').value=$('qIdea').value;
    $('qSketchIdea').disabled=sketchBusy||sketchUsing||submitting||!cake;
    $('qSketchExample').hidden=has;
    $('qSketchExampleOptions').hidden=has;
    $('qSketchUseLook').hidden=has;
    $('qSketchActivate').hidden=cake;
    $('qSketchMobileLauncher').textContent=cake?(has?'View your cake sketch':'Open cake sketcher'):'Add a cake & try it';
    $('qSketchMobileLauncher').setAttribute('aria-expanded',String(sketch.open));
    $('qSketchMobileLauncher').setAttribute('aria-controls','qSketchPanel');
    root.querySelectorAll('[data-quote-example]').forEach(button=>button.disabled=sketchBusy||sketchUsing||submitting);
    $('qSketchUseLook').disabled=sketchBusy||sketchUsing||submitting;
    $('qSketchActivate').disabled=sketchBusy||sketchUsing||submitting;
    $('qSketchResult').hidden=!has;$('qSketchRefine').hidden=!has;$('qSketchActions').hidden=!has;
    $('qSketchGenerate').hidden=has||!cake;$('qSketchBusy').hidden=!sketchBusy;
    if(has&&$('qSketchImage').getAttribute('src')!==sketch.image)$('qSketchImage').src=sketch.image;
    if(!has)$('qSketchImage').removeAttribute('src');
    for(const id of ['qSketchGenerate','qSketchApply','qSketchUse','qSketchNew','qSketchChange'])$(id).disabled=sketchBusy||sketchUsing||submitting;
    const already=attached&&sketch.attachedVersion===sketch.version;
    $('qSketchUse').textContent=already?'Design added ✓':'Use this design ✓';
    $('qSketchUse').disabled=sketchBusy||sketchUsing||submitting||already;
    $('qSketchAttached').hidden=!attached;
    $('qSketchBusy').querySelector('span').textContent=has?'Making your change…':'Sketching your idea…';
  }
  function setSketchMode(open){sketch.open=open;if(open)sketch.minimized=false;sketchError('');syncSketch();saveSoon();}
  async function createQuoteSketch(refine){
    if(sketchBusy||sketchUsing||submitting)return;
    const brief=refine?sketch.brief:$('qIdea').value.trim();
    const change=$('qSketchChange').value.trim();
    if(brief.length<5){sketchError('Add a few words about your cake to get started.');$('qSketchIdea').focus();return;}
    if(refine&&(!sketch.image||!change)){sketchError('Tell us what you’d like to change.');$('qSketchChange').focus();return;}
    const changes=refine?sketch.changes.concat(change):[];
    const description=brief+(changes.length?'\nRequested changes: '+changes.join('. '):'');
    if(description.length>12000){sketchError('Please shorten the description a little before continuing.');return;}
    const reference=refine?sketch.image:null,id=++sketchRequest;
    sketchBusy=true;sketch.open=true;sketchError('');syncSketch();
    sketchController=new AbortController();let timedOut=false;
    const timer=setTimeout(()=>{timedOut=true;sketchController?.abort();},150000);
    try{
      const response=await fetch('https://us-central1-bakers-agent.cloudfunctions.net/mbc-cake-design-v1',{
        method:'POST',headers:{'Content-Type':'application/json'},signal:sketchController.signal,
        body:JSON.stringify({description,productType:'cake',operation:refine?'edit':'generate',referenceImage:reference,editInstruction:refine?change:''})
      });
      const data=await response.json();if(id!==sketchRequest)return;
      if(!response.ok||!data.image)throw new Error(data.error||'The sketch could not be created just now. Please try again.');
      if(!/^data:image\/(png|jpeg|webp);base64,/.test(data.image))throw new Error('The sketch image could not be opened. Please try again.');
      sketch.image=data.image;sketch.brief=brief;sketch.changes=changes;sketch.version++;sketch.change='';$('qSketchChange').value='';
      await saveNow();
    }catch(error){if(id===sketchRequest)sketchError(error.name==='AbortError'?(timedOut?'That sketch took too long. You can try again or continue without it.':'Sketch canceled.'):error.message||'Please try the sketch again.');}
    finally{clearTimeout(timer);if(id===sketchRequest){sketchBusy=false;sketchController=null;syncSketch();}}
  }
  async function useQuoteSketch(){
    if(!sketch.image||sketchBusy||sketchUsing||submitting)return;
    const oldIndex=files.findIndex(file=>file.name===sketch.attachedName);
    if(oldIndex<0&&files.length>=3){sketchError('You already have 3 references. Remove one below before using this sketch.');return;}
    const image=sketch.image,request=sketchRequest;sketchUsing=true;sketchError('');syncSketch();
    try{
      const blob=await (await fetch(image)).blob();
      if(request!==sketchRequest||!picked().includes('Cake'))return;
      if(blob.size>5*1024*1024)throw new Error('This sketch exceeds the 5 MB attachment limit. Try a simpler sketch.');
      const extension=blob.type==='image/jpeg'?'jpg':blob.type==='image/webp'?'webp':'png';
      const name='AI-cake-sketch-'+Date.now()+'.'+extension;
      const file=new File([blob],name,{type:blob.type});
      const replaceIndex=files.findIndex(existing=>existing.name===sketch.attachedName);
      if(replaceIndex<0&&files.length>=3)throw new Error('Remove a reference file below to make room for this sketch.');
      if(replaceIndex>=0)files.splice(replaceIndex,1,file);else files.push(file);
      sketch.attachedName=name;sketch.attachedVersion=sketch.version;
      if(sketch.appliedNote)$('qIdea').value=$('qIdea').value.replace('\n'+sketch.appliedNote,'');
      sketch.appliedNote=sketch.changes.length?'Cake sketch adjustments: '+sketch.changes.join('; '):'';
      if(sketch.appliedNote)$('qIdea').value=$('qIdea').value.trim()+'\n'+sketch.appliedNote;
      sketch.open=false;renderFiles();updateSummary();await saveNow();
      $('qSketchAttached').scrollIntoView({block:'nearest',behavior:'instant'});
    }catch(error){sketchError(error.message||'The sketch could not be attached. Please try again.');}
    finally{sketchUsing=false;syncSketch();}
  }
  $('qUploadChoice').addEventListener('click',()=>setSketchMode(false));
  $('qSketchChoice').addEventListener('click',()=>setSketchMode(true));
  $('qSketchEditBrief').addEventListener('click',()=>$('qIdea').focus());
  $('qSketchGenerate').addEventListener('click',()=>createQuoteSketch(false));
  $('qSketchApply').addEventListener('click',()=>createQuoteSketch(true));
  $('qSketchChange').addEventListener('keydown',event=>{if(event.key==='Enter'){event.preventDefault();createQuoteSketch(true);}});
  $('qSketchChange').addEventListener('input',()=>{sketch.change=$('qSketchChange').value;saveSoon();});
  $('qSketchUse').addEventListener('click',useQuoteSketch);
  $('qSketchNew').addEventListener('click',()=>{sketch.image='';sketch.brief='';sketch.changes=[];sketch.change='';$('qSketchChange').value='';sketchError('');syncSketch();saveSoon();});
  $('qSketchCancel').addEventListener('click',()=>{sketchRequest++;sketchController?.abort();sketchController=null;sketchBusy=false;sketchError('');syncSketch();});

  const sketchDesktop=matchMedia('(min-width:1001px)');
  const sketchSidebar=root.querySelector('.q-sidebar');
  const requestCard=sketchSidebar.querySelector('.q-summary-card');
  const requestDetails=node('details','q-request-details');requestDetails.append(node('summary',null,'Your request summary'));
  requestCard.before(requestDetails);requestDetails.append(requestCard);
  function placeSketch(){
    if(sketchDesktop.matches)sketchSidebar.prepend($('qSketchPanel'));
    else $('qSketchMobileSlot').append($('qSketchPanel'));
  }
  placeSketch();sketchDesktop.addEventListener('change',()=>{placeSketch();syncSketch();});
  function activateCakeSketch(){
    const cake=form.querySelector('[name="products"][value="Cake"]');
    if(!cake.checked){cake.checked=true;cake.dispatchEvent(new Event('change',{bubbles:true}));}
    setSketchMode(true);
    if(!sketch.image)$('qSketchIdea').focus({preventScroll:sketchDesktop.matches});
  }
  $('qSketchActivate').addEventListener('click',activateCakeSketch);
  $('qSketchMobileLauncher').addEventListener('click',activateCakeSketch);
  $('qSketchClose').addEventListener('click',()=>{if(sketchDesktop.matches){sketch.minimized=true;syncSketch();saveSoon();$('qSketchReopen').focus({preventScroll:true});}else{setSketchMode(false);$('qSketchMobileLauncher').focus({preventScroll:true});}});
  $('qSketchReopen').addEventListener('click',()=>setSketchMode(true));
  $('qSketchIdea').addEventListener('input',()=>{$('qIdea').value=$('qSketchIdea').value;$('qIdea').dispatchEvent(new Event('input',{bubbles:true}));});
  let quoteExample=0;
  const quoteExamples=[
    'A sculpted mushroom-house cake with a red cap and ivory spots, a tiny wood-textured door, climbing flowers and a green fondant board with a stone path.',
    'A realistic ramen-bowl illusion cake: a dark edible bowl with fondant noodles, egg halves, roast-style fondant toppings and scallions, on a wood-look cakeboard.',
    'A space birthday cake shaped like a cratered moon, with a cheerful fondant astronaut, a blue-and-red rocket and little yellow stars.'
  ];
  root.querySelectorAll('[data-quote-example]').forEach(button=>button.addEventListener('click',()=>{
    quoteExample=Number(button.dataset.quoteExample);$('qSketchExampleFrame').style.setProperty('--q-example',quoteExample);
    $('qSketchExampleFrame').querySelector('img').alt=['Example AI sculpted mushroom-house cake','Example AI realistic ramen-bowl cake','Example AI space-themed birthday cake'][quoteExample];
    root.querySelectorAll('[data-quote-example]').forEach(other=>other.setAttribute('aria-pressed',String(other===button)));
  }));
  $('qSketchUseLook').addEventListener('click',()=>{
    activateCakeSketch();
    let current=$('qIdea').value.trim();
    if(sketch.exampleNote)current=current.replace(sketch.exampleNote,'').trim();
    sketch.exampleNote=(current?'Cake style inspiration: ':'')+quoteExamples[quoteExample];
    $('qIdea').value=(current?current+'\n':'')+sketch.exampleNote;
    $('qIdea').dispatchEvent(new Event('input',{bubbles:true}));$('qSketchIdea').value=$('qIdea').value;
    $('qSketchIdea').focus({preventScroll:true});
  });

  const header=document.querySelector('header');if(header){const measure=()=>root.style.setProperty('--q-nav',header.getBoundingClientRect().height+'px');measure();new ResizeObserver(measure).observe(header);}
  new IntersectionObserver(entries=>document.body.classList.toggle('quote-in-view',entries[0].isIntersecting)).observe(root);
  const progressDock=root.querySelector('.q-open-progress');
  const measureProgress=()=>root.style.setProperty('--q-progress-height',progressDock.getBoundingClientRect().height+'px');
  new ResizeObserver(measureProgress).observe(progressDock);measureProgress();
  $('qJumpFinish').addEventListener('click',()=>{setStep(2,false);$('qFinish').scrollIntoView({block:'end',behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});$('qFinish').focus({preventScroll:true});});
  form.addEventListener('focusin',event=>{const section=event.target.closest('[data-step]');if(section&&Number(section.dataset.step)!==step)setStep(Number(section.dataset.step),false);});
  let scrollFrame=0;
  window.addEventListener('scroll',()=>{if(scrollFrame)return;scrollFrame=requestAnimationFrame(()=>{scrollFrame=0;if(form.hidden)return;const boundary=(header?.getBoundingClientRect().height||96)+progressDock.getBoundingClientRect().height+45;let visibleStep=0;root.querySelectorAll('[data-step]').forEach(section=>{if(section.getBoundingClientRect().top<=boundary)visibleStep=Number(section.dataset.step);});if(visibleStep!==step)setStep(visibleStep,false);});},{passive:true});
  renderProducts();eventState();updateSummary();setStep(0,false);restore();
})();
