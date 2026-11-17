import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { productParts, type ProductPart } from '../data/v8-pro-s';

gsap.registerPlugin(ScrollTrigger);

const host = document.querySelector<HTMLElement>('[data-product-viewer]');
if (host) { setupViewer(host);setupNarration(host); }

function setupNarration(host: HTMLElement) {
  const button=host.querySelector<HTMLButtonElement>('[data-narrate]')!;
  if (!('speechSynthesis' in window)) {button.hidden=true;return;}
  const audio=window.speechSynthesis;
  let current:SpeechSynthesisUtterance|null=null;
  const stop=()=>{
    current=null;audio.cancel();button.textContent='Ouvir detalhe';button.setAttribute('aria-pressed','false');
  };
  button.disabled=false;
  button.addEventListener('click',()=>{
    if(current){stop();return;}
    const part=productParts.find(part=>part.id===host.dataset.activePart)??productParts[0];
    const utterance=new SpeechSynthesisUtterance(`${part.title} ${part.description}`);
    utterance.lang='pt-BR';utterance.rate=.95;
    const voice=audio.getVoices().find(voice=>voice.lang==='pt-BR')??audio.getVoices().find(voice=>voice.lang.startsWith('pt'));
    if(voice)utterance.voice=voice;
    current=utterance;button.textContent='Parar áudio';button.setAttribute('aria-pressed','true');
    utterance.onend=()=>{if(current===utterance)stop();};
    utterance.onerror=()=>{if(current===utterance){stop();host.querySelector('[data-model-announcer]')!.textContent='A narração não está disponível neste dispositivo.';}};
    audio.speak(utterance);
  });
  const observer=new MutationObserver(()=>{if(current)stop();});
  observer.observe(host,{attributes:true,attributeFilter:['data-active-part']});
  window.addEventListener('pagehide',()=>{stop();observer.disconnect();},{once:true});
}

