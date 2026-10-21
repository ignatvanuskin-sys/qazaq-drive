import type { Metadata } from "next";
import { brand } from "@/content/brand";
import type { Locale } from "./i18n";

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://qazaqdrive.kz").replace(
  /\/$/,
  "",
);

type PageKey =
  | "home"
  | "programs"
  | "process"
  | "fleet"
  | "instructors"
  | "reviews"
  | "faq"
  | "contacts"
  | "booking"
  | "privacy";

const copy: Record<PageKey, Record<Locale, { title: string; description: string; path: string }>> = {
  home: {
    ru: {
      title: "Автошкола в Алматы — QAZAQ DRIVE SCHOOL | Обучение вождению",
      description:
        "Автошкола QAZAQ DRIVE SCHOOL в Алматы: 13 категорий прав, теория без зубрёжки и практика с инструктором. Рейтинг 5,0 в 2ГИС. Запись онлайн за 2 минуты.",
      path: "",
    },
    kz: {
      title: "Алматыдағы автомектеп — QAZAQ DRIVE SCHOOL | Жүргізуді үйрету",
      description:
        "Алматыдағы QAZAQ DRIVE SCHOOL автомектебі: 13 санат, жаттаусыз теория және нұсқаушымен практика. 2GIS-те 5,0 рейтинг. Онлайн жазылу — 2 минут.",
      path: "",
    },
  },
  programs: {
    ru: {
      title: "Программы обучения вождению в Алматы — категории A, B, C, D | QAZAQ DRIVE",
      description:
        "Категории A, A1, B, B1, BE, C, C1, CE, C1E, D, D1, DE, D1E. Теория, практика и модульный формат. Стоимость и график подтверждает администратор.",
      path: "/programs",
    },
    kz: {
      title: "Алматыда жүргізуді үйрету бағдарламалары — A, B, C, D санаттары | QAZAQ DRIVE",
      description:
        "A, A1, B, B1, BE, C, C1, CE, C1E, D, D1, DE, D1E санаттары. Теория, практика және модульдік формат. Құны мен кестені әкімші растайды.",
      path: "/programs",
    },
  },
  process: {
    ru: {
      title: "Как проходит обучение в автошколе — 6 этапов | QAZAQ DRIVE SCHOOL",
      description:
        "От заявки до экзамена: консультация, оформление, теория, практика с инструктором и подготовка к экзамену. Порядок обучения в Алматы.",
      path: "/process",
    },
    kz: {
      title: "Автомектепте оқу қалай өтеді — 6 кезең | QAZAQ DRIVE SCHOOL",
      description:
        "Өтінімнен емтиханға дейін: кеңес, рәсімдеу, теория, нұсқаушымен практика және емтиханға дайындық. Алматыдағы оқу тәртібі.",
      path: "/process",
    },
  },
  fleet: {
    ru: {
      title: "Учебные автомобили и практика вождения | QAZAQ DRIVE SCHOOL Алматы",
      description:
        "Практика на учебных автомобилях школы: площадка и город, занятия один на один с инструктором. Автопарк и галерея.",
      path: "/fleet",
    },
    kz: {
      title: "Оқу көліктері және жүргізу практикасы | QAZAQ DRIVE SCHOOL Алматы",
      description:
        "Мектептің оқу көліктеріндегі практика: алаң және қала, нұсқаушымен жеке сабақтар. Автопарк және галерея.",
      path: "/fleet",
    },
  },
  instructors: {
    ru: {
      title: "Инструкторы по вождению в Алматы | QAZAQ DRIVE SCHOOL",
      description:
        "Инструкторы автошколы QAZAQ DRIVE SCHOOL: подтверждённые профили, опыт и языки обучения. Терпеливый подход к каждому ученику.",
      path: "/instructors",
    },
    kz: {
      title: "Алматыдағы жүргізу нұсқаушылары | QAZAQ DRIVE SCHOOL",
      description:
        "QAZAQ DRIVE SCHOOL нұсқаушылары: расталған профильдер, тәжірибе және оқыту тілдері. Әр оқушыға шыдамды көзқарас.",
      path: "/instructors",
    },
  },
  reviews: {
    ru: {
      title: "Отзывы учеников автошколы в Алматы | QAZAQ DRIVE SCHOOL",
      description:
        "Реальные отзывы учеников из карточки 2ГИС: рейтинг 5,0, 144 оценки. Каждый отзыв можно проверить по ссылке на источник.",
      path: "/reviews",
    },
    kz: {
      title: "Алматыдағы автомектеп оқушыларының пікірлері | QAZAQ DRIVE SCHOOL",
      description:
        "2GIS карточкасындағы нақты оқушы пікірлері: 5,0 рейтинг, 144 баға. Әр пікірді дереккөз сілтемесі арқылы тексеруге болады.",
      path: "/reviews",
    },
  },
  faq: {
    ru: {
      title: "Вопросы об обучении в автошколе в Алматы | QAZAQ DRIVE SCHOOL",
      description:
        "Документы, стоимость, сроки, график, оплата и практика — ответы на частые вопросы об обучении в автошколе QAZAQ DRIVE SCHOOL.",
      path: "/faq",
    },
    kz: {
      title: "Алматыдағы автомектепте оқу туралы сұрақтар | QAZAQ DRIVE SCHOOL",
      description:
        "Құжаттар, құны, мерзім, кесте, төлем және практика — QAZAQ DRIVE SCHOOL автомектебінде оқу туралы жиі қойылатын сұрақтарға жауаптар.",
      path: "/faq",
    },
  },
  contacts: {
    ru: {
      title: "Контакты автошколы в Алматы — 1-й микрорайон, 81 | QAZAQ DRIVE SCHOOL",
      description:
        "Адрес: Алматы, 1-й микрорайон, 81, офис 17. Телефон +7 708 086 10 28, WhatsApp, email. Маршрут в 2ГИС и форма консультации.",
      path: "/contacts",
    },
    kz: {
      title: "Алматыдағы автомектеп байланысы — 1-шағын аудан, 81 | QAZAQ DRIVE SCHOOL",
      description:
        "Мекенжай: Алматы, 1-шағын аудан, 81, 17-кеңсе. Телефон +7 708 086 10 28, WhatsApp, email. 2GIS-те маршрут және кеңес формасы.",
      path: "/contacts",
    },
  },
  booking: {
    ru: {
      title: "Записаться на обучение в автошколу Алматы | QAZAQ DRIVE SCHOOL",
      description:
        "Онлайн-запись за 4 шага: выберите интерес, категорию и удобное время. Заявка сразу попадает администратору школы.",
      path: "/booking",
    },
    kz: {
      title: "Алматыдағы автомектепке оқуға жазылу | QAZAQ DRIVE SCHOOL",
      description:
        "4 қадамда онлайн жазылу: қызығушылықты, санатты және ыңғайлы уақытты таңдаңыз. Өтінім бірден мектеп әкімшісіне түседі.",
      path: "/booking",
    },
  },
  privacy: {
    ru: {
      title: "Политика конфиденциальности | QAZAQ DRIVE SCHOOL",
      description:
        "Какие персональные данные собирает сайт автошколы, зачем они нужны, кому передаются и как запросить удаление.",
      path: "/privacy",
    },
    kz: {
      title: "Құпиялылық саясаты | QAZAQ DRIVE SCHOOL",
      description:
        "Автомектеп сайты қандай дербес деректерді жинайды, олар не үшін қажет, кімге беріледі және жоюды қалай сұрауға болады.",
      path: "/privacy",
    },
  },
};

