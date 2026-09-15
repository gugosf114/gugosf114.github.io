import * as T from './vendor/three/three.module.min.js';

// Built from George's September 14 box photos: white folding board,
// shaped window, attached rear hinge, corner labels and crinkle fill.
export function createRealPackaging({ root, scene, geom, mat, trackTexture, bump, label, qrImage }) {
  const white = mat(new T.MeshStandardMaterial({color:'#fffdf9',roughness:.86,bumpMap:bump,bumpScale:.004,side:T.DoubleSide}));
  const foldInk = mat(new T.LineBasicMaterial({color:'#d1cbc2',transparent:true,opacity:.62}));
  const box = new T.Group(); root.add(box);
  const block = (parent, size, position, material=white) => {
    const mesh = new T.Mesh(geom(new T.BoxGeometry(...size)),material);
    mesh.position.set(...position); mesh.castShadow=true; mesh.receiveShadow=true; parent.add(mesh); return mesh;
  };
  const line = (parent, points) => {
    const g=geom(new T.BufferGeometry().setFromPoints(points.map(p=>new T.Vector3(...p))));
    parent.add(new T.Line(g,foldInk));
  };
  block(box,[10.8,.075,8.4],[0,0,0]);
  block(box,[10.8,1.52,.065],[0,.76,-4.17]);
  block(box,[10.8,1.52,.065],[0,.76,4.17]);
  block(box,[.065,1.52,8.3],[-5.37,.76,0]);
  block(box,[.065,1.52,8.3],[5.37,.76,0]);
  for(const side of [-1,1]) {
    line(box,[[side*5.408,.12,-3.9],[side*5.408,1.2,-2.2],[side*5.408,1.2,2.2],[side*5.408,.12,3.9]]);
    line(box,[[side*5.25,.08,4.208],[side*3.6,1.16,4.208],[side*2.6,1.16,4.208]]);
  }
  line(box,[[-.46,1.49,4.21],[0,1.17,4.21],[.46,1.49,4.21]]);

  // Hundreds of folded strips share one mesh, keeping the film render efficient.
  let seed=41219;
  const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  const positions=[], colors=[];
  for(let strip=0;strip<1350;strip++) {
    const x=(random()-.5)*10.15,z=(random()-.5)*7.8,angle=random()*Math.PI*2;
    const length=.3+random()*.9,width=.023+random()*.026,level=.22+random()*.35;
    const shade=.84+random()*.16;
    const points=[];
    for(let j=0;j<=12;j++) {
      const along=(j/12-.5)*length, bend=Math.sin(j*.45+strip)*.07;
      const px=x+Math.cos(angle)*along-Math.sin(angle)*bend;
      const pz=z+Math.sin(angle)*along+Math.cos(angle)*bend;
      const y=level+(j%2?.052:-.017)+Math.sin(j/12*Math.PI)*.035;
      points.push([px-Math.sin(angle)*width,y,pz+Math.cos(angle)*width],[px+Math.sin(angle)*width,y+.007,pz-Math.cos(angle)*width]);
    }
    for(let j=0;j<12;j++) for(const k of [j*2,j*2+1,j*2+2,j*2+1,j*2+3,j*2+2]) {
      positions.push(...points[k]); colors.push(shade,shade,shade*.99);
    }
  }
  const fillGeo=geom(new T.BufferGeometry());
  fillGeo.setAttribute('position',new T.Float32BufferAttribute(positions,3));
  fillGeo.setAttribute('color',new T.Float32BufferAttribute(colors,3));fillGeo.computeVertexNormals();
  const filler=new T.Mesh(fillGeo,mat(new T.MeshStandardMaterial({vertexColors:true,roughness:1,side:T.DoubleSide})));
  filler.castShadow=true;filler.receiveShadow=true;box.add(filler);

  const windowPath = (Path=T.Path) => {
    const p=new Path();p.moveTo(-4.32,3.3);
    p.quadraticCurveTo(-2.1,3.3,0,3.12);p.quadraticCurveTo(2.1,3.3,4.32,3.3);
    p.lineTo(4.31,2.0);p.quadraticCurveTo(3.92,0,4.42,-3.22);
    p.quadraticCurveTo(2.1,-3.18,0,-3.02);p.quadraticCurveTo(-2.1,-3.18,-4.42,-3.22);
    p.quadraticCurveTo(-3.92,0,-4.31,2.0);p.lineTo(-4.32,3.3);return p;
  };
  const lid=new T.Group();lid.position.set(0,1.56,-4.17);box.add(lid);
  const panel=new T.Shape();panel.moveTo(-5.4,-4.2);panel.lineTo(5.4,-4.2);panel.lineTo(5.4,4.2);panel.lineTo(-5.4,4.2);panel.closePath();
  panel.holes.push(windowPath());
  const lidGeo=geom(new T.ExtrudeGeometry(panel,{depth:.055,bevelEnabled:false,curveSegments:24}));lidGeo.rotateX(-Math.PI/2);
  const board=new T.Mesh(lidGeo,white);board.position.z=4.2;board.castShadow=true;board.receiveShadow=true;lid.add(board);
  const windowGeo=geom(new T.ShapeGeometry(windowPath(T.Shape),24));windowGeo.rotateX(-Math.PI/2);
  const windowMesh=new T.Mesh(windowGeo,mat(new T.MeshPhysicalMaterial({color:'#fff',roughness:.075,transparent:true,opacity:.09,clearcoat:1,side:T.DoubleSide,depthWrite:false})));
  windowMesh.position.set(0,.025,4.2);lid.add(windowMesh);

  const tabShape=new T.Shape();tabShape.moveTo(-4.9,0);tabShape.lineTo(4.9,0);tabShape.lineTo(4.8,-.82);tabShape.quadraticCurveTo(4.7,-1.22,4.3,-1.22);tabShape.lineTo(-4.3,-1.22);tabShape.quadraticCurveTo(-4.7,-1.22,-4.8,-.82);tabShape.closePath();
  const tuck=new T.Group();tuck.position.z=8.39;lid.add(tuck);
  tuck.add(new T.Mesh(geom(new T.ShapeGeometry(tabShape)),white));
  const dustFlaps=[];
  for(const side of [-1,1]) {
    const hinge=new T.Group();hinge.position.set(side*5.37,0,4.2);lid.add(hinge);
    block(hinge,[1.15,.035,6.4],[side*.575,0,0]);dustFlaps.push({hinge,side});
    line(lid,[[side*5.34,.06,.3],[side*5.34,.06,8.1]]);
  }
  const sticker=(texture,x,z,radius)=>{
    const mesh=new T.Mesh(geom(new T.CircleGeometry(radius,64)),mat(new T.MeshStandardMaterial({map:texture,roughness:.8})));
    mesh.rotation.x=-Math.PI/2;mesh.position.set(x,.069,z);lid.add(mesh);
  };
  sticker(label,-4.74,7.73,.49);
  if(qrImage) {
    const qr=trackTexture(new T.Texture(qrImage));qr.colorSpace=T.SRGBColorSpace;qr.needsUpdate=true;
    sticker(qr,4.74,.64,.41);
  }

  // Neutral serving scene: a partial oak tabletop, linen, and dessert plates.
  const table=new T.Group();scene.add(table);
  const woodCanvas=document.createElement('canvas');woodCanvas.width=1024;woodCanvas.height=512;
  const c=woodCanvas.getContext('2d');c.fillStyle='#c9aa81';c.fillRect(0,0,1024,512);
  for(let i=0;i<950;i++) {
    const y=random()*512;c.strokeStyle=`rgba(105,72,41,${.025+random()*.05})`;c.lineWidth=.25+random();c.beginPath();
    for(let x=0;x<=1024;x+=32){const py=y+Math.sin(x*.009+i)*2+Math.sin(x*.025+i)*.7;x?c.lineTo(x,py):c.moveTo(x,py);}c.stroke();
  }
  const wood=trackTexture(new T.CanvasTexture(woodCanvas));wood.colorSpace=T.SRGBColorSpace;
  const oak=mat(new T.MeshStandardMaterial({map:wood,roughness:.65,color:'#f4e4cf'}));
  block(table,[30,.55,23],[0,-.4,-2],oak);
  const linen=mat(new T.MeshStandardMaterial({color:'#e5dccb',roughness:1,bumpMap:bump,bumpScale:.035}));
  const napkin=block(table,[3.6,.06,4.4],[8,.005,1.1],linen);napkin.rotation.y=-.18;
  const ceramic=mat(new T.MeshPhysicalMaterial({color:'#faf7ef',roughness:.24,clearcoat:.45}));
  const plateGeo=geom(new T.LatheGeometry([new T.Vector2(0,0),new T.Vector2(.9,0),new T.Vector2(1.24,.07),new T.Vector2(1.53,.19),new T.Vector2(1.55,.24),new T.Vector2(1.49,.27),new T.Vector2(1.17,.15),new T.Vector2(.9,.08),new T.Vector2(0,.08)],64));
  for(let i=0;i<3;i++){const plate=new T.Mesh(plateGeo,ceramic);plate.position.set(8,.08+i*.13,1);plate.castShadow=true;plate.receiveShadow=true;table.add(plate);}
  for(const x of [-11,11])block(table,[.8,6,.8],[x,-3.55,6],oak);
  return {box,update(frame) {
    box.visible=frame.box>0;box.position.y=-(1-frame.box)*1.7;
    lid.rotation.x=-1.93*(1-frame.lid);
    tuck.rotation.x=-Math.PI/2*(1-frame.lid);
    dustFlaps.forEach(({hinge,side})=>hinge.rotation.z=-side*frame.lid*Math.PI/2);
    table.visible=frame.table>0;table.position.y=-(1-frame.table)*1.25;
  }};
}
