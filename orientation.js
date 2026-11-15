(() => {
  const safe = document.getElementById('safe-area');
  const stage = document.getElementById('stage');
  const button = document.getElementById('wide');
  const notice = document.getElementById('screen-notice');
  let timer;
  function fit() {
    const w = safe.clientWidth, h = safe.clientHeight;
    const portrait = h > w;
    const width = Math.min(portrait ? h : w, (portrait ? w : h) * 16 / 9);
    stage.style.setProperty('--turn', portrait ? '90deg' : '0deg');
    stage.style.setProperty('--scene-width', width + 'px');
    stage.style.setProperty('--scene-height', width * 9 / 16 + 'px');
  }
  function active() { return document.fullscreenElement || document.webkitFullscreenElement; }
  function sync() {
    fit();
    button.textContent = active() ? '退出全屏' : '全屏';
    button.setAttribute('aria-label', active() ? '退出全屏' : '全屏观看');
  }
  function explain() {
    notice.textContent = '已铺满网页，顶部栏由浏览器控制';
    notice.hidden = false;
    clearTimeout(timer);
    timer = setTimeout(() => { notice.hidden = true; }, 2600);
  }
  button.addEventListener('click', async () => {
    notice.hidden = true;
    const root = document.documentElement;
    try {
      if (active()) {
        await (document.exitFullscreen || document.webkitExitFullscreen).call(document);
      } else {
        if (root.requestFullscreen) await root.requestFullscreen({navigationUI:'hide'});
        else if (root.webkitRequestFullscreen) root.webkitRequestFullscreen();
        else { explain(); return; }
        if (active() && screen.orientation?.lock) {
          try { await screen.orientation.lock('landscape'); } catch {}
        }
      }
    } catch { explain(); }
    sync();
  });
  window.addEventListener('resize', fit);
  window.visualViewport?.addEventListener('resize', fit);
  if (window.ResizeObserver) new ResizeObserver(fit).observe(safe);
  document.addEventListener('fullscreenchange', sync);
  document.addEventListener('webkitfullscreenchange', sync);
  sync();
})();
