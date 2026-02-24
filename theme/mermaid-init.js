(function () {
  var codeBlocks = document.querySelectorAll("code.language-mermaid");
  if (!codeBlocks.length) return;

  var sources = [];
  codeBlocks.forEach(function (code) {
    sources.push({ pre: code.parentElement, text: code.textContent });
  });

  /* ── CSS injection ── */
  var style = document.createElement("style");
  style.textContent = [
    ".mermaid-wrap { position:relative; }",
    ".mermaid-wrap .mermaid-zoom-btn {",
    "  position:absolute; top:6px; right:6px;",
    "  width:32px; height:32px; border:none; border-radius:6px;",
    "  background:var(--sidebar-bg, #f5f5f5); color:var(--fg, #333);",
    "  cursor:pointer; opacity:0; transition:opacity .2s;",
    "  display:flex; align-items:center; justify-content:center;",
    "  box-shadow:0 1px 4px rgba(0,0,0,.15); z-index:5;",
    "  font-size:16px; line-height:1; padding:0;",
    "}",
    ".mermaid-wrap:hover .mermaid-zoom-btn { opacity:.85; }",
    ".mermaid-wrap .mermaid-zoom-btn:hover { opacity:1; transform:scale(1.1); }",
    "",
    "/* overlay */",
    ".mermaid-overlay {",
    "  position:fixed; inset:0; z-index:9999;",
    "  background:rgba(0,0,0,.65); backdrop-filter:blur(2px);",
    "  display:flex; align-items:center; justify-content:center;",
    "  cursor:zoom-out;",
    "}",
    ".mermaid-overlay-inner {",
    "  position:relative; max-width:98vw; max-height:96vh;",
    "  overflow:hidden; cursor:default;",
    "  background:var(--bg, #fff); border-radius:10px;",
    "  padding:24px; box-shadow:0 8px 32px rgba(0,0,0,.3);",
    "}",
    ".mermaid-overlay-inner svg { max-width:none; width:auto; height:auto; }",
    ".mermaid-overlay-close {",
    "  position:fixed; top:16px; right:16px; z-index:10000;",
    "  width:28px; height:28px; border:none; border-radius:50%;",
    "  background:var(--sidebar-bg, #eee); color:var(--fg, #333);",
    "  cursor:pointer; font-size:16px; line-height:1;",
    "  display:flex; align-items:center; justify-content:center;",
    "}",
    ".mermaid-overlay-close:hover { background:var(--sidebar-active, #ddd); }",
    ".mermaid-overlay-controls {",
    "  position:fixed; bottom:16px; right:16px; z-index:10000;",
    "  display:flex; gap:4px;",
    "}",
    ".mermaid-overlay-controls button {",
    "  width:32px; height:32px; border:none; border-radius:6px;",
    "  background:var(--sidebar-bg, #eee); color:var(--fg, #333);",
    "  cursor:pointer; font-size:15px; display:flex;",
    "  align-items:center; justify-content:center;",
    "}",
    ".mermaid-overlay-controls button:hover { background:var(--sidebar-active, #ddd); }",
  ].join("\n");
  document.head.appendChild(style);

  /* ── Zoom overlay ── */
  function openZoom(svgHtml, origWidth, origHeight) {
    var overlay = document.createElement("div");
    overlay.className = "mermaid-overlay";

    var inner = document.createElement("div");
    inner.className = "mermaid-overlay-inner";
    inner.innerHTML = svgHtml;

    var svg = inner.querySelector("svg");
    if (svg) {
      svg.removeAttribute("style");
      var vb = svg.getAttribute("viewBox");
      var ratio = origWidth / origHeight;
      var maxW = window.innerWidth * 0.9;
      var maxH = window.innerHeight * 0.85;
      var fitW, fitH;
      if (ratio > maxW / maxH) {
        fitW = maxW;
        fitH = maxW / ratio;
      } else {
        fitH = maxH;
        fitW = maxH * ratio;
      }
      svg.setAttribute("width", fitW);
      svg.setAttribute("height", fitH);
      if (!vb) svg.setAttribute("viewBox", "0 0 " + origWidth + " " + origHeight);
    }
    var baseW = fitW;
    var baseH = fitH;
    var scale = 1;
    var panX = 0;
    var panY = 0;
    var minScale = 0.3;
    var maxScale = 5;

    function applyTransform() {
      if (svg) {
        svg.setAttribute("width", baseW * scale);
        svg.setAttribute("height", baseH * scale);
        svg.style.transform = "translate(" + panX + "px," + panY + "px)";
        svg.style.transformOrigin = "0 0";
      }
    }


    var closeBtn = document.createElement("button");
    closeBtn.className = "mermaid-overlay-close";
    closeBtn.innerHTML = "&#10005;";
    closeBtn.title = "닫기 (Esc)";
    closeBtn.onclick = function (e) { e.stopPropagation(); overlay.remove(); };


    var controls = document.createElement("div");
    controls.className = "mermaid-overlay-controls";

    var zoomIn = document.createElement("button");
    zoomIn.innerHTML = "&#43;";
    zoomIn.title = "확대";
    zoomIn.onclick = function (e) {
      e.stopPropagation();
      scale = Math.min(maxScale, scale * 1.3);
      applyTransform();
    };

    var zoomOut = document.createElement("button");
    zoomOut.innerHTML = "&#8722;";
    zoomOut.title = "축소";
    zoomOut.onclick = function (e) {
      e.stopPropagation();
      scale = Math.max(minScale, scale / 1.3);
      applyTransform();
    };

    var resetBtn = document.createElement("button");
    resetBtn.innerHTML = "&#8634;";
    resetBtn.title = "원래 크기";
    resetBtn.onclick = function (e) {
      e.stopPropagation();
      scale = 1;
      panX = 0;
      panY = 0;
      applyTransform();
    };

    controls.appendChild(zoomOut);
    controls.appendChild(resetBtn);
    controls.appendChild(zoomIn);

    overlay.appendChild(closeBtn);
    overlay.appendChild(controls);
    overlay.appendChild(inner);
    document.body.appendChild(overlay);
    document.body.style.overflow = "hidden";

    inner.addEventListener("wheel", function (e) {
      e.preventDefault();
      if (e.deltaY < 0) {
        scale = Math.min(maxScale, scale * 1.15);
      } else {
        scale = Math.max(minScale, scale / 1.15);
      }
      applyTransform();
    }, { passive: false });

    var dragging = false;
    var dragStartX = 0;
    var dragStartY = 0;
    var panStartX = 0;
    var panStartY = 0;

    inner.addEventListener("mousedown", function (e) {
      if (e.target.tagName === "BUTTON") return;
      dragging = true;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      panStartX = panX;
      panStartY = panY;
      inner.style.cursor = "grabbing";
      e.preventDefault();
    });

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);

    function onMouseMove(e) {
      if (!dragging) return;
      panX = panStartX + (e.clientX - dragStartX);
      panY = panStartY + (e.clientY - dragStartY);
      applyTransform();
    }

    function onMouseUp() {
      if (!dragging) return;
      dragging = false;
      inner.style.cursor = "grab";
    }

    inner.style.cursor = "grab";

    var didDrag = false;
    inner.addEventListener("mousedown", function () { didDrag = false; });
    inner.addEventListener("mousemove", function () { didDrag = true; });

    overlay.addEventListener("click", function (e) {
      if (e.target === overlay && !didDrag) closeOverlay();
    });

    function closeOverlay() {
      overlay.remove();
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    }

    closeBtn.onclick = function (e) {
      e.stopPropagation();
      closeOverlay();
    };

    function onKey(e) {
      if (e.key === "Escape") closeOverlay();
    }
    document.addEventListener("keydown", onKey);
  }

  /* ── Wrap mermaid divs with zoom button ── */
  function addZoomButtons() {
    document.querySelectorAll(".mermaid[data-processed],.mermaid svg").forEach(function (el) {
      var mDiv = el.closest(".mermaid");
      if (!mDiv || mDiv.parentElement.classList.contains("mermaid-wrap")) return;

      var wrap = document.createElement("div");
      wrap.className = "mermaid-wrap";
      mDiv.parentNode.insertBefore(wrap, mDiv);
      wrap.appendChild(mDiv);

      var btn = document.createElement("button");
      btn.className = "mermaid-zoom-btn";
      btn.innerHTML = "&#128269;";
      btn.title = "확대해서 보기";
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        var svg = mDiv.querySelector("svg");
        if (svg) {
          var rect = svg.getBoundingClientRect();
          openZoom(svg.outerHTML, rect.width, rect.height);
        }
      });
      wrap.appendChild(btn);
    });
  }

  /* ── Mermaid CDN load ── */
  var script = document.createElement("script");
  script.src =
    "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js";
  script.onload = function () {
    render();
  };
  document.head.appendChild(script);

  function isDark() {
    var cl = document.documentElement.classList;
    return (
      cl.contains("coal") ||
      cl.contains("navy") ||
      cl.contains("ayu") ||
      cl.contains("mocha") ||
      cl.contains("macchiato") ||
      cl.contains("frappe")
    );
  }

  function render() {
    mermaid.initialize({
      startOnLoad: false,
      theme: isDark() ? "dark" : "default",
      securityLevel: "loose",
    });

    sources.forEach(function (s) {
      if (!s.pre.parentNode) return;
      var div = document.createElement("div");
      div.className = "mermaid";
      div.textContent = s.text;
      s.pre.parentNode.replaceChild(div, s.pre);
      s.div = div;
    });

    mermaid.run().then(function () {
      addZoomButtons();
    });
  }

  new MutationObserver(function () {
    if (typeof mermaid === "undefined") return;
    mermaid.initialize({
      startOnLoad: false,
      theme: isDark() ? "dark" : "default",
      securityLevel: "loose",
    });
    sources.forEach(function (s) {
      if (!s.div) return;

      var wrap = s.div.parentElement;
      if (wrap && wrap.classList.contains("mermaid-wrap")) {
        var btn = wrap.querySelector(".mermaid-zoom-btn");
        if (btn) btn.remove();
        wrap.parentNode.insertBefore(s.div, wrap);
        wrap.remove();
      }
      s.div.removeAttribute("data-processed");
      s.div.innerHTML = "";
      s.div.textContent = s.text;
    });
    mermaid.run().then(function () {
      addZoomButtons();
    });
  }).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
})();
