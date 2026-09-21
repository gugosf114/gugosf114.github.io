(() => {
 const page=document.querySelector('.contact-connect-page');
 const header=document.querySelector('header');
 if(header&&page){const size=()=>page.style.setProperty('--contact-header-height',header.getBoundingClientRect().height+'px');size();new ResizeObserver(size).observe(header);}
 const status=document.querySelector('.connect-copy-status');
 document.querySelectorAll('[data-copy]').forEach(button=>{
  let timer;
  button.addEventListener('click',async()=>{
   try {
    await navigator.clipboard.writeText(button.dataset.copy);
    clearTimeout(timer);button.textContent='Copied';status.textContent='Copied '+button.dataset.copy;
    timer=setTimeout(()=>button.textContent='Copy',1800);
   }catch{status.textContent='Copy unavailable. Select the phone number or email address to copy it.';}
  });
 });
})();
