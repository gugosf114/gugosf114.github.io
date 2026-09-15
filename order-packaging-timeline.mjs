export const DURATION = 20;
export const HERO_COOKIE = 8;
const clamp = x => Math.max(0, Math.min(1, x));
export const ease = x => { x = clamp(x); return x*x*x*(x*(x*6-15)+10); };
export const progress = (time, start, end) => ease((time-start)/(end-start));
const mix = (a,b,t) => a+(b-a)*t;
const vector = (a,b,t) => a.map((v,i)=>mix(v,b[i],t));
export function cookieSlots() {
  return Array.from({length:12}, (_,i)=>[((i%4)-1.5)*2.52,.34,(1-Math.floor(i/4))*2.62]);
}
export function filmFrame(value) {
  const t = Math.max(0,Math.min(DURATION,Number(value)||0));
  const wrapper = progress(t,8,9.55), reveal = progress(t,9.4,10.9);
  let camera, target;
  if(t<8) {
    const drift = (1-Math.cos(t/8*Math.PI*2))/2;
    camera = vector([.2,5.1,6.5],[1.6,4.4,5.6],drift);
    target = [0,2,0];
  } else if(t<9.6) {
    const p = progress(t,8,9.6);
    camera = vector([.2,5.1,6.5],[1.7,5.5,7],p); target=[0,2,0];
  } else {
    const p = progress(t,9.6,12);
    camera = vector([1.7,5.5,7],[7.7,16.7,15],p);
    target = vector([0,2,0],[0,.5,0],p);
  }
  const heroRotation = t<8
    ? [.78+.065*Math.sin(t*Math.PI/4),-.14*Math.sin(t*Math.PI/4),-.055]
    : vector([.78,0,-.055],[.6,.12,-.08],progress(t,8,9.6));
  const cookies = cookieSlots().map((slot,i)=>{
    const hero = i===HERO_COOKIE;
    const startTime = hero ? 10.1 : 10.35+Math.floor(i/4)*.7+(i%4)*.13;
    const packed = progress(t,startTime,startTime+1.05);
    const start = hero ? [0,2,0] : [slot[0],slot[1]+3.6,slot[2]-.45];
    return {packed,visible:hero||t>=startTime,position:vector(start,slot,packed),
      rotation:vector(hero?heroRotation:[.16,(i%2?.08:-.08),.035],[0,0,0],packed)};
  });
  return {time:t,wrapper,box:reveal,lid:progress(t,14.35,15.55),
    rotation:progress(t,15.7,19.25)*Math.PI*2,camera,target,cookies,
    phase:t<2?'cookie':t<4?'family':t<6?'baby':t<8?'business':t<9.6?'wrap':t<14.35?'pack':t<15.7?'finish':'turn',
    complete:t>=DURATION};
}
