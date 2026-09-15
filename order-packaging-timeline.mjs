export const DURATION = 31;
export const HERO_COOKIE = 8;
const clamp = x => Math.max(0, Math.min(1, x));
export const ease = x => { x = clamp(x); return x*x*x*(x*(x*6-15)+10); };
export const progress = (time, start, end) => ease((time-start)/(end-start));
const mix = (a,b,t) => a+(b-a)*t;
const vector = (a,b,t) => a.map((v,i)=>mix(v,b[i],t));
export function cookieSlots() {
  return Array.from({length:12}, (_,i)=>[((i%4)-1.5)*2.52,.88,(1-Math.floor(i/4))*2.62]);
}
export function filmFrame(value) {
  const t = Math.max(0,Math.min(DURATION,Number(value)||0));
  const wrapper = progress(t,8,9.55), reveal = progress(t,13.4,14.9);
  let camera, target;
  if(t<8) {
    const drift = (1-Math.cos(t/8*Math.PI*2))/2;
    camera = vector([.2,5.1,6.5],[1.6,4.4,5.6],drift);
    target = [0,2,0];
  } else if(t<13.6) {
    const p = progress(t,8,13.6);
    camera = vector([.2,5.1,6.5],[1.7,5.5,7],p); target=[0,2,0];
  } else {
    const p = progress(t,13.6,16);
    camera = vector([1.7,5.5,7],[7.7,18.7,18],p);
    target = vector([0,2,0],[0,1.2,-.8],p);
  }
  if(t>=23.2) {
    const p=progress(t,23.2,26.5);
    camera=vector([7.7,18.7,18],[10.5,21,25],p);
    target=vector([0,1.2,-.8],[-.4,1.5,.3],p);
  }
  const heroRotation = t<8
    ? [.78+.065*Math.sin(t*Math.PI/4),-.14*Math.sin(t*Math.PI/4),-.055]
    : vector([.78,0,-.055],[.6,.12,-.08],progress(t,8,13.6));
  const cookies = cookieSlots().map((slot,i)=>{
    const hero = i===HERO_COOKIE;
    const startTime = hero ? 14.1 : 14.35+Math.floor(i/4)*.7+(i%4)*.13;
    const packed = progress(t,startTime,startTime+1.05);
    const start = hero ? [0,2,0] : [slot[0],slot[1]+3.6,slot[2]-.45];
    return {packed,visible:hero||t>=startTime,position:vector(start,slot,packed),
      rotation:vector(hero?heroRotation:[.16,(i%2?.08:-.08),.035],[0,0,0],packed)};
  });
  return {time:t,wrapper,peel:progress(t,9.8,11.05),seal:progress(t,11.45,12.55),box:reveal,lid:progress(t,18.35,19.55)*(1-progress(t,25,26.6)),
    table:progress(t,23.2,25),
    rotation:progress(t,19.7,23.15)*Math.PI*2,camera,target,cookies,
    phase:t<2?'cookie':t<4?'family':t<6?'baby':t<8?'business':t<9.8?'wrap':t<11.25?'peel':t<12.6?'seal':t<13.6?'sealed':t<18.35?'pack':t<19.7?'finish':t<23.2?'turn':t<25?'table':'serve',
    complete:t>=DURATION};
}
