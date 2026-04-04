/**
 * AZ / RU / EN — localStorage: aviakassa_lang
 */
(function () {
  var STORAGE = "aviakassa_lang";
  var ALLOWED = { az: 1, ru: 1, en: 1 };

  var S = {
    az: {
      page_title: "Hesabım — Aviakassa",
      skip_main: "Əsas məzmuna keç",
      nav_aria: "Hesab menyusu",
      nav_search: "Uçuş axtar",
      nav_account: "Hesabım",
      nav_login: "Giriş",
      nav_logout: "Çıxış",
      lang_aria: "Dil seçimi",
      hero_eyebrow: "Şəxsi kabinet · səyahətçi profili",
      copy_title: "E-poçtu mübadiləyə kopyala",
      copy_aria: "E-poçtu kopyala",
      search_new: "Yeni uçuş axtar",
      badge_active: "Hesab aktivdir",
      stat_bookings: "Sifariş və rezervasiya",
      stat_docs: "Yüklənmiş sənəd",
      stat_next: "Növbəti uçuş tarixi",
      spot_aria: "Qısa məsləhətlər",
      spot1_t: "Check-in",
      spot1_d: "Çox vaxt uçuşdan 24 saat əvvəl onlayn açılır — reys kodunu yoxlayın.",
      spot2_t: "Sənədlər",
      spot2_d: "Bilet və şəxsiyyət nüsxələrini təhlükəsiz saxlamaq üçün PDF yükləyin.",
      spot3_t: "Profil",
      spot3_d: "İmza mətni bəzi biletlərdə və hesab kartında göstərilə bilər.",
      bookings_title: "Səyahətlərim",
      bookings_desc:
        "Rezervasiyalar, istiqamət və ödəniş statusu — bütün sifarişlər bir cədvəldə.",
      empty_title: "Hələ sifariş yoxdur",
      empty_text: "İlk uçuşunuzu seçin — istiqamət və tarix ilə axtarış edin.",
      empty_btn: "Uçuş axtarışına keç",
      th_order: "Sifariş",
      th_route: "İstiqamət",
      th_date: "Uçuş tarixi",
      th_amount: "Məbləğ",
      th_status: "Status",
      profile_title: "Profil və imza",
      profile_desc:
        "Bu mətn biletlərdə və hesab kartında göstərilə bilər. HTML təhlükəsiz şəkildə təmizlənir.",
      label_about: "Qısa təqdimat / imza",
      ph_about:
        "Məsələn: adınız, üstünlük verdiyiniz oturacaq və ya xüsusi istəklər…",
      char_hint: "{n} / 100 000 simvol",
      save_btn: "Dəyişiklikləri saxla",
      preview_title: "Canlı önizləmə",
      docs_title: "Sənədlər",
      docs_desc: "Bilet nüsxəsi, şəxsiyyət və ya PDF — təhlükəsiz saxlanılır.",
      file_label: "Fayl seçin",
      upload_btn: "Yüklə",
      help_title: "Dəstək",
      help_html:
        "Dəyişiklik və ya geri ödəniş üçün <strong>sifariş nömrənizi</strong> dəstək xidmətinə bildirin. Cavab müddəti adətən 1–2 iş günü.",
      guest_html: 'Daxil olmamısınız. <a href="login.html">Giriş səhifəsi</a>',
      footer_copy: "© Aviakassa",
      footer_tickets: "Biletlər",
      member_prefix: "Üzv:",
      greet_morning: "Sabahınız xeyir",
      greet_day: "Gününüz xeyir",
      greet_evening: "Axşamınız xeyir",
      greet_night: "Xoş gəldiniz",
      save_ok: "Profil yeniləndi.",
      save_err: "Xəta",
      server_err: "Server xətası.",
      upload_ok: "Fayl qəbul edildi.",
      upload_err: "Fayl seçin.",
      upload_fail: "Server xətası.",
      guest_redirect: "Qoşulma xətası",
      traveler_default: "Səyahətçi",
      nav_register: "Qeydiyyat",
      title_login: "Giriş — Aviakassa",
      login_tagline: "Hesaba daxil olun",
      login_heading: "Giriş",
      login_email_lbl: "E-poçt",
      login_email_ph: "nümunə@mail.com",
      login_pw_lbl: "Parol",
      login_pw_ph: "****",
      login_relaxed: "Korporativ iş e-poçtu istifadə edirəm (şirkət domeni üzrə ünvan)",
      login_submit: "Daxil ol",
      login_footer_html: 'Hesabınız yoxdur? <a href="register.html">Qeydiyyat</a>',
      title_register: "Qeydiyyat — Aviakassa",
      reg_tagline: "Səyahətçi hesabı",
      reg_heading: "Səyahətçi qeydiyyatı",
      reg_intro:
        "Rezervasiya təsdiqi, biletlərin göndərilməsi və uçuş xəbərdarlıqları üçün əlaqə məlumatlarınızdan istifadə edəcəyik.",
      reg_name_lbl: "Passport / şəxsiyyət vəsiqəsi üzrə ad, soyad",
      reg_name_ph: "Şəxsiyyət sənədindəki kimi",
      reg_name_hint: "Biletdə çap olunacaq yazılışla eyni olmalıdır (ən azı 2 simvol).",
      reg_email_lbl: "Əlaqə e-poçtu",
      reg_email_ph: "ad.soyad@mail.com",
      reg_email_hint: "Elektron bilet və dəyişiklik bildirişləri bu ünvana göndəriləcək.",
      reg_pw_lbl: "Hesab parolu",
      reg_pw_hint: "Ən azı 8 simvol; həm hərf, həm rəqəm — hesab və ödəniş təhlükəsizliyi üçün.",
      reg_pw2_lbl: "Parolu təsdiqləyin",
      reg_pw2_hint: "Təkrarlanan parol yuxarıdakı ilə üst-üstə düşməlidir.",
      reg_terms_html:
        '<a href="#terms" class="auth-inline-link">İstifadə şərtləri</a> və <a href="#privacy" class="auth-inline-link">məxfilik siyasəti</a> ilə tanış oldum və razıyam; şəxsi məlumatlarımın biletlərin təqdimi üçün emalına icazə verirəm.',
      reg_submit: "Qeydiyyatı tamamla",
      reg_footer_html: 'Artıq hesabınız var? <a href="login.html">Giriş</a>',
      reg_terms_title: "İstifadə şərtləri",
      reg_terms_body:
        "Rezervasiya və ödənişlər Aviakassa qaydalarına uyğun aparılır; biletlər elektron kanalla təqdim olunur. Dəyişiklik və geri ödəmə qaydaları daşıyıcı şirkətin tarifinə əsasən tətbiq olunur.",
      reg_privacy_title: "Məxfilik",
      reg_privacy_body:
        "Şəxsi məlumatlarınız yalnız səyahət sənədlərinin tərtibi, biletlərin göndərilməsi və qanuni öhdəliklər üçün emal olunur; üçüncü tərəflərə yalnız zəruri hallarda ötürülür.",
      title_home: "Aviakassa — Uçuş axtarışı",
      home_tagline: "Uçuşları müqayisə edin və biletinizi seçin",
      search_heading: "Uçuş axtar",
      lbl_from_co: "Haradan — ölkə",
      lbl_from_city: "Haradan — şəhər / aeroport",
      lbl_to_co: "Hara — ölkə",
      lbl_to_city: "Hara — şəhər / aeroport",
      lbl_date: "Uçuş tarixi",
      lbl_pax: "Sərnişin",
      pax_1: "1 böyük",
      pax_2: "2 böyük",
      pax_3: "3 böyük",
      btn_search: "Uçuşları göstər",
      results_demo: "Nümunə reyslər (demo)",
      demo1_route: "Bakı (GYD) → İstanbul (IST)",
      demo1_sub: "Azərbaycan → Türkiyə · 09:30 — birbaşa",
      demo1_dur: "2 saat 15 dəq",
      demo1_price: "₼ 189-dən",
      demo2_route: "İstanbul (IST) → Dubay (DXB)",
      demo2_sub: "Türkiyə → BƏƏ · 14:00 — birbaşa",
      demo2_dur: "3 saat 10 dəq",
      demo2_price: "₼ 320-dən",
      footer_disclaimer: "Qiymətlər və mövcud uçuşlar məlumat xarakterlidir.",
      ava_ph_country: "— Ölkə seçin —",
      ava_ph_city_first: "— Əvvəl ölkə seçin —",
      ava_ph_city: "— Şəhər seçin —",
      auth_hint_email_ok: "Düzgün e-poçt formatı",
      auth_hint_email_err: "Xəta: düzgün e-poçt daxil edin (məs. ad@domain.com)",
      auth_hint_relaxed: "Korporativ / xüsusi format göndərilir",
      auth_err_email_login: "E-poçt düzgün deyil — nümunə@mail.com formatında olmalıdır.",
      auth_err_email_fill: "E-poçt sahəsini doldurun.",
      auth_err_pw_empty: "Parol yazın.",
      auth_err_login_creds: "E-poçt və ya parol səhvdir.",
      auth_err_login_blocked: "Daxilolma mümkün olmadı.",
      auth_ok_short: "Uğurlu.",
      auth_err_network: "Serverə qoşulmaq mümkün olmadı.",
      auth_probe_aria: "Verilənlər bazası xətası",
      auth_fetch_bad: "Server cavabı gözlənilməzdir (HTTP {status}). Deploy və DATABASE_URL yoxlayın.",
      auth_fetch_empty: "Boş cavab (HTTP {status}).",
      auth_err_name_short: "Passport / şəxsiyyət üzrə ad və soyadı daxil edin (ən azı 2 simvol).",
      auth_err_email_reg: "Əlaqə e-poçtunu düzgün daxil edin (məsələn ad@domain.com).",
      auth_err_email_req: "Elektron poçt ünvanınızı daxil edin.",
      auth_err_terms: "Davam etmək üçün istifadə şərtləri ilə razılıq verin.",
      auth_pw_short: "Hesab parolu ən azı 8 simvol olmalıdır.",
      auth_pw_no_letter: "Parolda ən azı bir hərf olmalıdır (təhlükəsizlik tələbi).",
      auth_pw_no_digit: "Parolda ən azı bir rəqəm olmalıdır (təhlükəsizlik tələbi).",
      auth_err_pw_match: "Parol təkrarı ilkin parolla üst-üstə düşmür.",
      auth_ok_register: "Oldu.",
      ava_err_from_co: "«Haradan» üçün ölkə seçin.",
      ava_err_from_city: "«Haradan» üçün şəhər seçin.",
      ava_err_to_co: "«Hara» üçün ölkə seçin.",
      ava_err_to_city: "«Hara» üçün şəhər seçin.",
      ava_err_same_city: "Çıxış və təyinat eyni şəhər ola bilməz.",
      ava_err_date: "Uçuş tarixini seçin.",
      ava_err_past: "Keçmiş tarix seçmək olmaz.",
      ava_err_pax: "Sərnişin sayını düzgün seçin.",
      ava_ok_accepted: "Məlumatlar qəbul edildi. Aşağıda xülasə.",
      ava_summary_title: "Axtarış xülasəsi",
      ava_summary_meta: "Tarix: {date} · Sərnişin: {n} nəfər",
      user_db_prefix: "Hesab:",
      title_admin: "Əməliyyat mərkəzi — Aviakassa",
      adm_back: "← Biletlər",
      adm_badge: "Daxili hesabat",
      adm_hero_title: "Əməliyyat mərkəzi",
      adm_hero_sub: "Reyslər, satışlar və sifariş sorğusu — vahid görünüş",
      adm_stat_flights: "Reyslər",
      adm_stat_trans: "Əməliyyatlar",
      adm_stat_sum: "Ümumi dövriyyə (₼)",
      adm_flights_title: "Reyslər",
      adm_flights_desc: "Aktiv istiqamətlər və mövcud yerlər",
      adm_trans_title: "Tranzaksiyalar",
      adm_trans_desc: "Son əməliyyatlar və statuslar",
      adm_th_id: "ID",
      adm_th_flight: "Reys",
      adm_th_from: "Haradan",
      adm_th_to: "Hara",
      adm_th_date: "Tarix",
      adm_th_price: "Qiymət",
      adm_th_seats: "Yerlər",
      adm_th_user: "İstifadəçi",
      adm_th_amount: "Məbləğ",
      adm_th_status: "Status",
      adm_lookup_title: "Sifariş sorğusu",
      adm_lookup_desc: "Dəstək üçün sifariş nömrəsini daxil edin — cavab JSON formatındadır",
      adm_tid_ph: "Nömrə (məs: 1)",
      adm_tid_aria: "Sifariş nömrəsi",
      adm_tid_btn: "Sorğula",
      adm_footer_back: "Biletlərə qayıt",
      adm_footer_meta: "Aviakassa",
      adm_err_report: "Hesabat alınmadı.",
      adm_empty_flights: "Məlumat yoxdur — reys siyahısı boşdur.",
      adm_empty_trans: "Hələ əməliyyat qeydi yoxdur.",
      adm_tid_bad: "Düzgün nömrə daxil edin.",
      adm_tid_loading: "Yüklənir…",
      adm_tid_err: "Xəta.",
    },
    ru: {
      page_title: "Мой аккаунт — Aviakassa",
      skip_main: "К основному содержанию",
      nav_aria: "Меню аккаунта",
      nav_search: "Поиск рейсов",
      nav_account: "Мой аккаунт",
      nav_login: "Вход",
      nav_logout: "Выход",
      lang_aria: "Выбор языка",
      hero_eyebrow: "Личный кабинет · профиль путешественника",
      copy_title: "Копировать e-mail в буфер",
      copy_aria: "Копировать e-mail",
      search_new: "Новый поиск рейсов",
      badge_active: "Аккаунт активен",
      stat_bookings: "Заказы и брони",
      stat_docs: "Загруженные файлы",
      stat_next: "Дата следующего рейса",
      spot_aria: "Краткие подсказки",
      spot1_t: "Регистрация",
      spot1_d: "Часто открывается за 24 ч до вылета — проверьте код рейса.",
      spot2_t: "Документы",
      spot2_d: "Загрузите PDF билета и документа для надёжного хранения.",
      spot3_t: "Профиль",
      spot3_d: "Текст подписи может отображаться в билетах и карточке аккаунта.",
      bookings_title: "Мои поездки",
      bookings_desc: "Брони, направление и статус оплаты — все заказы в одной таблице.",
      empty_title: "Пока нет заказов",
      empty_text: "Выберите первый рейс — поиск по направлению и дате.",
      empty_btn: "К поиску рейсов",
      th_order: "Заказ",
      th_route: "Маршрут",
      th_date: "Дата рейса",
      th_amount: "Сумма",
      th_status: "Статус",
      profile_title: "Профиль и подпись",
      profile_desc:
        "Этот текст может отображаться в билетах и карточке. HTML безопасно очищается.",
      label_about: "Краткое описание / подпись",
      ph_about: "Например: имя, предпочтения по месту или пожелания…",
      char_hint: "{n} / 100 000 символов",
      save_btn: "Сохранить изменения",
      preview_title: "Предпросмотр",
      docs_title: "Документы",
      docs_desc: "Копия билета, удостоверение или PDF — хранится безопасно.",
      file_label: "Выберите файл",
      upload_btn: "Загрузить",
      help_title: "Поддержка",
      help_html:
        "Для изменений или возврата сообщите в поддержку <strong>номер заказа</strong>. Ответ обычно за 1–2 рабочих дня.",
      guest_html: 'Вы не вошли. <a href="login.html">Страница входа</a>',
      footer_copy: "© Aviakassa",
      footer_tickets: "Билеты",
      member_prefix: "С:",
      greet_morning: "Доброе утро",
      greet_day: "Добрый день",
      greet_evening: "Добрый вечер",
      greet_night: "Добро пожаловать",
      save_ok: "Профиль обновлён.",
      save_err: "Ошибка",
      server_err: "Ошибка сервера.",
      upload_ok: "Файл принят.",
      upload_err: "Выберите файл.",
      upload_fail: "Ошибка сервера.",
      guest_redirect: "Ошибка подключения",
      traveler_default: "Путешественник",
      nav_register: "Регистрация",
      title_login: "Вход — Aviakassa",
      login_tagline: "Войдите в аккаунт",
      login_heading: "Вход",
      login_email_lbl: "Эл. почта",
      login_email_ph: "example@mail.com",
      login_pw_lbl: "Пароль",
      login_pw_ph: "****",
      login_relaxed: "Использую корпоративную почту (домен компании)",
      login_submit: "Войти",
      login_footer_html: 'Нет аккаунта? <a href="register.html">Регистрация</a>',
      title_register: "Регистрация — Aviakassa",
      reg_tagline: "Аккаунт путешественника",
      reg_heading: "Регистрация путешественника",
      reg_intro:
        "Контакты нужны для подтверждения брони, отправки билетов и уведомлений о рейсах.",
      reg_name_lbl: "Имя и фамилия как в паспорте / удостоверении",
      reg_name_ph: "Как в документе",
      reg_name_hint: "Должно совпадать с билетом (не менее 2 символов).",
      reg_email_lbl: "Контактный e-mail",
      reg_email_ph: "name.surname@mail.com",
      reg_email_hint: "На этот адрес придут e-билеты и уведомления.",
      reg_pw_lbl: "Пароль аккаунта",
      reg_pw_hint: "Не менее 8 символов; буквы и цифры — для безопасности.",
      reg_pw2_lbl: "Подтвердите пароль",
      reg_pw2_hint: "Повтор должен совпадать с паролем выше.",
      reg_terms_html:
        'Ознакомился с <a href="#terms" class="auth-inline-link">условиями</a> и <a href="#privacy" class="auth-inline-link">политикой конфиденциальности</a>; согласен на обработку данных для оформления билетов.',
      reg_submit: "Завершить регистрацию",
      reg_footer_html: 'Уже есть аккаунт? <a href="login.html">Вход</a>',
      reg_terms_title: "Условия использования",
      reg_terms_body:
        "Бронирование и оплата по правилам Aviakassa; билеты в электронном виде. Изменения и возврат — по тарифу перевозчика.",
      reg_privacy_title: "Конфиденциальность",
      reg_privacy_body:
        "Персональные данные обрабатываются для оформления поездок, билетов и юридических обязательств; передача третьим лицам — только при необходимости.",
      title_home: "Aviakassa — поиск рейсов",
      home_tagline: "Сравните рейсы и выберите билет",
      search_heading: "Поиск рейса",
      lbl_from_co: "Откуда — страна",
      lbl_from_city: "Откуда — город / аэропорт",
      lbl_to_co: "Куда — страна",
      lbl_to_city: "Куда — город / аэропорт",
      lbl_date: "Дата вылета",
      lbl_pax: "Пассажиры",
      pax_1: "1 взрослый",
      pax_2: "2 взрослых",
      pax_3: "3 взрослых",
      btn_search: "Показать рейсы",
      results_demo: "Примерные рейсы (демо)",
      demo1_route: "Баку (GYD) → Стамбул (IST)",
      demo1_sub: "Азербайджан → Турция · 09:30 — прямой",
      demo1_dur: "2 ч 15 мин",
      demo1_price: "от ₼ 189",
      demo2_route: "Стамбул (IST) → Дубай (DXB)",
      demo2_sub: "Турция → ОАЭ · 14:00 — прямой",
      demo2_dur: "3 ч 10 мин",
      demo2_price: "от ₼ 320",
      footer_disclaimer: "Цены и рейсы носят информационный характер.",
      ava_ph_country: "— Выберите страну —",
      ava_ph_city_first: "— Сначала страна —",
      ava_ph_city: "— Выберите город —",
      auth_hint_email_ok: "Корректный формат e-mail",
      auth_hint_email_err: "Ошибка: введите e-mail (например user@domain.com)",
      auth_hint_relaxed: "Отправляется в расширенном формате",
      auth_err_email_login: "Неверный e-mail — нужен формат example@mail.com",
      auth_err_email_fill: "Заполните поле e-mail",
      auth_err_pw_empty: "Введите пароль",
      auth_err_login_creds: "Неверный e-mail или пароль",
      auth_err_login_blocked: "Вход невозможен",
      auth_ok_short: "Успешно.",
      auth_err_network: "Не удалось подключиться к серверу",
      auth_probe_aria: "Ошибка базы данных",
      auth_fetch_bad: "Неожиданный ответ сервера (HTTP {status}). Проверьте deploy и DATABASE_URL.",
      auth_fetch_empty: "Пустой ответ (HTTP {status}).",
      auth_err_name_short: "Введите имя и фамилию как в документе (не менее 2 символов).",
      auth_err_email_reg: "Введите корректный e-mail (например user@domain.com).",
      auth_err_email_req: "Введите адрес электронной почты.",
      auth_err_terms: "Примите условия использования, чтобы продолжить.",
      auth_pw_short: "Пароль не короче 8 символов.",
      auth_pw_no_letter: "В пароле должна быть хотя бы одна буква.",
      auth_pw_no_digit: "В пароле должна быть хотя бы одна цифра.",
      auth_err_pw_match: "Повтор пароля не совпадает.",
      auth_ok_register: "Готово.",
      ava_err_from_co: "Выберите страну отправления.",
      ava_err_from_city: "Выберите город отправления.",
      ava_err_to_co: "Выберите страну назначения.",
      ava_err_to_city: "Выберите город назначения.",
      ava_err_same_city: "Отправление и прибытие не могут совпадать.",
      ava_err_date: "Выберите дату вылета.",
      ava_err_past: "Нельзя выбрать прошедшую дату.",
      ava_err_pax: "Выберите число пассажиров.",
      ava_ok_accepted: "Данные приняты. Ниже сводка.",
      ava_summary_title: "Сводка поиска",
      ava_summary_meta: "Дата: {date} · Пассажиры: {n}",
      user_db_prefix: "Аккаунт:",
      title_admin: "Операционный центр — Aviakassa",
      adm_back: "← Билеты",
      adm_badge: "Внутренний отчёт",
      adm_hero_title: "Операционный центр",
      adm_hero_sub: "Рейсы, продажи и запрос заказа — единый вид",
      adm_stat_flights: "Рейсы",
      adm_stat_trans: "Операции",
      adm_stat_sum: "Оборот (₼)",
      adm_flights_title: "Рейсы",
      adm_flights_desc: "Активные направления и места",
      adm_trans_title: "Транзакции",
      adm_trans_desc: "Последние операции и статусы",
      adm_th_id: "ID",
      adm_th_flight: "Рейс",
      adm_th_from: "Откуда",
      adm_th_to: "Куда",
      adm_th_date: "Дата",
      adm_th_price: "Цена",
      adm_th_seats: "Места",
      adm_th_user: "Пользователь",
      adm_th_amount: "Сумма",
      adm_th_status: "Статус",
      adm_lookup_title: "Запрос заказа",
      adm_lookup_desc: "Введите номер заказа для поддержки — ответ в JSON",
      adm_tid_ph: "Номер (напр. 1)",
      adm_tid_aria: "Номер заказа",
      adm_tid_btn: "Запросить",
      adm_footer_back: "К билетам",
      adm_footer_meta: "Aviakassa",
      adm_err_report: "Отчёт не получен.",
      adm_empty_flights: "Нет данных — список рейсов пуст.",
      adm_empty_trans: "Записей операций пока нет.",
      adm_tid_bad: "Введите корректный номер.",
      adm_tid_loading: "Загрузка…",
      adm_tid_err: "Ошибка.",
    },
    en: {
      page_title: "My account — Aviakassa",
      skip_main: "Skip to main content",
      nav_aria: "Account menu",
      nav_search: "Search flights",
      nav_account: "My account",
      nav_login: "Log in",
      nav_logout: "Log out",
      lang_aria: "Language",
      hero_eyebrow: "Personal area · traveller profile",
      copy_title: "Copy email to clipboard",
      copy_aria: "Copy email",
      search_new: "Search new flights",
      badge_active: "Account active",
      stat_bookings: "Orders & bookings",
      stat_docs: "Uploaded files",
      stat_next: "Next flight date",
      spot_aria: "Quick tips",
      spot1_t: "Check-in",
      spot1_d: "Often opens 24h before departure — check your flight code.",
      spot2_t: "Documents",
      spot2_d: "Upload PDF tickets and ID copies for safe storage.",
      spot3_t: "Profile",
      spot3_d: "Signature text may appear on some tickets and your account card.",
      bookings_title: "My trips",
      bookings_desc: "Bookings, route and payment status — all orders in one table.",
      empty_title: "No orders yet",
      empty_text: "Choose your first flight — search by route and date.",
      empty_btn: "Go to flight search",
      th_order: "Order",
      th_route: "Route",
      th_date: "Flight date",
      th_amount: "Amount",
      th_status: "Status",
      profile_title: "Profile & signature",
      profile_desc:
        "This text may appear on tickets and your account card. HTML is safely sanitized.",
      label_about: "Short bio / signature",
      ph_about: "e.g. your name, seat preference or special requests…",
      char_hint: "{n} / 100,000 characters",
      save_btn: "Save changes",
      preview_title: "Live preview",
      docs_title: "Documents",
      docs_desc: "Ticket copy, ID or PDF — stored securely.",
      file_label: "Choose file",
      upload_btn: "Upload",
      help_title: "Support",
      help_html:
        "For changes or refunds, tell support your <strong>order number</strong>. Replies usually within 1–2 business days.",
      guest_html: 'You are not logged in. <a href="login.html">Log in page</a>',
      footer_copy: "© Aviakassa",
      footer_tickets: "Tickets",
      member_prefix: "Member since:",
      greet_morning: "Good morning",
      greet_day: "Good afternoon",
      greet_evening: "Good evening",
      greet_night: "Welcome",
      save_ok: "Profile updated.",
      save_err: "Error",
      server_err: "Server error.",
      upload_ok: "File uploaded.",
      upload_err: "Choose a file.",
      upload_fail: "Server error.",
      guest_redirect: "Connection error",
      traveler_default: "Traveller",
      nav_register: "Register",
      title_login: "Log in — Aviakassa",
      login_tagline: "Sign in to your account",
      login_heading: "Log in",
      login_email_lbl: "Email",
      login_email_ph: "you@example.com",
      login_pw_lbl: "Password",
      login_pw_ph: "****",
      login_relaxed: "I use a corporate email (company domain)",
      login_submit: "Sign in",
      login_footer_html: 'No account? <a href="register.html">Register</a>',
      title_register: "Register — Aviakassa",
      reg_tagline: "Traveller account",
      reg_heading: "Traveller registration",
      reg_intro:
        "We will use your contact details for booking confirmation, tickets and flight alerts.",
      reg_name_lbl: "Full name as on passport / ID",
      reg_name_ph: "As shown on your ID",
      reg_name_hint: "Must match ticket printing (at least 2 characters).",
      reg_email_lbl: "Contact email",
      reg_email_ph: "name.surname@mail.com",
      reg_email_hint: "E-tickets and change notices go to this address.",
      reg_pw_lbl: "Account password",
      reg_pw_hint: "At least 8 characters; letters and numbers — for account and payment security.",
      reg_pw2_lbl: "Confirm password",
      reg_pw2_hint: "Must match the password above.",
      reg_terms_html:
        'I have read the <a href="#terms" class="auth-inline-link">terms of use</a> and <a href="#privacy" class="auth-inline-link">privacy policy</a> and agree; I consent to processing my data to provide tickets.',
      reg_submit: "Complete registration",
      reg_footer_html: 'Already have an account? <a href="login.html">Log in</a>',
      reg_terms_title: "Terms of use",
      reg_terms_body:
        "Bookings and payments follow Aviakassa rules; tickets are delivered electronically. Changes and refunds depend on the carrier’s fare rules.",
      reg_privacy_title: "Privacy",
      reg_privacy_body:
        "Personal data is processed only for travel documents, tickets and legal obligations; shared with third parties only when necessary.",
      title_home: "Aviakassa — flight search",
      home_tagline: "Compare flights and pick your ticket",
      search_heading: "Search flights",
      lbl_from_co: "From — country",
      lbl_from_city: "From — city / airport",
      lbl_to_co: "To — country",
      lbl_to_city: "To — city / airport",
      lbl_date: "Flight date",
      lbl_pax: "Passengers",
      pax_1: "1 adult",
      pax_2: "2 adults",
      pax_3: "3 adults",
      btn_search: "Show flights",
      results_demo: "Sample flights (demo)",
      demo1_route: "Baku (GYD) → Istanbul (IST)",
      demo1_sub: "Azerbaijan → Turkey · 09:30 — direct",
      demo1_dur: "2 h 15 min",
      demo1_price: "from ₼ 189",
      demo2_route: "Istanbul (IST) → Dubai (DXB)",
      demo2_sub: "Turkey → UAE · 14:00 — direct",
      demo2_dur: "3 h 10 min",
      demo2_price: "from ₼ 320",
      footer_disclaimer: "Prices and availability are for information only.",
      ava_ph_country: "— Select country —",
      ava_ph_city_first: "— Select country first —",
      ava_ph_city: "— Select city —",
      auth_hint_email_ok: "Valid email format",
      auth_hint_email_err: "Error: enter a valid email (e.g. you@domain.com)",
      auth_hint_relaxed: "Sending in extended / corporate format",
      auth_err_email_login: "Invalid email — use you@example.com format",
      auth_err_email_fill: "Fill in the email field",
      auth_err_pw_empty: "Enter your password",
      auth_err_login_creds: "Incorrect email or password",
      auth_err_login_blocked: "Sign-in not possible",
      auth_ok_short: "Success.",
      auth_err_network: "Could not reach the server",
      auth_probe_aria: "Database error",
      auth_fetch_bad: "Unexpected server response (HTTP {status}). Check deploy and DATABASE_URL.",
      auth_fetch_empty: "Empty response (HTTP {status}).",
      auth_err_name_short: "Enter first and last name as on your ID (at least 2 characters).",
      auth_err_email_reg: "Enter a valid email (e.g. you@domain.com).",
      auth_err_email_req: "Enter your email address.",
      auth_err_terms: "Accept the terms of use to continue.",
      auth_pw_short: "Password must be at least 8 characters.",
      auth_pw_no_letter: "Password must include at least one letter.",
      auth_pw_no_digit: "Password must include at least one digit.",
      auth_err_pw_match: "Password confirmation does not match.",
      auth_ok_register: "Done.",
      ava_err_from_co: "Select departure country.",
      ava_err_from_city: "Select departure city.",
      ava_err_to_co: "Select destination country.",
      ava_err_to_city: "Select destination city.",
      ava_err_same_city: "Origin and destination cannot be the same city.",
      ava_err_date: "Select a flight date.",
      ava_err_past: "Past dates are not allowed.",
      ava_err_pax: "Select a valid passenger count.",
      ava_ok_accepted: "Details accepted. Summary below.",
      ava_summary_title: "Search summary",
      ava_summary_meta: "Date: {date} · Passengers: {n}",
      user_db_prefix: "Account:",
      title_admin: "Operations centre — Aviakassa",
      adm_back: "← Tickets",
      adm_badge: "Internal report",
      adm_hero_title: "Operations centre",
      adm_hero_sub: "Flights, sales and order lookup — one view",
      adm_stat_flights: "Flights",
      adm_stat_trans: "Transactions",
      adm_stat_sum: "Total turnover (₼)",
      adm_flights_title: "Flights",
      adm_flights_desc: "Active routes and seats",
      adm_trans_title: "Transactions",
      adm_trans_desc: "Recent operations and statuses",
      adm_th_id: "ID",
      adm_th_flight: "Flight",
      adm_th_from: "From",
      adm_th_to: "To",
      adm_th_date: "Date",
      adm_th_price: "Price",
      adm_th_seats: "Seats",
      adm_th_user: "User",
      adm_th_amount: "Amount",
      adm_th_status: "Status",
      adm_lookup_title: "Order lookup",
      adm_lookup_desc: "Enter order number for support — response is JSON",
      adm_tid_ph: "Number (e.g. 1)",
      adm_tid_aria: "Order number",
      adm_tid_btn: "Lookup",
      adm_footer_back: "Back to tickets",
      adm_footer_meta: "Aviakassa",
      adm_err_report: "Could not load report.",
      adm_empty_flights: "No data — flight list is empty.",
      adm_empty_trans: "No transaction records yet.",
      adm_tid_bad: "Enter a valid number.",
      adm_tid_loading: "Loading…",
      adm_tid_err: "Error.",
    },
  };

  function get() {
    var v = (localStorage.getItem(STORAGE) || "az").toLowerCase();
    return ALLOWED[v] ? v : "az";
  }

  function set(lang) {
    if (!ALLOWED[lang]) lang = "az";
    localStorage.setItem(STORAGE, lang);
    document.documentElement.lang = lang === "en" ? "en" : lang === "ru" ? "ru" : "az";
    return lang;
  }

  function t(key, map) {
    var lang = get();
    var pack = S[lang] || S.az;
    var s = Object.prototype.hasOwnProperty.call(pack, key) ? pack[key] : S.az[key] || key;
    if (map && typeof map === "object") {
      Object.keys(map).forEach(function (k) {
        s = s.split("{" + k + "}").join(String(map[k]));
      });
    }
    return s;
  }

  function greetingFirst(name) {
    var lang = get();
    var h = new Date().getHours();
    var part = "greet_night";
    if (h >= 5 && h < 12) part = "greet_morning";
    else if (h >= 12 && h < 17) part = "greet_day";
    else if (h >= 17 && h < 22) part = "greet_evening";
    return t(part) + ", " + name + "!";
  }

  function memberLine(isoDateStr) {
    if (!isoDateStr) return t("member_prefix") + " —";
    try {
      var d = new Date(isoDateStr);
      if (isNaN(d.getTime())) return t("member_prefix") + " " + String(isoDateStr).slice(0, 10);
      var loc = get() === "ru" ? "ru-RU" : get() === "en" ? "en-GB" : "az-Latn";
      var m = d.toLocaleDateString(loc, { month: "long", year: "numeric" });
      if (get() === "az") m = m.charAt(0).toUpperCase() + m.slice(1);
      return t("member_prefix") + " " + m;
    } catch (e) {
      return t("member_prefix") + " —";
    }
  }

  function charCounter(n) {
    return t("char_hint").replace("{n}", String(n).replace(/\s/g, "\u00a0"));
  }

  function applyPanel() {
    var lang = get();
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var k = el.getAttribute("data-i18n");
      if (!k) return;
      if (el.tagName === "TITLE") {
        document.title = t(k);
        return;
      }
      el.textContent = t(k);
    });
    document.querySelectorAll("[data-i18n-html]").forEach(function (el) {
      var k = el.getAttribute("data-i18n-html");
      if (k) el.innerHTML = t(k);
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach(function (el) {
      var k = el.getAttribute("data-i18n-placeholder");
      if (k) el.setAttribute("placeholder", t(k));
    });
    document.querySelectorAll("[data-i18n-title]").forEach(function (el) {
      var k = el.getAttribute("data-i18n-title");
      if (k) el.setAttribute("title", t(k));
    });
    document.querySelectorAll("[data-i18n-aria]").forEach(function (el) {
      var k = el.getAttribute("data-i18n-aria");
      if (k) el.setAttribute("aria-label", t(k));
    });
    document.querySelectorAll(".lang-switch__btn").forEach(function (btn) {
      var L = btn.getAttribute("data-set-lang");
      var on = L === lang;
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }

  function bindLangSwitch() {
    document.querySelectorAll("[data-set-lang]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var L = btn.getAttribute("data-set-lang");
        if (!ALLOWED[L]) return;
        set(L);
        applyPanel();
        window.dispatchEvent(new CustomEvent("aviakassa:langchange", { detail: { lang: L } }));
      });
    });
  }

  window.AviakassaLang = {
    get: get,
    set: set,
    t: t,
    greetingFirst: greetingFirst,
    memberLine: memberLine,
    charCounter: charCounter,
    applyPanel: applyPanel,
    applyPage: applyPanel,
    bindLangSwitch: bindLangSwitch,
  };

  set(get());
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      applyPanel();
      bindLangSwitch();
    });
  } else {
    applyPanel();
    bindLangSwitch();
  }
})();
