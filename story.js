(() => {
  // reunion.js
  var smooth = (x) => {
    const u = Math.max(0, Math.min(x, 1));
    return u * u * (3 - 2 * u);
  };
  var mix = (a2, b, f) => a2 + (b - a2) * f;
  function reunionPose(p, seconds) {
    if (seconds <= 0 || !p.girlAlpha) return;
    const reach = smooth(seconds / 0.72), answer = smooth((seconds - 0.36) / 0.74);
    const pull = smooth((seconds - 1.18) / 1.38), hug = smooth((seconds - 2.95) / 1.35);
    p.boy -= 3 * pull;
    p.girl = mix(p.girl, p.boy + 38, pull);
    p.girl = mix(p.girl, p.boy + 32, hug);
    p.girlY = mix(p.girlY, p.boyY + 3, hug);
    p.steps ?? (p.steps = [0, 0]);
    p.steps[1] += Math.sin((seconds - 1.18) * 8) * 4 * pull * (1 - pull);
    p.reach = [reach, answer];
    p.pull = pull;
    p.hug = hug;
    for (let i = 0; i < 2; i++) {
      const a2 = p.acting[i];
      a2.lean = mix(a2.lean || 0, 0.043, hug);
      a2.head = mix(a2.head || 0, 0.062, hug);
      a2.left = mix(a2.left || 0, -0.34, hug);
      if (hug > 0.3) p.moods[i] = i ? "relieved" : "tender";
    }
  }
  function dinnerFinale(p, time, release, walkTime) {
    if (time <= 0) return;
    reunionPose(p, time);
    if (time <= release) return;
    const u = Math.max(0, Math.min(1, (time - release) / walkTime)), walk = smooth(u);
    const unwind = 1 - smooth((time - release) / 0.62);
    p.hug *= unwind;
    p.reach = p.reach.map((alpha) => alpha * unwind);
    p.sit = smooth((time - release - walkTime + 0.15) / 0.8);
    for (let i = 0; i < 2; i++) {
      const x = i ? "girl" : "boy", y = i ? "girlY" : "boyY";
      p[x] = mix(p[x], i ? 562 : 496, walk);
      p[y] = mix(p[y], i ? 358 : 344, walk) + Math.sin(Math.PI * walk) * (i ? 15 : 22);
      p.steps[i] = Math.sin(time * 8.2 + i) * Math.min(1, walk * 13, (1 - walk) * 15);
      p.look[i] = p.turn[i] = mix(mix(i ? -1 : 1, -1, smooth(u * 8)), i ? -1 : 1, p.sit);
      p.acting[i].lean *= unwind;
      p.acting[i].head *= unwind;
      p.acting[i].right = mix(p.acting[i].right || 0, -0.9, p.sit);
      p.acting[i].left *= unwind;
    }
  }
  function sleeve(c, x, y, elbowX, elbowY, endX, endY, coat, trim) {
    const vx = endX - elbowX, vy = endY - elbowY, len = Math.hypot(vx, vy) || 1, nx = -vy / len, ny = vx / len;
    const ax = elbowX - x, ay = elbowY - y, al = Math.hypot(ax, ay) || 1, bx = -ay / al, by = ax / al;
    c.beginPath();
    c.moveTo(x + bx * 3.7, y + by * 3.7);
    c.quadraticCurveTo(elbowX + bx * 4, elbowY + by * 4, endX + nx * 2.5, endY + ny * 2.5);
    c.lineTo(endX - nx * 2.5, endY - ny * 2.5);
    c.quadraticCurveTo(elbowX - bx * 4, elbowY - by * 4, x - bx * 3.7, y - by * 3.7);
    c.closePath();
    c.fillStyle = coat;
    c.fill();
    c.lineWidth = 0.8;
    c.strokeStyle = "#63505b";
    c.stroke();
    c.strokeStyle = trim;
    c.lineWidth = 1.8;
    c.beginPath();
    c.moveTo(endX + nx * 2.1, endY + ny * 2.1);
    c.lineTo(endX - nx * 2.1, endY - ny * 2.1);
    c.stroke();
  }
  function palm(c, x, y, dir, angle, shade) {
    c.save();
    c.translate(x, y);
    c.scale(dir, 1);
    c.rotate(angle);
    c.fillStyle = shade;
    c.beginPath();
    c.moveTo(-1, -2.1);
    c.quadraticCurveTo(1, -2.6, 2, -1.8);
    c.lineTo(3.8, -2.3);
    c.quadraticCurveTo(5.1, -2.2, 4.5, -0.6);
    c.quadraticCurveTo(5.1, 1.8, 2, 2.4);
    c.lineTo(-1, 1.9);
    c.fill();
    c.restore();
  }
  function wrapArms(c, p) {
    if (!p.reach) return;
    const [r, a2] = p.reach, h = p.hug, b = p.boy, g = p.girl, y = p.boyY, v = p.girlY;
    const link = mix((b + g) / 2 + 1, b + 17, p.pull), height = mix((y + v) / 2 - 26, y - 30, p.pull);
    c.save();
    c.lineJoin = "round";
    const bx = mix(b + 15, link - 2, r), by = mix(y - 24, height, r);
    c.globalAlpha = r * (1 - h);
    sleeve(c, b + 9, y - 40, b + 11, y - 26, bx, by, "#507d9c", "#9eb2bb");
    palm(c, bx, by, 1, -0.18, "#edbe9d");
    c.globalAlpha = h;
    sleeve(c, b + 12, y - 40, b + 15, y - 37, g - 11, v - 42, "#527f9e", "#98afbc");
    palm(c, g + 13, v - 41, -1, 0.82, "#f1c4a4");
    const gx = mix(mix(g - 13, link + 3, a2), b + 2, h), gy = mix(mix(v - 23, height - 1, a2), y - 32, h);
    c.globalAlpha = a2;
    sleeve(c, g - 9, v - 40, mix(g - 12, g - 15, h), mix(v - 25, v - 21, h), gx, gy, "#bd83ae", "#e1bbca");
    palm(c, gx, gy, -1, mix(0.14, -0.36, h), "#f5ccad");
    c.restore();
  }
  function waitingCamera(base, weight, x, y) {
    const zoom = base.zoom + (3 - base.zoom) * weight;
    const targetX = Math.min(0, Math.max(-2560, 580 - 3 * x)), targetY = Math.min(0, Math.max(-1440, 396 - 3 * (y - 43)));
    return { zoom, dx: base.dx + (targetX - base.dx) * weight, dy: base.dy + (targetY - base.dy) * weight };
  }
  function foldedLetter(c) {
    c.save();
    c.rotate(-0.16);
    c.fillStyle = "#795c58";
    c.fillRect(-10, -8, 21, 14);
    c.fillStyle = "#fae4b4";
    c.fillRect(-9, -7, 19, 11);
    c.strokeStyle = "#bc8c72";
    c.lineWidth = 1.1;
    c.beginPath();
    c.moveTo(-9, -6);
    c.lineTo(0, 0);
    c.lineTo(9, -6);
    c.stroke();
    c.fillStyle = "#b56555";
    c.fillRect(-1, -1, 3, 3);
    c.restore();
  }

  // expression.js
  var beats = [
    "startled amused amused shy shy tender tender amused shy shy amused hopeful tender smile",
    "amused smile shy amused tender teasing smile amused hopeful earnest shy tender smile smile",
    "worried amused tender worried worried earnest worried guarded startled shy hurt worried tense wistful",
    "worried hurt regret hurt wistful hopeful guarded weary tense hurt tender tense tender relieved",
    "wistful tender nervous startled earnest regret nervous worried hurt sad shy sad tender sad",
    "sad worried resolve shock tear hurt sad tender tear sad tear sad wistful sad",
    "weary amused wistful shy startled startled nervous hopeful tender startled smile tender hopeful relieved",
    "earnest wistful wistful nervous regret earnest hopeful tender hopeful relieved happyTears smile teasing joy"
  ].map((s2) => s2.split(" "));
  var listens = [
    "curious shy smile amused tender amused smile tender tender shy shy hopeful smile smile",
    "smile amused shy teasing tender amused shy amused shy hopeful earnest smile teasing smile",
    "worried smile tender tense tense worried guarded worried nervous regret sad regret hurt sad",
    "guarded worried sad hurt wistful nervous tense weary sad worried hurt sad tender tender",
    "wistful tender startled worried sad hurt worried hurt sad sad sad sad tender sad",
    "sad worried shock hurt hurt sad tear sad sad sad tear sad wistful sad",
    "weary wistful wistful wistful nervous hopeful hopeful nervous shy curious tender shy hopeful relieved",
    "nervous tender wistful hopeful sad tender tender hopeful nervous happyTears relieved joy smile joy"
  ].map((s2) => s2.split(" "));
  function moods(id, index, speaker) {
    const n = Math.max(0, Math.min(13, index)), pair = [listens[id][n], listens[id][n]];
    pair[speaker] = beats[id][n];
    return pair;
  }
  var happy = /* @__PURE__ */ new Set(["joy", "smile", "teasing", "amused", "happyTears", "relieved"]);
  var low = /* @__PURE__ */ new Set(["sad", "tear", "hurt", "regret", "wistful", "weary"]);
  function face(c, mood, t, speaking, age, look) {
    const line4 = (pts, col, w = 1.3) => {
      c.beginPath();
      pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y));
      c.strokeStyle = col;
      c.lineWidth = w;
      c.stroke();
    };
    const box2 = (x, y, w, h, col) => {
      c.fillStyle = col;
      c.fillRect(x, y, w, h);
    };
    const blush = ["shy", "tender", "joy", "happyTears", "teasing"].includes(mood), down = low.has(mood), wide = ["startled", "shock"].includes(mood);
    const f = happy.has(mood), blink = t % 3.7 > 3.54, worry = ["worried", "nervous", "guarded", "tense", "resolve", "earnest", "hopeful"].includes(mood);
    c.save();
    c.translate(look * 1.15, down ? 0.35 : 0);
    for (const side of [-1, 1]) {
      const x = side * 6.8, gaze = mood === "shy" ? -0.8 : look * 0.45;
      const browY = -53.2 - (wide ? 0.8 : 0) + (mood === "teasing" && side < 0 ? -0.6 : 0);
      line4([[x - 1.8, browY + 0.25], [x, browY - 0.18], [x + 1.8, browY + 0.25]], "#a87668", 0.8);
      if (blink || mood === "joy" || mood === "amused") {
        line4([[x - 1.8, -49.4], [x, -50.1], [x + 1.8, -49.4]], "#654c50", 1.25);
      } else {
        const h = wide ? 3.85 : down ? 2.95 : 3.45;
        c.fillStyle = "#58434b";
        c.beginPath();
        c.ellipse(x + gaze, -49.3, 1.44, h / 2, 0, 0, Math.PI * 2);
        c.fill();
        box2(x + gaze - 0.65, -50.45, 0.85, 0.85, "#fff0da");
      }
      box2(x - 2.2, -46.1, 3.8, blush ? 1.65 : 1.05, blush ? "#eaa39b" : "#efb9a4");
    }
    const lift = f || blush ? 0.85 : down ? 0.42 : worry ? 0.18 : 0.46;
    const open = speaking && Math.sin(t * 9) > 0.48;
    if (open) {
      c.fillStyle = "#aa7671";
      c.beginPath();
      c.ellipse(0.35, -43.9, 1.48, wide ? 0.97 : 0.73, 0, 0, Math.PI * 2);
      c.fill();
    } else line4([[-1.95, -43.9], [0.2, -43.9 + lift], [2.25, -43.95]], "#a67570", 0.95);
    if ((mood === "tear" || mood === "happyTears") && age > 0.6 && age < 2.9) {
      c.globalAlpha *= Math.sin((age - 0.6) / 2.3 * Math.PI) * 0.7;
      box2(8, -47.85, 1.3, 0.85, "#fff2dd");
    }
    c.restore();
  }

  // assets.js
  function assetURL(path) {
    return globalThis.islandAssets?.[path] ?? path;
  }

  // clockwork.js
  var TAU = Math.PI * 2;
  var CX = 640;
  var CY = 383;
  var RX = 469;
  var RY = 159;
  function bend(r, k) {
    const u = Math.min(1, r), arch = Math.sin(Math.PI * u);
    return [0.3 * arch + 0.08 * u, -0.32 * arch + 0.12 * u, 0.23 * arch - 0.09 * u, -0.19 * arch - 0.045 * u][k];
  }
  function point(progress, r, k) {
    const a2 = progress * TAU + bend(r, k);
    return [CX + RX * r * Math.sin(a2), CY - RY * r * Math.cos(a2)];
  }
  function angleAt(x, y, k) {
    const u = (x - CX) / RX, v = (y - CY) / RY;
    return (Math.atan2(u, -v) - bend(Math.hypot(u, v), k) + TAU) % TAU / TAU;
  }
  function reached(x, y, progress, k) {
    if (progress <= 0) return 0;
    if (progress >= 1) return 1;
    const f = Math.max(0, Math.min(1, (progress - angleAt(x, y, k)) / 0.038));
    return f * f * (3 - 2 * f);
  }
  function radialEdge(c, p, k, out) {
    for (let j = 0; j <= 48; j++) c.lineTo(...point(p, (out ? j : 48 - j) / 48, k));
  }
  function sector(c, progress, inverse, k, paint) {
    if (progress <= 0 && !inverse || progress >= 1 && inverse) return;
    if (progress >= 1 && !inverse || progress <= 0 && inverse) {
      paint();
      return;
    }
    const start = inverse ? progress : 0, end = inverse ? 1 : progress, shift = bend(1, k) - Math.PI / 2;
    c.save();
    c.beginPath();
    c.moveTo(CX, CY);
    radialEdge(c, start, k, true);
    c.ellipse(CX, CY, RX * 9, RY * 9, 0, start * TAU + shift, end * TAU + shift);
    radialEdge(c, end, k, false);
    c.closePath();
    c.clip();
    paint();
    c.restore();
  }
  var facets = 168;
  var step = TAU / facets;
  var seed = 928;
  function sample() {
    seed = Math.imul(seed, 1664525) + 1013904223 >>> 0;
    return seed / 4294967296;
  }
  var basalt = Array.from({ length: facets }, () => {
    const shade = sample() * 0.85;
    const color = (r2, g2, b2) => `rgb(${Math.round(r2)} ${Math.round(g2)} ${Math.round(b2)})`;
    const r = 41 + 77 * shade, g = 46 + 50 * shade, b = 73 + 46 * shade;
    return {
      depth: sample() * 14 - 7,
      slant: sample() * 10 - 5,
      face: color(r * 0.9, g * 0.88, b * 0.93),
      shadow: color(r * 0.61 + 10, g * 0.61 + 14, b * 0.61 + 23),
      seam: color(r * 0.58 + 69, g * 0.58 + 64, b * 0.58 + 72)
    };
  });
  var cliff = document.createElement("canvas");
  var density = 0.75;
  var left = 146;
  var top = 363;
  cliff.width = Math.ceil((1134 - left) * density);
  cliff.height = Math.ceil((630 - top) * density);
  var ink = cliff.getContext("2d");
  var silhouette = document.createElement("canvas");
  silhouette.width = cliff.width;
  silhouette.height = cliff.height;
  var mask = silhouette.getContext("2d");
  function seamPoint(theta, stone) {
    const front = Math.sin(theta), side = Math.cos(theta), x = CX + RX * side, y = 384 + RY * front;
    const extent = 12 + stone.depth * 0.33;
    const normalLength = Math.hypot(side / RX, front / RY);
    return {
      x,
      y,
      u: x + stone.slant * front,
      v: y + 11 + 39 * Math.pow(front, 0.6) + stone.depth * front,
      dx: extent * side / (RX * normalLength),
      dy: extent * front / (RY * normalLength),
      cap: extent * side ** 7
    };
  }
  function contour(ctx, edge, f) {
    ctx.beginPath();
    for (const p of edge) ctx.lineTo(p.x + p.cap * f, p.y - 2);
    for (let i = edge.length - 1; i >= 0; i--) {
      const p = edge[i];
      ctx.lineTo(p.u + p.dx * f, p.v + p.dy * f);
    }
    ctx.closePath();
    ctx.fill();
  }
  function rockRim(c, time) {
    const t = time * 0.021, first = Math.floor(-t / step), last = Math.ceil((Math.PI - t) / step);
    for (const ctx of [ink, mask]) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, cliff.width, cliff.height);
      ctx.setTransform(density, 0, 0, density, -left * density, -top * density);
    }
    const edge = [];
    for (let i = first; i <= last; i++) {
      const a2 = Math.max(0, Math.min(Math.PI, i * step + t));
      const stone = basalt[(i % facets + facets) % facets];
      edge.push(seamPoint(a2, stone));
    }
    ink.fillStyle = "#302d43";
    contour(ink, edge, 1);
    for (let j = 0; j < edge.length - 1; j++) {
      const p = edge[j], q = edge[j + 1], i = (first + j) % facets, stone = basalt[(i + facets) % facets];
      ink.fillStyle = stone.face;
      ink.beginPath();
      ink.moveTo(p.x + p.cap, p.y - 2);
      ink.lineTo(q.x + q.cap, q.y - 2);
      ink.lineTo(q.u + q.dx, q.v + q.dy);
      ink.lineTo(p.u + p.dx, p.v + p.dy);
      ink.closePath();
      ink.fill();
      ink.fillStyle = stone.shadow;
      ink.beginPath();
      ink.moveTo(p.x, p.y + 4);
      ink.lineTo(p.u + p.dx, p.v + p.dy);
      ink.lineTo(q.u + q.dx, q.v + q.dy - 4);
      ink.fill();
      if ((i + facets) % 3 === 1 && p.x - q.x > 4) {
        ink.strokeStyle = stone.seam;
        ink.lineWidth = 0.95;
        ink.beginPath();
        ink.moveTo(p.x - 2, p.y + 9);
        ink.lineTo(p.u - 2, p.v - 4);
        ink.stroke();
        ink.fillStyle = "#bda48b";
        ink.fillRect(p.x - 2, p.y + 12, 1.65, 3.4);
      }
    }
    let previous = 0;
    for (let band = 1; band <= 12; band++) {
      const u = band / 12, opacity = u * u * (3 - 2 * u);
      mask.fillStyle = "rgba(255,255,255," + (opacity - previous) / (1 - previous) + ")";
      contour(mask, edge, 1 - u * 1.38);
      previous = opacity;
    }
    ink.save();
    ink.setTransform(1, 0, 0, 1, 0, 0);
    ink.globalCompositeOperation = "destination-in";
    ink.drawImage(silhouette, 0, 0);
    ink.restore();
    c.save();
    c.imageSmoothingEnabled = false;
    c.drawImage(cliff, left, top, cliff.width / density, cliff.height / density);
    c.restore();
  }
  function pointer(c, progress, t, active, k, previous) {
    const strength = active ? Math.min(1, (1 - progress) * 18, progress * 18) : 0;
    if (strength > 0) {
      let trace = function(a2, b, col, w, offset = 0) {
        c.strokeStyle = col;
        c.lineWidth = w;
        c.beginPath();
        for (let i = 0; i <= 48; i++) {
          const u = a2 + (b - a2) * i / 48, p = point(progress + offset * Math.sin(Math.PI * i / 48), u, k);
          if (i) c.lineTo(...p);
          else c.moveTo(...p);
        }
        c.stroke();
      };
      c.save();
      c.globalAlpha *= strength;
      c.lineJoin = "round";
      c.lineCap = "round";
      const [shade, metal, light] = [["#576d42", "#c5cf87", "#ffe3dd"], ["#376b76", "#79d5ce", "#e0fffc"], ["#825039", "#e59b51", "#ffe6a3"], ["#536b9d", "#b4d6f4", "#f4ffff"]][k];
      trace(0.018, 1.025, metal + "38", 8);
      trace(0.018, 1.025, shade, 3.3);
      trace(0.018, 1.025, light, 1.7);
      if (k === 1) {
        trace(0.16, 0.93, metal, 2.4, -0.014);
        trace(0.32, 0.82, light, 1, -0.022);
      }
      if (k === 2) {
        trace(0.3, 1.01, metal, 2.7, -0.023);
        trace(0.3, 1.01, metal, 1.6, 0.01);
      }
      for (let j = 0; j < 5; j++) {
        const u = 0.22 + 0.17 * j, [x2, y2] = point(progress, u, k), next = point(progress, u + 0.012, k);
        c.save();
        c.translate(x2, y2);
        c.rotate(Math.atan2(next[1] - y2, next[0] - x2));
        c.scale(1, j % 2 ? -1 : 1);
        const leaf = (len, width, col) => {
          c.fillStyle = col;
          c.beginPath();
          c.moveTo(0, 0);
          c.quadraticCurveTo(len * 0.3, -width, len, -width * 0.8);
          c.quadraticCurveTo(len * 0.65, 1, 0, 0);
          c.fill();
        };
        if (k === 0) {
          leaf(9, 5, metal);
          c.fillStyle = "#efa5ba";
          c.beginPath();
          c.ellipse(6, -5, 3, 2.1, -0.5, 0, TAU);
          c.fill();
        }
        if (k === 1) {
          c.fillStyle = light;
          c.beginPath();
          c.ellipse(1, -3, 2.4, 1.4, 0, 0, TAU);
          c.fill();
        }
        if (k === 2) {
          c.strokeStyle = metal;
          c.lineWidth = 1.6;
          c.beginPath();
          c.moveTo(-4, 0);
          c.lineTo(5, -4);
          c.stroke();
          if (j === 4) leaf(12, 6, "#f3aa53");
        }
        if (k === 3) {
          c.strokeStyle = metal;
          c.lineWidth = 1.5;
          c.beginPath();
          c.moveTo(-5, 0);
          c.lineTo(3, -6);
          c.lineTo(5, -6);
          c.moveTo(0, -3);
          c.lineTo(0, -6);
          c.stroke();
        }
        c.restore();
      }
      const [x, y] = point(progress, 1.025, k);
      c.fillStyle = light;
      c.beginPath();
      c.moveTo(x - 4, y);
      c.lineTo(x, y - 4);
      c.lineTo(x + 4, y);
      c.lineTo(x, y + 4);
      c.fill();
      c.restore();
    }
    const ellipse = (x, y, rx, ry, col) => {
      c.fillStyle = col;
      c.beginPath();
      c.ellipse(x, y, rx, ry, 0, 0, TAU);
      c.fill();
    };
    ellipse(CX, CY + 2, 22, 8, "#4e3527");
    ellipse(CX, CY, 21, 8, "#d5a747");
    ellipse(CX, CY - 1, 18, 6.4, "#fff095");
    ellipse(CX, CY - 0.6, 13, 5, "#503721");
    ellipse(CX, CY - 1, 8, 2.8, "#ffe7a0");
    ellipse(CX - 2, CY - 2, 4, 1.1, "#fffbe6");
    for (const [u, v, angle] of [[-20, -3, -0.5], [17, 4, 0.25], [10, -7, 0.48]]) {
      const season2 = active && angleAt(CX + u, CY + v, k) > progress ? previous : k;
      c.save();
      c.translate(CX + u, CY + v);
      c.rotate(angle);
      c.scale(0.88, 0.76);
      if (season2 === 0) {
        for (let i = 0; i < 5; i++) {
          c.rotate(TAU / 5);
          ellipse(0, -3, 2.3, 3.3, i % 2 ? "#e798ac" : "#ffcdd2");
        }
        ellipse(0, 0, 1.8, 1.8, "#ffe49c");
      } else if (season2 === 1) {
        c.fillStyle = "#479477";
        c.beginPath();
        c.moveTo(0, 0);
        c.ellipse(0, 0, 7, 4, 0, 0.4, TAU - 0.4);
        c.closePath();
        c.fill();
        c.strokeStyle = "#a5c56e";
        c.lineWidth = 1;
        c.beginPath();
        c.moveTo(0, 0);
        c.lineTo(-5, -2);
        c.stroke();
        ellipse(3, -2, 1.4, 1, "#e5f7c5");
      } else if (season2 === 2) {
        c.fillStyle = "#d27637";
        c.beginPath();
        for (const [i, j] of [[-6, 2], [-5, -3], [-2, -2], [0, -7], [2, -3], [5, -4], [4, 0], [7, 0], [1, 4]]) c.lineTo(i, j);
        c.fill();
        c.strokeStyle = "#f1bd65";
        c.lineWidth = 1;
        c.beginPath();
        c.moveTo(-2, 5);
        c.lineTo(1, -3);
        c.stroke();
      } else {
        c.strokeStyle = "#d7effa";
        c.lineWidth = 1.3;
        for (let i = 0; i < 6; i++) {
          c.rotate(TAU / 6);
          c.beginPath();
          c.moveTo(0, 0);
          c.lineTo(0, -5.8);
          c.moveTo(-1.7, -4.8);
          c.lineTo(0, -3);
          c.lineTo(1.7, -4.8);
          c.stroke();
        }
        ellipse(0, 0, 1.8, 1.2, "#91c5df");
      }
      c.restore();
    }
  }

  // lamps.js
  var lamps = [[365, 383, 0.52], [552, 342, 0.5], [836, 335, 0.46], [680, 488, 0.65], [967, 414, 0.6]];
  var colors = ["#ffd291", "#ffe299", "#ffb772", "#ffe2ae"];
  function drawLamps(c, k, t, lit) {
    for (const [x, y, s2] of lamps) {
      c.save();
      c.translate(x, y);
      c.scale(s2, s2);
      const flicker = 0.91 + 0.07 * Math.sin(t * 1.7 + x), intensity = (x === 967 && lit ? 1.3 : 1) * flicker;
      const halo = (cx, cy, r, color) => {
        const g = c.createRadialGradient(cx, cy, 0, cx, cy, r);
        g.addColorStop(0, color);
        g.addColorStop(1, "#ffba6c00");
        c.fillStyle = g;
        c.fillRect(cx - r, cy - r, r * 2, r * 2);
      };
      c.save();
      c.scale(1, 0.29);
      halo(0, 0, 56 * intensity, "#ffe19773");
      c.restore();
      const box2 = (x2, y2, w, h, col) => {
        c.fillStyle = col;
        c.fillRect(x2, y2, w, h);
      };
      box2(-6, -3, 12, 4, "#52454b");
      box2(-2, -54, 4, 53, "#53484c");
      box2(-1, -52, 1, 47, "#b9986f");
      halo(0, -52, 34 * intensity, "#ffcc7a87");
      box2(-6, -60, 12, 14, "#694950");
      box2(-4, -58, 8, 10, colors[k]);
      box2(0, -58, 1, 11, "#bb8c61");
      box2(-8, -61, 16, 2, "#5c4850");
      box2(-5, -64, 10, 3, k === 3 ? "#dfedef" : "#786067");
      box2(-2, -66, 4, 2, "#a28975");
      if (x === 836 && k !== 3) {
        c.save();
        c.beginPath();
        c.ellipse(-50, -30, 63, 19, 0, 0, 2 * Math.PI);
        c.clip();
        for (let j = 0; j < 6; j++) {
          c.globalAlpha = 0.55 - j * 0.06;
          box2(-24 - j * 2 + Math.sin(t * 2 + j) * 4, -40 + 4 * j, 11 - j, 1.8, colors[k]);
        }
        c.restore();
      }
      if (k < 3 && Math.sin(t * 0.23 + x) > 0.05) {
        for (let i = 0; i < (k === 1 ? 4 : 2); i++) {
          const u = t * (1.2 + i * 0.12) + x + i * 4, mx = Math.cos(u) * (12 + i * 2), my = -53 + Math.sin(u * 1.8) * 9;
          box2(mx, my, 2, 2, "#f7d892");
          box2(mx + (Math.sin(u * 9) > 0 ? -2 : 2), my - 1, 2, 1.4, "#fff4c6");
        }
      }
      c.restore();
    }
  }

  // harbor.js
  var palettes = [
    ["#276b71", "#489899", "#81c0a1", "#92735a", "#edab81", "#ffe3ab"],
    ["#195768", "#287d85", "#63afa9", "#775749", "#23818a", "#ffcd78"],
    ["#315d68", "#507e81", "#a6aaa0", "#895540", "#b54f43", "#ffd181"],
    ["#395871", "#638a9f", "#c3dce1", "#655464", "#5f728e", "#ffda86"]
  ];
  var banks = [];
  function shape(c, pts, color) {
    c.fillStyle = color;
    c.beginPath();
    pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y));
    c.closePath();
    c.fill();
  }
  function line(c, pts, color, w = 2) {
    c.strokeStyle = color;
    c.lineWidth = w;
    c.beginPath();
    pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y));
    c.stroke();
  }
  function box(c, x, y, w, h, color) {
    c.fillStyle = color;
    c.fillRect(x, y, w, h);
  }
  var shore = [[1040, 305], [1031, 324], [1034, 344], [1018, 355], [1005, 377], [975, 386], [963, 402], [936, 414], [929, 434], [948, 450], [995, 473], [1120, 477], [1140, 302]];
  function clipIsland(c) {
    c.beginPath();
    c.ellipse(640, 381, 466, 157, 0, 0, Math.PI * 2);
    c.clip();
  }
  function paintBank(k) {
    const canvas2 = document.createElement("canvas");
    canvas2.width = 188;
    canvas2.height = 135;
    const c = canvas2.getContext("2d");
    c.scale(0.75, 0.75);
    c.translate(-902, -298);
    const [deep, sea, glint, wood, canvasColor, light] = palettes[k];
    c.save();
    clipIsland(c);
    shape(c, shore, "#453e45");
    c.translate(4, 0);
    shape(c, shore, deep);
    c.translate(-4, 0);
    shape(c, [[1048, 324], [1044, 344], [1033, 360], [1033, 374], [994, 393], [978, 409], [962, 421], [959, 439], [1009, 468], [1110, 467], [1112, 322]], sea);
    for (let i = 0; i < 82; i++) {
      const y = 334 + i * 37 % 127, x = 1046 - Math.max(0, y - 341) * 0.73 + i * 47 % 106;
      box(c, x, y, 3 + i % 12, 1.4, i % 4 ? deep : glint);
    }
    if (k === 3) {
      for (const [x, y, s2] of [[1039, 359, 12], [989, 404, 7], [1067, 379, 10], [989, 447, 12], [1026, 450, 9]]) {
        shape(c, [[x - s2, y], [x - 3, y - 3], [x + s2, y - 2], [x + s2 - 4, y + 2], [x - 2, y + 3]], "#b6d4dc");
        box(c, x - 3, y - 3, s2, 1.4, "#e4e8d9");
      }
    }
    const edge = shore.slice(0, 11);
    for (let i = 0; i < edge.length - 1; i++) {
      const [x, y] = edge[i], [xx, yy] = edge[i + 1];
      for (let j = 0; j < 3; j++) {
        const a2 = j / 3, X = x + (xx - x) * a2, Y = y + (yy - y) * a2;
        shape(c, [[X - 6, Y - 2], [X, Y - 4], [X + 4, Y], [X + 2, Y + 3], [X - 5, Y + 3]], i % 2 ? wood : "#827668");
        box(c, X - 4, Y - 2, 5, 1.5, k === 3 ? "#deebec" : "#bdad83");
      }
    }
    c.restore();
    const deck = [[929, 412], [964, 399], [1054, 419], [1021, 437]];
    for (const [x, y] of [[951, 419], [990, 428], [1022, 433], [1048, 419]]) {
      box(c, x, y, 5, 16, "#453b41");
      box(c, x + 1, y, 2, 12, "#986d53");
    }
    shape(c, [[929, 412], [1021, 433], [1054, 419], [1054, 424], [1021, 442], [929, 419]], "#513c3b");
    shape(c, deck, wood);
    for (let i = 0; i < 15; i++) {
      const x = 932 + i * 6, y = 413 + i * 1.35;
      line(c, [[x, y], [x + 30, y - 14]], i % 3 ? "#cf9566" : "#f2bc83", 2);
      box(c, x + 4, y - 1, 1.7, 1.6, "#533e43");
    }
    for (const [x, y] of [[938, 410], [966, 398], [1018, 409], [1050, 418]]) {
      box(c, x, y - 10, 5, 14, "#62423d");
      box(c, x, y - 9, 2, 12, "#bb895f");
      box(c, x - 1, y - 11, 7, 3, k === 3 ? "#e8eeee" : "#d8ab7f");
    }
    line(c, [[966, 389], [986, 398], [1004, 400], [1019, 400]], "#e9bd88", 1.8);
    box(c, 946, 371, 4, 39, "#5a3e3a");
    box(c, 939, 372, 21, 3, "#68483f");
    for (const [x, col] of [[940, k === 3 ? "#b6f6fb" : "#84d6d3"], [953, k === 3 ? "#8b7973" : light]]) {
      box(c, x, 375, 1.5, 4, "#44373b");
      box(c, x - 2, 378, 6, 9, "#513d41");
      box(c, x - 1, 379, 4, 5, col);
    }
    box(c, 918, 388, 18, 18, "#80553d");
    box(c, 920, 391, 14, 6, "#3f3940");
    box(c, 921, 394, 9, 2, "#e2be87");
    box(c, 922, 400, 4, 3, "#e1a56d");
    shape(c, [[914, 388], [919, 380], [935, 380], [940, 388]], k === 3 ? "#d2e2e7" : canvasColor);
    for (let i = 0; i < 4; i++) box(c, 916 + i * 5, 387, 3, 3, i % 2 ? light : canvasColor);
    return canvas2;
  }
  function harbor(c, k, t, departure = 0) {
    const [deep, , glint, wood, sail, light] = palettes[k];
    c.save();
    c.imageSmoothingEnabled = false;
    banks[k] ?? (banks[k] = paintBank(k));
    c.drawImage(banks[k], 902, 298, 188 / 0.75, 180);
    c.save();
    clipIsland(c);
    for (let i = 0; i < 11; i++) {
      const x2 = 1001 + i * 27 % 73 + Math.round(Math.sin(t * 1.4 + i) * 3), y2 = 381 + i * 19 % 43;
      box(c, x2, y2, 3 + i % 3 * 2, 1.3, glint);
    }
    const x = 1045 + departure * 45, y = 401 - departure * 55 + Math.sin(t * 1.5) * 1.1;
    c.translate(x, y);
    c.scale(1.52, 1.42);
    c.globalAlpha = 1 - Math.max(0, (departure - 0.78) / 0.22);
    shape(c, [[-31, 0], [-17, 5], [22, -1], [31, -7], [24, 3], [-11, 12], [-24, 9]], "#483443");
    shape(c, [[-31, -1], [-18, 3], [21, -3], [30, -8], [25, -2], [-12, 8], [-26, 5]], "#ae6744");
    line(c, [[-28, 1], [-14, 6], [23, -2]], "#ffd397", 1.6);
    shape(c, [[-16, 0], [-9, -12], [8, -15], [17, -4]], wood);
    box(c, -7, -10, 5, 6, light);
    box(c, 0, -11, 5, 6, "#6d9ea2");
    shape(c, [[-20, -9], [-10, -17], [8, -20], [14, -14], [-10, -9]], k === 3 ? "#dce9eb" : sail);
    line(c, [[18, -6], [18, -27]], "#775343", 2);
    shape(c, [[19, -26], [31, -24 + Math.sin(t * 3) * 1.5], [19, -20]], "#de7257");
    box(c, -24, 9, 10, 1.2, deep);
    c.restore();
    c.restore();
  }

  // wardrobe.js
  function outfit(c, k, female) {
    const p = (points, color) => {
      c.fillStyle = color;
      c.beginPath();
      points.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y));
      c.closePath();
      c.fill();
    };
    const r = (x, y, w, h, color) => {
      c.fillStyle = color;
      c.fillRect(x, y, w, h);
    };
    if (k === 0 && female) {
      p([[-8, -38], [7, -38], [8, -28], [15, -13], [8, -10], [-13, -12], [-10, -26]], "#df806b");
      r(-8, -40, 3, 11, "#faaf8d");
      r(5, -40, 3, 11, "#faaf8d");
      r(-9, -28, 18, 3, "#803e53");
      for (const [x, y] of [[-8, -20], [4, -15], [6, -24], [-2, -32]]) {
        r(x, y, 3, 1, "#ffebcc");
        r(x + 1, y - 1, 1, 3, "#fff0d1");
      }
    } else if (k === 0) {
      p([[-7, -38], [8, -38], [9, -29], [12, -15], [-10, -15], [-7, -29]], "#367773");
      r(-7, -41, 3, 9, "#8a583e");
      r(5, -41, 3, 9, "#8a583e");
      r(-6, -24, 11, 7, "#224f55");
      r(-4, -27, 2, 7, "#efb961");
    } else if (k === 1 && female) {
      p([[-11, -29], [9, -29], [12, -12], [2, -12], [0, -20], [-2, -12], [-12, -12]], "#304e66");
      p([[-13, -39], [-4, -43], [5, -42], [14, -35], [16, -23], [8, -20], [-13, -22]], "#edb841");
      r(-10, -24, 21, 2, "#a66f37");
      r(1, -37, 2, 13, "#fff0a0");
    } else if (k === 1) {
      for (let y = -37; y < -25; y += 4) r(-10, y, 20, 1.6, "#e0efca");
      r(-7, -40, 3, 16, "#315d70");
      r(6, -40, 3, 16, "#315d70");
      r(-7, -32, 16, 17, "#397485");
      r(-5, -29, 10, 5, "#285567");
      r(-8, -15, 8, 3, "#b8d4c2");
      r(2, -15, 8, 3, "#b8d4c2");
    } else if (k === 2 && female) {
      p([[-10, -32], [8, -32], [16, -11], [-16, -12]], "#814555");
      for (const x of [-9, -2, 5]) p([[x, -24], [x + 2, -24], [x + 5, -12], [x + 1, -12]], "#b66a65");
      p([[-9, -41], [6, -42], [12, -37], [18, -25], [6, -24], [1, -27], [-5, -23], [-18, -25]], "#bc553d");
      p([[-9, -41], [2, -37], [8, -40], [4, -33], [0, -34]], "#f7bc76");
      r(0, -32, 3, 2, "#f8d58a");
    } else if (k === 2) {
      p([[-10, -41], [-4, -40], [0, -31], [6, -41], [11, -37], [11, -17], [5, -15], [0, -18], [-8, -15]], "#88503c");
      r(-9, -29, 8, 2, "#cc9660");
      r(3, -26, 7, 2, "#d5a567");
      r(1, -29, 2, 2, "#f6c87e");
      r(0, -23, 2, 2, "#f6c87e");
    } else {
      p([[-12, -41], [8, -41], [14, -34], [16, -13], [8, -9], [-14, -10], [-14, -31]], female ? "#874b72" : "#335a79");
      p([[-11, -40], [-1, -34], [9, -41], [7, -33], [1, -30], [-6, -33]], "#dfcaae");
      for (let y = -28; y <= -17; y += 6) {
        r(-3, y, 2.5, 2.5, "#e6bc79");
        r(5, y, 2.5, 2.5, "#e6bc79");
      }
      r(-12, -14, 24, 2, "#8da4ae");
      r(-10, -8, 8, 4, "#55454d");
      r(2, -8, 8, 4, "#55454d");
    }
  }

  // breeze.js
  var locations = [
    [[415, 292], [557, 256], [691, 255], [902, 298], [271, 392]],
    [[425, 280], [526, 263], [675, 246], [949, 315], [248, 383]],
    [[434, 272], [548, 264], [726, 257], [942, 315], [257, 382]],
    [[421, 274], [563, 259], [704, 247], [924, 310], [253, 390]]
  ];
  var treeLocations = (k) => locations[k];
  function wind(t, x) {
    const phase = t * 0.89 - x * 6e-3;
    return 0.48 * Math.sin(phase) + 0.27 * Math.sin(phase * 1.83 + 0.6) + 0.25 * Math.sin(t * 0.38 - x * 4e-3);
  }
  function grove(c, sprites3, k, t, reveal) {
    const roots = locations[k];
    const w = sprites3.width / roots.length, h = sprites3.height;
    roots.forEach(([x, y], i) => {
      const gain = reveal ? reveal(x, y) : 1;
      if (gain <= 0) return;
      c.save();
      c.translate(x, y);
      c.globalAlpha *= gain;
      const scale = 1.23 * (0.86 + 0.14 * gain);
      c.scale(scale, scale);
      const sway = wind(t, x) * (k === 3 ? 0.022 : k === 2 ? 0.06 : 0.045);
      c.transform(1, 0, sway, 1, 0, 0);
      c.drawImage(sprites3, i * w, 0, w, h, -73, -163, 146, 171);
      c.restore();
    });
  }
  function meadow(c, k, t) {
    for (const [x, y] of [[320, 423], [373, 464], [451, 489], [757, 495], [878, 461], [1003, 431]]) {
      for (let j = 0; j < 9; j++) {
        const X = x + Math.sin(j * 23) * 11, Y = y + Math.sin(j * 7) * 4, h = 7 + j % 4 * 1.8;
        const dx = (wind(t, X) * 3 + Math.sin(t * 2 + j) * 0.55) * h / 10;
        c.strokeStyle = k === 3 ? "#6b8793" : "#4a7744";
        c.lineWidth = 1;
        c.beginPath();
        c.moveTo(X, Y);
        c.quadraticCurveTo(X + dx * 0.25, Y - h * 0.6, X + dx, Y - h);
        c.stroke();
        c.fillStyle = ["#ffd2d9", "#ffc24b", "#eb9044", "#dc5b69"][k];
        c.beginPath();
        c.ellipse(X + dx, Y - h, 2.1, 1.5, dx * 0.1, 0, 2 * Math.PI);
        c.fill();
      }
    }
    if (k === 3) return;
    const count = k === 2 ? 1 : 4;
    for (let i = 0; i < count; i++) {
      const period = 8.3 + i * 0.8, cycle = (t + i * 2.7) % period, travel = Math.min(1, cycle / (period - 1.65));
      const a2 = travel * 2 * Math.PI, span = 24 + i * 3;
      const x = [366, 486, 764, 879][i] + span * Math.sin(a2) + 6 * Math.sin(a2 * 3);
      const y = [450, 372, 489, 454][i] - (1 - Math.cos(a2)) * 15 - 6 * Math.sin(a2 * 2);
      const wing = 0.16 + 0.84 * Math.abs(Math.sin(t * (travel < 1 ? 14 : 2.6) + i));
      c.save();
      c.translate(x, y);
      c.rotate(0.24 * Math.cos(a2));
      c.scale(wing, 1);
      for (const side of [-1, 1]) {
        c.fillStyle = ["#ffb44e", "#72c8e4", "#f59863", "#edd36c"][i];
        c.beginPath();
        c.ellipse(side * 3, -2.5, 3.6, 4.1, side * 0.52, 0, 2 * Math.PI);
        c.fill();
        c.fillStyle = ["#ed8155", "#6280bd", "#db766a", "#d6a147"][i];
        c.beginPath();
        c.ellipse(side * 2.6, 1.4, 2.7, 2.2, 0, 0, 2 * Math.PI);
        c.fill();
        c.fillStyle = "#fff0bd";
        c.fillRect(side * 4 - 0.6, -4.5, 1.3, 1.3);
      }
      c.restore();
      c.strokeStyle = "#604b46";
      c.beginPath();
      c.moveTo(x, y - 2.5);
      c.lineTo(x, y + 2.3);
      c.stroke();
    }
  }

  // atmosphere.js
  var TAU2 = Math.PI * 2;
  var wrap = (n, size) => (n % size + size) % size;
  var sprites = /* @__PURE__ */ new Map();
  function stamp(k, v) {
    const key = k * 3 + v;
    if (sprites.has(key)) return sprites.get(key);
    const canvas2 = document.createElement("canvas");
    canvas2.width = canvas2.height = 23;
    const c = canvas2.getContext("2d"), r = (x, y, w, h, color) => {
      c.fillStyle = color;
      c.fillRect(x, y, w, h);
    };
    const poly3 = (points, col) => {
      c.beginPath();
      points.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y));
      c.closePath();
      c.fillStyle = col;
      c.fill();
    };
    if (k === 0) {
      const pink = ["#ef88ab", "#df789f", "#f5a0bd"][v];
      poly3([[3, 6], [5, 3], [9, 4], [11, 7], [15, 4], [19, 6], [19, 11], [16, 15], [6, 19], [7, 14], [3, 11]], pink);
      poly3([[5, 5], [8, 5], [11, 8], [8, 10], [5, 9]], "#ffe5dc");
      poly3([[11, 10], [17, 7], [17, 10], [12, 14], [7, 17]], "#ffd1d7");
    } else if (k === 2) {
      const main = ["#e9852e", "#c5533f", "#e8ad46"][v], shadow = ["#b5522c", "#9d3c3a", "#ba762e"][v];
      const leaf = v === 0 ? [[2, 11], [6, 11], [3, 5], [9, 8], [11, 1], [13, 8], [18, 4], [17, 9], [21, 8], [18, 13], [20, 15], [13, 16], [10, 19], [8, 16], [4, 16]] : v === 1 ? [[3, 17], [3, 12], [5, 8], [9, 5], [18, 3], [18, 8], [15, 12], [10, 16]] : [[3, 16], [5, 10], [9, 7], [19, 4], [18, 9], [14, 13], [9, 16]];
      poly3(leaf, main);
      poly3([[5, 16], [9, 12], [14, 9], [10, 15], [7, 17]], shadow);
      for (let j = 0; j < 5; j++) r(4 + 2 * j, 17 - 2 * j, 3, 1, "#ffcd79");
      r(2, 18, 3, 1, "#b6794c");
    } else {
      const ink2 = ["#e4f5ff", "#bed9f1", "#e9e8ff"][v];
      if (v === 1) {
        poly3([[11, 4], [14, 9], [18, 11], [14, 13], [11, 18], [8, 13], [4, 11], [9, 9]], ink2);
        r(10, 9, 3, 3, "#fffdf6");
      } else {
        c.save();
        c.translate(11.5, 11.5);
        c.strokeStyle = ink2;
        c.lineWidth = 1.6;
        for (let n = 0; n < 6; n++) {
          c.rotate(TAU2 / 6);
          c.beginPath();
          c.moveTo(0, 0);
          c.lineTo(0, -9);
          c.moveTo(-2.6, -7);
          c.lineTo(0, -4.5);
          c.lineTo(2.6, -7);
          c.stroke();
        }
        c.restore();
        r(10, 10, 3, 3, "#ffffff");
      }
    }
    sprites.set(key, canvas2);
    return canvas2;
  }
  function airborne(c, k, t, particles, near) {
    const count = (near ? [14, 12, 18, 18] : [82, 94, 95, 128])[k], offset = near ? 140 : 0;
    for (let i = 0; i < count; i++) {
      const [a2, b, z, v] = particles[i + offset], speed = (near ? 1.65 : 0.65) + z * 0.72, phase = v * TAU2;
      const sway = wind(t * 0.63, a2 * 900);
      const x = wrap(a2 * 1460 + t * [24, 17, 34, 12][k] * speed + Math.sin(t * 0.67 + phase) * (k === 1 ? 2 : 18) + sway * (near ? 22 : 10), 1460) - 90;
      const y = wrap(b * 836 + t * [18, 143, 29, 22][k] * speed + Math.cos(t * 0.77 + phase) * (k === 1 ? 0 : 8), 836) - 58;
      c.save();
      c.translate(Math.round(x), Math.round(y));
      c.globalAlpha = (near ? 0.76 : 0.32) + v * (near ? 0.18 : 0.38);
      if (k === 1) {
        c.globalAlpha *= near ? 0.7 : 0.6;
        c.strokeStyle = near ? "#c6e4eb" : "#a3cfda";
        c.lineWidth = near ? 1.8 : 0.85;
        c.beginPath();
        c.moveTo(0, 0);
        c.lineTo(1.8 + speed, 6 + speed * 5);
        c.stroke();
      } else if (!near && z < 0.47) {
        c.fillStyle = ["#ffcbdb", "", "#edab5a", "#d6eafc"][k];
        c.fillRect(0, 0, 1.5 + z * 5, 1.4 + z * 3);
      } else {
        const size = (near ? [23, 0, 27, 22][k] : [9, 0, 12, 8][k]) * (0.62 + z * 0.7);
        c.rotate(phase + Math.sin(t * 0.7 + phase) * 0.8 + t * (k === 2 ? 0.65 : 0.28));
        if (k !== 3) c.scale(0.4 + 0.6 * Math.abs(Math.cos(phase + t * 0.85)), 1);
        c.drawImage(stamp(k, i % 3), -size / 2, -size / 2, size, size);
      }
      c.restore();
    }
  }
  function springOrAutumn(c, k, t, particles) {
    const trees2 = treeLocations(k);
    for (let i = 0; i < 24; i++) {
      const [a2, b, z, v] = particles[230 + i], [x, y] = trees2[i % trees2.length], period = 5 + b * 4;
      const f = wrap(t / period + v, 1), gust = wind(t, x);
      c.save();
      c.globalAlpha = Math.min(1, f * 8, (1 - f) * 6) * (0.48 + z * 0.45);
      c.translate(x - 26 + a2 * 49 + f * (46 + b * 72) + gust * 10, y - 119 + a2 * 47 + f * 68 + Math.sin(f * 8 + v * 3) * 8);
      c.rotate(v * 6 + f * 4);
      const s2 = 6 + z * 7;
      c.drawImage(stamp(k, i % 3), -s2 / 2, -s2 / 2, s2, s2);
      c.restore();
    }
  }
  function summer(c, t, particles) {
    c.save();
    c.beginPath();
    c.ellipse(778, 320, 62, 17, 0, 0, TAU2);
    c.clip();
    for (let i = 0; i < 11; i++) {
      const [a2, b, z] = particles[210 + i], f = wrap(t * (0.67 + z * 0.3) + a2, 1);
      c.globalAlpha = 0.56 * (1 - f);
      c.strokeStyle = "#c8f6ef";
      c.lineWidth = 1.3;
      c.beginPath();
      c.ellipse(726 + a2 * 108, 307 + b * 25, 1 + f * 9, 1 + f * 2.3, 0, 0, TAU2);
      c.stroke();
    }
    c.restore();
    for (let i = 0; i < 24; i++) {
      const [a2, b, z, v] = particles[260 + i];
      const x = 335 + a2 * 654 + Math.sin(t * 0.68 + v * 9) * 16, y = 300 + b * 155 + Math.cos(t * 0.91 + a2 * 8) * 8;
      const pulse = 0.5 + 0.5 * Math.sin(t * (0.86 + z) + v * 14);
      c.globalAlpha = 0.18 + 0.8 * pulse * pulse;
      const g = c.createRadialGradient(x, y, 0, x, y, 8);
      g.addColorStop(0, "#e9f5a9a0");
      g.addColorStop(1, "#d8ed7000");
      c.fillStyle = g;
      c.fillRect(x - 8, y - 8, 16, 16);
      c.fillStyle = "#fff4ab";
      c.fillRect(x - 1, y - 1, 2.6, 2.6);
    }
  }
  function atmosphere(c, k, t, particles) {
    c.save();
    c.imageSmoothingEnabled = false;
    airborne(c, k, t, particles, false);
    if (k === 1) summer(c, t, particles);
    if (k === 0 || k === 2) springOrAutumn(c, k, t, particles);
    airborne(c, k, t, particles, true);
    c.restore();
  }

  // weather.js
  function umbrella(c, opening) {
    if (opening <= 0) return;
    c.save();
    c.strokeStyle = "#64404a";
    c.lineWidth = 2.2;
    c.beginPath();
    c.moveTo(-4, 4);
    c.quadraticCurveTo(0, 10, 0, 2);
    c.lineTo(0, -68);
    c.stroke();
    c.translate(0, -68);
    c.scale(opening, 0.45 + 0.55 * opening);
    const colors2 = ["#923f51", "#d75d54", "#ee825e", "#a84a53"];
    for (let j = 0; j < 4; j++) {
      const left2 = -50 + j * 25, right = left2 + 25;
      c.beginPath();
      c.moveTo(0, 0);
      c.quadraticCurveTo(left2 * 0.78, 4, left2, 24);
      c.quadraticCurveTo((left2 + right) / 2, 18, right, 24);
      c.quadraticCurveTo(right * 0.78, 4, 0, 0);
      c.fillStyle = colors2[j];
      c.fill();
    }
    c.fillStyle = "#eac295";
    c.fillRect(-1, -2, 2, 3);
    c.restore();
  }

  // wildlife.js
  var sprites2 = {
    rabbit: ["...a.a......", "...aba......", "...aba......", "..aaabaa....", "..abbcba....", "...abbbbaa..", ".aaabbbbbba.", "abbbbbbbbbaa", ".aabbbbbbbba", "...aaabbaaaa"],
    frog: ["..aa...aa...", ".abca.abca..", "aabbbabbbbaa", "abbbbbbbbbba", ".abbdddbbba.", "..adddddda..", ".abbbbbbbba.", "aaa......aaa"],
    fox: [".a..a..........", ".ababa.........", ".abbba.........", "aabbbba........", "acbcbba.....ad.", ".addba.....abda", "..abbbaaa.abbaa", "..abbbbbbabbaa.", "..abbddbbbbaa..", "..aaabbbbaa....", "..aa...aa......"],
    bird: [".....aa....", "....abbad..", "....acbaa..", "...abbbba..", ".aabdddbba.", "abbbdddbba.", ".aabbbbaa..", "....a.a...."],
    deer: ["..a.a.......", "..aaa.a.....", "...aaaa.....", "...abbba....", "...acbbda...", "....abba....", "....abbaa...", ".aaabbbba...", "abbbdbbbba..", "abdbbbbbba..", ".abbbbbbaa..", "..ab..aba...", "..aa...aa..."]
  };
  sprites2.hedgehog = [".....a.....", "..aaaaaaa..", ".ababababa.", "aababababb.", "abbbbbbbddc", "..aa..aa..."];
  sprites2.squirrel = [".......aaa.", "..a.a.abbbb", ".abab.abbaa", ".acbbabbba.", "..abbabba..", "..abbbbba..", "..aabbbba..", ".aa..aaa..."];
  var palettes2 = { rabbit: ["#806875", "#e9cab0", "#362f41", "#f7ebd1"], frog: ["#295f50", "#74aa4b", "#faf0b6", "#b6cf73"], fox: ["#72443a", "#e47936", "#392f39", "#f4dab0"], bird: ["#3a424f", "#877b70", "#222a36", "#dba565"], deer: ["#604f52", "#ab8064", "#342f36", "#e1c8a3"] };
  palettes2.hedgehog = ["#64523a", "#ac8651", "#312e36", "#e2b680"];
  palettes2.squirrel = ["#854533", "#dd8147", "#352d37", "#ebc38a"];
  var visitors = [["rabbit", "bird", "squirrel"], ["frog", "bird", "rabbit"], ["fox", "hedgehog", "squirrel"], ["deer", "rabbit", "bird"]];
  function passing(c, k, t) {
    for (let i = 0; i < 8; i++) {
      const period = 13 + i % 4 * 2, cycle = (t + i * 4.7) % period;
      if (cycle > period - 2.4) continue;
      const progress = cycle / (period - 2.4), angle = [0.6, 2.55, -0.43, 2.86, 1.22, 2.09, 0.14, 1.76][i];
      const r = 0.46 + 0.54 * progress;
      const x = 640 + 465 * r * Math.cos(angle) + 4 * Math.sin(cycle * 1.2) * (1 - progress);
      const y = 381 + 155 * r * Math.sin(angle);
      const edge = Math.hypot((x - 640) / 465, (y - 381) / 155);
      const alpha = Math.min(1, cycle * 2, Math.max(0, (1 - edge) / 0.12));
      c.save();
      c.globalAlpha = alpha;
      pixelSprite(c, visitors[k][i % 3], x, y, 1.15 + i % 4 * 0.23, t + i, i);
      c.restore();
    }
  }
  var groups = [
    [["rabbit", 467, 417, 2], ["rabbit", 495, 409, 1.4], ["bird", 795, 350, 1.4]],
    [["frog", 826, 342, 1.6], ["frog", 735, 346, 1.35], ["bird", 506, 347, 1.55]],
    [["fox", 503, 413, 2.1], ["bird", 492, 322, 1.4], ["bird", 520, 326, 1.25]],
    [["deer", 497, 411, 2.4], ["rabbit", 820, 448, 1.65], ["bird", 456, 341, 1.55]]
  ];
  function pixelSprite(c, name, x, y, size, t, i) {
    const flight = name === "bird", cycle = (t * 0.32 + i * 0.76) % 3, move = cycle < 1.25;
    const progress = Math.min(1, cycle / 1.25), shift = (1 - Math.cos(progress * Math.PI * 2)) * 7;
    const hop = move ? Math.abs(Math.sin(progress * 2 * Math.PI)) * (flight ? 8 : name === "frog" ? 9 : name === "rabbit" ? 6 : 1.6) : 0;
    c.fillStyle = "#36493b42";
    c.fillRect(Math.round(x + shift - 6), Math.round(y), 13, 2);
    c.save();
    c.translate(Math.round(x + shift), Math.round(y - hop));
    c.scale(i % 2 ? -size : size, size);
    const shape2 = sprites2[name], colors2 = palettes2[name];
    shape2.forEach((row, j) => {
      for (let k = 0; k < row.length; k++) {
        const n = "abcd".indexOf(row[k]);
        if (n < 0) continue;
        c.fillStyle = colors2[n];
        c.fillRect(k - 6, j - shape2.length + (name === "deer" && j < 5 && !move ? Math.round(Math.sin(t * 0.8) * 0.6) : 0), 1.04, 1.04);
      }
    });
    c.restore();
  }
  function wildlife(c, k, t) {
    passing(c, k, t);
    groups[k].forEach(([name, x, y, z], i) => pixelSprite(c, name, x, y, z, t, i));
    if (k === 1) {
      for (let i = 0; i < 4; i++) {
        const x = 765 + Math.sin(t * 0.48 + i) * 28 + i * 6, y = 290 + Math.cos(t * 0.9 + i) * 11;
        c.fillStyle = "#e0eecc";
        c.fillRect(x - 5, y - 2, 10, 1);
        c.fillStyle = "#238486";
        c.fillRect(x, y - 3, 1.5, 6);
      }
    }
  }

  // stories.js
  function captionText(words) {
    return words.replace(/。([”」』）]*)$/u, "$1");
  }
  var people = ["阿岑", "棠梨"];
  var a = (text, act, thought) => ({ who: 0, text, act, thought });
  var l = (text, act, thought) => ({ who: 1, text, act, thought });
  var episodes = [
    {
      title: "跳板窄，只借一只手",
      place: "tree",
      task: "去樱树下捡回那张航图",
      found: "图纸压住了。她还踩着晃悠悠的跳板。",
      before: [
        l("别踩！你脚底下是我画了一早上的右岸。", "point"),
        a("那我倒想知道，我左脚站的是河还是你家？", "look"),
        l("河。你家那扇歪窗户我还没舍得画。", "smile"),
        a("原来每天趴在船头偷看我窗户的是你。", "lean"),
        l("我看水尺！……顺便看的。", "shy"),
        a("风又起来了。图给我，你先下来。", "reach")
      ],
      paths: [
        ["扶她下跳板", "手给我。那块木头一头翘，别逞能。", "我知道。你能不能先把眼睛睁开？", "沾了泥的铜尺", "reach"],
        ["系好图筒", "我把图拴在你腕上。另一只手归我扶。", "你耳朵怎么红了？绳子又没勒在那儿。", "图筒上的红绳", "tie"]
      ],
      after: [
        l("到了。阿岑，我已经站在地上了。", "look"),
        a("哦。那……手还你。", "shy"),
        l("也没说急着要。你手上全是铜屑，扎人。", "smile"),
        a("下回我洗干净。你明天还量吗？", "lean"),
        l("量。明早要是窗户开着，我就敲两下。", "wave"),
        a("那我今晚先把窗轴上点油。省得起晚了。", "smile")
      ]
    },
    {
      title: "黄灯下面有两只碗",
      place: "dock",
      task: "到右岸把两盏灯分开挂",
      found: "棠梨走到跳板尽头。阿岑从她站的位置看，才发现两盏灯重了影。",
      before: [
        a("往左半步。现在看得清是哪盏了吗？", "point"),
        l("黄的。蓝的让你脑袋挡住了。", "smile"),
        a("黄灯能靠，蓝灯绕行。那我要是想你了呢？", "raise"),
        l("你可别给我发明第三盏。", "lean"),
        a("不挂灯。灶上留一碗面，你闻着就回来。", "smile"),
        l("面里有葱吗？有的话我这就掉头。", "look")
      ],
      paths: [
        ["给她挑葱", "我都捞到自己碗里了。一根一根数的。", "难怪你那碗绿得像池塘。", "压在碗下的菜单", "give"],
        ["把约定画在图上", "画黄灯的地方，旁边留只小碗。", "那你得擦干净手，帮我按个指印。", "画着两只碗的航图", "map"]
      ],
      after: [
        l("你真打算天天给我留啊？", "look"),
        a("嗯。我想和你过日子，先从晚饭开始。", "reach"),
        l("那我先说好，我会有赶不上饭的时候。", "lean"),
        a("我给你留汤。面等你回来再下。", "smile"),
        l("成交。今天的先分我一口，我饿了。", "give"),
        a("筷子在我这儿。你再靠过来一点。", "lean")
      ]
    },
    {
      title: "同一把伞的两边",
      place: "dock",
      task: "去栈桥下看被水漫过的刻度",
      found: "水尺第三格已没进河里。棠梨的湿袖口露出一张船单。",
      before: [
        a("都往里站了，你怎么还在滴水？", "look"),
        l("因为你一直在给我的图撑伞。", "smile"),
        a("过来。图夹中间，人站我这边。", "reach"),
        l("昨晚看见你的蓝灯了。后面那条粮船差点跟错。", "look"),
        a("怪不得两声笛挨那么近。我一晚上没敢摘灯。", "raise"),
        l("下游的弯还没人量，我跟领航队说我去。", "map")
      ],
      paths: [
        ["摊开排班单", "这张单上，怎么连下个月都有你的名字？", "本来只跑三天。下游多塌了一处岸。", "浸过雨的船单", "map"],
        ["替她拧袖口", "别拿手背蹭，墨要花了。写的哪天回来？", "最后一栏是空的。我也不知道。", "晾过的船期表", "reach"]
      ],
      after: [
        a("你什么时候答应的？", "look"),
        l("昨天。吃面的时候，话到嘴边，你又给我添了汤。", "shy"),
        a("原来我还问你淡不淡。你说刚好。", "look"),
        l("汤是真刚好。别的事，我是真没敢说。", "lean"),
        a("我宁可你那会儿就说。伞给你拿稳，我去收缆。", "give"),
        l("他左边肩膀湿透了。我刚才怎么没看见。", "look", "rain")
      ]
    },
    {
      title: "凉了三回的面",
      place: "lamp",
      task: "去路灯下对一对换班的日子",
      found: "雨从伞沿滴在值班簿上。阿岑用袖口擦了两次，日期还是糊了。",
      before: [
        l("你门怎么开着？风把炉子都吹灭了。", "look"),
        a("我听见船响，以为是你。面热过三回了。", "give"),
        l("对不起。上游封航，我托了人带话。", "lean"),
        a("带话的人就在你后面那条船上。", "look"),
        l("我站船头也能看见这把伞。每趟都是同一个地方。", "look", "rain"),
        a("我换了下个月的班。要不我陪你走一趟？", "letter")
      ],
      paths: [
        ["翻到换班那一页", "你把师傅的名字也填了？他手还在抖呢。", "我知道。我填完，橡皮都拿出来了。", "擦薄的换班页", "map"],
        ["问那三碗面", "你一直等到几点？你自己吃了没有？", "没吃。到后来连我都分不清，我在等饭还是等你。", "锅沿上的面粉印", "lean"]
      ],
      after: [
        l("我一进门就怕你问，下次几点。", "shy"),
        a("我也怕。不问，像我根本不惦记你。", "look"),
        l("你可以只说，你想我。", "reach"),
        a("……想。可我现在还在生气。", "look"),
        l("那我陪你生一会儿气。给我半边伞。", "lean"),
        a("过来吧。先回去生炉子，汤还能喝。", "reach")
      ]
    },
    {
      title: "一张多买的船票",
      place: "lamp",
      task: "在灯下展开单程船票",
      found: "棠梨把卷了边的票压平。票背上抄着阿岑怕忘掉的换灯日。",
      before: [
        a("头回见这树叶变黄，你说它像一锅煎蛋。", "smile"),
        l("那天我饿。今天我带了栗子，你剥一颗。", "give"),
        a("有件事。我买了明早的船票。", "letter"),
        l("你晕船，阿岑。上回过河是谁抱着桶？", "look"),
        a("这次我带了姜。你不是要签一年吗？", "lean"),
        l("签了。我想自己告诉你，又让你先听到了。", "shy")
      ],
      paths: [
        ["把票递给她", "你看，我真想好了。连铺位都是靠窗的。", "我看见票了。你跟师傅说过，是你自己想走吗？", "折过的单程票", "letter"],
        ["把铜芯拿出来", "我整理行李，第一个塞的居然是这个。", "这是岸灯的芯。船上根本用不上。", "一枚旧铜芯", "key"]
      ],
      after: [
        a("昨晚师傅来找你了？你怎么没跟我说。", "look"),
        l("他当着我的面问，非得把阿岑带走吗？你就在门口。", "reach"),
        a("我听见了。我刚答应替他守冬班，没脸跟他说我反悔了。", "shy"),
        l("我一个人跟他解释了半天。我一直等你进来。", "look"),
        a("是我买的票，却让你替我挨了那句话。对不起。", "give"),
        l("我知道你也难开口。可昨晚我是真想你站在我旁边。", "lean")
      ]
    },
    {
      title: "秋天最后一班船",
      place: "dock",
      task: "陪她走到跳板旁边",
      found: "末班船敲了两下钟。他们在跳板前停住，谁也没伸手去提箱子。",
      before: [
        l("以前觉得这段路好长。今天怎么几步就到了。", "look"),
        a("我还能送你过跳板。", "reach"),
        l("别送了。阿岑，我们分手吧。", "look"),
        a("明早还有一班。留下来吃顿饭，再走，好吗？", "shy"),
        l("我怕再坐到你对面，就说不出口了。让我走吧。", "look"),
        a("我明天去找师傅。这话早该是我去说。", "lean")
      ],
      paths: [
        ["把原图留在岸上", "右岸这张给你。歪窗户我画进去了。", "还真是歪的。等我修直了，你这图就不准了。", "留下的右岸航图", "map"],
        ["还他那根绳", "这根绳还你。那个活结我现在闭着眼也会打。", "留着扎你的图吧。船上风大。", "留在图筒上的绳结", "tie"]
      ],
      after: [
        l("别一个人把两碗都吃了。", "shy"),
        a("知道。你也别总拿凉栗子当饭。", "look"),
        l("那……我走了。", "wave"),
        a("嗯。踩左边那块，右边有点晃。", "point"),
        a("明天就把那块板钉好。", "look"),
        a("怎么手还在这儿举着。", "shy")
      ]
    },
    {
      title: "雪里先到的一封信",
      place: "dock",
      task: "去码头信匣拆开带水印的信封",
      found: "新航图寄到了。歪窗户旁边，多了一行棠梨自己的字。",
      before: [
        a("这封最厚。又是催我报水位的吧。", "letter"),
        a("咦，窗户还是歪的。画它的人也没改。", "smile"),
        a("那天她笑得手都在抖，硬说是船晃。", "look", "portrait"),
        a("我把窗修好了，倒有点舍不得告诉她。", "shy"),
        a("背面还有字……“周三午后靠右岸。愿意见我吗？”", "map"),
        a("今天不就是周三？我的手套呢。", "look")
      ],
      paths: [
        ["把信折进口袋", "先把手套戴上。上回手冰得人家一哆嗦。", "……掉了一只。算了，一只也行。", "口袋里的一封信", "letter"],
        ["把灯玻璃擦亮", "有雾。先顾好靠岸的人，别又光顾着找她。", "黄灯挂好了。信上说靠右岸，我就在这儿等。", "擦亮的灯罩", "lamp"]
      ],
      after: [
        l("阿岑，你手套掉在跳板上了。", "give"),
        a("还真让你捡着了。你踩那块板，晃不晃？", "look"),
        l("不晃。你钉好了。", "smile"),
        a("嗯。你那天走了，第二天一早钉的。", "shy"),
        l("我这趟请了两天假。能陪我走一会儿吗？", "reach"),
        a("能。码头风大，往灯底下走。", "lean")
      ]
    },
    {
      title: "这回等你到了再下面",
      place: "lamp",
      task: "到暖灯下，把两个人想说的话说完",
      found: "雪落上她的袖口。阿岑伸出手，等她自己把手递过来。",
      before: [
        l("秋天那天，我说分手是认真的。今天，我想听你把话说完。", "look"),
        a("我后来照样守灯，面也学会只下一人份了。就是想你。", "shy"),
        l("我也想你。尤其是下雨，船顶滴水，像你那把破伞。", "smile", "rain"),
        a("你走的第二天，我就去找师傅了。", "look"),
        a("我跟他说清楚了，票是我自己买的。那天让你一个人站着，对不起。", "lean"),
        l("我收到你那封信了。其实我最想听的，就是你刚刚这句。", "reach")
      ],
      paths: [
        ["把下一程告诉他", "下周一出航，归期还没定。能写信我就写。", "好。我给你回信，讲讲岸上的事，不催你赶船。", "两个人的通信地址", "letter"],
        ["把手递过去", "我下趟还会走。现在这只手，你还愿意牵吗？", "愿意。你走你的船，我守我的灯。想你了我就说。", "一双没戴齐的手套", "reach"]
      ],
      after: [
        a("棠梨，我还想跟你在一起。我们重新在一起，好吗？", "reach"),
        l("好。阿岑，先让我抱一下。", "embrace"),
        a("手给我。面还在锅边，咱们回去吃。", "reach"),
        a("晚饭想吃什么？今天不着急，我等你点。", "smile"),
        l("面，不要葱。还是这只碗，你还记得。", "lean"),
        a("记得。你那份葱，都在我碗里呢。", "supper")
      ]
    }
  ];
  function pathLines(id, choice) {
    const ep = episodes[id], path = ep.paths[choice], who = id % 2;
    return [{ who, text: path[1], act: path[4] }, { who: id === 6 ? 0 : 1 - who, text: path[2], act: "look" }];
  }

  // timeline.js
  var chapters = [
    { name: "春 · 初见", accent: "#f1c9cb", start: 0, end: 2.83, words: ["那边的樱花开了。", "再陪我走一会儿吧。"] },
    { name: "夏 · 远行", accent: "#bad8af", start: 2.83, end: 6.83, words: ["你要走了吗？", "风把你的声音吹远了。"] },
    { name: "秋 · 告别", accent: "#edbc86", start: 6.83, end: 11.75, words: ["那天，你没有回头。", "那片叶子，我还留着。"] },
    { name: "冬 · 归岸", accent: "#c4d9ea", start: 11.75, end: 19.48, words: ["还记得那年春天吗？", "等雪化了，花还会开。"] }
  ];
  var clamp = (x) => Math.max(0, Math.min(1, x));
  function poses(k, u) {
    const s2 = clamp(u), ease = s2 * s2 * (3 - 2 * s2);
    const boy = [455 + 67 * ease, 963 - 83 * ease, 832 + 102 * ease, 923 - 67 * ease][k];
    const girl = [535 + 48 * ease, 994 - 85 * ease, 896 + 126 * ease, 0][k];
    return {
      boy,
      girl,
      boyY: [381 + 25 * ease, 421 + 7 * Math.sin(s2 * Math.PI), 429 - 10 * ease, 410 + 18 * ease][k],
      girlY: [385 + 23 * ease, 424 + 7 * Math.sin(s2 * Math.PI), 427 - 6 * ease, 0][k],
      girlAlpha: k === 3 ? 0 : 1
    };
  }

  // encounters.js
  var panel = document.querySelector("#dialogue");
  var talker = document.querySelector("#speaker");
  var line2 = document.querySelector("#line");
  var coords = { pond: [747, 380], lamp: [874, 424], tree: [454, 348], dock: [970, 419] };
  var winterPair = null;
  var history = {};
  try {
    const stored = JSON.parse(localStorage.getItem("island-harbor-letters") || "{}");
    for (let i = 0; i < 8; i++) if ([0, 1].includes(stored?.[i])) history[i] = stored[i];
  } catch {
  }
  var encounter = null;
  var motion = null;
  var season = 0;
  var lastPose = null;
  var departurePose = null;
  var notify = () => {
  };
  function bindStories(refresh) {
    notify = refresh;
    document.querySelectorAll("[data-talk]").forEach((b) => b.onclick = () => startStory(Number(b.dataset.talk)));
    document.querySelector("#journal").onclick = () => {
      const d = document.querySelector("#notebook");
      d.querySelector("ol").replaceChildren(...episodes.map((ep, i) => {
        const li = document.createElement("li");
        const choice = ep.paths[history[i]];
        li.textContent = ep.title + "　" + (choice ? choice[3] : "尚未留下纪念物");
        return li;
      }));
      d.showModal();
    };
    document.querySelector("#notebook button").onclick = () => document.querySelector("#notebook").close();
  }
  function chapterStory(k, entry) {
    closeStory();
    season = k;
    winterPair = k === 3 && entry?.girlAlpha > 0 ? { girl: entry.girl, girlY: entry.girlY } : null;
    motion = null;
    lastPose = null;
    departurePose = k === 2 && entry?.girlAlpha === 0 ? entry : null;
  }
  function closeStory() {
    encounter = null;
    panel.hidden = true;
    document.querySelectorAll(".quest-target").forEach((b) => b.classList.remove("quest-target"));
    notify();
  }
  function moveTo(dest, kind, who) {
    const from = lastPose || poses(season, 0);
    motion = { at: performance.now(), from: { ...from }, dest, kind, who };
    notify();
  }
  function busy(now) {
    return motion && now - motion.at < (motion.kind === "board" ? 5e3 : 3400);
  }
  function poseAt(k, u, now) {
    if (departurePose) return { ...departurePose, steps: [0, 0], gesture: "listen", acting: [] };
    const p = poses(k, u);
    if (k === 3 && winterPair) Object.assign(p, winterPair, { girlAlpha: 1 });
    if (!motion) {
      lastPose = p;
      return p;
    }
    if (motion.kind === "board") {
      const f = clamp((now - motion.at) / 2900), slide = f * f * (3 - 2 * f);
      Object.assign(p, motion.from, {
        girl: motion.from.girl + (1041 - motion.from.girl) * slide,
        girlY: motion.from.girlY + (409 - motion.from.girlY) * slide,
        girlAlpha: f < 1 ? 1 : 0,
        steps: [0, Math.sin(f * 22) * (f < 1 ? 1 : 0)],
        facing: [1, 1],
        gesture: "listen",
        departure: clamp((now - motion.at - 2900) / 2e3)
      });
      if (p.departure === 1) departurePose = p;
      lastPose = p;
      return p;
    }
    const raw = clamp((now - motion.at) / 1e3), ease = raw * raw * (3 - 2 * raw), [x, y] = motion.dest;
    for (const [key, target] of Object.entries({ boy: x - 25, girl: x + 26, boyY: y, girlY: y - 2 })) {
      p[key] = (motion.from[key] ?? 472) * (1 - ease) + target * ease;
    }
    p.walk = raw < 1 ? Math.sin(raw * Math.PI * 6) * (1 - raw) : 0;
    p.moods = motion.moods;
    p.look = [1, -1];
    p.turn = [1, -1];
    p.acting = [0, 1].map((i) => ({ speaking: !panel.hidden && motion.who === i, head: Math.sin(now * 2e-3 + i) * 0.035 }));
    p.gesture = motion.kind;
    p.actor = motion.who;
    p.phase = clamp((now - motion.at - 650) / 1450);
    p.age = (now - (motion.cueAt ?? motion.at)) / 1e3;
    if (encounter?.id === 6 && encounter.index >= 4 && encounter.index <= 7) {
      p.letter = true;
      p.acting[0].right = -1.36;
      p.waitFocus = encounter.focus;
    }
    if (encounter?.id === 7 || motion.kind === "supper") dinnerFinale(p, motion.contactTime ?? 22, 5, 4);
    lastPose = p;
    return p;
  }
  function startStory(who) {
    if (departurePose || motion?.kind === "board") return;
    closeStory();
    const id = season * 2 + who, ep = episodes[id], choice = history[id] === void 0 ? 0 : 1 - history[id];
    if (season === 3) winterPair = who ? { girl: 999, girlY: 422 } : null;
    const start = poses(season, 0);
    encounter = { id, choice, index: -1, start: null, cues: [...ep.before, ...pathLines(id, choice), ...ep.after] };
    moveTo(id === 5 ? coords.dock : [start.boy + 25, start.boyY], "listen", who);
    if (season === 3 && who) {
      motion.from.girl = 999;
      motion.from.girlY = 422;
    }
    notify();
  }
  function updateStory(seconds) {
    if (!encounter) return;
    const e = encounter, ep = episodes[e.id];
    e.start ?? (e.start = seconds);
    const i = Math.floor((seconds - e.start) / 4.4);
    const elapsed = seconds - e.start;
    if (e.id === 6) e.focus = clamp((elapsed - 5.5 * 4.4) / 2.4) * clamp((8 * 4.4 - elapsed) / 2.4);
    if (e.id === 7 && motion) motion.contactTime = elapsed - 9 * 4.4 + 0.62;
    if (i === e.index) return;
    if (i >= e.cues.length) {
      history[e.id] = e.choice;
      try {
        localStorage.setItem("island-harbor-letters", JSON.stringify(history));
      } catch {
      }
      closeStory();
      if (e.id === 5) moveTo(coords.dock, "board", 1);
      return;
    }
    e.index = i;
    const cue = e.cues[i];
    if (i === ep.before.length) moveTo(coords[ep.place], cue.act, cue.who);
    if (season === 3 && cue.who === 1 && !winterPair) {
      winterPair = { girl: 1040, girlY: 409 };
      moveTo(coords.dock, "listen", 1);
      motion.from.girl = 1040;
      motion.from.girlY = 409;
    }
    Object.assign(motion, { kind: cue.act ?? "listen", who: cue.who, moods: moods(e.id, i, cue.who), cueAt: performance.now() });
    panel.hidden = false;
    panel.dataset.thought = cue.thought || "";
    talker.textContent = people[cue.who];
    line2.textContent = captionText(cue.text);
  }

  // world.js
  var TAU3 = 2 * Math.PI;
  function line3(c, pts, col, w = 1) {
    c.beginPath();
    pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y));
    c.strokeStyle = col;
    c.lineWidth = w;
    c.stroke();
  }
  function poly(c, pts, col) {
    c.beginPath();
    pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y));
    c.closePath();
    c.fillStyle = col;
    c.fill();
  }
  function ell(c, x, y, rx, ry, col) {
    c.fillStyle = col;
    c.beginPath();
    c.ellipse(x, y, rx, ry, 0, 0, TAU3);
    c.fill();
  }
  function distance(c, k, t) {
    const colors2 = [["#674c87", "#a791b4", "#dfabc1"], ["#295677", "#7ab1ae", "#d1d6ac"], ["#7d4e66", "#cb9b86", "#ecce9b"], ["#475888", "#93b4d0", "#c7e0f2"]][k];
    for (const [x, y, z] of [[119, 362, 0.71], [1120, 274, 0.72], [1170, 504, 0.37], [201, 538, 0.31]]) {
      c.save();
      c.translate(x, y + 1.4 * Math.sin(0.4 * t + x));
      c.scale(z, z);
      c.globalAlpha = 0.62;
      poly(c, [[-82, 0], [-64, 15], [-39, 19], [-20, 45], [2, 22], [29, 28], [40, 13], [62, 8], [77, -2], [29, -12], [-31, -11]], colors2[0]);
      poly(c, [[-82, 0], [-39, -8], [17, -14], [77, -2], [32, 7], [-22, 8]], colors2[1]);
      for (let j = 0; j < 6; j++) {
        const X = -55 + j * 19, h = 12 + 10 * Math.sin(j * 2 + x);
        poly(c, [[X, -4], [X + 6, -h], [X + 11, -4]], colors2[0]);
      }
      if (x > 1e3 && z > 0.5) {
        poly(c, [[-11, -7], [-7, -67], [2, -67], [8, -7]], colors2[2]);
        c.fillStyle = "#ae706a";
        c.fillRect(-7, -63, 11, 7);
        poly(c, [[-12, -69], [-3, -78], [6, -69]], colors2[0]);
        const phase = t * 0.59 + 2.7, side = Math.cos(phase), front = Math.sin(phase);
        const ex = -3 + side * 164, ey = -65 + front * 22, spread = 9 + 7 * (1 + front);
        const gradient = c.createLinearGradient(-3, -65, ex, ey);
        gradient.addColorStop(0, "rgba(255,236,175," + (0.64 + 0.12 * front) + ")");
        gradient.addColorStop(0.55, "#ffe8b22e");
        gradient.addColorStop(1, "#ffe7a900");
        poly(c, [[-3, -67], [ex - 4 * front, ey - spread], [ex + 4 * front, ey + spread], [-3, -63]], gradient);
        const flare = Math.max(0, front) ** 7;
        const halo = c.createRadialGradient(-3, -65, 0, -3, -65, 9 + flare * 8);
        halo.addColorStop(0, "#fff2b7bf");
        halo.addColorStop(1, "#ffde9000");
        c.fillStyle = halo;
        c.fillRect(-23, -85, 40, 40);
        ell(c, -3, -65, 2.4 + flare, 2.1, "#fff7cf");
      }
      c.restore();
    }
    c.save();
    c.translate(1074 + 5 * Math.sin(t * 0.28), 170 + 4 * Math.sin(0.5 * t));
    c.scale(0.77, 0.77);
    for (const [dx, rx, col] of [[0, 16, "#bb6270"], [-4, 9, "#f5aa77"], [-5, 3.5, "#ffe0a1"]]) ell(c, dx, 0, rx, 19, col);
    for (const dx of [-11, 0, 11]) line3(c, [[dx, 13], [dx * 0.34, 32]], "#d2b399", 1);
    poly(c, [[-6, 30], [6, 30], [4, 37], [-4, 37]], "#a0725b");
    c.restore();
    for (let i = 0; i < 5; i++) {
      let x = 307 + i * 24 + t * (4 + i * 0.6), y = 103 + i % 3 * 9 + 3 * Math.sin(t + i);
      let f = 3 * Math.sin(t * 4 + i);
      line3(c, [[x - 5, y + f], [x - 2, y - 1], [x, y + 1], [x + 3, y - 2], [x + 7, y + f - 1]], "#eacac3", 1.3);
    }
  }
  function life(c, k, t, lit) {
    if (k === 3) for (let i = 0; i < 5; i++) {
      let u = (t * 0.19 + i / 5) % 1;
      ell(c, 361 + 13 * u + 3 * Math.sin(u * 6), 253 - 37 * u, 2 + 4 * u, 2 + 3 * u, "rgba(235,217,206," + 0.32 * (1 - u) + ")");
    }
    if (k === 3) for (let i = 0; i < 3; i++) {
      const u = (t * 0.44 + i / 3) % 1, x = 530 + 2 * Math.sin(t + i), y = 308 - 12 * u;
      c.strokeStyle = "rgba(251,241,219," + 0.46 * (1 - u) + ")";
      c.lineWidth = 1.5;
      c.beginPath();
      c.moveTo(x, y);
      c.quadraticCurveTo(x - 3, y - 3, x + 1, y - 7);
      c.stroke();
    }
    if (k === 1) {
      for (let i = 0; i < 2; i++) {
        let x = 764 + Math.sin(t * 0.32 + i) * 11 + i * 18, y = 321 + i * 7;
        ell(c, x, y + 1, 9, 2, "#9ce5dc");
        ell(c, x, y - 1, 5.7, 2.7, "#fff1c7");
        ell(c, x + 4, y - 4, 2.6, 2.5, "#f5dd9a");
        poly(c, [[x + 6, y - 4], [x + 10, y - 3], [x + 6, y - 2]], "#dd8749");
      }
    }
  }
  function token(c, type, x, y, size = 1) {
    c.save();
    c.translate(x, y);
    c.scale(size, size);
    if (type === "flower") {
      for (let j = 0; j < 5; j++) {
        let a2 = j * TAU3 / 5;
        ell(c, 4 * Math.cos(a2), 4 * Math.sin(a2), 3.3, 3, "#ff829a");
      }
      ell(c, 0, 0, 2, 2, "#ffe889");
    } else if (type === "signal" || type === "lamp") {
      ell(c, 0, 0, 6, 8, "#ffb458");
      line3(c, [[-5, -8], [5, -8]], "#603b42", 2.6);
      line3(c, [[0, -5], [0, 5]], "#ffed96", 2);
    } else if (type === "key") {
      ell(c, -3, -2, 4, 4, "#f4bc52");
      ell(c, -3, -2, 1.7, 1.7, "#80564b");
      line3(c, [[0, 0], [8, 6], [9, 3]], "#f6cf6e", 2);
    } else if (type === "tie") {
      poly(c, [[-7, -4], [0, -1], [6, -6], [7, 3], [1, 1], [-5, 5]], "#e65c71");
      line3(c, [[0, 0], [2, 8], [6, 12]], "#ef8896", 2);
    } else {
      poly(c, [[-9, -5], [6, -7], [9, 5], [-6, 8]], "#f9dc9e");
      line3(c, [[-7, -4], [0, 1], [6, -5]], "#b47c57", 1.3);
      if (type === "map") line3(c, [[-5, 4], [-1, 2], [3, 4], [6, 1]], "#569aa0", 1.4);
    }
    c.restore();
  }

  // scene.js
  var grounds = [];
  var houses = [];
  var trees = [];
  var fronts = [];
  var skies = [];
  var TAU4 = Math.PI * 2;
  async function loadArt() {
    async function image(src) {
      const i = new Image();
      await new Promise((ok,fail)=>{i.onload=ok;i.onerror=fail;i.src=assetURL("assets/painted/"+src)});
      return i;
    }
    await Promise.all(chapters.map(async (_, k) => {
      [grounds[k], houses[k], trees[k], fronts[k], skies[k]] = await Promise.all([image("ground" + k + ".png"), image("houses" + k + ".png"), image("trees" + k + ".png"), image("front" + k + ".png"), image("sky" + k + ".webp")]);
    }));
  }
  var seed2 = 3154;
  var rand = () => (seed2 = Math.imul(seed2, 1664525) + 1013904223 >>> 0) / 4294967296;
  var stars = Array.from({ length: 435 }, () => [rand(), rand(), rand(), rand()]);
  function oval(c, x, y, rx, ry, color) {
    c.fillStyle = color;
    c.beginPath();
    c.ellipse(x, y, rx, ry, 0, 0, TAU4);
    c.fill();
  }
  function poly2(c, points, color) {
    c.beginPath();
    points.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y));
    c.closePath();
    c.fillStyle = color;
    c.fill();
  }
  function stroke(c, points, color, w) {
    c.beginPath();
    points.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y));
    c.strokeStyle = color;
    c.lineWidth = w;
    c.stroke();
  }
  function glow(c, x, y, r, color) {
    const g = c.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color);
    g.addColorStop(1, "transparent");
    c.fillStyle = g;
    c.fillRect(x - r, y - r, 2 * r, 2 * r);
  }
  function sky(c, k, t, old = k, mix2 = 1) {
    if (mix2 < 1) c.drawImage(skies[old], 0, 0, 1280, 720);
    c.save();
    c.globalAlpha = mix2;
    c.drawImage(skies[k], 0, 0, 1280, 720);
    c.restore();
    for (const [x, y, z, v] of stars) {
      const X = x * 1280, Y = y * 720;
      const opacity = 0.28 + 0.46 * (0.5 + 0.5 * Math.sin(t * 0.7 + v * 30));
      c.globalAlpha = opacity;
      oval(c, X, Y, 0.35 + z * z * 1.2, 0.35 + z * z * 1.2, v > 0.62 ? "#f2d8ab" : "#d3def6");
      if (z > 0.949) {
        const r = z > 0.99 ? 6 : 3;
        stroke(c, [[X - r, Y], [X + r, Y]], "#faf1d4", 0.7);
        stroke(c, [[X, Y - r * 1.4], [X, Y + r * 1.4]], "#e9e3f6", 0.8);
      }
    }
    c.globalAlpha = 1;
    c.save();
    c.translate(206, 135);
    c.rotate(-0.34);
    c.beginPath();
    c.arc(0, 0, 22, 0.55, 5.73);
    c.bezierCurveTo(-7, -18, -10, 16, 19, 11.5);
    c.fillStyle = "#f3dcaf";
    c.fill();
    c.restore();
    for (const seq of [[[74, 206], [94, 189], [116, 198], [134, 177]], [[1019, 178], [1039, 157], [1066, 164], [1084, 139]]]) {
      stroke(c, seq, "#e3dabe38", 0.7);
      for (const [x, y] of seq) oval(c, x, y, 1.25, 1.25, "#d8cbbb");
    }
  }
  function actor(c, x, y, k, female, pose, t) {
    c.save();
    const who = female ? 1 : 0, back = pose.back?.[who], acting = pose.actor === who, age = pose.age || 0, g = pose.gesture;
    const expressive = pose.acting?.[who] || {};
    const base = female ? -1 : 1, turn = pose.turn?.[who] ?? pose.facing?.[who] ?? base;
    const look = (pose.look?.[who] ?? turn) * base, rear = pose.rear?.[who] ?? (back ? 1 : 0);
    const moving = pose.steps?.[who] ?? (pose.walk || 0) * (female ? 0.83 : 1), beat = Math.sin(t * 3.5 + who * 0.8);
    const lift = acting && g && g !== "listen" ? Math.sin(Math.PI * Math.min(1, Math.max(0, age - 0.45) / 2.5)) : 0;
    oval(c, x + 3, y + 1, 22, 4.5, "#23333e49");
    c.translate(x, y - Math.abs(moving) * 0.65 - (expressive.rise || 0));
    c.scale(1.18 * base, 1.18);
    c.transform(1 - 0.085 * Math.abs(turn), 0, -0.017 * turn * base, 1, 0, 0);
    const seated = pose.sit || 0, crouch = (g === "kneel" && acting ? lift * 5 : 0) + 5 * seated;
    c.rotate(moving * 5e-3 + (acting ? lift * 0.045 : 0) + (expressive.lean || 0));
    const outline = "#3c3542", hair = female ? "#764846" : "#343747", shine = female ? "#aa6960" : "#565667", skin = "#f4c8a4";
    const body = (p, col) => poly2(c, p, col), box2 = (x2, y2, w, h, col) => {
      c.fillStyle = col;
      c.fillRect(x2, y2, w, h);
    };
    const coat = (female ? ["#ed9865", "#f2cb79", "#c95c50", "#c07dba"] : ["#4996a5", "#51a99c", "#ab7548", "#467ba4"])[k];
    for (const dx of [-9, 2]) {
      c.save();
      const stride = moving * (dx < 0 ? -1 : 1);
      c.translate(stride * 2.4, stride * 1.2);
      const knee = dx + seated * (dx < 0 ? 8 : 10), hip = -15 + 4 * seated, fold2 = -9 + 3 * seated;
      body([[dx, hip], [dx + 6, hip], [knee + 6, fold2], [knee + 5, -4], [knee, -4], [knee, fold2 + 1], [dx, hip + 4]], outline);
      body([[dx + 1, hip + 1], [dx + 5, hip + 1], [knee + 5, fold2], [knee + 4, -5], [knee + 1, -5], [knee + 1, fold2]], female ? "#ddba9d" : "#536071");
      box2(knee - 1, -5, 9, 5, "#47404a");
      box2(knee, -4, 5, 1.4, "#ae948a");
      c.restore();
    }
    c.translate(0, crouch + beat * 0.38 + (expressive.dip || 0));
    body([[-12, -42], [9, -42], [14, -37], [16, -21], [12, -19], [11, -13], [-12, -13], [-14, -20], [-17, -21], [-15, -36]], outline);
    body([[-10, -41], [8, -41], [12, -36], [13, -24], [9, -23], [10, -15], [-10, -15], [-9, -24], [-14, -24], [-12, -36]], coat);
    c.save();
    c.translate(-11, -35);
    c.rotate(0.14 + moving * 0.22 + (expressive.left || 0));
    body([[-4, -1], [3, -1], [4, 11], [2, 14], [-3, 13]], coat);
    box2(-3, 10, 6, 3, "#e8cab0");
    oval(c, 0, 15, 3, 4, skin);
    c.restore();
    outfit(c, k, female);
    const holding = k === 1 && !female;
    const armAngle = holding ? -1.95 + 0.12 * Math.sin(t * 1.8) + moving * 0.09 : -0.28 - lift * (g === "raise" || g === "catch" ? 2.65 : 1.36) - moving * 0.19 + (expressive.right || 0);
    c.save();
    c.translate(11, -35);
    c.rotate(armAngle);
    if (holding) {
      c.save();
      c.translate(1, 15);
      c.rotate(-armAngle + 0.14 + 0.05 * Math.sin(t * 1.65));
      umbrella(c, clamp((pose.rainTime ?? 1) / 0.85));
      c.restore();
    }
    c.globalAlpha *= 1 - (pose.reach?.[who] || 0);
    body([[-3, -2], [4, -2], [5, 9], [3, 13], [-3, 13], [-4, 6]], coat);
    box2(-3, 10, 7, 3, "#e6c9ac");
    oval(c, 1, 15, 3.4, 4, skin);
    if (pose.letter && !female) {
      c.save();
      c.translate(1, 15);
      c.rotate(-armAngle);
      foldedLetter(c);
      c.restore();
    }
    if (pose.drawHeld) {
      c.save();
      c.translate(1, 15);
      c.rotate(-armAngle);
      c.scale(base, 1);
      pose.drawHeld(c, who);
      c.restore();
    }
    c.restore();
    c.save();
    c.translate(look * 1.8, -39);
    c.rotate(0.02 * look + beat * 0.019 + lift * 0.09 + (expressive.head || 0));
    c.translate(0, 39);
    if (!back && k === 0) {
      body([[-8, -40], [0, -36], [8, -40], [4, -33], [0, -35], [-4, -32]], "#f1e5ce");
    }
    if (k === 3) {
      box2(-13, -42, 26, 5, "#b14f52");
      box2(5, -38, 6, 12, "#d16e64");
      box2(6, -29, 5, 2, "#f1a07f");
    }
    body([[-17, -59], [-15, -66], [-7, -70], [8, -69], [15, -65], [18, -58], [18, -47], [14, -41], [8, -38], [-8, -38], [-15, -43], [-18, -49]], outline);
    body([[-15, -57], [-10, -64], [9, -64], [15, -58], [15, -48], [11, -42], [6, -40], [-7, -40], [-13, -45]], skin);
    body([[-18, -53], [-18, -63], [-13, -68], [-8, -69], [-5, -73], [4, -72], [11, -70], [16, -66], [19, -60], [18, -51], [14, -48], [12, -58], [8, -59], [6, -54], [3, -57], [-3, -53], [-1, -59], [-8, -55], [-12, -52], [-13, -46], [-17, -49]], hair);
    if (female) {
      body([[-18, -61], [-12, -64], [-13, -48], [-10, -40], [-11, -24], [-16, -27], [-19, -40]], hair);
      body([[15, -60], [19, -58], [20, -29], [15, -25], [12, -40]], hair);
    }
    face(c, pose.moods?.[who] ?? "tender", t + who * 0.8, expressive.speaking, age, look);
    if (rear > 0) {
      c.save();
      c.globalAlpha *= rear;
      const nape = female ? -26 : -41;
      body([[-16, -62], [12, -66], [18, -58], [17, nape - 4], [10, nape], [3, nape - 2], [-6, nape], [-15, nape - 4]], hair);
      for (let j = -10; j < 14; j += 5) stroke(c, [[j, -58], [j + 1, -50], [j, nape - 5]], shine, 1.2);
      c.restore();
    }
    stroke(c, [[-12, -63], [-7, -67], [-1, -67]], shine, 2);
    for (let i = 0; i < 5; i++) {
      let dx = -11 + i * 4;
      stroke(c, [[dx, -67 + Math.abs(i - 2)], [dx + 3, -68 + Math.abs(i - 2)], [dx + 6, -65 + Math.abs(i - 2)]], female ? "#bf8070" : "#686378", 0.8);
    }
    if (female) {
      for (let j = 0; j < 4; j++) oval(c, -15 + j * 0.65, -42 + j * 4, 3.4, 3.7, j % 2 ? "#80504e" : "#915c53");
      box2(-16, -29, 6, 2, "#f6aa83");
    } else if (rear < 0.55) {
      body([[-11, -39], [1, -36], [10, -39], [8, -34], [2, -32], [-2, -24], [-6, -26], [-4, -34]], "#cf7057");
    }
    if (female && k === 1) {
      oval(c, 0, -62, 21, 3, "#b77837");
      body([[-16, -63], [-12, -71], [-5, -75], [7, -75], [15, -64]], "#f2bd4c");
      box2(-15, -65, 30, 2, "#ffda78");
    }
    if (female && k !== 1) {
      oval(c, 13, -59, 4.5, 2.6, "#e69d97");
      oval(c, 16, -62, 2.5, 3.3, "#f2bfae");
    }
    if (!female && k === 3) {
      body([[-17, -62], [-14, -71], [-6, -76], [7, -75], [14, -69], [17, -62]], "#d9e3df");
      box2(-17, -64, 34, 5, "#a0b5c7");
      for (let i = -15; i < 16; i += 4) box2(i, -63, 1, 3, "#d9e3df");
    }
    c.restore();
    c.restore();
  }
  function drawRememberedGirl(c, t) {
    c.save();
    c.translate(39, 66);
    c.scale(0.72, 0.72);
    actor(c, 0, 0, 0, true, { acting: [{}, { head: 0.06 * Math.sin(t * 2), right: -1.8 + 0.22 * Math.sin(t * 4) }] }, t);
    c.restore();
  }
  function ground(c, k) {
    c.drawImage(grounds[k], 0, 0, 1280, 720);
  }
  var lots = [
    [275, 170, 162, 211, 355, 351],
    [437, 190, 100, 121, 474, 300],
    [437, 311, 100, 72, 477, 350],
    [538, 145, 155, 139, 615, 256],
    [693, 274, 140, 80, 778, 322],
    [804, 176, 132, 132, 857, 290],
    [942, 260, 126, 146, 994, 371]
  ];
  function buildings(c, k, reveal) {
    if (!reveal) {
      c.drawImage(houses[k], 0, 0, 1280, 720);
      return;
    }
    const sprite = houses[k], sx = sprite.width / 1280, sy = sprite.height / 720;
    for (const [x, y, w, h, baseX, baseY] of lots) {
      const alpha = reveal(baseX, baseY);
      if (alpha <= 0) continue;
      c.save();
      c.globalAlpha = alpha;
      c.translate(0, (1 - alpha) * 3);
      c.drawImage(sprite, x * sx, y * sy, w * sx, h * sy, x, y, w, h);
      c.restore();
    }
  }
  function fixtures(c, k, t, depart, lit) {
    c.drawImage(fronts[k], 0, 0, 1280, 720);
    meadow(c, k, t);
    harbor(c, k, t, depart);
    drawLamps(c, k, t, lit);
    life(c, k, t, lit);
    wildlife(c, k, t);
  }
  function charm(c, x, y, r) {
    poly2(c, [[x - r, y - 2], [x - r, y - r * 0.52], [x - r * 0.5, y - r * 0.8], [x, y - r * 0.46], [x + r * 0.5, y - r * 0.8], [x + r, y - r * 0.52], [x + r, y - 2], [x, y + r]], "#cd7278");
    stroke(c, [[x - r * 0.68, y - r * 0.36], [x - r * 0.48, y - r * 0.5], [x - r * 0.28, y - r * 0.44]], "#ffded0", 1.5);
  }
  function fleck(c, x, y, k, s2, a2) {
    c.save();
    c.translate(x, y);
    c.rotate(a2);
    if (k === 1) {
      glow(c, 0, 0, s2 * 4, "#e3ef8c88");
      oval(c, 0, 0, s2 * 0.48, s2 * 0.48, "#f4ffb2");
    } else if (k === 3) {
      stroke(c, [[-s2, 0], [s2, 0]], "#e7f3ff", 0.8);
      stroke(c, [[0, -s2], [0, s2]], "#effaff", 0.8);
    } else {
      poly2(c, [[-s2, 0], [-s2 * 0.38, -s2 * 0.62], [s2 * 0.68, -s2 * 0.42], [s2, 0], [0, s2 * 0.5]], k === 0 ? "#f1bdc8" : "#da9660");
      stroke(c, [[-s2 * 0.6, 0], [s2 * 0.54, -s2 * 0.18]], k === 0 ? "#ffe5db" : "#f2bd7e", 0.65);
    }
    c.restore();
  }
  function draw(canvas2, s2, now) {
    const c = canvas2.getContext("2d");
    c.setTransform(canvas2.width / 1280, 0, 0, canvas2.height / 720, 0, 0);
    c.imageSmoothingEnabled = true;
    c.imageSmoothingQuality = "high";
    const k = s2.season, u = s2.progress, t = s2.elapsed, air = s2.ambient ?? t, blend = s2.previous === k ? 1 : clamp(t / 3.8);
    const camera = s2.shot ?? s2.camera;
    if (camera) {
      c.translate(camera.dx, camera.dy);
      c.scale(camera.zoom, camera.zoom);
    }
    const p = s2.shot?.pose ?? s2.explorePose ?? poseAt(k, u, now);
    sky(c, k, air, s2.previous, blend);
    distance(c, k, air);
    rockRim(c, air);
    c.save();
    c.imageSmoothingEnabled = false;
    const layers = (paint) => {
      if (blend < 1) sector(c, blend, true, k, () => paint(s2.previous));
      sector(c, blend, false, k, () => paint(k));
    };
    layers((season2) => ground(c, season2));
    if (blend < 1) {
      buildings(c, s2.previous, (x, y) => 1 - reached(x, y, blend, k));
      buildings(c, k, (x, y) => reached(x, y, blend, k));
      grove(c, trees[s2.previous], s2.previous, air, (x, y) => 1 - reached(x, y, blend, k));
      grove(c, trees[k], k, air, (x, y) => reached(x, y, blend, k));
    } else {
      buildings(c, k);
      grove(c, trees[k], k, air);
    }
    layers((season2) => fixtures(c, season2, air, s2.shot?.departing ?? p.departure, s2.lit || s2.shot?.light));
    layers((season2) => atmosphere(c, season2, air, stars));
    c.restore();
    pointer(c, blend, air, blend < 1 && s2.selected, k, s2.previous);
    const fx = s2.shot ? s2.shot.effect : s2.effect, age = s2.shot ? s2.shot.age : fx ? (now - fx.at) / 1e3 : 9;
    if (fx?.kind === "pond" && age >= 0 && age < 2.7) {
      c.save();
      c.beginPath();
      c.ellipse(778, 320, 68, 19, 0, 0, TAU4);
      c.clip();
      c.globalAlpha = clamp((2.7 - age) / 0.45);
      for (let j = 0; j < 4; j++) {
        const r = age * 22 - j * 9;
        if (r > 0 && r < 67) {
          c.strokeStyle = k === 3 ? "#fbfdff" : "#d9ffef";
          c.lineWidth = 1.5;
          c.beginPath();
          if (k === 3) {
            for (let h = 0; h < 6; h++) {
              let a2 = h * TAU4 / 6 + j * 0.2;
              c.moveTo(778, 321);
              c.lineTo(778 + Math.cos(a2) * r * 0.5, 321 + Math.sin(a2) * r * 0.17);
              c.lineTo(778 + Math.cos(a2 + 0.16) * r, 321 + Math.sin(a2 + 0.16) * r * 0.33);
            }
          } else c.ellipse(778, 321, r, r * 0.33, 0, 0, TAU4);
          c.stroke();
        }
      }
      c.restore();
    }
    const anim = s2.shot?.performanceTime ?? t + (p.age ? Math.min(p.age, 3.4) : 0);
    p.rainTime = s2.shot?.rainTime ?? t;
    const girlFirst = p.girlY < p.boyY && p.girlAlpha > 0;
    if (girlFirst) actor(c, p.girl, p.girlY, p.seasons?.[1] ?? k, true, p, anim);
    actor(c, p.boy, p.boyY, p.seasons?.[0] ?? k, false, p, anim);
    if (!girlFirst && p.girlAlpha > 0) actor(c, p.girl, p.girlY, p.seasons?.[1] ?? k, true, p, anim);
    wrapArms(c, p);
    if (!p.letter && p.gesture && ["flower", "tie", "key", "map", "signal", "lamp", "letter"].includes(p.gesture)) {
      const a2 = clamp((p.age - 0.45) / 1.35), from = p.actor === 0 ? p.boy : p.girl, to = p.actor === 0 ? p.girl : p.boy;
      token(c, p.gesture, p.girlAlpha > 0 ? from + (to - from) * a2 : p.boy + 22, p.boyY - 45 - 17 * Math.sin(a2 * Math.PI), 0.93);
    } else if (!s2.selected || k === 0 && !p.gesture) charm(c, (p.boy + p.girl) / 2, 354 + Math.sin(t * 2) * 2, 7.7);
    if (s2.lit || s2.shot?.light) {
      glow(c, 909, 310, 66, "#ffe3a59c");
      oval(c, 909, 309, 3.8, 6, "#fff3ad");
    }
    if (fx && age < 2.7) {
      c.save();
      c.globalAlpha = clamp((2.7 - age) / 0.45);
      if (fx.kind === "tree") {
        for (let j = 0; j < 52; j++) {
          const [a2, b, z, v] = stars[j];
          fleck(c, fx.x + (a2 - 0.5) * 99 + Math.sin(age * 2 + v * 8) * 20 + age * (v * 24 - 4), fx.y + (b - 0.5) * 65 + age * (23 + z * 22), k, 2 + z * 4, v * 8 + age * 2);
        }
      }
      if (fx.kind === "person") speech(c, fx.actor === "girl" ? p.girl : p.boy, fx.actor === "girl" ? p.girlY - 92 : 373, fx.text);
      c.restore();
    }
  }
  function speech(c, x, y, text) {
    c.save();
    c.font = '15px "Microsoft YaHei",sans-serif';
    const w = c.measureText(text).width + 24;
    c.fillStyle = "#fff1de";
    c.strokeStyle = "#745f66";
    c.lineWidth = 1.5;
    c.beginPath();
    if(c.roundRect)c.roundRect(x - w / 2, y - 26, w, 29, 5);else c.rect(x - w / 2, y - 26, w, 29);
    c.fill();
    c.stroke();
    poly2(c, [[x - 4, y + 2], [x, y + 9], [x + 5, y + 2]], "#fff1de");
    c.fillStyle = "#413946";
    c.textAlign = "center";
    c.fillText(text, x, y - 6);
    c.restore();
  }

  // thoughts.js
  var descriptions = { portrait: "阿岑想起春日里笑着的棠梨", rain: "棠梨想起雨夜等船的红伞与岸灯" };
  function thoughtPicture(bubble, kind, seconds) {
    const image = bubble.querySelector("canvas");
    if (!kind) {
      image.hidden = true;
      bubble.classList.remove("thinking");
      delete image.dataset.kind;
      return;
    }
    const frame2 = matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : Math.floor(seconds * 8);
    if (!image.hidden && image.dataset.kind === kind && Number(image.dataset.frame) === frame2) return;
    image.hidden = false;
    image.dataset.frame = frame2;
    image.dataset.kind = kind;
    image.setAttribute("aria-label", descriptions[kind]);
    bubble.classList.add("thinking");
    const c = image.getContext("2d"), t = frame2 / 8;
    c.clearRect(0, 0, 78, 42);
    c.save();
    c.imageSmoothingEnabled = false;
    const box2 = (x, y, w, h, col) => {
      c.fillStyle = col;
      c.fillRect(Math.round(x), Math.round(y), w, h);
    };
    if (kind === "portrait") {
      box2(0, 0, 78, 42, "#725775");
      box2(0, 21, 78, 21, "#948491");
      box2(0, 30, 78, 12, "#697e77");
      for (const [x, y] of [[2, 3], [13, 6], [4, 11], [66, 1], [59, 6], [71, 9]]) {
        box2(x, y, 11, 6, "#ae7887");
        box2(x + 1, y, 5, 2, "#e9b39f");
      }
      drawRememberedGirl(c, t);
      for (let i = 0; i < 6; i++) {
        const x = (i * 17 + t * 6) % 79, y = (i * 11 + t * 5) % 43;
        box2(x, y, 3, 1, "#ffd8c8");
      }
    } else {
      box2(0, 0, 78, 42, "#384b61");
      box2(0, 28, 78, 14, "#325669");
      box2(0, 25, 78, 3, "#6e6366");
      for (let i = 0; i < 10; i++) {
        const y = (i * 11 + t * 21) % 27;
        box2((i * 19 + y * 0.35) % 77, y, 1, 4, "#83a6ad");
      }
      box2(13, 8, 2, 18, "#584852");
      box2(10, 8, 8, 9, "#bc8657");
      box2(12, 9, 4, 6, "#ffdf94");
      box2(46, 16, 2, 10, "#d2b696");
      box2(34, 16, 26, 2, "#d88270");
      box2(37, 13, 20, 3, "#c76464");
      box2(42, 11, 11, 2, "#e29479");
      box2(42, 19, 5, 6, "#514457");
      box2(42, 21, 5, 2, "#c18d6b");
      for (let j = 0; j < 5; j++) {
        box2(10 + Math.sin(t * 2 + j) * 3, 29 + j * 2, 8 - j, 1, "#d1ae78");
        box2(43 + Math.cos(t + j) * 3, 30 + j * 2, 8 - j, 1, "#b08084");
      }
    }
    c.restore();
  }

  // screenplay.js
  var beatSeconds = 4.4;
  var episodeSeconds = 2 + 14 * beatSeconds + 2;
  var seasonSeconds = episodeSeconds * 2;
  var defaults = [0, 1, 0, 1, 0, 0, 1, 0];
  var smooth2 = (n) => {
    const x = clamp(n);
    return x * x * (3 - 2 * x);
  };
  var blocking = [
    [
      [[0, 339, 388], [4, 382, 402], [8, 453, 379], [13, 454, 379], [17, 484, 384], [23, 485, 384]],
      [[0, 500, 369], [3, 510, 362], [6, 506, 360], [9, 485, 377], [23, 530, 382]]
    ],
    [
      [[0, 485, 384], [3, 530, 407], [9, 730, 438], [13, 875, 430], [18, 951, 419], [23, 951, 419]],
      [[0, 530, 382], [4, 626, 408], [9, 818, 420], [14, 965, 417], [17, 997, 422], [23, 997, 422]]
    ],
    [
      [[0, 917, 426], [4, 922, 426], [8, 946, 421], [13, 948, 422], [23, 948, 421]],
      [[0, 1021, 425], [4, 1012, 423], [8, 1e3, 423], [12, 999, 423], [23, 999, 422]]
    ],
    [
      [[0, 948, 421], [4, 931, 431], [8, 894, 438], [13, 840, 420], [18, 840, 420], [23, 840, 420]],
      [[0, 999, 422], [4, 984, 431], [8, 946, 437], [13, 892, 421], [18, 892, 421], [23, 892, 421]]
    ],
    [
      [[0, 557, 451], [4, 593, 460], [10, 676, 485], [15, 780, 456], [19, 848, 422], [23, 849, 422]],
      [[0, 935, 422], [5, 933, 422], [9, 900, 420], [14, 903, 419], [19, 891, 422], [23, 891, 422]]
    ],
    [
      [[0, 849, 422], [2.8, 947, 419], [23, 947, 419]],
      [[0, 891, 422], [2.8, 988, 418], [17, 988, 418], [18.86, 1041, 409], [23, 1041, 409]]
    ],
    [
      [[0, 660, 469], [4, 694, 480], [8, 794, 462], [8.8, 939, 418], [13.5, 939, 418], [16, 950, 419], [19, 945, 424], [23, 899, 428]],
      [[0, 1040, 409], [12.6, 1040, 409], [14.2, 1014, 425], [16, 1001, 422], [19, 995, 425], [23, 946, 426]]
    ],
    [
      [[0, 899, 428], [4, 861, 425], [10, 857, 425], [15, 857, 425], [17, 865, 425], [23, 865, 425]],
      [[0, 946, 426], [4, 913, 424], [10, 909, 424], [15, 905, 424], [17, 907, 426], [23, 907, 426]]
    ]
  ];
  function mark(path, t, facing) {
    if (!path) return { x: 0, y: 0, move: 0, face: facing, back: false };
    let i = 1;
    while (i < path.length - 1 && t > path[i][0]) i++;
    const [a2, x, y] = path[i - 1], [b, X, Y] = path[i], u = clamp((t - a2) / (b - a2)), f = smooth2(u);
    const move = Math.min(1, Math.hypot(X - x, Y - y) / (b - a2) / 11) * 4 * u * (1 - u);
    return { x: x + (X - x) * f, y: y + (Y - y) * f, move, face: move > 0.22 && Math.abs(X - x) > 6 ? Math.sign(X - x) : facing, back: move > 0.25 && Y < y - 11 && Math.abs(X - x) < 2 * (y - Y) };
  }
  var scripts = episodes.map((ep, id) => ep.paths.map((_, choice) => [...ep.before, ...pathLines(id, choice), ...ep.after]));
  function shot(k, elapsed, choices = {}) {
    const half = Math.min(1, Math.floor(elapsed / episodeSeconds)), id = k * 2 + half, local = elapsed - half * episodeSeconds;
    const script = scripts[id][choices[id] ?? defaults[id]], t = 23 * local / episodeSeconds;
    const index = Math.floor((local - 2) / beatSeconds), age = local - 2 - index * beatSeconds;
    const beat = script[index], speaks = beat && age < beatSeconds - 0.24;
    const [b, g] = blocking[id].map((path, i) => mark(path, t, i ? -1 : 1));
    const arrival = 2 + 8 * beatSeconds - 0.7, boarding = 2 + 12 * beatSeconds - 1;
    const present = (id !== 5 || local < boarding) && (id !== 6 || local >= arrival);
    if (k === 1) {
      b.face = 1;
      g.face = -1;
    }
    const act = beat?.act ?? "listen", who = beat?.who ?? 0;
    const pulse = Math.sin(Math.PI * clamp(age / 3.6)) ** 2;
    const expressions = moods(id, index, who);
    const turning = (i, offset) => {
      const path = blocking[id][i], base = i ? -1 : 1;
      const own = i ? g : b, other = i ? b : g;
      const rest = present ? Math.sign(other.x - own.x) || base : base;
      let side = 0, back = 0;
      for (let j = -2; j <= 2; j++) {
        const m = mark(path, t + (offset + j * 0.12) * 23 / episodeSeconds, rest), weight2 = 3 - Math.abs(j);
        side += m.face * weight2;
        back += (m.back ? 1 : 0) * weight2;
      }
      return [side / 9, back / 9];
    };
    const shoulders = [turning(0, -0.12), turning(1, -0.12)], eyes = [turning(0, 0.15), turning(1, 0.15)];
    const pose = {
      boy: b.x,
      boyY: b.y,
      girl: g.x,
      girlY: g.y,
      girlAlpha: present ? 1 : 0,
      steps: [b.move * Math.sin(local * 9), g.move * Math.sin(local * 9 + 0.6)],
      turn: shoulders.map((q) => q[0]),
      look: eyes.map((q) => q[0]),
      rear: shoulders.map((q) => q[1]),
      moods: expressions,
      gesture: act,
      actor: who,
      age: beat ? age : 0,
      acting: [0, 1].map((i) => {
        const speaking = speaks && !beat.thought && who === i, perform = who === i ? pulse : 0;
        const tender = act === "embrace", lean = act === "lean" || act === "shy";
        return {
          speaking,
          head: speaking ? 0.035 * Math.sin(age * 4) : 0.035 * Math.sin(local * 2 + i),
          right: tender ? -1.15 : -(act === "point" ? 1.5 : ["give", "reach", "wave"].includes(act) ? 1.1 : 0.25) * perform,
          left: tender ? 0.8 : act === "shy" ? 0.7 * perform : 0.12 * perform,
          lean: tender ? 0.09 : lean ? 0.085 * perform : 0,
          dip: act === "shy" ? 2 * perform : 0,
          rise: act === "wave" ? 2 * perform : 0
        };
      })
    };
    const focus = smooth2(t / 3) * (1 - smooth2((t - 20.2) / 2.8)), x = present ? (b.x + g.x) / 2 : b.x, y = present ? (b.y + g.y) / 2 : b.y;
    const zoom = 1 + 0.085 * focus, ep = episodes[id];
    const weight = id === 6 ? smooth2((local - 25) / 4) * (1 - smooth2((local - 34) / 4)) : 0;
    const camera = waitingCamera({ zoom, dx: -(zoom - 1) * x, dy: -(zoom - 1) * (y - 90) }, weight, b.x, b.y);
    if (id === 6 && local >= 19 && local < 38) {
      pose.letter = true;
      pose.acting[0].right = -1.36;
    }
    if (id === 7) dinnerFinale(pose, local - (2 + 9 * beatSeconds) + 0.62, 5, 4);
    return {
      pose,
      speaker: speaks ? people[who] : "",
      text: speaks ? captionText(beat.text) : "",
      thought: speaks ? beat.thought : null,
      age,
      title: ep.title,
      ...camera,
      departing: id === 5 ? smooth2((local - boarding) / 4) : id === 6 ? 1 - smooth2((local - arrival + 6) / 6) : 0,
      light: ep.place === "lamp" || id === 6 && index >= 6,
      effect: null
    };
  }

  // player.js
  var stage = document.querySelector("main");
  var canvas = document.querySelector("canvas");
  var nav = [...document.querySelectorAll("nav button")];
  var spots = document.querySelector("#spots");
  var controls = document.querySelector("#controls");
  var play = document.querySelector("#play");
  var again = document.querySelector("#again");
  var hint = document.querySelector("#hint");
  var title = document.querySelector("#chapter");
  var s = { season: 0, previous: 0, selected: false, playing: false, elapsed: 0, progress: 0, lit: false, effect: null };
  var ambientAnchor = performance.now();
  var ambientBase = 0;
  var ambientOn = true;
  function ambientTime(now) {
    return ambientBase + (ambientOn ? Math.max(0, now - ambientAnchor) / 1e3 : 0);
  }
  function animateAir(on) {
    const now = performance.now();
    ambientBase = ambientTime(now);
    ambientAnchor = now;
    ambientOn = on;
  }
  var ready = false;
  var origin = 0;
  let storyRate = 1;
  var raf = 0;
  var film = true;
  var bookmark = 0;
  var mode = document.querySelector("#mode");
  var caption = document.querySelector("#film-caption");
  function setFilm(value) {
    film = value;
    stage.classList.toggle("watching", film);
    mode.textContent = film ? "自由探索" : "继续观赏";
    caption.hidden = !film;
    hint.textContent = film ? "四季连映" : "点人物交谈，或去池边走走";
  }
  function explore() {
    if (!film) return;
    bookmark = s.elapsed;
    animateAir(true);
    const last = s.shot?.pose;
    setFilm(false);
    s.shot = null;
    s.playing = false;
    s.elapsed = 0;
    s.progress = 0;
    chapterStory(s.season, last);
    play.textContent = "播放";
    render();
  }
  function project(x, y) {
    const cam = s.shot ?? s.camera;
    return cam ? [x * cam.zoom + cam.dx, y * cam.zoom + cam.dy] : [x, y];
  }
  var length = () => film ? seasonSeconds : chapters[s.season].end - chapters[s.season].start;
  var dock = document.createElement("button");
  dock.dataset.place = "dock";
  dock.setAttribute("aria-label", "查看右岸渡口");
  var dockLabel = document.createElement("span");
  dockLabel.textContent = "右岸渡口";
  dock.append(dockLabel);
  Object.assign(dock.style, { left: "78%", top: "58%", width: "8%", height: "5%" });
  spots.append(dock);
  var tree = spots.querySelector("[data-place=tree]");
  for (const [x, y, w, h] of [[271, 309, 100, 109], [557, 183, 87, 92], [691, 174, 92, 102], [902, 209, 104, 120]]) {
    const hit = tree.cloneNode(true);
    hit.dataset.x = x;
    hit.dataset.y = y;
    Object.assign(hit.style, { left: x / 12.8 + "%", top: y / 7.2 + "%", width: w / 12.8 + "%", height: h / 7.2 + "%" });
    spots.append(hit);
  }
  var girlHit = spots.querySelector("[data-place=person]").cloneNode(true);
  girlHit.dataset.actor = "girl";
  spots.append(girlHit);
  function layout() {
    const dpr = Math.min(3, devicePixelRatio || 1);
    canvas.width = Math.round(canvas.clientWidth * dpr);
    canvas.height = Math.round(canvas.clientHeight * dpr);
    render();
  }
  var menu = document.querySelector("#island-menu");
  var panel2 = document.querySelector("#dialogue");
  function fold(focus = false) {
    if (!menu.open) return;
    menu.open = false;
    if (focus) menu.querySelector("summary").focus();
  }
  document.addEventListener("pointerdown", (e) => {
    if (!menu.contains(e.target)) fold();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && menu.open) fold(true);
  });
  menu.addEventListener("click", (e) => {
    if (e.target.closest("#controls button")) fold(true);
  });
  function pinBubble(el, who, p) {
    if (el.hidden) return;
    const [x, y] = project(who === 1 ? p.girl : p.boy, (who === 1 ? p.girlY : p.boyY) - 98 + 8 * (p.sit || 0));
    const w = stage.clientWidth, h = stage.clientHeight, anchor = x * w / 1280;
    const tailY = y * h / 720, box2 = el.offsetWidth, pad = 6;
    const left2 = Math.max(pad, Math.min(w - box2 - pad, anchor - box2 * (who === 1 ? 0.28 : 0.72)));
    el.style.left = left2 + "px";
    el.style.top = tailY - 4 + "px";
    el.style.setProperty("--tip", Math.max(12, Math.min(box2 - 12, anchor - left2)) + "px");
  }
  function render(now = performance.now()) {
    if (!ready) return;
    if (!film) updateStory(ambientTime(now));
    s.shot = film ? shot(s.season, s.elapsed, history) : null;
    if (s.shot) {
      const f = s.shot;
      caption.hidden = !f.text || !f.speaker;
      const [name, words] = caption.children;
      if (words.textContent !== f.text || name.textContent !== f.speaker) {
        name.textContent = f.speaker;
        words.textContent = f.text;
        if (f.speaker && f.text && !matchMedia("(prefers-reduced-motion: reduce)").matches) caption.animate([{ opacity: 0.1, translate: "0 4px" }, { opacity: 1, translate: "0 0" }], { duration: 160 });
      }
      thoughtPicture(caption, f.thought, s.elapsed);
      if (hint.textContent !== f.title) hint.textContent = f.title;
    }
    s.explorePose = film ? null : poseAt(s.season, s.progress, now);
    const pose = s.shot?.pose ?? s.explorePose;
    s.camera = pose.waitFocus ? waitingCamera({ zoom: 1, dx: 0, dy: 0 }, pose.waitFocus, pose.boy, pose.boyY) : null;
    s.ambient = ambientTime(now);
    draw(canvas, s, now);
    if (s.shot) pinBubble(caption, s.shot.speaker === "棠梨" ? 1 : 0, pose);
    if (!panel2.hidden) thoughtPicture(panel2, panel2.dataset.thought, now / 1e3);
    if (!panel2.hidden) pinBubble(panel2, document.querySelector("#speaker").textContent === "棠梨" ? 1 : 0, pose);
    for (const [element, x, y] of [[spots.querySelector("[data-place=person]"), pose.boy, pose.boyY - 40], [girlHit, pose.girl, pose.girlY - 36]]) {
      const [X, Y] = project(x, y);
      element.style.left = X / 12.8 + "%";
      element.style.top = Y / 7.2 + "%";
    }
    girlHit.hidden = pose.girlAlpha < 0.12;
    const girlTalk = controls.querySelector('[data-talk="1"]');
    girlTalk.textContent = s.season === 3 && pose.girlAlpha === 0 ? "去渡口赴约" : "找棠梨";
    girlTalk.disabled = s.season === 2 && pose.girlAlpha === 0;
    controls.querySelector('[data-talk="0"]').disabled = girlTalk.disabled;
  }
  function clock(now) {
    if (!s.playing) return;
    const elapsed = Math.max(0, (now - origin) * (film ? storyRate : 1) / 1e3);
    if (film && elapsed >= seasonSeconds) {
      const completed = Math.floor(elapsed / seasonSeconds);
      choose((s.season + completed) % chapters.length, elapsed % seasonSeconds);
      return;
    }
    s.elapsed = Math.min(length(), elapsed);
    if (!film && s.elapsed >= length() - 0.025) {
      s.elapsed = length();
      s.playing = false;
      play.textContent = "重播";
      hint.textContent = "点人物开口交谈，也可以去树下、池边走走";
    }
    s.progress = clamp(s.elapsed / length());
  }
  function frame(now) {
    raf = 0;
    clock(now);
    render(now);
    if (ambientOn || s.playing || !panel2.hidden && panel2.dataset.thought || busy(now) || s.effect && now - s.effect.at < 2750) schedule();
  }
  function schedule() {
    if (!raf) raf = requestAnimationFrame(frame);
  }
  function pause() {
    clock(performance.now());
    animateAir(false);
    s.playing = false;
    play.textContent = "继续";
    render();
  }
  function resume() {
    animateAir(true);
    s.playing = true;
    origin = performance.now() - s.elapsed * 1e3 / (film ? storyRate : 1);
    play.textContent = "暂停";
    schedule();
  }
  function choose(k, offset = 0) {
    if (!ready) return;
    Object.assign(s, { previous: s.season, season: k, selected: true, playing: false, elapsed: offset, progress: 0, effect: null, lit: false });
    s.progress = offset / length();
    const treeButtons = [...spots.querySelectorAll("[data-place=tree]")], roots = treeLocations(k);
    [0, 4, 1, 2, 3].forEach((idx, i) => {
      const [x, y] = roots[idx], el = treeButtons[i];
      el.dataset.x = x;
      el.dataset.y = y - 86;
      el.style.left = x / 12.8 + "%";
      el.style.top = (y - 86) / 7.2 + "%";
    });
    chapterStory(k);
    spots.querySelector("[data-place=lamp]").setAttribute("aria-pressed", "false");
    spots.hidden = controls.hidden = false;
    title.textContent = chapters[k].name;
    hint.textContent = "点人物开口交谈，也可以去树下、池边走走";
    stage.style.setProperty("--accent", chapters[k].accent);
    nav.forEach((b, i) => b.setAttribute("aria-pressed", i === k));
    render();
    resume();
  }

  // The cue clock also drives character blocking and expressions.
  const speedControls = document.querySelector('#story-speed');
  speedControls.addEventListener('click', event => {
    const button = event.target.closest('[data-rate]');
    if (!button || !film || !ready) return;
    const now = performance.now();
    clock(now);
    storyRate = Number(button.dataset.rate);
    origin = now - s.elapsed * 1000 / storyRate;
    for (const item of speedControls.querySelectorAll('button')) {
      item.setAttribute('aria-pressed', String(item === button));
    }
  });
  function nextDialogue() {
    if (!ready || !film) return;
    const now = performance.now();
    clock(now);
    const wasPlaying = s.playing;
    const episode = Math.floor(s.elapsed / episodeSeconds);
    const local = s.elapsed - episode * episodeSeconds;
    const cue = local < 2 ? 0 : Math.floor((local - 2) / beatSeconds) + 1;
    const firstLine = 2.03;
    let target = episode * episodeSeconds + firstLine + cue * beatSeconds;
    if (cue >= 14) target = (episode + 1) * episodeSeconds + firstLine;
    if (target >= seasonSeconds) {
      choose((s.season + 1) % chapters.length, firstLine);
      if (!wasPlaying) pause();
    } else {
      s.elapsed = target;
      s.progress = target / seasonSeconds;
      origin = now - target * 1000 / storyRate;
      render(now);
      schedule();
    }
  }
  // In watching mode a tap on either character means the same as a tap on scenery.
  stage.addEventListener('click', event => {
    if (!film || !ready || event.target.closest('nav,details,dialog,#controls,#story-speed,#wide')) return;
    event.stopPropagation();
    nextDialogue();
  }, true);
  nav.forEach((button, k) => button.onclick = () => {
    bookmark = 0;
    choose(k);
  });
  mode.onclick = () => {
    if (film) explore();
    else {
      setFilm(true);
      choose(s.season, Math.min(bookmark, seasonSeconds - 0.05));
    }
  };
  document.querySelector("#controls").addEventListener("click", (e) => {
    if (e.target.closest("[data-talk],#journal")) explore();
  }, true);
  play.onclick = () => {
    if (s.playing) pause();
    else if (s.progress >= 1) choose(s.season);
    else resume();
  };
  again.onclick = () => choose(s.season);
  spots.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!s.selected || !button) return;
    explore();
    const kind = button.dataset.place;
    if (kind === "lamp") {
      s.lit = !s.lit;
      button.setAttribute("aria-pressed", s.lit);
    }
    if (kind === "person") {
      animateAir(true);
      startStory(button.dataset.actor === "girl" ? 1 : 0);
      schedule();
      return;
    }
    s.effect = { kind, x: Number(button.dataset.x) || 416, y: Number(button.dataset.y) || 192, actor: button.dataset.actor, at: performance.now(), text: "" };
    render();
    schedule();
  });
  bindStories(() => {
    schedule();
  });
  controls.querySelectorAll("[data-talk]").forEach((b) => b.addEventListener("click", () => animateAir(true)));
  if(window.ResizeObserver)new ResizeObserver(layout).observe(stage);else window.addEventListener("resize",layout);
  async function initialize() {
    try {
      await loadArt();
      document.getElementById("load-state").hidden=true;
      ready = true;
      layout();
      nav.forEach((b) => b.disabled = false);
      setFilm(true);
      s.season = 3;
      choose(0);
    } catch (e) {
      const msg=document.getElementById("load-state");msg.firstChild.textContent="小岛还没加载完整，请再试一次";msg.querySelector("button").hidden=false;
      hint.textContent = "小岛素材加载失败，请刷新重试";
      console.error(e);
    }
  }
  initialize();
})();
