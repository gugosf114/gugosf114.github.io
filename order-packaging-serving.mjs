import * as T from './vendor/three/three.module.min.js';

// Reference: Alaska Airlines, DocuSign and Flying Princess cake-pop photos.
// Fully spherical cake balls with thin circular fondant patches following the ball surface.
export function addServingProducts({table,geom,mat,trackTexture,bump,artwork}) {
  const mesh=(parent,geometry,material,position)=>{
    const m=new T.Mesh(geom(geometry),material);m.position.set(...position);
    m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;
  };
  const chocolate=mat(new T.MeshPhysicalMaterial({color:'#fff9e7',roughness:.43,clearcoat:.16,bumpMap:bump,bumpScale:.003}));
  const stickMat=mat(new T.MeshStandardMaterial({color:'#fffdf5',roughness:.8}));
  const gold=mat(new T.MeshStandardMaterial({color:'#cda94d',roughness:.69,metalness:.12,bumpMap:bump,bumpScale:.01}));
  const pops=new T.Group();pops.position.set(-8.1,0,1.2);pops.rotation.y=.16;table.add(pops);
  mesh(pops,new T.BoxGeometry(4.8,.53,4.0),gold,[0,.15,0]);
  const textures=artwork.rows.map(source=>{
    const c=document.createElement('canvas');c.width=c.height=1024;const x=c.getContext('2d');
    x.beginPath();x.arc(512,512,512,0,Math.PI*2);x.clip();
    x.fillStyle='#fffaf0';x.fillRect(0,0,1024,1024);x.drawImage(source,0,0,1024,1024);
    const t=trackTexture(new T.CanvasTexture(c));t.colorSpace=T.SRGBColorSpace;t.anisotropy=8;return t;
  });
  const printed=textures.map(map=>mat(new T.MeshStandardMaterial({map,roughness:.56,bumpMap:bump,bumpScale:.001})));
  const coatings=['#f5d614','#ed4d98','#cf1730'].map(color=>mat(new T.MeshPhysicalMaterial({
    color,roughness:.27,clearcoat:.46,clearcoatRoughness:.22,bumpMap:bump,bumpScale:.002,
  })));
  const popGeometry=geom(new T.SphereGeometry(.68,64,40));
  // Spherical caps retain a round perimeter while draping the fondant onto the ball.
  const fondantCap=(radius,maxAngle)=>{
    const positions=[],uvs=[],indices=[],rings=24,segments=64;
    const projectedRadius=radius*Math.sin(maxAngle);
    for(let ring=0;ring<=rings;ring++)for(let segment=0;segment<=segments;segment++) {
      const theta=maxAngle*ring/rings,phi=Math.PI*2*segment/segments;
      const x=radius*Math.sin(theta)*Math.cos(phi),y=radius*Math.sin(theta)*Math.sin(phi);
      positions.push(x,y,radius*Math.cos(theta));
      uvs.push(.5+x/(2*projectedRadius),.5+y/(2*projectedRadius));
    }
    for(let ring=0;ring<rings;ring++)for(let segment=0;segment<segments;segment++) {
      const a=ring*(segments+1)+segment,b=a+segments+1;
      indices.push(a,b,a+1,b,b+1,a+1);
    }
    const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));
    g.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));g.setIndex(indices);g.computeVertexNormals();return g;
  };
  const fondantGeometry=geom(fondantCap(.705,.88));
  const printGeometry=geom(fondantCap(.707,.855));
  const edgePositions=[],edgeIndices=[];
  for(let i=0;i<=64;i++)for(const r of [.705,.6805]) {
    const phi=i/64*Math.PI*2;
    edgePositions.push(r*Math.sin(.88)*Math.cos(phi),r*Math.sin(.88)*Math.sin(phi),r*Math.cos(.88));
  }
  for(let i=0;i<64;i++){const a=i*2;edgeIndices.push(a,a+1,a+2,a+1,a+3,a+2);}
  const edgeGeometry=geom(new T.BufferGeometry());
  edgeGeometry.setAttribute('position',new T.Float32BufferAttribute(edgePositions,3));
  edgeGeometry.setIndex(edgeIndices);edgeGeometry.computeVertexNormals();
  const fondantMat=mat(new T.MeshStandardMaterial({color:'#fffaf0',roughness:.8,bumpMap:bump,bumpScale:.001}));
  const collarGeometry=geom(new T.SphereGeometry(.082,16,12));
  for(let row=0;row<3;row++)for(let column=0;column<3;column++) {
    const x=(column-1)*1.48,z=(row-1)*1.28;
    const height=2.6+(2-row)*.24;
    mesh(pops,new T.CylinderGeometry(.041,.041,height,12),stickMat,[x,.4+height/2,z]);
    const pop=new T.Group();pop.position.set(x,.4+height,z);
    pop.rotation.y=.33+(column-1)*.055;pop.rotation.z=(column-1)*.022;pops.add(pop);
    const body=new T.Mesh(popGeometry,coatings[column]);body.castShadow=true;body.receiveShadow=true;pop.add(body);
    pop.add(new T.Mesh(fondantGeometry,fondantMat));
    pop.add(new T.Mesh(edgeGeometry,fondantMat));
    const face=new T.Mesh(printGeometry,printed[column]);pop.add(face);
    const collar=new T.Mesh(collarGeometry,coatings[column]);collar.position.y=-.67;collar.scale.set(.8,1.6,.8);pop.add(collar);
  }

  // A real concave outline removes the bitten corner from biscuit, icing and print.
  const bite=()=>{
    const s=new T.Shape();s.moveTo(-.88,-1.04);s.lineTo(.88,-1.04);
    s.quadraticCurveTo(1.04,-1.04,1.04,-.88);s.lineTo(1.04,.26);
    s.quadraticCurveTo(.69,.12,.64,.43);
    s.quadraticCurveTo(.32,.34,.34,.66);
    s.quadraticCurveTo(.10,.73,.27,1.04);
    s.lineTo(-.88,1.04);s.quadraticCurveTo(-1.04,1.04,-1.04,.88);
    s.lineTo(-1.04,-.88);s.quadraticCurveTo(-1.04,-1.04,-.88,-1.04);return s;
  };
  const slab=(depth,bevel)=>{
    const g=new T.ExtrudeGeometry(bite(),{depth,bevelEnabled:true,bevelSize:bevel,bevelThickness:bevel,bevelSegments:2,curveSegments:18});
    g.rotateX(-Math.PI/2);return g;
  };
  const cookie=new T.Group();cookie.position.set(8,.445,1);cookie.rotation.y=-.24;table.add(cookie);
  const biscuit=mat(new T.MeshStandardMaterial({color:'#d5a25e',roughness:.88,bumpMap:bump,bumpScale:.035}));
  mesh(cookie,slab(.20,.018),biscuit,[0,0,0]);
  const icing=mesh(cookie,slab(.047,.008),chocolate,[0,.216,0]);icing.scale.set(.968,1,.968);
  const faceGeo=new T.ShapeGeometry(bite(),18);
  const p=faceGeo.attributes.position,uv=faceGeo.attributes.uv;
  for(let i=0;i<p.count;i++)uv.setXY(i,(p.getX(i)+1.04)/2.08,(p.getY(i)+1.04)/2.08);
  faceGeo.rotateX(-Math.PI/2);
  const wish=trackTexture(new T.CanvasTexture(artwork.rows[0]));wish.colorSpace=T.SRGBColorSpace;wish.anisotropy=8;
  const face=mesh(cookie,faceGeo,mat(new T.MeshStandardMaterial({map:wish,roughness:.61})),[0,.273,0]);face.scale.set(.944,1,.944);
  // Tiny crumbs make the missing corner read as a bite rather than a cookie shape.
  for(let i=0;i<9;i++) {
    const a=i*2.4,r=.035+(i%3)*.009;
    mesh(table,new T.IcosahedronGeometry(r,0),biscuit,[8.55+Math.sin(a)*.23,.438, .24+Math.cos(a)*.22]);
  }
}
