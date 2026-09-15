import { canvas } from './order-studio-art.mjs?v=ai-original-1';
import { defaultText } from './order-studio-designs.mjs?v=ai-original-1';

const DESIGN_API = 'https://us-central1-bakers-agent.cloudfunctions.net/mbc-cookie-design-v1';

export async function generateAiDesigns(input, signal, onEvent) {
  const response = await fetch(DESIGN_API, {
    method: 'POST', headers: {'Content-Type':'application/json'},
    body: JSON.stringify(input), signal,
  });
  if (!response.ok) {
    const data = await response.json().catch(()=>({}));
    throw new Error(data.error || 'The design artist is unavailable. Please try again.');
  }
  let finished = false;
  const consume = async line => {
    if (!line.trim()) return;
    const event = JSON.parse(line);
    if (event.type === 'error') throw new Error(event.message || 'The artist could not finish.');
    if (event.type === 'done') finished = true;
    await onEvent(event);
  };
  const reader = response.body.getReader(), decoder = new TextDecoder();
  let buffer = '';
  try {
    while (true) {
      const {value,done} = await reader.read();
      buffer += decoder.decode(value || new Uint8Array(),{stream:!done});
      const lines=buffer.split('\n');buffer=lines.pop();
      for (const line of lines) { if (signal.aborted) throw new DOMException('Cancelled','AbortError'); await consume(line); }
      if (done) break;
    }
    if (buffer.trim()) await consume(buffer);
    if (!finished) throw new Error('The connection ended early. You can use any designs that finished, or try again.');
  } finally { await reader.cancel().catch(()=>{}); reader.releaseLock(); }
}

export async function makeAiDesign(result, request) {
  if (!/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(result.image || '') || result.image.length > 24000000)
    throw new Error('The generated image could not be opened. Please try again.');
  const bytes = Uint8Array.from(atob(result.image.split(',')[1]),c=>c.charCodeAt(0));
  const file = new File([bytes], 'ai-cookie-background.jpg', {type:'image/jpeg'});
  const bitmap = await createImageBitmap(file), image=canvas(bitmap.width,bitmap.height);
  image.getContext('2d').drawImage(bitmap,0,0);bitmap.close();
  const c=result.concept, corporate=request.occasion==='corporate';
  return {
    occasion:request.occasion, shape:'square', logoRequired:corporate,
    view:{zoom:corporate?.4:1,x:0,y:corporate?-.21:0,fit:corporate?'contain':'cover'},
    backdrop:{id:'ai-generated',color:c.base_color,image,file},
    text:{...defaultText(),message:c.message,font:c.font,color:c.text_color,size:corporate?.067:.083,y:c.text_y},
    ai:{token:result.token,title:c.title,request:{...request}},
  };
}
