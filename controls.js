(()=>{const el=id=>document.getElementById(id),music=el('music'),stage=el('stage'),play=el('play'),title=el('scene-title'),line=el('season-line'),hint=el('hint'),pb=el('phone-play'),mb=el('phone-music');
function sync(){const b=stage.querySelector('nav [aria-pressed=true]');if(b)line.textContent=b.firstChild.textContent+'季';title.textContent=hint.textContent;pb.textContent=stage.classList.contains('watching')?(play.textContent==='暂停'?'暂停剧情':'继续剧情'):'回到剧情';mb.textContent=music.paused?'开启音乐':'暂停音乐';pb.disabled=!b}
function audioSync(){mb.textContent=music.paused?'开启音乐':'暂停音乐'}
for(const n of ['play','pause','error'])music.addEventListener(n,audioSync);
pb.onclick=()=>{(stage.classList.contains('watching')?play:el('mode')).click();sync()};mb.onclick=()=>el('music-toggle').click();
const ob=new MutationObserver(sync);for(const e of [hint,play])ob.observe(e,{subtree:true,childList:true,characterData:true});ob.observe(stage,{attributes:true,attributeFilter:['class']});sync()})()