export function buildMetadata(locale: Locale, page: PageKey): Metadata {
  const c = copy[page][locale];
  const url = `${siteUrl}/${locale}${c.path}`;
  return {
    title: c.title,
    description: c.description,
    alternates: {
      canonical: url,
      languages: {
        ru: `${siteUrl}/ru${c.path}`,
        kk: `${siteUrl}/kz${c.path}`,
        "x-default": `${siteUrl}/ru${c.path}`,
      },
    },
    openGraph: {
      type: "website",
      siteName: brand.name,
      locale: locale === "ru" ? "ru_KZ" : "kk_KZ",
      alternateLocale: locale === "ru" ? "kk_KZ" : "ru_KZ",
      url,
      title: c.title,
      description: c.description,
    },
    twitter: {
      card: "summary_large_image",
      title: c.title,
      description: c.description,
    },
  };
}

export function organizationJsonLd(locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "DrivingSchool",
    "@id": `${siteUrl}/#organization`,
    name: brand.name,
    alternateName: brand.legalDisplayRu,
    description:
      locale === "ru"
        ? "Автошкола в Алматы: теория, практика и модульное обучение вождению. Категории A, B, C, D."
        : "Алматыдағы автомектеп: теория, практика және модульдік жүргізу оқытуы. A, B, C, D санаттары.",
    url: `${siteUrl}/${locale}`,
    telephone: brand.contact.phoneRaw,
    email: brand.contact.email,
    image: `${siteUrl}/og/cover.jpg`,
    priceRange: "₸₸",
    currenciesAccepted: "KZT",
    paymentAccepted: (locale === "ru" ? brand.paymentsRu : brand.paymentsKz).join(", "),
    address: {
      "@type": "PostalAddress",
      streetAddress: `${brand.address.line1}, ${brand.address.line2}`,
      addressLocality: brand.address.city,
      postalCode: brand.address.postalCode,
      addressCountry: "KZ",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: brand.address.lat,
      longitude: brand.address.lng,
    },
    areaServed: { "@type": "City", name: "Алматы" },
    sameAs: [brand.links.instagram, brand.links.gis2, brand.links.tiktok],
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        opens: brand.hours.opensAt,
      },
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: locale === "ru" ? "Категории обучения" : "Оқу санаттары",
      itemListElement: brand.categories.map((c) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name:
            locale === "ru"
              ? `Обучение вождению, категория ${c}`
              : `Жүргізуді үйрету, ${c} санаты`,
        },
      })),
    },
  };
}

export function breadcrumbJsonLd(locale: Locale, items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${siteUrl}/${locale}${item.path}`,
    })),
  };
}
