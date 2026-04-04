/*
  Aviakassa — forma üçün JavaScript
  HTML faylında: <script src="aviakassa.js"></script>
  Məqsəd: ölkə seçimi, tarix yoxlaması, göndərməni saxlamaq (səhifə yenilənməsin)
*/

(function () {
  /*
    Bütün kod bu anonim funksiyanın içindədir.
    Belə olanda dəyişənlər (var) qlobal scope-da görünmür — ad çakışması azalır.
  */

  // --- 1) Ünvan sətri (URL) ---
  // Əvvəl form get ilə göndərilibsə ünvanda ?haradan=... kimi şeylər qala bilər.
  // replaceState ilə ünvandan sorğu hissəsini (?) silirik, səhifə yenidən yüklənmir.
  if (window.location.search) {
    history.replaceState(null, "", window.location.pathname + window.location.hash);
  }

  // --- 2) Ölkə siyahısı ---
  // Haradan və Hara üçün <select> doldurulacaq; istifadəçi yalnız bu adlardan birini seçə bilər.
  var OLKELER = [
    "Azərbaycan",
    "Türkiyə",
    "Birləşmiş Ərəb Əmirlikləri",
    "Qətər",
    "Küveyt",
    "Səudiyyə Ərəbistanı",
    "İran",
    "İraq",
    "Gürcüstan",
    "Rusiya",
    "Ukrayna",
    "Almaniya",
    "Fransa",
    "İtaliya",
    "İspaniya",
    "Birləşmiş Krallıq",
    "ABŞ",
    "Kanada",
    "Çin",
    "Yaponiya",
    "Hindistan",
    "Misir",
    "Yunanistan",
    "Kipr",
    "İsveç",
    "Niderland",
    "Belçika",
    "Avstraliya",
    "Özbəkistan",
    "Qazaxıstan",
    "Türkmənistan",
    "Polşa",
    "Avstriya",
    "İsveçrə"
  ];

  // --- 3) DOM elementlərinə istinad ---
  // getElementById — HTML-də id ilə işarələnmiş teqləri tapırıq
  var form = document.getElementById("flight-search-form");
  var msgEl = document.getElementById("form-message");
  var summaryBox = document.getElementById("search-summary-box");
  var elHaradan = document.getElementById("haradan");
  var elHara = document.getElementById("hara");
  var elTarix = document.getElementById("tarix");
  var elSernisin = document.getElementById("sərnişin");

  /*
    select boş gəlir HTML-də; burada hər birinə əvvəlcə "boş seçim" (value=""),
    sonra OLKELER massivindəki hər ölkə üçün <option> əlavə edirik.
  */
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

  olkeSecimleriniDoldur(elHaradan, "— Haradan ölkə seçin —");
  olkeSecimleriniDoldur(elHara, "— Hara ölkə seçin —");

  // type="date" üçün: keçmiş günləri seçmək olmasın — min atributu bu günə təyin olunur
  // toISOString().split("T")[0] formatı YYYY-MM-DD verir (input date belə istəyir)
  elTarix.min = new Date().toISOString().split("T")[0];

  /*
    innerHTML ilə yazanda istifadəçi mətni birbaşa HTML ola bilər (<script> və s.).
    Bu funksiya &, <, > işarələrini escape edir ki, təhlükəsiz göstərilsin.
  */
  function guvenliMətn(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  // Başda və sonda olan boşluqları atırıq — "  Azərbaycan " → "Azərbaycan"
  function trimStr(s) {
    return (s || "").trim();
  }

  /*
    Göndərilən dəyər həqiqətən OLKELER massivində var mı?
    (Brauzerdə value dəyişdirsə, yalnız siyahıdakı adlar keçərli sayılır.)
  */
  function olkeSiyahindaVar(s) {
    var t = trimStr(s);
    if (!t) return false;
    for (var i = 0; i < OLKELER.length; i++) {
      if (OLKELER[i] === t) return true;
    }
    return false;
  }

  /*
    tarix input-u "2026-04-06" kimi string verir.
    Bunu Date-ə çevirib bu günün tarixilə müqayisə edirik (saatları sıfırlayırıq).
    true = bu gün və ya gələcək
  */
  function tarixKecemediMi(isoDateStr) {
    if (!isoDateStr) return false;
    var sec = isoDateStr.split("-");
    var secilen = new Date(Number(sec[0]), Number(sec[1]) - 1, Number(sec[2]));
    var bugun = new Date();
    bugun.setHours(0, 0, 0, 0);
    secilen.setHours(0, 0, 0, 0);
    return secilen.getTime() >= bugun.getTime();
  }

  // Bütün input/select-lərdən qırmızı xəta çərçivəsini silirik
  function clearInputErrors() {
    var a = form.querySelectorAll(".input-error");
    for (var i = 0; i < a.length; i++) a[i].classList.remove("input-error");
  }

  // form-message bölməsində mətn göstəririk; nov === "ok" yaşıl, deyilsə qırmızı stil
  function setMsg(text, nov) {
    msgEl.textContent = text;
    msgEl.className = "form-msg form-grid--full-width is-visible " + (nov === "ok" ? "form-msg--ok" : "form-msg--error");
  }

  function hideMsg() {
    msgEl.textContent = "";
    msgEl.className = "form-msg form-grid--full-width";
  }

  // İstifadəçi seçimi dəyişəndə köhnə xəta çərçivəsi silinsin
  function secimXetasiniSil(sel) {
    sel.addEventListener("change", function () {
      sel.classList.remove("input-error");
    });
  }

  secimXetasiniSil(elHaradan);
  secimXetasiniSil(elHara);

  // --- 4) Form göndərilməsi ---
  form.addEventListener("submit", function (e) {
    // Brauzerin standart göndərməsini dayandırırıq — səhifə yenilənməsin, URL dəyişməsin
    e.preventDefault();

    clearInputErrors();
    hideMsg();
    summaryBox.hidden = true;
    summaryBox.textContent = "";

    var haradan = trimStr(elHaradan.value);
    var hara = trimStr(elHara.value);
    var tarix = elTarix.value;

    // Haradan: boş olmamalı və siyahıdakı ölkə olmalıdır
    if (!haradan || !olkeSiyahindaVar(haradan)) {
      setMsg("«Haradan» üçün siyahıdan ölkə seçin.", "err");
      elHaradan.classList.add("input-error");
      elHaradan.focus();
      return;
    }

    if (!hara || !olkeSiyahindaVar(hara)) {
      setMsg("«Hara» üçün siyahıdan ölkə seçin.", "err");
      elHara.classList.add("input-error");
      elHara.focus();
      return;
    }

    // Eyni ölkədən eyni ölkəyə uçuş axtarışı bu nümunədə qəbul etmirik
    if (haradan === hara) {
      setMsg("Çıxış və təyinat ölkəsi eyni ola bilməz.", "err");
      elHara.classList.add("input-error");
      elHara.focus();
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

    // Sərnişin: 1, 2 və ya 3 — başqa dəyər olmamalı (normalda select-də yalnız bunlar var)
    var sernisin = elSernisin.value;
    if (sernisin !== "1" && sernisin !== "2" && sernisin !== "3") {
      setMsg("Sərnişin sayını düzgün seçin.", "err");
      elSernisin.classList.add("input-error");
      elSernisin.focus();
      return;
    }

    // Bütün yoxlamalar keçdisə — uğur mesajı və xülasə bloku
    setMsg("Məlumatlar qəbul edildi. Aşağıda xülasə.", "ok");
    summaryBox.hidden = false;
    summaryBox.innerHTML =
      "<strong>Axtarış xülasəsi</strong><br />" +
      guvenliMətn(haradan) +
      " → " +
      guvenliMətn(hara) +
      "<br />Tarix: " +
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
