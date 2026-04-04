(function () {
  var main = document.getElementById("panel-main");
  var guest = document.getElementById("panel-guest");
  var hero = document.getElementById("panel-hero");
  var stats = document.getElementById("panel-stats");
  var greeting = document.getElementById("panel-greeting");
  var avatarEl = document.getElementById("panel-avatar");
  var nameEl = document.getElementById("panel-user-name");
  var emailEl = document.getElementById("panel-user-email");
  var memberEl = document.getElementById("panel-member-since");
  var statBookings = document.getElementById("stat-bookings");
  var statDocs = document.getElementById("stat-docs");
  var statNext = document.getElementById("stat-next");
  var bookingsBody = document.getElementById("panel-bookings-body");
  var bookingsWrap = document.getElementById("panel-bookings-wrap");
  var bookingsEmpty = document.getElementById("panel-bookings-empty");
  var bookingsNote = document.getElementById("panel-bookings-note");
  var aboutEl = document.getElementById("panel-about");
  var previewEl = document.getElementById("panel-about-preview");
  var saveBtn = document.getElementById("panel-save-about");
  var aboutMsg = document.getElementById("panel-about-msg");
  var logoutBtn = document.getElementById("panel-logout");
  var navLogin = document.getElementById("panel-nav-login");
  var uploadForm = document.getElementById("panel-upload-form");
  var uploadMsg = document.getElementById("panel-upload-msg");
  var uploadList = document.getElementById("panel-upload-list");
  var heroWelcome = document.getElementById("panel-hero-welcome");
  var copyEmailBtn = document.getElementById("panel-copy-email");
  var aboutCountEl = document.getElementById("panel-about-count");
  var spotlight = document.getElementById("panel-spotlight");

  function esc(s) {
    if (s === null || s === undefined) return "";
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function formatRoute(city, country) {
    var c = city != null && String(city).trim() ? String(city).trim() : "";
    var co = esc(country || "");
    if (c) return esc(c) + ", " + co;
    return co;
  }

  function formatMoney(n) {
    var x = Number(n);
    if (isNaN(x)) return "—";
    return x.toLocaleString("az-Latn", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " ₼";
  }

  function formatDateShort(s) {
    if (!s) return "—";
    var t = String(s);
    if (t.length >= 10 && t.indexOf("-") >= 0) return t.slice(0, 10);
    try {
      var d = new Date(t);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString("az-Latn", { day: "numeric", month: "short", year: "numeric" });
      }
    } catch (e) {}
    return t.slice(0, 16);
  }

  function greetingLine() {
    var h = new Date().getHours();
    if (h >= 5 && h < 12) return "Sabahınız xeyir";
    if (h >= 12 && h < 17) return "Gününüz xeyir";
    if (h >= 17 && h < 22) return "Axşamınız xeyir";
    return "Xoş gəldiniz";
  }

  function firstNameFromUser(fullName, email) {
    var n = (fullName || "").trim();
    if (n) {
      var parts = n.split(/\s+/);
      return parts[0];
    }
    if (email) return String(email).split("@")[0];
    return "Səyahətçi";
  }

  function updateAboutCount() {
    if (!aboutEl || !aboutCountEl) return;
    var len = (aboutEl.value || "").length;
    aboutCountEl.textContent =
      len.toLocaleString("az-Latn") + " / 100 000 simvol";
  }

  function formatMemberSince(iso) {
    if (!iso) return "Üzv: —";
    try {
      var d = new Date(iso);
      if (isNaN(d.getTime())) return "Üzv: " + String(iso).slice(0, 10);
      var m = d.toLocaleDateString("az-Latn", { month: "long", year: "numeric" });
      return "Üzv: " + m.charAt(0).toUpperCase() + m.slice(1);
    } catch (e) {
      return "Üzv: —";
    }
  }

  function statusBadge(status) {
    var raw = String(status || "");
    var cls = "badge";
    if (raw.indexOf("ödən") >= 0) cls += " badge--success";
    else if (raw.indexOf("gözlə") >= 0) cls += " badge--warn";
    else cls += " badge--neutral";
    return '<span class="' + cls + '">' + esc(raw) + "</span>";
  }

  function setAvatar(name, email) {
    if (!avatarEl) return;
    var t = (name || email || "?").trim();
    var ch = t.charAt(0).toUpperCase();
    if (/[a-zA-ZəöüğışçƏÖÜĞİŞÇ]/.test(ch)) avatarEl.textContent = ch;
    else avatarEl.textContent = "✈";
  }

  function showAboutMsg(text, err) {
    if (!aboutMsg) return;
    aboutMsg.textContent = text || "";
    aboutMsg.className =
      "form-msg" + (text ? (err ? " form-msg--error is-visible" : " form-msg--ok is-visible") : "");
  }

  function showUploadMsg(text, err) {
    if (!uploadMsg) return;
    uploadMsg.textContent = text || "";
    uploadMsg.className =
      "form-msg" + (text ? (err ? " form-msg--error is-visible" : " form-msg--ok is-visible") : "");
  }

  function renderPreview(html) {
    if (!previewEl) return;
    previewEl.innerHTML = html || "";
  }

  function renderBookings(bookings, note) {
    if (bookingsNote) {
      if (note) {
        bookingsNote.hidden = false;
        bookingsNote.textContent = note;
      } else {
        bookingsNote.hidden = true;
        bookingsNote.textContent = "";
      }
    }
    if (!bookingsBody || !bookingsWrap || !bookingsEmpty) return;
    bookingsBody.innerHTML = "";
    if (!bookings || bookings.length === 0) {
      bookingsWrap.hidden = true;
      bookingsEmpty.hidden = false;
      if (statNext) statNext.textContent = "—";
      return;
    }
    bookingsEmpty.hidden = true;
    bookingsWrap.hidden = false;
    var nextFlight = null;
    bookings.forEach(function (b) {
      var fd = b.flight_date ? String(b.flight_date).slice(0, 10) : "";
      if (fd && (!nextFlight || fd < nextFlight)) nextFlight = fd;
    });
    var today = new Date().toISOString().slice(0, 10);
    var upcoming = bookings
      .filter(function (b) {
        var fd = b.flight_date ? String(b.flight_date).slice(0, 10) : "";
        return fd && fd >= today;
      })
      .sort(function (a, b) {
        return String(a.flight_date).localeCompare(String(b.flight_date));
      });
    if (statNext) {
      statNext.textContent =
        upcoming.length > 0 ? formatDateShort(upcoming[0].flight_date) : formatDateShort(bookings[0].flight_date);
    }
    bookings.forEach(function (b) {
      var tr = document.createElement("tr");
      var route =
        formatRoute(b.from_city, b.from_country) + " → " + formatRoute(b.to_city, b.to_country);
      tr.innerHTML =
        "<td><strong>#" +
        esc(b.id) +
        "</strong><br /><span class=\"panel-cell-sub\">" +
        esc(b.flight_code) +
        "</span></td><td>" +
        route +
        "</td><td>" +
        esc(formatDateShort(b.flight_date)) +
        "</td><td>" +
        esc(formatMoney(b.amount)) +
        "</td><td>" +
        statusBadge(b.status) +
        "</td>";
      bookingsBody.appendChild(tr);
    });
  }

  fetch("/api/me", { credentials: "same-origin" })
    .then(function (r) {
      return r.json();
    })
    .then(function (data) {
      if (!data.logged_in || !data.user) {
        if (guest) guest.hidden = false;
        if (main) main.hidden = true;
        if (hero) hero.hidden = true;
        if (stats) stats.hidden = true;
        if (spotlight) spotlight.hidden = true;
        window.location.href = "login.html";
        return;
      }
      var u = data.user;
      if (guest) guest.hidden = true;
      if (main) main.hidden = false;
      if (hero) hero.hidden = false;
      if (stats) stats.hidden = false;
      if (spotlight) spotlight.hidden = false;
      if (logoutBtn) {
        logoutBtn.hidden = false;
        if (navLogin) navLogin.hidden = true;
      }

      if (nameEl) nameEl.textContent = u.full_name || "Səyahətçi";
      if (emailEl) emailEl.textContent = u.email || "";
      if (memberEl) memberEl.textContent = formatMemberSince(u.created_at);
      if (heroWelcome) {
        heroWelcome.textContent =
          greetingLine() + ", " + firstNameFromUser(u.full_name, u.email) + "!";
      }
      setAvatar(u.full_name, u.email);

      if (statBookings) statBookings.textContent = "…";

      if (aboutEl) {
        aboutEl.value = u.about_me || "";
        aboutEl.addEventListener("input", updateAboutCount);
        updateAboutCount();
      }
      renderPreview(u.about_me || "");

      if (copyEmailBtn && emailEl) {
        copyEmailBtn.addEventListener("click", function () {
          var t = (emailEl.textContent || "").trim();
          if (!t) return;
          function done() {
            copyEmailBtn.classList.add("is-done");
            copyEmailBtn.innerHTML = '<span aria-hidden="true">✓</span>';
            setTimeout(function () {
              copyEmailBtn.classList.remove("is-done");
              copyEmailBtn.innerHTML = '<span aria-hidden="true">📋</span>';
            }, 1600);
          }
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(t).then(done).catch(function () {});
          } else {
            var ta = document.createElement("textarea");
            ta.value = t;
            document.body.appendChild(ta);
            ta.select();
            try {
              document.execCommand("copy");
              done();
            } catch (e) {}
            document.body.removeChild(ta);
          }
        });
      }

      fetch("/api/me/bookings", { credentials: "same-origin" })
        .then(function (r) {
          return r.json();
        })
        .then(function (bd) {
          var list = (bd.ok && bd.bookings) || [];
          if (statBookings) statBookings.textContent = String(list.length);
          renderBookings(list, bd.note || "");
        })
        .catch(function () {
          if (statBookings) statBookings.textContent = "0";
          renderBookings([], "");
        });

      if (saveBtn && aboutEl) {
        saveBtn.addEventListener("click", function () {
          showAboutMsg("", false);
          fetch("/api/me/profile", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            credentials: "same-origin",
            body: JSON.stringify({ about_me: aboutEl.value }),
          })
            .then(function (r) {
              return r.json().then(function (d) {
                return { ok: r.ok, data: d };
              });
            })
            .then(function (res) {
              if (res.data.ok && res.data.user) {
                showAboutMsg("Profil yeniləndi.", false);
                renderPreview(res.data.user.about_me || "");
              } else {
                showAboutMsg(res.data.error || "Xəta", true);
              }
            })
            .catch(function () {
              showAboutMsg("Server xətası.", true);
            });
        });
      }

      function refreshUploads() {
        fetch("/api/uploads/mine", { credentials: "same-origin" })
          .then(function (r) {
            return r.json();
          })
          .then(function (d) {
            var items = d.uploads || [];
            if (statDocs) statDocs.textContent = String(items.length);
            if (!uploadList) return;
            uploadList.innerHTML = "";
            items.forEach(function (it) {
              var li = document.createElement("li");
              var a = document.createElement("a");
              a.href = it.url || "#";
              a.textContent = it.original_name || it.stored_name;
              a.target = "_blank";
              a.rel = "noopener noreferrer";
              li.appendChild(a);
              uploadList.appendChild(li);
            });
          });
      }

      if (uploadForm) {
        uploadForm.addEventListener("submit", function (e) {
          e.preventDefault();
          showUploadMsg("", false);
          var fi = document.getElementById("panel-file");
          if (!fi || !fi.files || !fi.files[0]) {
            showUploadMsg("Fayl seçin.", true);
            return;
          }
          var fd = new FormData();
          fd.append("file", fi.files[0]);
          fetch("/api/upload", {
            method: "POST",
            credentials: "same-origin",
            body: fd,
          })
            .then(function (r) {
              return r.json().then(function (d) {
                return { ok: r.ok, data: d };
              });
            })
            .then(function (res) {
              if (res.data.ok) {
                showUploadMsg("Fayl qəbul edildi.", false);
                fi.value = "";
                refreshUploads();
              } else {
                showUploadMsg(res.data.error || "Xəta", true);
              }
            })
            .catch(function () {
              showUploadMsg("Server xətası.", true);
            });
        });
      }

      refreshUploads();

      if (logoutBtn) {
        logoutBtn.addEventListener("click", function () {
          fetch("/api/logout", { method: "POST", credentials: "same-origin" }).then(function () {
            window.location.href = "login.html";
          });
        });
      }
    })
    .catch(function () {
      if (nameEl) nameEl.textContent = "Qoşulma xətası";
    });
})();