function setupViewer(host: HTMLElement) {
  const canvas = host.querySelector<HTMLCanvasElement>('canvas')!;
  const status = host.querySelector<HTMLElement>('.viewer-loading')!;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const small = matchMedia('(max-width: 767px)');
  const photoFallback = (message: string) => {
    status.textContent=message;host.dataset.sceneState='fallback';host.classList.remove('is-ready');
    host.querySelectorAll<HTMLButtonElement>('[data-mode], [data-zoom], [data-overview]').forEach(button=>button.disabled=true);
    host.querySelectorAll<HTMLButtonElement>('[data-hotspot]').forEach(button=>button.hidden=true);
    document.querySelectorAll<HTMLButtonElement>('.part-action').forEach(button=>{
      button.textContent='Ver nas fotografias ↗';
      button.onclick=()=>document.getElementById('fotos')?.scrollIntoView();
    });
  };
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'default' });
  } catch {
    photoFallback('O 3D não está disponível neste navegador. Explore as fotos e os detalhes abaixo.');
    return;
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, small.matches ? 1.5 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = .85;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, .025, 50);
  camera.position.fromArray(productParts[0].camera);
  const controls = new OrbitControls(camera, canvas);
  controls.target.fromArray(productParts[0].target);
  controls.enableDamping = true;
  controls.dampingFactor = .085;
  controls.enablePan = false;
  controls.enableZoom = false;
  controls.minDistance = .32;
  controls.maxDistance = 10;
  controls.minPolarAngle = .14;
  controls.maxPolarAngle = Math.PI * .52;
  controls.enabled = false;
  canvas.style.touchAction = 'pan-y pinch-zoom';

  const room = new RoomEnvironment();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = pmrem.fromScene(room, .04);
  scene.environment = environment.texture;
  scene.environmentIntensity = .55;
  room.dispose();
  pmrem.dispose();
  scene.add(new THREE.HemisphereLight(0xe5f4ec, 0x0b120f, .55));
  const key = new THREE.DirectionalLight(0xf5f7ff, 3.2); key.position.set(1,3,2);scene.add(key);
  const rim = new THREE.DirectionalLight(0xffdeb8, 2);rim.position.set(-2,2,-2);scene.add(rim);
  const fill = new THREE.DirectionalLight(0x98b6bf, .65);fill.position.set(-2,1,2);scene.add(fill);

  const shadowCanvas = document.createElement('canvas');
  shadowCanvas.width = 128; shadowCanvas.height = 128;
  const context = shadowCanvas.getContext('2d')!;
  const gradient = context.createRadialGradient(64,64,5,64,64,63);
  gradient.addColorStop(0,'rgba(0,0,0,.65)');gradient.addColorStop(1,'rgba(0,0,0,0)');
  context.fillStyle = gradient;context.fillRect(0,0,128,128);
  const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(2.2,1.1), new THREE.MeshBasicMaterial({ map: shadowTexture, transparent: true, depthWrite: false, opacity: .8 }));
  shadow.rotation.x = -Math.PI/2;shadow.position.y=.004;scene.add(shadow);

  const pointVector = new THREE.Vector3();
  const cameraWanted = new THREE.Vector3();
  const targetWanted = new THREE.Vector3();
  const offset = new THREE.Vector3();
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const hotspotButtons = [...host.querySelectorAll<HTMLButtonElement>('[data-hotspot]')];
  const allPartButtons = [...document.querySelectorAll<HTMLButtonElement>('[data-part]')];
  const modeButtons = [...host.querySelectorAll<HTMLButtonElement>('[data-mode]')];
  const chapters = [...document.querySelectorAll<HTMLElement>('[data-scene-step]')];
  const anchors: number[] = [];
  let loaded: THREE.Group | undefined;
  let visible = true;
  let destroyed = false;
  let frame = 0;
  let mode: 'tour' | 'free' = 'tour';
  let active = '';
  let cameraAnimation: gsap.core.Timeline | undefined;
  let introReady = document.documentElement.dataset.movIntro !== 'loading';

  function requestRender() {
    if (!frame && !destroyed && visible && !document.hidden && host.dataset.sceneState!=='fallback') frame = requestAnimationFrame(render);
  }
  function render() {
    frame = 0;
    if (destroyed || !visible || document.hidden || host.dataset.sceneState==='fallback') return;
    const changing = controls.update();
    camera.updateMatrixWorld();
    const width = host.clientWidth, height = host.clientHeight;
    for (const button of hotspotButtons) {
      const part = productParts.find(part => part.id === button.dataset.hotspot)!;
      pointVector.fromArray(part.point).project(camera);
      const x = (pointVector.x * .5 + .5) * width, y = (-pointVector.y * .5 + .5) * height;
      const safe = loaded && pointVector.z > -1 && pointVector.z < 1 && x > 12 && x < width-30 && y > 110 && y < height-140;
      button.hidden = !safe;
      if (safe) button.style.transform = `translate3d(${x-22}px,${y-22}px,0)`;
    }
    renderer.render(scene,camera);
    if (changing && controls.enabled) requestRender();
  }
  function size() {
    const width = host.clientWidth, height = host.clientHeight;
    renderer.setSize(width,height,false);camera.aspect=width/height;
    camera.setViewOffset(width,height,small.matches?0:-width*.17,small.matches?height*.23:0,width,height);
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(devicePixelRatio,small.matches ? 1.5 : 2));
    requestRender();
  }
  const resize = new ResizeObserver(size);resize.observe(host);
  const intersection = new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    if (visible) requestRender(); else { cancelAnimationFrame(frame);frame=0; }
  });intersection.observe(host);
  const onVisibility = () => { if (document.hidden) { cancelAnimationFrame(frame);frame=0; } else requestRender(); };
  document.addEventListener('visibilitychange',onVisibility);
  controls.addEventListener('change',requestRender);
  controls.addEventListener('start',() => cameraAnimation?.kill());

  function setInfo(part: ProductPart, announce = false) {
    if (part.id === active && !announce) return;
    active=part.id;host.dataset.activePart=part.id;
    host.querySelector('[data-part-number]')!.textContent=part.number;
    host.querySelector('[data-part-title]')!.textContent=part.id==='overview'?'V8 Pro S':part.title;
    host.querySelector('[data-part-description]')!.textContent=part.id==='overview'?part.detail:part.description;
    allPartButtons.forEach(button => button.setAttribute('aria-pressed',String(button.dataset.part===part.id)));
    host.querySelectorAll<HTMLAnchorElement>('[data-scene-link]').forEach(link=>{
      if(link.dataset.sceneLink===part.id)link.setAttribute('aria-current','step');else link.removeAttribute('aria-current');
    });
    if (announce) host.querySelector('[data-model-announcer]')!.textContent=`${part.eyebrow}. ${part.description}`;
  }
  function setMode(next: 'tour' | 'free') {
    mode=next;host.dataset.mode=next;controls.enabled=next==='free';
    if (next==='free') { smoothCamera.forEach(update=>update.tween.pause());smoothTarget.forEach(update=>update.tween.pause()); }
    canvas.style.touchAction='pan-y pinch-zoom';
    modeButtons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.mode===next)));
  }
  function moveTo(part: ProductPart, announce = false) {
    cameraAnimation?.kill();
    setInfo(part,announce);
    const view = part.camera;
    const mobileFactor = small.matches ? mobileDistance(part.id) : 1;
    cameraWanted.fromArray(view);targetWanted.fromArray(part.target);
    cameraWanted.sub(targetWanted).multiplyScalar(mobileFactor).add(targetWanted);
    if (reduced.matches) {
      camera.position.copy(cameraWanted);controls.target.copy(targetWanted);controls.update();requestRender();return;
    }
    cameraAnimation=gsap.timeline({ defaults: { duration: .95, ease: 'power2.inOut' }, onUpdate: requestRender });
    cameraAnimation.to(camera.position,{x:cameraWanted.x,y:cameraWanted.y,z:cameraWanted.z},0)
      .to(controls.target,{x:targetWanted.x,y:targetWanted.y,z:targetWanted.z},0);
  }
  const smoothCamera = ['x','y','z'].map(axis=>gsap.quickTo(camera.position,axis,{duration:.45,ease:'power2.out',onUpdate:requestRender}));
  const smoothTarget = ['x','y','z'].map(axis=>gsap.quickTo(controls.target,axis,{duration:.45,ease:'power2.out',onUpdate:requestRender}));
  function mobileDistance(id:string){return Math.max(1.5,(id==='overview'?.86:.65)/camera.aspect);}
  function measure() {
    anchors.length=0;
    chapters.forEach(chapter=>{
      const card=chapter.querySelector<HTMLElement>('.story-card')!;
      anchors.push(card.getBoundingClientRect().top+scrollY+card.offsetHeight*.5);
    });
  }
  function followScroll() {
    if (!loaded || !introReady || mode!=='tour') return;
    const focus = scrollY + innerHeight * (small.matches?.70:.50);
    let index=0;
    while (index<anchors.length-1 && focus>anchors[index+1]) index++;
    const next=Math.min(index+1,productParts.length-1);
    const progress=next===index?0:THREE.MathUtils.clamp((focus-anchors[index])/(anchors[next]-anchors[index]),0,1);
    const transition=THREE.MathUtils.clamp((progress-.25)/.65,0,1);
    const t=reduced.matches?(progress>.5?1:0):transition*transition*(3-2*transition);
    const a=productParts[index],b=productParts[next];
    cameraWanted.fromArray(a.camera);pointVector.fromArray(b.camera);cameraWanted.lerp(pointVector,t);
    targetWanted.fromArray(a.target);pointVector.fromArray(b.target);targetWanted.lerp(pointVector,t);
    if(small.matches)cameraWanted.sub(targetWanted).multiplyScalar(THREE.MathUtils.lerp(mobileDistance(a.id),mobileDistance(b.id),t)).add(targetWanted);
    cameraAnimation?.kill();
    if(reduced.matches){camera.position.copy(cameraWanted);controls.target.copy(targetWanted);controls.update();}
    else {
      smoothCamera.forEach((update,i)=>update(cameraWanted.getComponent(i)));
      smoothTarget.forEach((update,i)=>update(targetWanted.getComponent(i)));
    }
    setInfo(progress>.5?b:a);requestRender();
  }
  measure();
  const scroll = ScrollTrigger.create({ trigger: '.product-experience',start:'top bottom',end:'bottom top',onUpdate:followScroll,onRefresh:()=>{measure();followScroll();} });
  const onIntro = () => { introReady=true;measure();followScroll();requestRender(); };
  document.addEventListener('mov:intro-ready',onIntro,{once:true});
  modeButtons.forEach(button=>button.addEventListener('click',()=>{
    setMode(button.dataset.mode==='free'?'free':'tour');
    if (mode==='tour') { measure();followScroll(); }
    else host.querySelector('[data-model-announcer]')!.textContent='Modo livre. Arraste para girar e use os botões para aproximar.';
    requestRender();
  }));
  document.querySelectorAll<HTMLAnchorElement>('[data-scene-link], .product-actions a[href^="#tour-"]').forEach(link=>link.addEventListener('click',event=>{
    const chapter=document.querySelector<HTMLElement>(link.hash==='#explorar'?'[data-scene-step="overview"]':link.hash);
    if(!chapter)return;
    event.preventDefault();setMode('tour');
    const card=chapter.querySelector<HTMLElement>('.story-card')!;
    const top=card.getBoundingClientRect().top+scrollY+card.offsetHeight*.5-innerHeight*(small.matches?.70:.50);
    window.scrollTo({top,behavior:reduced.matches?'instant':'smooth'});
    requestAnimationFrame(()=>{measure();followScroll();});
  }));
  allPartButtons.forEach(button=>button.addEventListener('click',()=>{
    if (!loaded || host.dataset.sceneState!=='ready') return;
    const part=productParts.find(part=>part.id===button.dataset.part);
    if (part) { setMode('free');moveTo(part,true); }
  }));
  host.querySelector<HTMLButtonElement>('[data-overview]')!.addEventListener('click',()=>{setMode('free');moveTo(productParts[0],true);});
  host.querySelectorAll<HTMLButtonElement>('[data-zoom]').forEach(button=>button.addEventListener('click',()=>{
    setMode('free');cameraAnimation?.kill();offset.copy(camera.position).sub(controls.target);
    const length=THREE.MathUtils.clamp(offset.length()*(button.dataset.zoom==='in'?.82:1.22),.36,10);
    offset.setLength(length).add(controls.target);
    if (reduced.matches) camera.position.copy(offset);
    else cameraAnimation=gsap.timeline({onUpdate:requestRender}).to(camera.position,{x:offset.x,y:offset.y,z:offset.z,duration:.35,ease:'power2.out'});
    requestRender();
  }));
  let pointerStart:{x:number;y:number}|undefined;
  canvas.addEventListener('pointerdown',event=>{pointerStart={x:event.clientX,y:event.clientY};});
  canvas.addEventListener('pointerup',event=>{
    if (!loaded || !pointerStart || Math.hypot(event.clientX-pointerStart.x,event.clientY-pointerStart.y)>6) {pointerStart=undefined;return;}
    pointerStart=undefined;
    const rect=canvas.getBoundingClientRect();pointer.set((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1);
    raycaster.setFromCamera(pointer,camera);
    const hit=raycaster.intersectObject(loaded,true)[0];
    if (!hit) return;
    let object:THREE.Object3D|null=hit.object;
    while (object && !object.name.startsWith('part_')) object=object.parent;
    const key=object?.name.replace('part_','').replace(/[._]?\d+$/,'');
    const id=key==='wheels'?'brakes':key==='drivetrain'?'suspension':key==='frame'?'overview':key;
    const part=productParts.find(part=>part.id===id);
    if (part) { setMode('free');moveTo(part,true); }
  });
  const onPreference=()=>{
    cameraAnimation?.kill();smoothCamera.forEach(update=>update.tween.pause());smoothTarget.forEach(update=>update.tween.pause());
    setMode('tour');followScroll();
  };
  reduced.addEventListener('change',onPreference);
  canvas.addEventListener('webglcontextlost',event=>{
    event.preventDefault();controls.enabled=false;cameraAnimation?.kill();cancelAnimationFrame(frame);frame=0;
    photoFallback('A visualização foi interrompida. As fotografias e informações continuam disponíveis.');
  });
  const draco = new DRACOLoader();draco.setDecoderPath('/draco/');draco.setWorkerLimit(1);
  new GLTFLoader().setDRACOLoader(draco).load('/models/v8-pro-s.glb',gltf=>{
    if (destroyed) {disposeModel(gltf.scene);return;}
    loaded=gltf.scene;scene.add(loaded);
    host.dataset.sceneState='ready';host.classList.add('is-ready');
    host.querySelectorAll<HTMLButtonElement>('[data-mode], [data-zoom], [data-overview]').forEach(button=>button.disabled=false);
    moveTo(productParts[0]);
    size();controls.update();renderer.render(scene,camera);followScroll();requestRender();
  },undefined,()=>{
    photoFallback('Não foi possível abrir o modelo 3D. Explore as fotografias e os detalhes abaixo.');
  });
  function disposeModel(model:THREE.Object3D) {
    const geometries=new Set<THREE.BufferGeometry>(),materials=new Set<THREE.Material>(),textures=new Set<THREE.Texture>();
    model.traverse(object=>{
      if (!(object instanceof THREE.Mesh)) return;
      geometries.add(object.geometry);
      const list=Array.isArray(object.material)?object.material:[object.material];
      list.forEach(material=>{materials.add(material);Object.values(material).forEach(value=>{if(value instanceof THREE.Texture)textures.add(value);});});
    });
    geometries.forEach(geometry=>geometry.dispose());materials.forEach(material=>material.dispose());textures.forEach(texture=>texture.dispose());
  }
  const dispose=()=>{
    if(destroyed)return;destroyed=true;cancelAnimationFrame(frame);cameraAnimation?.kill();
    smoothCamera.forEach(update=>update.tween.kill());smoothTarget.forEach(update=>update.tween.kill());
    scroll.kill();resize.disconnect();intersection.disconnect();controls.dispose();environment.dispose();draco.dispose();
    disposeModel(scene);shadowTexture.dispose();renderer.dispose();
    reduced.removeEventListener('change',onPreference);document.removeEventListener('visibilitychange',onVisibility);document.removeEventListener('mov:intro-ready',onIntro);
  };
  window.addEventListener('pagehide',event=>{if(!event.persisted)dispose();});
  size();requestRender();
}
