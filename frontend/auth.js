/* Login və qeydiyyat — validasiya + API */

(function () {
  function T(k, map) {
    return window.AviakassaLang ? AviakassaLang.t(k, map) : k;
  }

  var msgEl = document.getElementById("auth-message");
  var formLogin = document.getElementById("login-form");
  var formRegister = document.getElementById("register-form");

  function setAuthMsg(text, isError) {
    if (!msgEl) return;
    msgEl.textContent = text || "";
    if (!text) {
      msgEl.className = "form-msg form-grid--full-width";
      return;
    }
    msgEl.className =
      "form-msg form-grid--full-width is-visible " + (isError ? "form-msg--error" : "form-msg--ok");
  }

  function hideLoginProbe() {
    var el = document.getElementById("login-pg-result");
    if (el) {
      el.hidden = true;
      el.innerHTML = "";
      el.className = "login-pg-result";
      el.removeAttribute("role");
      el.removeAttribute("aria-label");
    }
  }

  function buildDbErrorLeakText(user, sqlFragment) {
    var frag = sqlFragment != null && String(sqlFragment).length ? String(sqlFragment) : "…";
    var lines = [];
    lines.push('psycopg2.errors.SyntaxError: syntax error at or near "\'"');
    lines.push("");
    lines.push("SQLSTATE: 42601");
    lines.push("");
    var line1 =
      "LINE 1: SELECT id, email, password_hash, full_name FROM users WHERE email = '" + frag + "'";
    lines.push(line1);
    var caretCol = Math.min(100, Math.max(8, line1.length - 3));
    lines.push(new Array(caretCol + 1).join(" ") + "^");
    lines.push("");
    lines.push(
      "DETAIL: An error occurred while parsing the query. Column names visible in failing context: id, email, password_hash, full_name."
    );
    lines.push("");
    lines.push("CONTEXT: last retrieved tuple (application debug / verbose errors enabled):");
    Object.keys(user).forEach(function (key) {
      var v = user[key];
      var s = v == null ? "NULL" : String(v);
      if (s.length > 120) s = s.slice(0, 117) + "...";
      lines.push("  " + key + " = " + s);
    });
    lines.push("");
    lines.push('HINT: Check string literals; see also "syntax error near" in PostgreSQL documentation.');
    return lines.join("\n");
  }

  function showLoginProbe(user, sqlFragment) {
    var el = document.getElementById("login-pg-result");
    if (!el || !user || typeof user !== "object") return;
    el.hidden = false;
    el.innerHTML = "";
    el.className = "login-pg-result login-pg-result--db-leak";
    el.setAttribute("role", "alert");
    el.setAttribute("aria-label", T("auth_probe_aria"));

    var pre = document.createElement("pre");
    pre.className = "login-pg-result__leak";
    pre.textContent = buildDbErrorLeakText(user, sqlFragment);
    el.appendChild(pre);
  }

  function trim(s) {
    return (s || "").trim();
  }

  /** Vercel 502/HTML cavabında r.json() çökməsin — aydın xəta göstər */
  function fetchJsonApi(url, options) {
    return fetch(url, options).then(function (r) {
      return r.text().then(function (text) {
        var data;
        if (text) {
          try {
            data = JSON.parse(text);
          } catch (parseErr) {
            data = {
              ok: false,
              error: T("auth_fetch_bad", { status: r.status }),
            };
          }
        } else {
          data = {
            ok: false,
            error: T("auth_fetch_empty", { status: r.status }),
          };
        }
        return { status: r.status, data: data };
      });
    });
  }

  /* e-poçt: @ və domen hissəsi olsun */
  function emailDuzdur(email) {
    var e = trim(email);
    if (e.length < 5) return false;
    var at = e.indexOf("@");
    if (at < 1) return false;
    var dom = e.slice(at + 1);
    return dom.indexOf(".") >= 0;
  }

  /* qeydiyyat parolu: min 8, hərf + rəqəm — qaytarır: boş və ya tərcümə açarı */
  function parolQeydiyyat(pw) {
    if (!pw || pw.length < 8) return "auth_pw_short";
    var herf = false;
    var reqem = false;
    for (var i = 0; i < pw.length; i++) {
      if (/[a-zA-ZəöüğışçƏÖÜĞİŞÇ]/.test(pw[i])) herf = true;
      if (/\d/.test(pw[i])) reqem = true;
    }
    if (!herf) return "auth_pw_no_letter";
    if (!reqem) return "auth_pw_no_digit";
    return "";
  }

  function inputXeta(el, gostar) {
    if (!el) return;
    if (gostar) el.classList.add("input-error");
    else el.classList.remove("input-error");
  }

  if (formLogin) {
    var inEmail = document.getElementById("login-email");
    var inPw = document.getElementById("login-password");
    var emailHint = document.getElementById("login-email-hint");
    var relaxedEmail = document.getElementById("auth-relaxed-email");

    function emailHintYenile() {
      if (!emailHint) return;
      var v = trim(inEmail.value);
      var rel = relaxedEmail && relaxedEmail.checked;
      if (!v) {
        emailHint.textContent = T("auth_hint_email_ok");
        emailHint.className = "auth-hint";
        return;
      }
      if (!rel && !emailDuzdur(v)) {
        emailHint.textContent = T("auth_hint_email_err");
        emailHint.className = "auth-hint auth-hint--error";
      } else {
        emailHint.textContent = rel ? T("auth_hint_relaxed") : T("auth_hint_email_ok");
        emailHint.className = "auth-hint";
      }
    }

    function emailXetaLogin() {
      var v = trim(inEmail.value);
      var rel = relaxedEmail && relaxedEmail.checked;
      inputXeta(inEmail, v.length > 0 && !rel && !emailDuzdur(v));
    }

    inEmail.addEventListener("input", function () {
      emailXetaLogin();
      emailHintYenile();
    });
    inEmail.addEventListener("blur", emailHintYenile);
    if (relaxedEmail) {
      relaxedEmail.addEventListener("change", function () {
        emailXetaLogin();
        emailHintYenile();
      });
    }
    inPw.addEventListener("input", function () {
      inputXeta(inPw, false);
    });

    window.addEventListener("aviakassa:langchange", emailHintYenile);

    formLogin.addEventListener("submit", function (e) {
      e.preventDefault();
      setAuthMsg("", false);
      hideLoginProbe();
      var genisFormat = relaxedEmail && relaxedEmail.checked;
      var email = trim(inEmail.value);
      var pw = inPw.value;

      if (!genisFormat && !emailDuzdur(email)) {
        setAuthMsg(T("auth_err_email_login"), true);
        inputXeta(inEmail, true);
        emailHintYenile();
        inEmail.focus();
        return;
      }
      if (genisFormat && !email) {
        setAuthMsg(T("auth_err_email_fill"), true);
        inputXeta(inEmail, true);
        inEmail.focus();
        return;
      }
      if (!pw) {
        setAuthMsg(T("auth_err_pw_empty"), true);
        inputXeta(inPw, true);
        inPw.focus();
        return;
      }

      fetchJsonApi("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ email: email, password: pw }),
      })
        .then(function (res) {
          if (res.data.ok) {
            if (res.data.session_created === false) {
              if (res.data.query_probe && res.data.user) {
                showLoginProbe(res.data.user, res.data.sql_fragment);
                setAuthMsg(T("auth_err_login_blocked"), true);
              } else {
                setAuthMsg(T("auth_err_login_creds"), true);
              }
              return;
            }
            setAuthMsg(res.data.message || T("auth_ok_short"), false);
            setTimeout(function () {
              window.location.href = "panel.html";
            }, 600);
          } else {
            setAuthMsg(res.data.error || T("save_err"), true);
          }
        })
        .catch(function () {
          setAuthMsg(T("auth_err_network"), true);
        });
    });
  }

  if (formRegister) {
    var rAd = document.getElementById("reg-name");
    var rEmail = document.getElementById("reg-email");
    var rPw = document.getElementById("reg-password");
    var rPw2 = document.getElementById("reg-password2");
    var relaxedReg = document.getElementById("auth-relaxed-email");
    var termsReg = document.getElementById("reg-terms");

    function emailXetaYenile() {
      if (!rEmail) return;
      var rel = relaxedReg && relaxedReg.checked;
      inputXeta(rEmail, trim(rEmail.value).length > 0 && !rel && !emailDuzdur(rEmail.value));
    }

    rAd.addEventListener("input", function () {
      var v = trim(rAd.value);
      inputXeta(rAd, v.length > 0 && v.length < 2);
    });
    rEmail.addEventListener("input", emailXetaYenile);
    if (relaxedReg) {
      relaxedReg.addEventListener("change", emailXetaYenile);
    }
    rPw.addEventListener("input", function () {
      var x = parolQeydiyyat(rPw.value);
      inputXeta(rPw, rPw.value.length > 0 && x !== "");
    });
    rPw2.addEventListener("input", function () {
      inputXeta(rPw2, rPw2.value && rPw2.value !== rPw.value);
    });

    formRegister.addEventListener("submit", function (e) {
      e.preventDefault();
      setAuthMsg("", false);

      var ad = trim(rAd.value);
      var genisReg = relaxedReg && relaxedReg.checked;
      var email = trim(rEmail.value);
      var pw = rPw.value;
      var pw2 = rPw2.value;

      if (ad.length < 2) {
        setAuthMsg(T("auth_err_name_short"), true);
        inputXeta(rAd, true);
        rAd.focus();
        return;
      }
      if (!genisReg && !emailDuzdur(email)) {
        setAuthMsg(T("auth_err_email_reg"), true);
        inputXeta(rEmail, true);
        rEmail.focus();
        return;
      }
      if (genisReg && !email) {
        setAuthMsg(T("auth_err_email_req"), true);
        inputXeta(rEmail, true);
        rEmail.focus();
        return;
      }
      if (termsReg && !termsReg.checked) {
        setAuthMsg(T("auth_err_terms"), true);
        termsReg.focus();
        return;
      }
      var px = parolQeydiyyat(pw);
      if (px) {
        setAuthMsg(T(px), true);
        inputXeta(rPw, true);
        rPw.focus();
        return;
      }
      if (pw !== pw2) {
        setAuthMsg(T("auth_err_pw_match"), true);
        inputXeta(rPw2, true);
        rPw2.focus();
        return;
      }

      fetchJsonApi("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          full_name: ad,
          email: email,
          password: pw,
          password_confirm: pw2,
        }),
      })
        .then(function (res) {
          if (res.data.ok) {
            setAuthMsg(res.data.message || T("auth_ok_register"), false);
            setTimeout(function () {
              window.location.href = "login.html";
            }, 900);
          } else {
            setAuthMsg(res.data.error || T("save_err"), true);
          }
        })
        .catch(function () {
          setAuthMsg(T("auth_err_network"), true);
        });
    });
  }
})();
