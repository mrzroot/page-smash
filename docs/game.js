(() => {
  const api = globalThis.browser || globalThis.chrome;
  if (globalThis.__pageSmashLoaded) return;
  globalThis.__pageSmashLoaded = true;

  const NAMES = ["مسلسل", "گرانش", "شعله‌افکن", "لیزر", "سیاه‌چاله"];

  function startPageSmash() {
    if (document.getElementById("page-smash-root")) return;
    if (!globalThis.Matter) return;

    try { sessionStorage.setItem("pageSmash", "1"); } catch (e) {}
    try { api.storage?.session?.set?.({ armed: false }); } catch (e) {}

    const { Engine, Bodies, Body, Events, Runner, Composite, Query, Vector } = globalThis.Matter;
    const engine = Engine.create();
    engine.gravity.y = 1;
    const world = engine.world;

    const root = document.createElement("div");
    root.id = "page-smash-root";
    const fx = document.createElement("canvas");
    fx.id = "ps-fx";
    const hud = document.createElement("div");
    hud.id = "ps-hud";
    const banner = document.createElement("div");
    banner.id = "ps-banner";
    banner.hidden = true;
    banner.innerHTML = "<span>صفحه خرد شد</span><button type='button' data-act='restart'>شروع دوباره</button><button type='button' data-act='keep'>ادامه</button>";
    document.documentElement.append(root, fx);
    root.append(hud, banner);
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    const chips = [];
    let smashed = 0;
    let total = 0;

    function addChip(x, y, w, h, node, hp) {
      node.classList.add("ps-chip");
      root.appendChild(node);
      const body = Bodies.rectangle(x + w / 2, y + h / 2, Math.max(8, w), Math.max(8, h), {
        restitution: 0.35,
        friction: 0.08,
        frictionAir: 0.02,
        density: 0.0015,
        chamfer: { radius: 2 },
      });
      body.plugin = { chip: true, node, w, h, hp };
      Composite.add(world, body);
      chips.push(body);
      total += 1;
      return body;
    }

    const SEL = "h1,h2,h3,h4,h5,h6,p,li,td,th,button,a,label,blockquote,figcaption,pre,dd,dt";
    const nodes = [];
    if (document.body) {
      for (const el of document.body.querySelectorAll(SEL)) {
        if (el.closest("#page-smash-root")) continue;
        if (el.querySelector("p,li,h1,h2,h3,h4,td,blockquote,pre")) continue;
        const r = el.getBoundingClientRect();
        if (r.width < 10 || r.height < 8) continue;
        if (r.bottom < 0 || r.top > innerHeight + 240) continue;
        nodes.push(el);
        if (nodes.length >= 70) break;
      }
      for (const img of document.body.querySelectorAll("img")) {
        if (nodes.length >= 90) break;
        const r = img.getBoundingClientRect();
        if (r.width < 16 || r.height < 16) continue;
        if (r.bottom < 0 || r.top > innerHeight + 240) continue;
        nodes.push(img);
      }
    }

    for (const el of nodes) {
      if (chips.length >= 320) break;
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      if (el.tagName === "IMG") {
        const node = document.createElement("img");
        node.src = el.currentSrc || el.src || "";
        node.alt = "";
        node.style.width = r.width + "px";
        node.style.height = r.height + "px";
        addChip(r.left, r.top, r.width, r.height, node, 3);
        el.style.visibility = "hidden";
        continue;
      }
      const text = (el.innerText || "").replace(/\s+/g, " ").trim();
      if (!text) continue;
      const fontSize = parseFloat(cs.fontSize) || 16;
      const words = text.split(" ").filter(Boolean).slice(0, 28);
      let x = r.left;
      let y = r.top;
      const lineH = Math.max(16, fontSize * 1.25);
      const charW = Math.max(7, fontSize * 0.52);
      let made = 0;
      for (const word of words) {
        if (chips.length >= 320) break;
        const w = Math.min(Math.max(r.width, 24), Math.max(22, word.length * charW + 8));
        if (x + w > r.right + 12 && x > r.left + 4) {
          x = r.left;
          y += lineH;
        }
        if (y > r.bottom + lineH * 2) break;
        const node = document.createElement("div");
        node.textContent = word;
        node.style.width = w + "px";
        node.style.height = lineH + "px";
        node.style.lineHeight = lineH + "px";
        node.style.fontSize = cs.fontSize;
        node.style.fontFamily = cs.fontFamily;
        node.style.fontWeight = cs.fontWeight;
        node.style.color = cs.color;
        const bg = cs.backgroundColor;
        if (bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") node.style.background = bg;
        addChip(x, y, w, lineH, node, 2);
        x += w + 3;
        made += 1;
      }
      if (made) el.style.visibility = "hidden";
    }

    const player = Bodies.circle(innerWidth * 0.5, innerHeight * 0.42, 14, {
      frictionAir: 0.12,
      restitution: 0.2,
      density: 0.004,
      collisionFilter: { group: -1 },
    });
    Composite.add(world, player);
    const pEl = document.createElement("div");
    pEl.id = "ps-player";
    pEl.innerHTML = "<i class='ps-body'></i><i class='ps-flame'></i>";
    root.appendChild(pEl);

    const keys = Object.create(null);
    let mx = innerWidth / 2 + 90;
    let my = innerHeight / 2;
    let lmb = false;
    let rmb = false;
    let weapon = 0;
    let cool = 0;
    let hole = null;
    let laser = null;
    let bannerShown = false;

    function aim() {
      return Math.atan2(my - player.position.y, mx - player.position.x);
    }

    function spawnBullet(speed, radius, dmg, life, color) {
      const a = aim();
      const b = Bodies.circle(
        player.position.x + Math.cos(a) * 22,
        player.position.y + Math.sin(a) * 22,
        radius,
        { frictionAir: 0.001, restitution: 0.6, density: 0.001, collisionFilter: { group: -1 } }
      );
      Body.setVelocity(b, { x: Math.cos(a) * speed, y: Math.sin(a) * speed });
      b.plugin = { bullet: true, dmg, life, color };
      Composite.add(world, b);
    }

    function damage(body, amount) {
      if (!body?.plugin?.chip) return;
      body.plugin.hp -= amount;
      if (body.plugin.hp > 0) return;
      Composite.remove(world, body);
      body.plugin.node.remove();
      const i = chips.indexOf(body);
      if (i >= 0) chips.splice(i, 1);
      smashed += 1;
    }

    function onKey(e, down) {
      keys[e.code] = down;
      if (down && ["KeyW", "KeyA", "KeyS", "KeyD", "Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code)) {
        e.preventDefault();
      }
      if (!down) return;
      if (e.code >= "Digit1" && e.code <= "Digit5") weapon = Number(e.code.slice(5)) - 1;
      if (e.code === "Space") {
        const a = aim();
        Body.setVelocity(player, { x: Math.cos(a) * 16, y: Math.sin(a) * 16 });
      }
      if (e.shiftKey && (e.code === "KeyR" || e.key === "R" || e.key === "r")) {
        try { sessionStorage.setItem("pageSmash", "1"); } catch (err) {}
        location.reload();
      }
      if (e.shiftKey && (e.code === "KeyN" || e.key === "N" || e.key === "n")) {
        const go = () => { location.href = "https://en.wikipedia.org/wiki/Special:Random"; };
        try {
          const p = api.storage?.session?.set?.({ armed: true });
          if (p && typeof p.then === "function") p.then(go, go);
          else go();
        } catch (err) { go(); }
      }
    }

    window.addEventListener("keydown", (e) => onKey(e, true), true);
    window.addEventListener("keyup", (e) => { keys[e.code] = false; }, true);
    window.addEventListener("mousemove", (e) => { mx = e.clientX; my = e.clientY; }, true);
    window.addEventListener("mousedown", (e) => {
      if (e.target && e.target.closest && e.target.closest("#ps-banner")) return;
      if (e.button === 0) lmb = true;
      if (e.button === 2) rmb = true;
      e.preventDefault();
    }, true);
    window.addEventListener("mouseup", (e) => {
      if (e.button === 0) lmb = false;
      if (e.button === 2) rmb = false;
    }, true);
    window.addEventListener("contextmenu", (e) => e.preventDefault(), true);
    window.addEventListener("blur", () => { lmb = false; rmb = false; });

    banner.addEventListener("click", (e) => {
      const act = e.target && e.target.dataset && e.target.dataset.act;
      if (act === "restart") location.reload();
      if (act === "keep") banner.hidden = true;
    });

    Events.on(engine, "collisionStart", (ev) => {
      for (const pair of ev.pairs) {
        const A = pair.bodyA;
        const B = pair.bodyB;
        const bullet = A.plugin?.bullet ? A : B.plugin?.bullet ? B : null;
        const chip = A.plugin?.chip ? A : B.plugin?.chip ? B : null;
        if (!bullet || !chip) continue;
        damage(chip, bullet.plugin.dmg);
        bullet.plugin.life = 0;
      }
    });

    function fire() {
      if (weapon === 0) {
        if (cool > 0) return;
        cool = rmb ? 9 : 3;
        spawnBullet(rmb ? 14 : 20, rmb ? 7 : 3, rmb ? 2 : 1, 46, rmb ? "#ffb703" : "#ffe66d");
        return;
      }
      if (weapon === 1) {
        const dir = rmb ? -1 : 1;
        for (const c of chips) {
          const d = Vector.sub(player.position, c.position);
          const len = Vector.magnitude(d);
          if (len < 240 && len > 10) {
            Body.applyForce(c, c.position, Vector.mult(Vector.normalise(d), dir * 0.00022));
          }
        }
        return;
      }
      if (weapon === 2) {
        if (cool > 0) return;
        cool = 2;
        spawnBullet(9, rmb ? 8 : 5, 0.4, 16, "#ff6b35");
        return;
      }
      if (weapon === 3) {
        const a = aim();
        const end = {
          x: player.position.x + Math.cos(a) * 1100,
          y: player.position.y + Math.sin(a) * 1100,
        };
        const hits = Query.ray(chips, player.position, end) || [];
        const count = rmb ? hits.length : Math.min(1, hits.length);
        let tip = end;
        for (let i = 0; i < count; i++) {
          damage(hits[i].body, rmb ? 0.12 : 0.4);
          if (i === 0) tip = hits[i].body.position;
        }
        laser = { x: tip.x, y: tip.y, pierce: rmb };
        return;
      }
      if (weapon === 4 && !hole && cool <= 0) {
        cool = 36;
        const a = aim();
        const pos = {
          x: player.position.x + Math.cos(a) * 150,
          y: player.position.y + Math.sin(a) * 150,
        };
        const body = Bodies.circle(pos.x, pos.y, 6, { isStatic: true, isSensor: true });
        Composite.add(world, body);
        hole = { body, r: rmb ? 110 : 210, pull: rmb ? -0.004 : 0.0035, life: 75 };
      }
    }

    const ctx = fx.getContext("2d");
    function resize() {
      fx.width = innerWidth;
      fx.height = innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    function drawFx() {
      ctx.clearRect(0, 0, fx.width, fx.height);
      for (const b of Composite.allBodies(world)) {
        if (!b.plugin?.bullet) continue;
        ctx.fillStyle = b.plugin.color;
        ctx.beginPath();
        ctx.arc(b.position.x, b.position.y, b.circleRadius || 3, 0, Math.PI * 2);
        ctx.fill();
      }
      if (laser) {
        ctx.strokeStyle = laser.pierce ? "#9ad0ff" : "#7af";
        ctx.lineWidth = laser.pierce ? 5 : 2;
        ctx.beginPath();
        ctx.moveTo(player.position.x, player.position.y);
        ctx.lineTo(laser.x, laser.y);
        ctx.stroke();
        laser = null;
      }
      if (hole) {
        ctx.fillStyle = "rgba(18, 0, 36, 0.55)";
        ctx.beginPath();
        ctx.arc(hole.body.position.x, hole.body.position.y, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(180, 140, 255, 0.7)";
        ctx.beginPath();
        ctx.arc(hole.body.position.x, hole.body.position.y, hole.r * 0.45, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(mx, my, 7, 0, Math.PI * 2);
      ctx.moveTo(mx - 12, my);
      ctx.lineTo(mx - 4, my);
      ctx.moveTo(mx + 4, my);
      ctx.lineTo(mx + 12, my);
      ctx.moveTo(mx, my - 12);
      ctx.lineTo(mx, my - 4);
      ctx.moveTo(mx, my + 4);
      ctx.lineTo(mx, my + 12);
      ctx.stroke();
    }

    function tick() {
      const g = engine.gravity;
      Body.applyForce(player, player.position, { x: 0, y: -g.y * g.scale * player.mass });
      let ix = 0;
      let iy = 0;
      if (keys.KeyA || keys.ArrowLeft) ix -= 1;
      if (keys.KeyD || keys.ArrowRight) ix += 1;
      if (keys.KeyW || keys.ArrowUp) iy -= 1;
      if (keys.KeyS || keys.ArrowDown) iy += 1;
      if (ix || iy) Body.applyForce(player, player.position, { x: ix * 0.002, y: iy * 0.002 });
      pEl.classList.toggle("thrust", !!(ix || iy || keys.Space));
      pEl.style.transform = "translate(" + (player.position.x - 18) + "px," + (player.position.y - 18) + "px) rotate(" + aim() + "rad)";

      if (cool > 0) cool -= 1;
      if (lmb || rmb) fire();

      if (hole) {
        hole.life -= 1;
        const origin = hole.body.position;
        for (const c of chips) {
          const d = Vector.sub(origin, c.position);
          const len = Vector.magnitude(d) || 1;
          if (len < hole.r) Body.applyForce(c, c.position, Vector.mult(Vector.normalise(d), hole.pull));
        }
        if (hole.life <= 0) {
          for (const c of chips.slice()) {
            const d = Vector.sub(c.position, origin);
            const len = Vector.magnitude(d) || 1;
            if (len < hole.r) {
              Body.applyForce(c, c.position, Vector.mult(Vector.normalise(d), 0.012));
              damage(c, 1);
            }
          }
          Composite.remove(world, hole.body);
          hole = null;
        }
      }

      for (const b of Composite.allBodies(world).slice()) {
        if (b.plugin?.bullet) {
          b.plugin.life -= 1;
          if (b.plugin.life <= 0) Composite.remove(world, b);
        }
        if (b.plugin?.chip) {
          const { x, y } = b.position;
          const { w, h, node } = b.plugin;
          node.style.transform = "translate(" + (x - w / 2) + "px," + (y - h / 2) + "px) rotate(" + b.angle + "rad)";
          if (y > innerHeight + 520 || x < -400 || x > innerWidth + 400) damage(b, 99);
        }
      }

      drawFx();
      hud.textContent = NAMES[weapon] + "  ·  " + smashed + "/" + total + "  ·  WASD  ماوس  ۱–۵  Space  Shift+R";
      if (!bannerShown && total > 6 && chips.length <= Math.max(3, total * 0.12)) {
        banner.hidden = false;
        bannerShown = true;
      }
    }

    const runner = Runner.create();
    Runner.run(runner, engine);
    (function loop() {
      tick();
      requestAnimationFrame(loop);
    })();
  }

  try {
    api.runtime.onMessage.addListener((msg) => {
      if (msg && msg.type === "start") startPageSmash();
    });
  } catch (e) {}

  try {
    if (sessionStorage.getItem("pageSmash") === "1") startPageSmash();
  } catch (e) {}

  try {
    const pending = api.storage?.session?.get?.("armed");
    if (pending && typeof pending.then === "function") {
      pending.then((res) => {
        if (res && res.armed) startPageSmash();
      }).catch(() => {});
    }
  } catch (e) {}
})();
