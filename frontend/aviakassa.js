/*
  Aviakassa — ölkə + şəhər seçimi, tarix yoxlaması (real bilet saytı axını)
*/

(function () {
  if (window.location.search) {
    history.replaceState(null, "", window.location.pathname + window.location.hash);
  }

  /** Ölkə adı → əsas şəhər / aeroportlar (nümunə siyahılar) */
  var OLKE_SEHERLER = {
    Azərbaycan: ["Bakı", "Gəncə", "Naxçıvan"],
    Türkiyə: ["İstanbul", "Ankara", "İzmir", "Antalya", "Bodrum"],
    "Birləşmiş Ərəb Əmirlikləri": ["Dubay", "Əbu-Dabi", "Şarja"],
    Qətər: ["Doha"],
    Küveyt: ["Küveyt şəhəri"],
    "Səudiyyə Ərəbistanı": ["Riyad", "Ciddə", "Mədinə"],
    İran: ["Tehran", "İsfahan", "Şiraz"],
    İraq: ["Bağdad", "İrbil"],
    Gürcüstan: ["Tbilisi", "Batumi", "Kutaisi"],
    Rusiya: ["Moskva", "Sankt-Peterburq", "Soçi"],
    Ukrayna: ["Kıyiv", "Lviv", "Odessa"],
    Almaniya: ["Berlin", "Münhen", "Frankfurt", "Hamburq"],
    Fransa: ["Paris", "Lyon", "Nitsa", "Marsel"],
    İtaliya: ["Roma", "Milan", "Venesiya", "Neapol"],
    İspaniya: ["Madrid", "Barselona", "Valensiya"],
    "Birləşmiş Krallıq": ["London", "Mançester", "Edinburq"],
    ABŞ: ["Nyu-York", "Los-Anceles", "Çikaqo", "Miami"],
    Kanada: ["Toronto", "Vankuver", "Monreal"],
    Çin: ["Pekin", "Şanqay", "Quançjou"],
    Yaponiya: ["Tokio", "Osaka", "Kyoto"],
    Hindistan: ["Dehli", "Mumbay", "Banqalor"],
    Misir: ["Qahirə", "Şarm əş-Şeyx", "Lükser"],
    Yunanistan: ["Afina", "Saloniki", "Krit"],
    Kipr: ["Lefkoşa", "Larnaka", "Pafos"],
    İsveç: ["Stokholm", "Gothenburq"],
    Niderland: ["Amsterdam", "Rotterdam", "Haaqa"],
    Belçika: ["Brüssel", "Antverpen"],
    Avstraliya: ["Sidney", "Melburn", "Brisben"],
    Özbəkistan: ["Daşkənd", "Səmərqənd", "Buxara"],
    Qazaxıstan: ["Almatı", "Nur-Sultan", "Şımkent"],
    Türkmənistan: ["Aşqabad", "Türkmenbaşı"],
    Polşa: ["Varşava", "Krakov", "Qdansk"],
    Avstriya: ["Vyana", "Salzburg", "İnsbruk"],
    İsveçrə: ["Cenevrə", "Sürix", "Bern"],
  };

  var OLKELER = [];
  for (var k in OLKE_SEHERLER) {
    if (Object.prototype.hasOwnProperty.call(OLKE_SEHERLER, k)) OLKELER.push(k);
  }
  OLKELER.sort(function (a, b) {
    return a.localeCompare(b, "az");
  });

  var form = document.getElementById("flight-search-form");
  var msgEl = document.getElementById("form-message");
  var summaryBox = document.getElementById("search-summary-box");
  var elHaradanOlke = document.getElementById("haradan-olke");
  var elHaradanSeher = document.getElementById("haradan-seher");
  var elHaraOlke = document.getElementById("hara-olke");
  var elHaraSeher = document.getElementById("hara-seher");
  var elTarix = document.getElementById("tarix");
  var elSernisin = document.getElementById("sərnişin");

  function seherleriDoldur(sel, olke, bosMətn) {
    sel.innerHTML = "";
    sel.disabled = true;
    sel.setAttribute("aria-disabled", "true");
    var bos = document.createElement("option");
    bos.value = "";
    bos.textContent = bosMətn;
    sel.appendChild(bos);
    if (!olke || !OLKE_SEHERLER[olke]) {
      return;
    }
    sel.disabled = false;
    sel.removeAttribute("aria-disabled");
    var arr = OLKE_SEHERLER[olke];
    for (var i = 0; i < arr.length; i++) {
      var o = document.createElement("option");
      o.value = arr[i];
      o.textContent = arr[i];
      sel.appendChild(o);
    }
  }

  function olkeSecimleriniDoldur(sel, bosMətn) {
    var bos = document.createElement("option");
    bos.value = "";
    bos.textContent = bosMətn;
    sel.appendChild(bos);
    for (var i = 0; i < OLKELER.length; i++) {
      var o = document.createElement("option");
      o.value = OLKELER[i];
      o.textContent = OLKELER[i];
      sel.appendChild(o);
    }
  }

  olkeSecimleriniDoldur(elHaradanOlke, "— Ölkə seçin —");
  olkeSecimleriniDoldur(elHaraOlke, "— Ölkə seçin —");
  seherleriDoldur(elHaradanSeher, "", "— Əvvəl ölkə seçin —");
  seherleriDoldur(elHaraSeher, "", "— Əvvəl ölkə seçin —");

  elHaradanOlke.addEventListener("change", function () {
    seherleriDoldur(elHaradanSeher, elHaradanOlke.value, "— Şəhər seçin —");
  });
  elHaraOlke.addEventListener("change", function () {
    seherleriDoldur(elHaraSeher, elHaraOlke.value, "— Şəhər seçin —");
  });

  elTarix.min = new Date().toISOString().split("T")[0];

  function guvenliMətn(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function trimStr(s) {
    return (s || "").trim();
  }

  function olkeSiyahindaVar(s) {
    var t = trimStr(s);
    if (!t) return false;
    for (var i = 0; i < OLKELER.length; i++) {
      if (OLKELER[i] === t) return true;
    }
    return false;
  }

  function seherSiyahindaVar(olke, seher) {
    var t = trimStr(seher);
    if (!t || !olke) return false;
    var arr = OLKE_SEHERLER[olke];
    if (!arr) return false;
    for (var i = 0; i < arr.length; i++) {
      if (arr[i] === t) return true;
    }
    return false;
  }

  function tarixKecemediMi(isoDateStr) {
    if (!isoDateStr) return false;
    var sec = isoDateStr.split("-");
    var secilen = new Date(Number(sec[0]), Number(sec[1]) - 1, Number(sec[2]));
    var bugun = new Date();
    bugun.setHours(0, 0, 0, 0);
    secilen.setHours(0, 0, 0, 0);
    return secilen.getTime() >= bugun.getTime();
  }

  function clearInputErrors() {
    var a = form.querySelectorAll(".input-error");
    for (var i = 0; i < a.length; i++) a[i].classList.remove("input-error");
  }

  function setMsg(text, nov) {
    msgEl.textContent = text;
    msgEl.className =
      "form-msg form-grid--full-width is-visible " + (nov === "ok" ? "form-msg--ok" : "form-msg--error");
  }

  function hideMsg() {
    msgEl.textContent = "";
    msgEl.className = "form-msg form-grid--full-width";
  }

  function secimXetasiniSil(sel) {
    sel.addEventListener("change", function () {
      sel.classList.remove("input-error");
    });
  }

  secimXetasiniSil(elHaradanOlke);
  secimXetasiniSil(elHaradanSeher);
  secimXetasiniSil(elHaraOlke);
  secimXetasiniSil(elHaraSeher);

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    clearInputErrors();
    hideMsg();
    summaryBox.hidden = true;
    summaryBox.textContent = "";

    var ho = trimStr(elHaradanOlke.value);
    var hs = trimStr(elHaradanSeher.value);
    var ko = trimStr(elHaraOlke.value);
    var ks = trimStr(elHaraSeher.value);
    var tarix = elTarix.value;

    if (!ho || !olkeSiyahindaVar(ho)) {
      setMsg("«Haradan» üçün ölkə seçin.", "err");
      elHaradanOlke.classList.add("input-error");
      elHaradanOlke.focus();
      return;
    }
    if (!hs || !seherSiyahindaVar(ho, hs)) {
      setMsg("«Haradan» üçün şəhər seçin.", "err");
      elHaradanSeher.classList.add("input-error");
      elHaradanSeher.focus();
      return;
    }

    if (!ko || !olkeSiyahindaVar(ko)) {
      setMsg("«Hara» üçün ölkə seçin.", "err");
      elHaraOlke.classList.add("input-error");
      elHaraOlke.focus();
      return;
    }
    if (!ks || !seherSiyahindaVar(ko, ks)) {
      setMsg("«Hara» üçün şəhər seçin.", "err");
      elHaraSeher.classList.add("input-error");
      elHaraSeher.focus();
      return;
    }

    if (ho === ko && hs === ks) {
      setMsg("Çıxış və təyinat eyni şəhər ola bilməz.", "err");
      elHaraSeher.classList.add("input-error");
      elHaraSeher.focus();
      return;
    }

    if (!tarix) {
      setMsg("Uçuş tarixini seçin.", "err");
      elTarix.classList.add("input-error");
      elTarix.focus();
      return;
    }
    if (!tarixKecemediMi(tarix)) {
      setMsg("Keçmiş tarix seçmək olmaz.", "err");
      elTarix.classList.add("input-error");
      elTarix.focus();
      return;
    }

    var sernisin = elSernisin.value;
    if (sernisin !== "1" && sernisin !== "2" && sernisin !== "3") {
      setMsg("Sərnişin sayını düzgün seçin.", "err");
      elSernisin.classList.add("input-error");
      elSernisin.focus();
      return;
    }

    setMsg("Məlumatlar qəbul edildi. Aşağıda xülasə.", "ok");
    summaryBox.hidden = false;
    var haradanSətir = guvenliMətn(hs) + ", " + guvenliMətn(ho);
    var haraSətir = guvenliMətn(ks) + ", " + guvenliMətn(ko);
    summaryBox.innerHTML =
      "<strong>Axtarış xülasəsi</strong><br />" +
      "<span class=\"search-summary__route\">" +
      haradanSətir +
      " → " +
      haraSətir +
      "</span><br />Tarix: " +
      guvenliMətn(tarix) +
      " · Sərnişin: " +
      guvenliMətn(sernisin) +
      " nəfər";
  });

  var userDbInfo = document.getElementById("user-db-info");
  if (userDbInfo) {
    fetch("/api/me", { credentials: "same-origin" })
      .then(function (r) {
        return r.json();
      })
      .then(function (data) {
        if (!data.ok || !data.logged_in || !data.user) return;
        var u = data.user;
        var ad = u.full_name || u.email || "";
        userDbInfo.textContent =
          "Hesab: " + ad + " · " + u.email + (u.created_at ? " · " + u.created_at : "");
        userDbInfo.hidden = false;
      })
      .catch(function () {});
  }
})();
