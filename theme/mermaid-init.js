(function () {
  var codeBlocks = document.querySelectorAll("code.language-mermaid");
  if (!codeBlocks.length) return;

  var sources = [];
  codeBlocks.forEach(function (code) {
    sources.push({ pre: code.parentElement, text: code.textContent });
  });

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

    mermaid.run();
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
      s.div.removeAttribute("data-processed");
      s.div.innerHTML = "";
      s.div.textContent = s.text;
    });
    mermaid.run();
  }).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
})();
