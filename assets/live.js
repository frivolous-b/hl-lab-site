// Live card: reads the paper executor's public /summary (testnet, no real money).
// Remote values are written with textContent only.
(function () {
  var card = document.getElementById("live");
  if (!card) return;
  var url = card.getAttribute("data-src");
  function set(id, text) { var el = document.getElementById(id); if (el) el.textContent = text; }
  function usd(x) { return (x >= 0 ? "+" : "") + x.toFixed(2) + " USD"; }
  function offline() { card.classList.add("offline"); set("live-state", "offline"); set("live-hyp", "offline"); set("live-day", "the executor's summary could not be read"); set("live-pnl", "—"); }
  var ctl = typeof AbortController === "function" ? new AbortController() : null;
  if (ctl) setTimeout(function () { ctl.abort(); }, 8000);
  fetch(url, { cache: "no-store", signal: ctl ? ctl.signal : undefined })
    .then(function (r) { if (!r.ok) throw new Error(String(r.status)); return r.json(); })
    .then(function (s) {
      set("live-state", "online");
      set("live-hyp", String(s.hypothesis));
      var day = s.run && s.run.day !== null ? "day " + s.run.day + " of " + s.run.ofDays + (s.run.ended ? " (ended)" : "") : "not started";
      set("live-day", day);
      if (s.book) set("live-pnl", usd(s.book.shadowPnlUsd) + " vs model " + usd(s.book.expectedPnlUsd));
      var list = document.getElementById("live-crit");
      if (list && Array.isArray(s.criteria)) {
        list.textContent = "";
        s.criteria.forEach(function (c) {
          var li = document.createElement("li");
          li.textContent = (c.ok === true ? "\u2713 " : c.ok === false ? "\u2717 " : "i ") + c.id + ": " + c.value;
          list.appendChild(li);
        });
      }
    })
    .catch(offline);
})();
