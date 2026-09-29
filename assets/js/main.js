(function () {
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- split the name into letters  ---------- */
  var h1 = document.querySelector(".name h1");
  var chars = [], n = 0;
  h1.setAttribute("aria-label", h1.textContent.trim().replace(/\s+/g, " "));
  h1.querySelectorAll("span").forEach(function (word) {
    var text = word.textContent.trim();
    word.textContent = "";
    word.className = "word";
    word.setAttribute("aria-hidden", "true");
    text.split("").forEach(function (c) {
      var o = document.createElement("span"); o.className = "ch"; o.style.setProperty("--i", n++);
      var s = document.createElement("span"); s.className = "in"; s.textContent = c;
      o.appendChild(s); word.appendChild(o);
      chars.push({ el: s, w: 300, dx: (Math.random() - .5) * 1000, dy: (Math.random() - .5) * 800, r: (Math.random() - .5) * 140 });
    });
  });

  /* ---------- scroll progress ---------- */
  var home = document.getElementById("home");
  var hint = document.getElementById("hint");
  var role = document.querySelector(".role"), bio = document.querySelector(".bio");
  var target = 0, ps = 0;
  function readScroll() { target = Math.max(0, Math.min(1, scrollY / (home.offsetHeight - innerHeight))); }
  addEventListener("scroll", readScroll, { passive: true }); readScroll();
  var ease = function (t) { return t * t * (3 - 2 * t); };

  var pointer = null, content = document.querySelector(".home-content");
  content.addEventListener("pointermove", function (e) { pointer = { x: e.clientX, y: e.clientY }; });
  content.addEventListener("pointerleave", function () { pointer = null; });

  function morphText(el, e, k, up) {
    el.style.opacity = Math.max(0, 1 - e * k).toFixed(3);
    el.style.transform = "translateY(" + (e * up).toFixed(1) + "px) scale(" + (1 - e * .1).toFixed(3) + ")";
    el.style.filter = "blur(" + (e * 10).toFixed(1) + "px)";
  }

  function frame(t) {
    ps += (target - ps) * .12;
    var e = ease(Math.min(1, ps * 1.15));

    /* letters: weight follows cursor, then scatter on scroll */
    for (var i = 0; i < chars.length; i++) {
      var c = chars[i], tw;
      if (pointer) {
        var r = c.el.getBoundingClientRect();
        var d = Math.hypot(pointer.x - (r.left + r.width / 2), pointer.y - (r.top + r.height / 2));
        tw = 200 + 600 * Math.max(0, 1 - d / 380);
      } else tw = 520 + 280 * Math.sin(t / 900 - i * .7);
      c.w += (tw - c.w) * .14;
      c.el.style.fontVariationSettings = '"wght" ' + (c.w + e * 200).toFixed(0);
      c.el.style.transform = "translate(" + (c.dx * e).toFixed(1) + "px," + (c.dy * e).toFixed(1) + "px) rotate(" + (c.r * e).toFixed(1) + "deg) scale(" + (1 + e * .8).toFixed(3) + ")";
      c.el.style.opacity = Math.max(0, 1 - e * 1.25).toFixed(3);
      c.el.style.filter = e > .01 ? "blur(" + (e * 14).toFixed(1) + "px)" : "none";
    }
    morphText(role, e, 2.2, -60);
    morphText(bio, e, 2.2, -40);
    hint.style.opacity = Math.max(0, 1 - ps * 8).toFixed(3);

    /* particles live in particle.js */
    if (window.ParticleBG) ParticleBG.render(e);

    requestAnimationFrame(frame);
  }
  if (reduce) {
    chars.forEach(function (c) { c.el.style.fontVariationSettings = '"wght" 600'; });
    if (window.ParticleBG) ParticleBG.render(0);
  } else requestAnimationFrame(frame);

  /* ---------- reveal sections as they enter ---------- */
  var rise = document.querySelectorAll(".rise");
  rise.forEach(function (el, i) { el.style.setProperty("--d", (i % 4) * 90 + "ms"); });
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add("show"); io.unobserve(x.target); } });
    }, { threshold: .15 });
    rise.forEach(function (el) { io.observe(el); });
  } else rise.forEach(function (el) { el.classList.add("show"); });

  /* ---------- highlight the current nav link ---------- */
  var links = document.querySelectorAll(".nav-links a");
  if ("IntersectionObserver" in window) {
    var nav = new IntersectionObserver(function (es) {
      es.forEach(function (x) {
        if (!x.isIntersecting) return;
        links.forEach(function (l) {
          if (l.getAttribute("href") === "#" + x.target.id) l.setAttribute("aria-current", "page");
          else l.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    document.querySelectorAll("#home, #about, #services, #contact").forEach(function (s) { nav.observe(s); });
  }

  /* ---------- navbar: blur when scrolled, white bar over the white section ---------- */
  var rest = document.querySelector(".rest");
  var navBar = document.querySelector(".navbar");
  function updateNav() {
    navBar.classList.toggle("scrolled", scrollY > 10);
    if (!rest) return;

    var rr = rest.getBoundingClientRect();
    var cut = parseFloat(getComputedStyle(rest).paddingTop) || 0;
    var y = navBar.getBoundingClientRect().height / 2;

    /* white only while the bar is over the white section (not over Contact) */
    var overWhite = rr.top + cut / 2 <= y && rr.bottom - cut / 2 > y;
    navBar.classList.toggle("on-light", overWhite);
  }
  addEventListener("scroll", updateNav, { passive: true });
  addEventListener("resize", updateNav);
  updateNav();
})();