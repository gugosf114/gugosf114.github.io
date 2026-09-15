import * as T from './vendor/three/three.module.min.js';
import { progress } from './order-packaging-timeline.mjs';

export function createSleeveFactory({geom,mat}) {
  const film=mat(new T.MeshPhysicalMaterial({color:'#fff',roughness:.065,transparent:true,opacity:.115,side:T.DoubleSide,depthWrite:false,clearcoat:1,clearcoatRoughness:.045,specularIntensity:1.5}));
  const seam=mat(new T.MeshStandardMaterial({color:'#b6aeb8',roughness:.3,transparent:true,opacity:.35,depthWrite:false}));
  const adhesive=mat(new T.MeshPhysicalMaterial({color:'#e7e0cd',roughness:.19,transparent:true,opacity:.3,side:T.DoubleSide,depthWrite:false,clearcoat:.8}));
  const topHeight=(x,z)=>.2+.12*Math.pow(Math.max(0,1-Math.max(Math.abs(x)/1.28,Math.abs(z)/1.475)**2),.55);
  const surface=top=>{
    const g=new T.PlaneGeometry(2.56,2.95,24,24),p=g.attributes.position;
    for(let i=0;i<p.count;i++) {
      const x=p.getX(i),z=p.getY(i),edge=Math.max(Math.abs(x)/1.28,Math.abs(z)/1.475);
      const crease=(Math.sin(x*24+z*14)*.009+Math.sin(z*42-x*13)*.005)*edge**2;
      p.setXYZ(i,x,(top?topHeight(x,z):-.14)+crease,z);
    }
    g.computeVertexNormals();return geom(g);
  };
  const top=surface(true),bottom=surface(false),bottomSeam=geom(new T.BoxGeometry(2.53,.008,.035)),sideSeam=geom(new T.BoxGeometry(.028,.009,2.95));
  return function createSleeve(hero=false) {
    const group=new T.Group();
    group.add(new T.Mesh(top,film),new T.Mesh(bottom,film));
    const closedEnd=new T.Mesh(bottomSeam,seam);closedEnd.position.set(0,.035,-1.455);group.add(closedEnd);
    for(const x of [-1.265,1.265]) {const side=new T.Mesh(sideSeam,seam);side.position.set(x,.035,0);group.add(side);}
    // The mouth at +Z stays open until the back-sheet extension folds over it.
    const flapGeometry=geom(new T.PlaneGeometry(2.5,.88,32,14));
    const stripGeometry=geom(new T.PlaneGeometry(2.3,.17,32,2));
    const flap=new T.Mesh(flapGeometry,film),strip=new T.Mesh(stripGeometry,adhesive);
    group.add(flap,strip);
    const flapPoint=(x,s,fold,offset=0)=>{
      const angle=-Math.PI*fold,z=1.475+Math.cos(angle)*s;
      let y=-.14+.38*fold-Math.sin(angle)*s+.014*Math.sin(s/.88*Math.PI);
      const settle=progress(fold,.68,1);
      y+=(topHeight(x,z)+.014-y)*settle;
      return [x,y+offset,z];
    };
    const setSheet=(g,fold,start,length,offset=0)=>{
      const p=g.attributes.position,uv=g.attributes.uv;
      for(let i=0;i<p.count;i++) {
        const x=(uv.getX(i)-.5)*(g===flapGeometry?2.5:2.3);
        const s=start+uv.getY(i)*length;
        p.setXYZ(i,...flapPoint(x,s,fold,offset));
      }
      p.needsUpdate=true;g.computeVertexNormals();
    };
    let liner,linerGeometry,linerMaterial,pressMark;
    if(hero) {
      linerGeometry=geom(new T.PlaneGeometry(2.3,.18,64,2));
      linerMaterial=mat(new T.MeshStandardMaterial({color:'#fbfcff',roughness:.48,side:T.DoubleSide,transparent:true,opacity:1,depthWrite:false}));
      liner=new T.Mesh(linerGeometry,linerMaterial);group.add(liner);
      const shine=mat(new T.MeshBasicMaterial({color:'#fff',transparent:true,opacity:.8,side:T.DoubleSide,depthWrite:false}));
      pressMark=new T.Mesh(geom(new T.PlaneGeometry(.1,.18)),shine);pressMark.rotation.x=-Math.PI/2;group.add(pressMark);
    }
    let lastFold=-1;
    function update(frame) {
      const fold=hero?frame.seal:1;
      if(fold!==lastFold){setSheet(flapGeometry,fold,0,.88);setSheet(stripGeometry,fold,.60,.17,.004);lastFold=fold;}
      if(!hero)return;
      const peel=frame.peel,departure=progress(frame.time,11.05,11.55);
      liner.visible=frame.time<11.55;
      if(liner.visible) {
        const p=linerGeometry.attributes.position,uv=linerGeometry.attributes.uv;
        const boundary=1.15-peel*2.3;
        for(let i=0;i<p.count;i++) {
          const sourceX=(uv.getX(i)-.5)*2.3,s=.595+uv.getY(i)*.18;
          const lifted=Math.max(0,sourceX-boundary);
          const x=lifted?boundary+Math.sin(lifted*1.8)/1.8:sourceX;
          const rise=lifted?(1-Math.cos(lifted*1.8))/1.8:0;
          p.setXYZ(i,x-departure*.75,-.112+rise+departure*.75,1.475+s-departure*.22);
        }
        p.needsUpdate=true;linerGeometry.computeVertexNormals();linerMaterial.opacity=1-departure;
      }
      pressMark.visible=frame.time>=12.6&&frame.time<13.2;
      if(pressMark.visible) {
        const x=-1.1+2.2*progress(frame.time,12.6,13.2);
        pressMark.position.set(...flapPoint(x,.685,1,.014));
        pressMark.material.opacity=Math.sin(progress(frame.time,12.6,13.2)*Math.PI)*.7;
      }
    }
    if(!hero)update({seal:1});
    return {group,update};
  };
}
