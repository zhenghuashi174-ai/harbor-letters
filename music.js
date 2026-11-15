(() => {
  // assets.js
  function assetURL(path) {
    return globalThis.islandAssets?.[path] ?? path;
  }

  // music.js
  var audio = document.querySelector("#music");
  var toggle = document.querySelector("#music-toggle");
  var file = document.querySelector("#track-file");
  var status = document.querySelector("#track-status");
  var volume = document.querySelector("#volume");
  var selector = document.querySelector("#track-choice");
  var customOption = selector.querySelector("[value=custom]");
  var library = { new: { url: assetURL("assets/harbor.m4a"), name: "新配乐" }, original: { url: assetURL("assets/song.m4a"), name: "原岛上配乐" } };
  var objectURL = "";
  var label = "";
  var favorite = null;
  var generation = 0;
  var db;
  function preference() {
    try {
      return localStorage.getItem("island-track-v3");
    } catch {
      return null;
    }
  }
  function remember(key) {
    try {
      localStorage.setItem("island-track-v3", key);
    } catch {
    }
  }
  function setFavorite(track) {
    favorite = track || null;
    customOption.disabled = !favorite;
    customOption.textContent = favorite?.name || "我的音乐";
  }
  function database() {
    if (!db) db = new Promise((resolve, reject) => {
      const req = indexedDB.open("four-seasons-audio", 1);
      req.onupgradeneeded = () => req.result.createObjectStore("library");
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    return db;
  }
  async function stored(mode, operation) {
    const conn = await database();
    return new Promise((resolve, reject) => {
      const tx = conn.transaction("library", mode);
      const request = operation(tx.objectStore("library"));
      tx.oncomplete = () => resolve(request.result);
      tx.onerror = tx.onabort = () => reject(tx.error);
    });
  }
  function refresh() {
    toggle.textContent = audio.paused ? "▷ 播放音乐" : "Ⅱ 暂停音乐";
    toggle.setAttribute("aria-pressed", String(!audio.paused));
  }
  async function play(token = generation) {
    try {
      await audio.play();
      if (token === generation) status.textContent = label;
    } catch (e) {
      if (token !== generation || e.name === "AbortError") return;
      status.textContent = e.name === "NotAllowedError" ? "点击播放音乐即可开启声音" : "此音频无法播放，请选择其他文件";
    }
    refresh();
  }
  function use(key, persist = true) {
    if (key === "custom" && !favorite) key = "new";
    const token = ++generation, previous = objectURL;
    audio.pause();
    objectURL = key === "custom" ? URL.createObjectURL(favorite) : "";
    label = key === "custom" ? favorite.name : library[key].name;
    selector.value = key;
    audio.src = objectURL || library[key].url;
    audio.loop = true;
    audio.load();
    if (previous) URL.revokeObjectURL(previous);
    if (persist) remember(key);
    status.textContent = label;
    play(token);
  }
  selector.onchange = () => use(selector.value);
  toggle.onclick = () => {
    if (audio.paused) play();
    else audio.pause();
  };
  audio.addEventListener("play", refresh);
  audio.addEventListener("pause", refresh);
  audio.addEventListener("error", () => {
    status.textContent = "音频读取失败，请换一首或恢复配乐";
    refresh();
  });
  volume.oninput = () => {
    audio.volume = Number(volume.value);
    try {
      localStorage.setItem("island-volume", volume.value);
    } catch {
    }
  };
  try {
    const value = localStorage.getItem("island-volume");
    if (value !== null) volume.value = value;
  } catch {
  }
  audio.volume = Number(volume.value);
  file.onchange = async () => {
    const track = file.files[0];
    file.value = "";
    if (!track) return;
    setFavorite(track);
    use("custom");
    const token = generation;
    try {
      await stored("readwrite", (store) => store.put(track, "favorite"));
    } catch {
      if (token === generation) status.textContent = "本次使用本地音乐，浏览器未能保存文件";
    }
  };
  document.querySelector("#default-track").onclick = () => use("new");
  var initial = preference();
  if (initial !== "custom") use(initial === "original" ? "original" : "new", false);
  var initialGeneration = generation;
  stored("readonly", (store) => store.get("favorite")).then((track) => {
    if (!favorite) setFavorite(track);
    if (initial === "custom" && generation === initialGeneration) use(favorite ? "custom" : "new", false);
  }).catch(() => {
    if (initial === "custom" && generation === initialGeneration) use("new", false);
  });
})();
