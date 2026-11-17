const host=document.querySelector<HTMLElement>('[data-product-viewer]');
if(host){
  const video=host.querySelector<HTMLVideoElement>('video')!;
  const chapters=[...document.querySelectorAll<HTMLElement>('[data-scene-step]')];
  const times=((innerWidth<768?host.dataset.filmMobileTimes:undefined)??host.dataset.filmTimes??'0,1.45,2.65,3.85,5.05,6.25,7.45,9.95').split(',').map(Number);
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let wanted=0,frame=0,ready=false;
  const seek=()=>{frame=0;if(!ready||video.seeking)return;if(Math.abs(video.currentTime-wanted)>.035)video.currentTime=Math.min(wanted,video.duration-.05);};
  video.addEventListener('seeked',()=>{if(Math.abs(video.currentTime-wanted)>.035&&!frame)frame=requestAnimationFrame(seek);});
  let anchors:number[]=[];
  const measure=()=>{anchors=chapters.map(chapter=>{const card=chapter.querySelector<HTMLElement>('.story-card')!;return card.getBoundingClientRect().top+scrollY+card.offsetHeight/2;});};
  const update=()=>{
    const focus=scrollY+host.clientHeight*(innerWidth<768?.76:.5);

    let i=0;while(i<anchors.length-1&&focus>=anchors[i+1])i++;
    const next=Math.min(i+1,times.length-1);
    const t=next===i?0:Math.max(0,Math.min(1,(focus-anchors[i])/(anchors[next]-anchors[i])));
    const transition=t;
    wanted=reduced.matches?times[t>.5?next:i]:times[i]+(times[next]-times[i])*transition;
    const active=chapters[t>.5?next:i].dataset.sceneStep!;host.dataset.activePart=active;
    host.querySelectorAll<HTMLElement>('[data-scene-link]').forEach(link=>{if(link.dataset.sceneLink===active)link.setAttribute('aria-current','step');else link.removeAttribute('aria-current');});
    if(!frame)frame=requestAnimationFrame(seek);
  };
  const fallback=()=>{host.dataset.sceneState='fallback';host.querySelector('.viewer-loading')!.textContent='O filme não está disponível. Explore as fotografias abaixo.';video.hidden=true;};
  video.addEventListener('loadedmetadata',()=>{ready=true;host.dataset.sceneState='ready';host.classList.add('is-ready');update();});
  video.addEventListener('error',fallback);
  if(video.readyState>=1){ready=true;host.classList.add('is-ready');host.dataset.sceneState='ready';}
  const go=(id:string)=>{const card=chapters.find(c=>c.dataset.sceneStep===id)?.querySelector<HTMLElement>('.story-card');if(card)scrollTo({top:card.getBoundingClientRect().top+scrollY+card.offsetHeight/2-host.clientHeight*(innerWidth<768?.76:.5),behavior:reduced.matches?'instant':'smooth'});};
  document.querySelectorAll<HTMLButtonElement>('[data-part]').forEach(button=>button.addEventListener('click',()=>go(button.dataset.part!)));
  document.querySelectorAll<HTMLAnchorElement>('[data-scene-link],.product-actions a[href^="#tour-"]').forEach(link=>link.addEventListener('click',event=>{event.preventDefault();go(link.dataset.sceneLink??link.hash.replace('#tour-',''));}));
  addEventListener('scroll',update,{passive:true});addEventListener('resize',()=>{measure();update();});document.addEventListener('mov:intro-ready',()=>{measure();update();});new ResizeObserver(()=>{measure();update();}).observe(document.querySelector('.product-copy')!);reduced.addEventListener('change',update);measure();update();
}

const lightbox=document.querySelector<HTMLDialogElement>('.photo-lightbox');
if(lightbox){
 const expanded=lightbox.querySelector('img')!;
 document.querySelectorAll<HTMLElement>('.photo-grid figure').forEach(figure=>{
  const image=figure.querySelector('img')!;figure.tabIndex=0;figure.setAttribute('role','button');figure.setAttribute('aria-label',`Ampliar fotografia: ${image.alt}`);
  const open=()=>{expanded.src=image.currentSrc||image.src;expanded.alt=image.alt;lightbox.showModal();};
  figure.addEventListener('click',open);figure.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();open();}});
 });
 lightbox.querySelector('button')!.addEventListener('click',()=>lightbox.close());
 lightbox.addEventListener('click',event=>{if(event.target===lightbox)lightbox.close();});
}
