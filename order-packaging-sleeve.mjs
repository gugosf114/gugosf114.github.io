import * as T from './vendor/three/three.module.min.js';
import { progress } from './order-packaging-timeline.mjs';

export function createSleeveFactory({geom,mat}) {
  const film=mat(new T.MeshPhysicalMaterial({color:'#fff',roughness:.26,transparent:true,opacity:.055,side:T.DoubleSide,depthWrite:false,clearcoat:.12,clearcoatRoughness:.3,specularIntensity:.65}));
  const seam=mat(new T.MeshStandardMaterial({color:'#dedbe0',roughness:.6,transparent:true,opacity:.13,depthWrite:false}));
  const adhesive=mat(new T.MeshPhysicalMaterial({color:'#e7e0cd',roughness:.19,transparent:true,opacity:.18,side:T.DoubleSide,depthWrite:false,clearcoat:.1}));
  // Thin film hugs the cookie and collapses together outside its edges.
  const contact=(x,z)=>1-progress(Math.max(Math.abs(x),Math.abs(z)),1.085,1.255);
  const topHeight=(x,z)=>.005+.18*contact(x,z)+.08*progress(z,1.20,1.475);
  const surface=top=>{
    const g=new T.PlaneGeometry(2.56,2.95,24,24),p=g.attributes.position;
    for(let i=0;i<p.count;i++) {
      const x=p.getX(i),z=p.getY(i),edge=Math.max(Math.abs(x)/1.28,Math.abs(z)/1.475);
      const crease=(Math.sin(x*29+z*17)*.003+Math.sin(z*49-x*15)*.002)*edge**2;
      const flutter=(Math.sin(z*24)*.008+Math.sin(z*39)*.004)*progress(Math.abs(x),1.1,1.28);
      const edgeRipple=Math.sin(x*27)*.008*progress(Math.abs(z),1.2,1.475);
      p.setXYZ(i,x+flutter,(top?topHeight(x,z):-.13*contact(x,z)-.025*progress(z,1.2,1.475))+crease,z+edgeRipple);
    }
    g.computeVertexNormals();return geom(g);
  };
  const top=surface(true),bottom=surface(false);
  // Heat-welded edges are flat film strips, with no solid perimeter frame.
  const weld=(side=false)=>{
    const g=new T.PlaneGeometry(side?.014:2.51,side?2.91:.015,side?1:32,side?32:1);
    const p=g.attributes.position;
    for(let i=0;i<p.count;i++) {
      const x=p.getX(i),z=p.getY(i);
      p.setXYZ(i,x,.005+Math.sin((side?z:x)*27)*.003,z);
    }
    g.computeVertexNormals();return geom(g);
  };
  const bottomSeam=weld(),sideSeam=weld(true);
  return function createSleeve(hero=false) {
    const group=new T.Group();
    // +Z is the local sleeve mouth; rotating it puts the closure above the printed image.
    group.rotation.y=Math.PI;
    group.add(new T.Mesh(top,film),new T.Mesh(bottom,film));
    const closedEnd=new T.Mesh(bottomSeam,seam);closedEnd.position.z=-1.46;group.add(closedEnd);
    for(const x of [-1.262,1.262]) {const side=new T.Mesh(sideSeam,seam);side.position.x=x;group.add(side);}
    const flapGeometry=geom(new T.PlaneGeometry(2.5,.88,32,14));
    const stripGeometry=geom(new T.PlaneGeometry(2.3,.17,32,2));
    const flap=new T.Mesh(flapGeometry,film),strip=new T.Mesh(stripGeometry,adhesive);
    group.add(flap,strip);
    const flapPoint=(x,s,fold,offset=0)=>{
      const angle=-Math.PI*fold,z=1.475+Math.cos(angle)*s;
      let y=-.025+.1*fold-Math.sin(angle)*s+.009*Math.sin(s/.88*Math.PI+x*12);
      const settle=progress(fold,.68,1);
      y+=(topHeight(x,z)+.003-y)*settle;
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
    function update(frame,packed=0) {
      flap.visible=hero&&packed<.95;
      strip.visible=hero&&frame.time>=9.8&&frame.seal<.995;
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
          p.setXYZ(i,x-departure*.75,-.011+rise+departure*.75,1.475+s-departure*.22);
        }
        p.needsUpdate=true;linerGeometry.computeVertexNormals();linerMaterial.opacity=1-departure;
      }
      pressMark.visible=frame.time>=12.6&&frame.time<13.2;
      if(pressMark.visible) {
        const x=-1.1+2.2*progress(frame.time,12.6,13.2);
        pressMark.position.set(...flapPoint(x,.685,1,.007));
        pressMark.material.opacity=Math.sin(progress(frame.time,12.6,13.2)*Math.PI)*.35;
      }
    }
    if(!hero)update({seal:1});
    return {group,update};
  };
}
