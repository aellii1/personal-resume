(function () {
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var cv = document.getElementById("bg");
  if (!cv) return;
  var ctx = cv.getContext("2d");
  var W, H, dpr, P = [], mouse = { x: -999, y: -999 };

  function size() {
    dpr = Math.min(devicePixelRatio || 1, 2); W = innerWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var count = Math.round(Math.min(110, W * H / 13000));
    while (P.length < count) P.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .5, vy: (Math.random() - .5) * .5, r: Math.random() * 1.6 + .8 });
    P.length = count;
  }
  size();
  addEventListener("resize", size);
  addEventListener("pointermove", function (e) { mouse.x = e.clientX; mouse.y = e.clientY; });
  addEventListener("pointerleave", function () { mouse.x = mouse.y = -999; });

  /* e = scroll progress from 0 to 1 (particles swirl and speed up as it grows) */
  function render(e) {
    e = e || 0;
    ctx.clearRect(0, 0, W, H);
    var col = getComputedStyle(document.documentElement).getPropertyValue("--dot").trim() || "29,43,209";
    var link = 130 * (1 - e * .7), cx = W / 2, cy = H / 2;

    for (var a = 0; a < P.length; a++) {
      var p = P[a];
      if (!reduce) {
        var mx = p.x - mouse.x, my = p.y - mouse.y, md = Math.hypot(mx, my);
        if (md < 140 && md > 0) { p.vx += mx / md * .06; p.vy += my / md * .06; }
        if (e > .02) { p.vx += (p.y - cy) * .00005 * e; p.vy += (cx - p.x) * .00005 * e; }
        p.vx *= .985; p.vy *= .985;
        if (Math.hypot(p.vx, p.vy) < .15) { p.vx += (Math.random() - .5) * .02; p.vy += (Math.random() - .5) * .02; }
        p.x += p.vx * (1 + e * 2.5); p.y += p.vy * (1 + e * 2.5);
        if (p.x < -10) p.x = W + 10; if (p.x > W + 10) p.x = -10;
        if (p.y < -10) p.y = H + 10; if (p.y > H + 10) p.y = -10;
      }
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r * (1 + e * .8), 0, 6.283);
      ctx.fillStyle = "rgba(" + col + ",.75)"; ctx.fill();

      for (var b = a + 1; b < P.length; b++) {
        var q = P[b], dd = Math.hypot(p.x - q.x, p.y - q.y);
        if (dd < link) {
          ctx.strokeStyle = "rgba(" + col + "," + (.28 * (1 - dd / link)).toFixed(3) + ")";
          ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
        }
      }
    }
  }

  window.ParticleBG = { render: render };
})();