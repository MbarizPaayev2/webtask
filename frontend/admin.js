(function () {
  function T(k, map) {
    return window.AviakassaLang ? AviakassaLang.t(k, map) : k;
  }

  function localeTag() {
    if (!window.AviakassaLang) return "az-Latn";
    var g = AviakassaLang.get();
    if (g === "ru") return "ru-RU";
    if (g === "en") return "en-GB";
    return "az-Latn";
  }

  var msg = document.getElementById("admin-msg");
  var tbodyF = document.querySelector("#admin-flights tbody");
  var tbodyT = document.querySelector("#admin-trans tbody");
  var tidIn = document.getElementById("admin-tid");
  var tidGo = document.getElementById("admin-tid-go");
  var tidOut = document.getElementById("admin-tid-out");
  var statFlights = document.getElementById("stat-n-flights");
  var statTrans = document.getElementById("stat-n-trans");
  var statSum = document.getElementById("stat-sum");

  var lastReport = null;

  function esc(s) {
    if (s === null || s === undefined) return "";
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function formatMoney(n) {
    var x = Number(n);
    if (isNaN(x)) return "—";
    return x.toLocaleString(localeTag(), { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " ₼";
  }

  function formatDateShort(s) {
    if (s === null || s === undefined) return "—";
    var t = String(s);
    if (t.length >= 10 && t.indexOf("-") >= 0) return t.slice(0, 10);
    return t.slice(0, 16);
  }

  function routeCell(city, country) {
    var c = city != null && String(city).trim() ? String(city).trim() : "";
    if (c) {
      return (
        "<strong>" +
        esc(c) +
        '</strong><br /><span class="table-cell-sub">' +
        esc(country || "") +
        "</span>"
      );
    }
    return esc(country || "");
  }

  function statusBadge(status) {
    var raw = String(status || "");
    var cls = "badge";
    if (raw.indexOf("ödən") >= 0 || raw.toLowerCase().indexOf("paid") >= 0) cls += " badge--success";
    else if (raw.indexOf("gözlə") >= 0 || raw.toLowerCase().indexOf("pending") >= 0) cls += " badge--warn";
    else cls += " badge--neutral";
    return '<span class="' + cls + '">' + esc(raw) + "</span>";
  }

  function setBanner(text) {
    if (!msg) return;
    if (!text) {
      msg.hidden = true;
      msg.textContent = "";
      return;
    }
    msg.hidden = false;
    msg.textContent = text;
  }

  function renderReport(d) {
    if (!d) return;
    if (!d.ok) {
      setBanner(T("adm_err_report"));
      return;
    }
    setBanner(d.note || "");

    var flights = d.flights || [];
    var trans = d.transactions || [];

    if (statFlights) statFlights.textContent = String(flights.length);
    if (statTrans) statTrans.textContent = String(trans.length);
    var sum = 0;
    trans.forEach(function (t) {
      var a = Number(t.amount);
      if (!isNaN(a)) sum += a;
    });
    if (statSum) {
      statSum.textContent =
        trans.length === 0
          ? "0"
          : sum.toLocaleString(localeTag(), { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    if (tbodyF) {
      tbodyF.innerHTML = "";
      if (flights.length === 0) {
        tbodyF.innerHTML =
          '<tr><td colspan="7" class="table-empty">' + esc(T("adm_empty_flights")) + "</td></tr>";
      } else {
        flights.forEach(function (f) {
          var tr = document.createElement("tr");
          tr.innerHTML =
            "<td>" +
            esc(f.id) +
            "</td><td><strong>" +
            esc(f.code) +
            "</strong></td><td>" +
            routeCell(f.from_city, f.from_country) +
            "</td><td>" +
            routeCell(f.to_city, f.to_country) +
            "</td><td>" +
            esc(formatDateShort(f.flight_date)) +
            "</td><td>" +
            esc(formatMoney(f.price)) +
            "</td><td>" +
            esc(f.seats) +
            "</td>";
          tbodyF.appendChild(tr);
        });
      }
    }

    if (tbodyT) {
      tbodyT.innerHTML = "";
      if (trans.length === 0) {
        tbodyT.innerHTML =
          '<tr><td colspan="6" class="table-empty">' + esc(T("adm_empty_trans")) + "</td></tr>";
      } else {
        trans.forEach(function (t) {
          var tr = document.createElement("tr");
          tr.innerHTML =
            "<td>" +
            esc(t.id) +
            '</td><td class="cell-clip"> <span class="cell-email">' +
            esc(t.user_email) +
            "</span></td><td>" +
            esc(t.flight_code) +
            "</td><td>" +
            esc(formatMoney(t.amount)) +
            "</td><td>" +
            statusBadge(t.status) +
            "</td><td>" +
            esc(formatDateShort(t.created_at)) +
            "</td>";
          tbodyT.appendChild(tr);
        });
      }
    }
  }

  function loadReport() {
    fetch("/api/admin/reports", { credentials: "same-origin" })
      .then(function (r) {
        return r.json();
      })
      .then(function (d) {
        lastReport = d;
        renderReport(d);
      })
      .catch(function () {
        setBanner(T("auth_err_network"));
      });
  }

  loadReport();

  window.addEventListener("aviakassa:langchange", function () {
    if (window.AviakassaLang && AviakassaLang.applyPage) AviakassaLang.applyPage();
    if (lastReport) renderReport(lastReport);
  });

  if (tidGo && tidOut) {
    tidGo.addEventListener("click", function () {
      var id = parseInt(String(tidIn && tidIn.value), 10);
      if (!id || id < 1) {
        tidOut.textContent = T("adm_tid_bad");
        return;
      }
      tidOut.textContent = T("adm_tid_loading");
      fetch("/api/transactions/" + id, { credentials: "same-origin" })
        .then(function (r) {
          return r.json().then(function (d) {
            return { status: r.status, data: d };
          });
        })
        .then(function (res) {
          tidOut.textContent = JSON.stringify(res.data, null, 2);
        })
        .catch(function () {
          tidOut.textContent = T("adm_tid_err");
        });
    });
  }
})();
