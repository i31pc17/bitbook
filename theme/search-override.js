/**
 * search-override.js — mdBook search enhancements
 *
 * 1. Paste support: mdBook only listens for 'keyup', so paste (Ctrl+V / context menu)
 *    never triggers a search. We listen for 'input' event which fires on ANY value change.
 * 2. Ctrl+F interception: Opens mdBook search panel instead of browser's native find.
 * 3. Search result highlight: background highlight on <em> in teasers AND titles.
 * 4. Title highlight: mdBook only highlights body text — we post-process breadcrumb links.
 */
(function () {
  'use strict';

  // ── 1. Inject search highlight CSS ──────────────────────────────────
  var style = document.createElement('style');
  style.textContent = [
    'ul#mdbook-searchresults span.teaser em,',
    'ul#mdbook-searchresults a em {',
    '  background-color: var(--search-mark-bg);',
    '  color: var(--bg);',
    '  padding: 0.1em 0.25em;',
    '  border-radius: 3px;',
    '  font-style: normal;',
    '  font-weight: 700;',
    '}',
    '',
    '#mdbook-search-wrapper:not(.hidden) {',
    '  position: fixed;',
    '  top: 0;',
    '  left: 0;',
    '  right: 0;',
    '  bottom: 0;',
    '  z-index: 200;',
    '  background: var(--bg);',
    '  display: flex;',
    '  flex-direction: column;',
    '  padding: 1rem;',
    '  overflow: hidden;',
    '}',
    '',
    '#mdbook-search-wrapper:not(.hidden) #mdbook-searchresults-outer {',
    '  flex: 1;',
    '  overflow-y: auto;',
    '  margin-top: 0.5rem;',
    '}',
    '',
    '.sidebar-home {',
    '  padding: 14px 16px;',
    '  border-bottom: 1px solid var(--sidebar-separator);',
    '  font-size: 14px;',
    '  position: relative;',
    '  z-index: 10;',
    '  background: var(--sidebar-bg);',
    '}',
    '#mdbook-sidebar > .sidebar-scrollbox {',
    '  top: 49px !important;',
    '}',
    '.sidebar-home a {',
    '  color: var(--sidebar-fg);',
    '  text-decoration: none;',
    '  display: block;',
    '  transition: color 0.15s;',
    '}',
    '.sidebar-home a:hover {',
    '  color: var(--sidebar-active);',
    '}',
  ].join('\n');
  document.head.appendChild(style);

  // ── Helper: wrap matching words in <em> inside text nodes ──────────
  function highlightTextNodes(el, words) {
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
    var nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    for (var n = 0; n < nodes.length; n++) {
      var node = nodes[n];
      var text = node.textContent;
      var lower = text.toLowerCase();
      var fragments = [];
      var lastIdx = 0;

      // Collect all match ranges, greedy left-to-right
      var ranges = [];
      for (var w = 0; w < words.length; w++) {
        var pos = 0;
        while ((pos = lower.indexOf(words[w], pos)) !== -1) {
          ranges.push([pos, pos + words[w].length]);
          pos += words[w].length;
        }
      }
      if (ranges.length === 0) continue;

      // Sort by start position, merge overlapping
      ranges.sort(function (a, b) { return a[0] - b[0]; });
      var merged = [ranges[0]];
      for (var r = 1; r < ranges.length; r++) {
        var prev = merged[merged.length - 1];
        if (ranges[r][0] <= prev[1]) {
          prev[1] = Math.max(prev[1], ranges[r][1]);
        } else {
          merged.push(ranges[r]);
        }
      }

      // Build fragments
      for (var m = 0; m < merged.length; m++) {
        if (merged[m][0] > lastIdx) {
          fragments.push(document.createTextNode(text.slice(lastIdx, merged[m][0])));
        }
        var em = document.createElement('em');
        em.textContent = text.slice(merged[m][0], merged[m][1]);
        fragments.push(em);
        lastIdx = merged[m][1];
      }
      if (lastIdx < text.length) {
        fragments.push(document.createTextNode(text.slice(lastIdx)));
      }

      var parent = node.parentNode;
      for (var f = 0; f < fragments.length; f++) {
        parent.insertBefore(fragments[f], node);
      }
      parent.removeChild(node);
    }
  }

  // ── 2. Fix paste / programmatic value changes ──────────────────────
  var searchbar = document.getElementById('mdbook-searchbar');
  if (searchbar) {
    // 'input' event fires on: keyboard input, paste, cut, drag-drop, IME
    searchbar.addEventListener('input', function () {
      searchbar.dispatchEvent(new KeyboardEvent('keyup', {
        key: 'Unidentified',
        bubbles: true,
      }));
    }, false);
  }

  // ── 3. Highlight search terms in result titles (breadcrumbs) ───────
  // mdBook's formatSearchResult only wraps body teaser matches in <em>.
  // We use MutationObserver to post-process title links after render.
  var searchResults = document.getElementById('mdbook-searchresults');
  if (searchResults && searchbar) {
    new MutationObserver(function () {
      var term = searchbar.value.trim().toLowerCase();
      if (!term) return;
      var words = term.split(/\s+/);
      var links = searchResults.querySelectorAll('li > a');
      for (var i = 0; i < links.length; i++) {
        if (links[i].querySelector('em')) continue;
        highlightTextNodes(links[i], words);
      }
    }).observe(searchResults, { childList: true });
  }

  // ── 4. Ctrl+F / Cmd+F interception ─────────────────────────────────
  document.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
      e.preventDefault();
      e.stopPropagation();

      var wrapper = document.getElementById('mdbook-search-wrapper');
      var bar = document.getElementById('mdbook-searchbar');
      var toggle = document.getElementById('mdbook-search-toggle');

      if (!wrapper || !bar) return;

      if (wrapper.classList.contains('hidden')) {
        if (toggle) toggle.click();
      }

      bar.select();
    }
  }, true); // capture phase to beat browser's native handler
})();
