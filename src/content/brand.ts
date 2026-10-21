/**
 * Verified brand facts.
 *
 * Every value in `verified` was taken from a public source listed in
 * `sources` during the research pass (2GIS firm card + Instagram public
 * profile header). Values that could not be confirmed live in `pending`
 * and are rendered as "уточняется" / "по запросу" in the UI — never as
 * invented numbers.
 */

export const brand = {
  name: "QAZAQ DRIVE SCHOOL",
  nameShort: "QAZAQ DRIVE",
  legalDisplayRu: "Автошкола «QazaqDriveSchool»",
  legalDisplayKz: "«QazaqDriveSchool» автомектебі",
  city: "Алматы",
  cityKz: "Алматы",
  country: "KZ",
  founded: null as number | null,

  contact: {
    /** 2GIS firm card: tel:+77080861028 */
    phone: "+7 708 086 10 28",
    phoneRaw: "+77080861028",
    /** 2GIS / Instagram bio: wa.me/77080861028 */
    whatsapp: "77080861028",
    email: "qazaqdriveschool@mail.ru",
  },

  address: {
    /** 2GIS: 1-й микрорайон, 81 — 17 офис; 1 этаж, Ауэзовский район */
    line1: "1-й микрорайон, 81, офис 17",
    line2: "1 этаж, Ауэзовский район",
    city: "Алматы",
    postalCode: "050062",
    country: "Казахстан",
    lat: 43.22758,
    lng: 76.845435,
  },

  /** 2GIS reports 3 branches; only the head office card is public. */
  branchCount: 3,

  hours: {
    /** Verified: the card states the branch opens at 09:00. */
    opensAt: "09:00",
    /** Not published anywhere public — surfaced as "уточните" in the UI. */
    closesAt: null as string | null,
    noteRu: "График работы уточняйте по телефону или в WhatsApp",
    noteKz: "Жұмыс кестесін телефон немесе WhatsApp арқылы нақтылаңыз",
  },

  links: {
    instagram: "https://www.instagram.com/qazaq_drive_school",
    /** Direct firm card, not a search page. */
    gis2: "https://2gis.kz/almaty/firm/70000001102010906",
    gis2Reviews: "https://2gis.kz/almaty/firm/70000001102010906/tab/reviews",
    gis2Route:
      "https://2gis.kz/almaty/directions/points/%7C76.845435%2C43.22758%3B70000001102010906",
    tiktok: "https://www.tiktok.com/@qazaqdriveschool",
    whatsapp: "https://wa.me/77080861028",
    email: "mailto:qazaqdriveschool@mail.ru",
  },

  /** Public rating snapshot — displayed with its source and date. */
  rating: {
    value: 5.0,
    ratings: 144,
    reviews: 129,
    source: "2GIS",
    checkedAt: "2026-10-21",
  },

  instagramFollowers: 4421,

  /** Confirmed driving categories from the 2GIS "Категории прав" block. */
  categories: ["A", "A1", "B", "BE", "B1", "C", "CE", "C1", "C1E", "D", "DE", "D1", "D1E"],

  /** Confirmed payment methods from the 2GIS info tab. */
  paymentsRu: ["Оплата картой", "Наличный расчёт", "Оплата через банк", "Оплата по QR-коду"],
  paymentsKz: ["Картамен төлеу", "Қолма-қол ақша", "Банк арқылы төлеу", "QR-код арқылы төлеу"],

  /**
   * Owner-authored claim that appears in the school's own 2GIS listing.
   * Rendered as a quote, not as a verified guarantee.
   */
  ownerClaimRu: "Пробный урок бесплатно. Индивидуальный подход к каждому ученику!",
  ownerClaimKz: "Сынақ сабағы тегін. Әр оқушыға жеке көзқарас!",

  /** Instagram bio lines (public header, verified). */
  bioRu: [
    "ПДД понятно и просто",
    "Обучаем вождению с нуля",
    "Теория, практика, модульная система",
  ],
  bioKz: [
    "ЖҚЕ қарапайым және түсінікті",
    "Нөлден бастап жүргізуді үйретеміз",
    "Теория, практика, модульдік жүйе",
  ],
} as const;

export const sources = [
  {
    label: "2GIS — карточка организации",
    url: "https://2gis.kz/almaty/firm/70000001102010906",
    used: "Адрес, телефон, email, категории прав, способы оплаты, рейтинг, часы открытия, число филиалов",
  },
  {
    label: "2GIS — отзывы",
    url: "https://2gis.kz/almaty/firm/70000001102010906/tab/reviews",
    used: "Тексты отзывов учеников, даты, имена авторов",
  },
  {
    label: "Instagram — публичный заголовок профиля",
    url: "https://www.instagram.com/qazaq_drive_school",
    used: "Описание профиля, число подписчиков, ссылка WhatsApp",
    note: "Лента и Reels недоступны без авторизации — визуальный стиль постов не изучался",
  },
  {
    label: "Официальный WhatsApp",
    url: "https://wa.me/77080861028",
    used: "Канал связи",
  },
] as const;

/** Facts the owner must supply before launch. Shown in the admin panel. */
export const pendingFacts: { key: string; ru: string; kz: string }[] = [
  { key: "prices", ru: "Стоимость обучения по каждой категории", kz: "Әр санат бойынша оқу құны" },
  { key: "duration", ru: "Продолжительность курсов и размер группы", kz: "Курс ұзақтығы және топ мөлшері" },
  { key: "schedule", ru: "График theory/practice и время закрытия", kz: "Теория/практика кестесі және жабылу уақыты" },
  { key: "fleet", ru: "Марки и модели учебных автомобилей", kz: "Оқу көліктерінің маркалары мен модельдері" },
  { key: "instructors", ru: "ФИО, фото и языки инструкторов", kz: "Нұсқаушылардың аты-жөні, фотосы, тілдері" },
  { key: "license", ru: "Номер лицензии на образовательную деятельность", kz: "Білім беру қызметіне лицензия нөмірі" },
  { key: "documents", ru: "Точный перечень документов для зачисления", kz: "Қабылдауға қажет құжаттар тізімі" },
];
