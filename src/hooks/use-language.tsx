"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export type Lang = "ar" | "en" | "ru";

export const translations = {
  ar: {
    // Nav
    navPromo: "الرمز الترويجي",
    navSteps: "الخطوات",
    navProgram: "البرنامج",
    navWithdraw: "السحب",
    navRegister: "التسجيل",
    headerCta: "كن شريكًا",

    // Hero
    heroEyebrow: "1XBET Affiliate Program",
    heroTitleLead: "انضم إلى برنامج شراكة 1XBET واحصل على",
    heroCopy: "انضم إلى برنامج شراكة 1XBET واحصل على رمز ترويجي مخصص يعزز أرباحك! استفد من عمولات تصل إلى 40% على كل لاعب جديد تُحيله، مع أدوات تتبُّع متقدمة وإمكانية سحب أرباحك بكل سهولة.",
    heroPrimary: "ابدأ التسجيل",
    heroSecondary: "عرض التفاصيل",
    heroStat1Label: "الحد الأدنى للسحب",
    heroStat1Value: "$30",
    heroStat2Label: "لاعبون نشطون",
    heroStat2Value: "3+",
    heroStat3Label: "محافظ رقمية",
    heroStat3Value: "6+",
    heroCardCta: "سجِّل الآن واحصل على رمزك الخاص!",

    // Notice
    noticeTitle: "سجِّل خلال دقيقة واحدة",
    noticeCopy: "قم بتعبئة بياناتك واختر الرمز الترويجي المناسب لك. سنعمل على مراجعة طلبك وإرسال رابط الشريك الخاص بك في أقرب وقت ممكن.",
    noticeCta: "ابدأ الآن",

    // Promo Intro
    promoKicker: "الرمز الترويجي",
    promoTitle: "رمز ترويجي مخصص لكل شريك",
    promoCopy: "يحصل كل شريك على رمز ترويجي فريد يتتبع كل تسجيل يُحيله. اختر الرمز الذي يمثلك وابدأ في جذب لاعبين جدد.",

    // Phrases for typing effect
    phrases: ["رمز ترويجي مخصص", "عمولات تصل إلى 40%", "سحب أرباح سهل"],

    // Horizontal scroll cards
    card1Title: "البيانات الشخصية",
    card1Desc: "الاسم والبريد الإلكتروني ورقم الهاتف والدولة — جميع البيانات المطلوبة لإنشاء حسابك.",
    card2Title: "مصدر الزيارات",
    card2Desc: "حدد القناة التسويقية الرئيسية: تيليجرام، فيسبوك، تيك توك، أو أي قناة أخرى.",
    card3Title: "الرمز التسويقي",
    card3Desc: "اختر رمزًا واضحًا وسهل التذكُّر ليكون مميزًا في حملاتك التسويقية.",
    card4Title: "تتبُّع النتائج",
    card4Desc: "تابع أداء حملاتك بالتفصيل واطلع على كل تسجيل وكل عمولة في أي وقت.",
    card5Title: "سحب الأرباح",
    card5Desc: "اسحب أرباحك بسهولة إلى حساب اللاعب أو المحفظة الرقمية عند بلوغ الحد الأدنى.",

    // Steps
    step1Title: "سجِّل بياناتك",
    step1Desc: "أدخل اسمك وبريدك الإلكتروني ورقم هاتفك ودولتك لإتمام هذه الخطوة خلال ثوانٍ.",
    step2Title: "حدد مصدر الزيارات",
    step2Desc: "حدد القناة التي ستجلب منها الزيارات — وسائل التواصل الاجتماعي أو الموقع الإلكتروني أو قنوات أخرى.",
    step3Title: "اختر الرمز الترويجي",
    step3Desc: "اختر رمزًا يمثلك ويكون سهل التذكُّر لربطه بحملاتك التسويقية.",
    step4Title: "انتظر التفعيل",
    step4Desc: "سنراجع طلبك ونُفعِّل حسابك ونرسل إليك رابط الشريك والرمز الخاص بك.",
    stepsKicker: "كيف تبدأ",
    stepsTitle: "4 خطوات لبدء تحقيق الأرباح",

    // Program Details
    programKicker: "عن البرنامج",
    programTitle: "كل ما يلزمك معرفته",
    detailAge: "18+",
    detailAgeLabel: "الحد الأدنى للعمر",
    detailMin: "$30",
    detailMinLabel: "الحد الأدنى للسحب",
    detailPeriod: "الاثنين - الأحد",
    detailPeriodLabel: "فترة الاحتساب",
    detailDay: "الثلاثاء",
    detailDayLabel: "يوم المعالجة",

    // Withdrawal
    withdrawKicker: "السحب والعمولات",
    withdrawTitle: "قواعد سحب الأرباح ونظام العمولات",
    withdrawRulesTitle: "قواعد السحب",
    rule1Title: "حساب اللاعب",
    rule1Desc: "3+ لاعبين نشطين",
    rule2Title: "محفظة رقمية",
    rule2Desc: "6+ لاعبين نشطين",
    rule3Title: "تتبُّع النتائج",
    rule3Desc: "تقارير اللاعبين",
    rule4Title: "بريد الدعم",
    rule4Desc: "support@partners1xbet.com",
    commissionEgypt: "مصر",
    commissionOther: "دول أخرى",
    commissionFtd: "FTD",
    commissionRate: "العمولة",
    commissionStructure: "هيكل العمولة",
    egyptTier1: "0-50",
    egyptTier2: "51-100",
    egyptTier3: "101-350",
    egyptTier4: "351+",
    otherTier1: "500-799",
    otherTier2: "800-1000",
    otherTier3: "1000+",

    // Form
    formKicker: "التسجيل",
    formTitle: "قدِّم طلبك الآن",
    formName: "الاسم الكامل",
    formNamePlaceholder: "أدخل اسمك الكامل",
    formEmail: "البريد الإلكتروني",
    formEmailPlaceholder: "example@email.com",
    formPhone: "رقم الهاتف",
    formPhonePlaceholder: "+20 xxx xxx xxxx",
    formCountry: "الدولة",
    formCountryPlaceholder: "اختر دولتك",
    formPromo: "الرمز الترويجي المقترح",
    formPromoPlaceholder: "مثال: PARTNER2024",
    formPromoPreview: "معاينة الرمز الترويجي",
    formTraffic: "مصدر الزيارات",
    formTrafficPlaceholder: "اختر مصدر الزيارات",
    formChannel: "وصف القناة",
    formChannelPlaceholder: "صِف قناتك التسويقية بإيجاز...",
    formSubmit: "تقديم الطلب",
    formSubmitting: "جارٍ التقديم...",
    formSuccess: "تم تقديم الطلب بنجاح!",
    formError: "حدث خطأ، يرجى المحاولة مرة أخرى",
    formPromoTaken: "هذا الرمز الترويجي مسجَّل بالفعل. يرجى اختيار رمز مختلف.",
    formPromoAvailable: "هذا الرمز متاح للاستخدام!",
    formNameTooShort: "الاسم يجب أن يحتوي على 3 أحرف على الأقل",
    formNameInvalid: "الاسم يجب أن يحتوي على أحرف ومسافات فقط",
    formPhoneInvalid: "رقم الهاتف غير صحيح (7-15 رقماً)",
    formEmailInvalid: "صيغة البريد الإلكتروني غير صحيحة",

    // Countries
    countryEgypt: "مصر",
    countrySaudi: "المملكة العربية السعودية",
    countryUAE: "الإمارات العربية المتحدة",
    countryMorocco: "المغرب",
    countryAlgeria: "الجزائر",
    countryIraq: "العراق",
    countryJordan: "الأردن",
    countryRussia: "روسيا",
    countryOther: "أخرى",

    // Traffic sources
    trafficTelegram: "تيليجرام",
    trafficFacebook: "فيسبوك",
    trafficTiktok: "تيك توك",
    trafficYoutube: "يوتيوب",
    trafficWebsite: "موقع إلكتروني",
    trafficOther: "أخرى",

    // FAQ
    faqKicker: "الأسئلة الشائعة",
    faqTitle: "إجابات على أسئلتك",
    faq1Q: "ما البيانات المطلوبة للتسجيل؟",
    faq1A: "الاسم الكامل ورقم الهاتف والبريد الإلكتروني والدولة ومصدر الزيارات والرمز الترويجي المقترح.",
    faq2Q: "كيف يمكنني تتبع نتائجي؟",
    faq2A: "من خلال تقارير الحساب يمكنك تتبع كل تسجيل وكل عمولة واختيار الفترة التي ترغب في مراجعتها.",
    faq3Q: "هل العمولة ثابتة؟",
    faq3A: "لا، تعتمد العمولة على عدد اللاعبين الجدد وشرائح FTD، ويمكن أن تصل إلى 40%.",

    // Footer
    footerDesc: "برنامج شراكة 1XBET — شريكك في النجاح. سجِّل الآن واحصل على رمز ترويجي مخصص وابدأ في جمع العمولات على كل لاعب جديد.",
    footerCopy: "© 2024 1XBET Affiliate. جميع الحقوق محفوظة.",

    // Contact
    contactBadge: "تواصل معنا",
    contactTitle: "تواصل معنا في أي وقت",
    contactDesc: "إذا كان لديك أي استفسار أو تحتاج إلى مساعدة، تواصل معنا عبر تيليجرام أو واتساب وسنرد عليك في أقرب وقت ممكن.",
    contactTelegram: "تيليجرام",
    contactTelegramDesc: "أرسل لنا رسالة على تيليجرام وسنرد عليك في أسرع وقت:",
    contactWhatsApp: "واتساب",
    contactWhatsAppDesc: "تواصل معنا مباشرة عبر واتساب على الرقم التالي:",

    // Preloader
    preloaderText: "جارٍ التحميل",
  },
  en: {
    // Nav
    navPromo: "Promo Code",
    navSteps: "Steps",
    navProgram: "Program",
    navWithdraw: "Payout",
    navRegister: "Register",
    headerCta: "Become Partner",

    // Hero
    heroEyebrow: "1XBET Affiliate Program",
    heroTitleLead: "Register as a partner and get a",
    heroCopy: "A premium registration flow for partner details, traffic source, and proposed promo code in one clear form built for campaign teams.",
    heroPrimary: "Start Registration",
    heroSecondary: "View Details",
    heroStat1Label: "Min. Withdrawal",
    heroStat1Value: "$30",
    heroStat2Label: "Active Players",
    heroStat2Value: "3+",
    heroStat3Label: "Crypto Wallets",
    heroStat3Value: "6+",
    heroCardCta: "Register now to get your code!",

    // Notice
    noticeTitle: "One Organized Request",
    noticeCopy: "Submit partner details, traffic source, and proposed promo code. After review, the request can be assigned to a sales owner or tracking dashboard.",
    noticeCta: "Submit Request",

    // Promo Intro
    promoKicker: "About Promo Codes",
    promoTitle: "Get a dedicated promo code for your campaigns",
    promoCopy: "A promo code is a dedicated marketing code used to identify partner requests and connect them with a traffic source. Fill in your details, choose a clean code, and start the review flow.",

    // Phrases for typing effect
    phrases: ["Dedicated Promo Code", "Clear Partner Link", "Trackable Request"],

    // Horizontal scroll cards
    card1Title: "Partner Details",
    card1Desc: "Name, email, phone, and country — everything needed to register a partner.",
    card2Title: "Traffic Source",
    card2Desc: "Specify the main marketing channel (Telegram, Facebook, TikTok, etc.).",
    card3Title: "Promo Code",
    card3Desc: "Choose a clear and memorable code to link with your campaigns.",
    card4Title: "Reports",
    card4Desc: "Track your results through account reports by selecting appropriate periods.",
    card5Title: "Withdrawal",
    card5Desc: "Withdraw earnings via player account or crypto wallet after reaching the minimum.",

    // Steps
    step1Title: "Create Your Account",
    step1Desc: "Register your basic info: name, email, phone number, and country.",
    step2Title: "Choose Traffic Source",
    step2Desc: "Select the marketing channel that will drive your traffic.",
    step3Title: "Propose a Promo Code",
    step3Desc: "Choose a clear marketing code to link with your account.",
    step4Title: "Wait for Review",
    step4Desc: "After review, you'll receive your partner link and dedicated promo code.",
    stepsKicker: "Registration Steps",
    stepsTitle: "Four Simple Steps to Get Started",

    // Program Details
    programKicker: "Program Details",
    programTitle: "Everything You Need to Know",
    detailAge: "18+",
    detailAgeLabel: "Minimum Age",
    detailMin: "$30",
    detailMinLabel: "Min. Withdrawal",
    detailPeriod: "Mon - Sun",
    detailPeriodLabel: "Calculation Period",
    detailDay: "Tuesday",
    detailDayLabel: "Processing Day",

    // Withdrawal
    withdrawKicker: "Payout & Commission",
    withdrawTitle: "Withdrawal Rules & Commission Structure",
    withdrawRulesTitle: "Withdrawal Rules",
    rule1Title: "Player Account",
    rule1Desc: "3+ active players",
    rule2Title: "Crypto Wallet",
    rule2Desc: "6+ active players",
    rule3Title: "Results Tracking",
    rule3Desc: "Player Report",
    rule4Title: "Support Email",
    rule4Desc: "support@partners1xbet.com",
    commissionEgypt: "Egypt",
    commissionOther: "Other Countries",
    commissionFtd: "FTD",
    commissionRate: "Commission",
    commissionStructure: "Commission Structure",
    egyptTier1: "0-50",
    egyptTier2: "51-100",
    egyptTier3: "101-350",
    egyptTier4: "351+",
    otherTier1: "500-799",
    otherTier2: "800-1000",
    otherTier3: "1000+",

    // Form
    formKicker: "Registration",
    formTitle: "Submit Your Request Now",
    formName: "Full Name",
    formNamePlaceholder: "Enter your full name",
    formEmail: "Email Address",
    formEmailPlaceholder: "example@email.com",
    formPhone: "Phone Number",
    formPhonePlaceholder: "+1 xxx xxx xxxx",
    formCountry: "Country",
    formCountryPlaceholder: "Select your country",
    formPromo: "Proposed Promo Code",
    formPromoPlaceholder: "e.g. PARTNER2024",
    formPromoPreview: "Promo Code Preview",
    formTraffic: "Traffic Source",
    formTrafficPlaceholder: "Select traffic source",
    formChannel: "Channel Description",
    formChannelPlaceholder: "Briefly describe your marketing channel...",
    formSubmit: "Submit Request",
    formSubmitting: "Submitting...",
    formSuccess: "Request submitted successfully!",
    formError: "An error occurred, please try again",
    formPromoTaken: "This promo code is already taken. Please choose a different one.",
    formPromoAvailable: "This promo code is available!",
    formNameTooShort: "Name must be at least 3 characters long",
    formNameInvalid: "Name can only contain letters and spaces",
    formPhoneInvalid: "Invalid phone number (7-15 digits required)",
    formEmailInvalid: "Invalid email address",

    // Countries
    countryEgypt: "Egypt",
    countrySaudi: "Saudi Arabia",
    countryUAE: "UAE",
    countryMorocco: "Morocco",
    countryAlgeria: "Algeria",
    countryIraq: "Iraq",
    countryJordan: "Jordan",
    countryRussia: "Russia",
    countryOther: "Other",

    // Traffic sources
    trafficTelegram: "Telegram",
    trafficFacebook: "Facebook",
    trafficTiktok: "TikTok",
    trafficYoutube: "YouTube",
    trafficWebsite: "Website",
    trafficOther: "Other",

    // FAQ
    faqKicker: "FAQ",
    faqTitle: "Answers to Your Questions",
    faq1Q: "What data is required to register?",
    faq1A: "Full name, phone number, email address, country, traffic source, and proposed promo code.",
    faq2Q: "How are results tracked?",
    faq2A: "Performance is tracked through account reports by selecting the appropriate period to view results.",
    faq3Q: "Is the commission fixed?",
    faq3A: "The commission is tied to new user performance, FTD tiers, and profit calculation method.",

    // Footer
    footerDesc: "1XBET Affiliate Program — A professional marketing platform for growth partners. Register now and get a dedicated promo code with integrated tracking campaigns.",
    footerCopy: "© 2024 1XBET Affiliate. All rights reserved.",

    // Contact
    contactBadge: "Contact Us",
    contactTitle: "Get in Touch Easily",
    contactDesc: "You can reach us through social media or by phone. We're here to help with any inquiry or issue you may have.",
    contactTelegram: "Telegram",
    contactTelegramDesc: "To contact us via Telegram, send a message to the following account:",
    contactWhatsApp: "WhatsApp",
    contactWhatsAppDesc: "For direct contact via WhatsApp, you can use the following number:",

    // Preloader
    preloaderText: "Loading",
  },
  ru: {
    // Nav
    navPromo: "Промокод",
    navSteps: "Шаги",
    navProgram: "Программа",
    navWithdraw: "Выплаты",
    navRegister: "Регистрация",
    headerCta: "Стать партнёром",

    // Hero
    heroEyebrow: "1XBET Affiliate Program",
    heroTitleLead: "Зарегистрируйтесь как партнёр и получите",
    heroCopy: "Премиальный процесс регистрации данных партнёра, источника трафика и предлагаемого промокода в одной понятной форме, созданной для команд маркетинга.",
    heroPrimary: "Начать регистрацию",
    heroSecondary: "Подробнее",
    heroStat1Label: "Мин. вывод",
    heroStat1Value: "$30",
    heroStat2Label: "Активные игроки",
    heroStat2Value: "3+",
    heroStat3Label: "Криптокошельки",
    heroStat3Value: "6+",
    heroCardCta: "Зарегистрируйтесь сейчас, чтобы получить код!",

    // Notice
    noticeTitle: "Один организованный запрос",
    noticeCopy: "Отправьте данные партнёра, источник трафика и предлагаемый промокод. После проверки запрос может быть назначен владельцу продаж или панели отслеживания.",
    noticeCta: "Отправить заявку",

    // Promo Intro
    promoKicker: "О промокодах",
    promoTitle: "Получите персональный промокод для кампаний",
    promoCopy: "Промокод — это специальный маркетинговый код для идентификации заявок партнёров и их связи с источником трафика. Заполните данные, выберите код и начните процесс проверки.",

    // Phrases for typing effect
    phrases: ["Персональный промокод", "Чёткая партнёрская ссылка", "Отслеживаемая заявка"],

    // Horizontal scroll cards
    card1Title: "Данные партнёра",
    card1Desc: "Имя, email, телефон и страна — всё необходимое для регистрации партнёра.",
    card2Title: "Источник трафика",
    card2Desc: "Укажите основной маркетинговый канал (Telegram, Facebook, TikTok и т.д.).",
    card3Title: "Промокод",
    card3Desc: "Выберите понятный и запоминающийся код для привязки к кампаниям.",
    card4Title: "Отчёты",
    card4Desc: "Отслеживайте результаты через отчёты аккаунта, выбирая нужные периоды.",
    card5Title: "Выплаты",
    card5Desc: "Выводите заработок на игровой счёт или криптокошелёк после достижения минимума.",

    // Steps
    step1Title: "Создайте аккаунт",
    step1Desc: "Зарегистрируйте базовую информацию: имя, email, номер телефона и страну.",
    step2Title: "Выберите источник трафика",
    step2Desc: "Выберите маркетинговый канал, который будет приносить трафик.",
    step3Title: "Предложите промокод",
    step3Desc: "Выберите чёткий маркетинговый код для привязки к аккаунту.",
    step4Title: "Ожидайте проверки",
    step4Desc: "После проверки вы получите партнёрскую ссылку и персональный промокод.",
    stepsKicker: "Шаги регистрации",
    stepsTitle: "Четыре простых шага для старта",

    // Program Details
    programKicker: "Детали программы",
    programTitle: "Всё, что нужно знать",
    detailAge: "18+",
    detailAgeLabel: "Минимальный возраст",
    detailMin: "$30",
    detailMinLabel: "Мин. вывод",
    detailPeriod: "Пн – Вс",
    detailPeriodLabel: "Период расчёта",
    detailDay: "Вторник",
    detailDayLabel: "День обработки",

    // Withdrawal
    withdrawKicker: "Выплаты и комиссии",
    withdrawTitle: "Правила вывода и структура комиссий",
    withdrawRulesTitle: "Правила вывода",
    rule1Title: "Игровой счёт",
    rule1Desc: "3+ активных игрока",
    rule2Title: "Криптокошелёк",
    rule2Desc: "6+ активных игроков",
    rule3Title: "Отслеживание результатов",
    rule3Desc: "Отчёт по игрокам",
    rule4Title: "Email поддержки",
    rule4Desc: "support@partners1xbet.com",
    commissionEgypt: "Египет",
    commissionOther: "Другие страны",
    commissionFtd: "FTD",
    commissionRate: "Комиссия",
    commissionStructure: "Структура комиссии",
    egyptTier1: "0-50",
    egyptTier2: "51-100",
    egyptTier3: "101-350",
    egyptTier4: "351+",
    otherTier1: "500-799",
    otherTier2: "800-1000",
    otherTier3: "1000+",

    // Form
    formKicker: "Регистрация",
    formTitle: "Отправьте заявку сейчас",
    formName: "Полное имя",
    formNamePlaceholder: "Введите ваше полное имя",
    formEmail: "Email адрес",
    formEmailPlaceholder: "example@email.com",
    formPhone: "Номер телефона",
    formPhonePlaceholder: "+7 xxx xxx xxxx",
    formCountry: "Страна",
    formCountryPlaceholder: "Выберите вашу страну",
    formPromo: "Предлагаемый промокод",
    formPromoPlaceholder: "напр. PARTNER2024",
    formPromoPreview: "Предпросмотр промокода",
    formTraffic: "Источник трафика",
    formTrafficPlaceholder: "Выберите источник трафика",
    formChannel: "Описание канала",
    formChannelPlaceholder: "Кратко опишите ваш маркетинговый канал...",
    formSubmit: "Отправить заявку",
    formSubmitting: "Отправка...",
    formSuccess: "Заявка успешно отправлена!",
    formError: "Произошла ошибка, попробуйте снова",
    formPromoTaken: "Этот промокод уже занят. Выберите другой.",
    formPromoAvailable: "Этот промокод доступен!",
    formNameTooShort: "Имя должно содержать минимум 3 символа",
    formNameInvalid: "Имя может содержать только буквы и пробелы",
    formPhoneInvalid: "Введите корректный номер телефона (7-15 цифр)",
    formEmailInvalid: "Некорректный email адрес",

    // Countries
    countryEgypt: "Египет",
    countrySaudi: "Саудовская Аравия",
    countryUAE: "ОАЭ",
    countryMorocco: "Марокко",
    countryAlgeria: "Алжир",
    countryIraq: "Ирак",
    countryJordan: "Иордания",
    countryRussia: "Россия",
    countryOther: "Другая",

    // Traffic sources
    trafficTelegram: "Telegram",
    trafficFacebook: "Facebook",
    trafficTiktok: "TikTok",
    trafficYoutube: "YouTube",
    trafficWebsite: "Веб-сайт",
    trafficOther: "Другое",

    // FAQ
    faqKicker: "FAQ",
    faqTitle: "Ответы на ваши вопросы",
    faq1Q: "Какие данные нужны для регистрации?",
    faq1A: "Полное имя, номер телефона, email, страна, источник трафика и предлагаемый промокод.",
    faq2Q: "Как отслеживаются результаты?",
    faq2A: "Производительность отслеживается через отчёты аккаунта путём выбора соответствующего периода для просмотра результатов.",
    faq3Q: "Комиссия фиксирована?",
    faq3A: "Комиссия привязана к производительности новых пользователей, уровням FTD и методу расчёта прибыли.",

    // Footer
    footerDesc: "1XBET Affiliate Program — профессиональная маркетинговая платформа для партнёров. Зарегистрируйтесь сейчас и получите персональный промокод с интегрированными кампаниями отслеживания.",
    footerCopy: "© 2024 1XBET Affiliate. Все права защищены.",

    // Contact
    contactBadge: "Связаться с нами",
    contactTitle: "Легко свяжитесь с нами",
    contactDesc: "Вы можете связаться с нами через социальные сети или по телефону. Мы здесь, чтобы помочь с любым вопросом.",
    contactTelegram: "Telegram",
    contactTelegramDesc: "Чтобы связаться с нами через Telegram, отправьте сообщение на следующий аккаунт:",
    contactWhatsApp: "WhatsApp",
    contactWhatsAppDesc: "Для прямой связи через WhatsApp используйте следующий номер:",

    // Preloader
    preloaderText: "Загрузка",
  },
} as const;

export type Translations = (typeof translations)[Lang];

interface LanguageContextType {
  lang: Lang;
  t: Translations;
  setLang: (lang: Lang) => void;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ar");

  const setLang = useCallback((newLang: Lang) => {
    setLangState(newLang);
  }, []);

  const t = translations[lang];
  const isRTL = lang === "ar";

  return (
    <LanguageContext.Provider value={{ lang, t, setLang, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
