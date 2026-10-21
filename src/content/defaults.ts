/**
 * Seed defaults for editable content. Prices/durations are intentionally
 * null: the school does not publish them, so the UI shows "по запросу"
 * until the owner fills them in the admin panel.
 */

export const defaultPrograms = [
  {
    slug: "category-b",
    category: "B",
    titleRu: "Категория B — легковой автомобиль",
    titleKz: "B санаты — жеңіл автомобиль",
    summaryRu:
      "Базовый курс для тех, кто садится за руль впервые: разбор ПДД понятным языком и практика на легковом автомобиле.",
    summaryKz:
      "Алғаш рет рөлге отыратындарға арналған базалық курс: ЖҚЕ-ні түсінікті тілмен талдау және жеңіл автомобильде практика.",
    priceKzt: null,
    priceNote: null,
    durationRu: null,
    durationKz: null,
    theoryRu: "Модульная программа ПДД: общие положения, обязанности водителей, безопасность.",
    theoryKz: "Модульдік ЖҚЕ бағдарламасы: жалпы ережелер, жүргізуші міндеттері, қауіпсіздік.",
    practiceRu: "Занятия с инструктором: площадка, затем город.",
    practiceKz: "Нұсқаушымен сабақтар: алаң, кейін қала.",
    transmission: null,
    includesRu: "Теория\nПрактика с инструктором\nПодготовка к экзамену",
    includesKz: "Теория\nНұсқаушымен практика\nЕмтиханға дайындық",
    extrasRu: null,
    extrasKz: null,
    isActive: true,
    isPlaceholder: true,
    sortOrder: 1,
  },
  {
    slug: "category-a",
    category: "A / A1",
    titleRu: "Категория A и A1 — мотоцикл",
    titleKz: "A және A1 санаттары — мотоцикл",
    summaryRu:
      "Обучение на мотоцикл: теория ПДД и практика с инструктором. Подходит для первой категории или дополнительной.",
    summaryKz:
      "Мотоциклге оқыту: ЖҚЕ теориясы және нұсқаушымен практика. Бірінші немесе қосымша санат үшін қолайлы.",
    priceKzt: null,
    priceNote: null,
    durationRu: null,
    durationKz: null,
    theoryRu: "Модульная программа ПДД.",
    theoryKz: "Модульдік ЖҚЕ бағдарламасы.",
    practiceRu: "Практика на учебном мотоцикле с инструктором.",
    practiceKz: "Нұсқаушымен оқу мотоцикліндегі практика.",
    transmission: null,
    includesRu: "Теория\nПрактика с инструктором\nПодготовка к экзамену",
    includesKz: "Теория\nНұсқаушымен практика\nЕмтиханға дайындық",
    extrasRu: null,
    extrasKz: null,
    isActive: true,
    isPlaceholder: true,
    sortOrder: 2,
  },
  {
    slug: "category-c",
    category: "C / C1 / CE / C1E",
    titleRu: "Категория C — грузовой транспорт",
    titleKz: "C санаты — жүк көлігі",
    summaryRu:
      "Подготовка водителей грузового транспорта. Категории C, C1, CE, C1E указаны в карточке школы.",
    summaryKz:
      "Жүк көлігі жүргізушілерін дайындау. C, C1, CE, C1E санаттары мектеп карточкасында көрсетілген.",
    priceKzt: null,
    priceNote: null,
    durationRu: null,
    durationKz: null,
    theoryRu: "Модульная программа ПДД.",
    theoryKz: "Модульдік ЖҚЕ бағдарламасы.",
    practiceRu: "Практика на учебном грузовом автомобиле.",
    practiceKz: "Оқу жүк көлігіндегі практика.",
    transmission: null,
    includesRu: "Теория\nПрактика с инструктором\nПодготовка к экзамену",
    includesKz: "Теория\nНұсқаушымен практика\nЕмтиханға дайындық",
    extrasRu: null,
    extrasKz: null,
    isActive: true,
    isPlaceholder: true,
    sortOrder: 3,
  },
  {
    slug: "category-d",
    category: "D / D1 / DE / D1E",
    titleRu: "Категория D — автобус",
    titleKz: "D санаты — автобус",
    summaryRu:
      "Подготовка водителей автобуса. Категории D, D1, DE, D1E указаны в карточке школы.",
    summaryKz:
      "Автобус жүргізушілерін дайындау. D, D1, DE, D1E санаттары мектеп карточкасында көрсетілген.",
    priceKzt: null,
    priceNote: null,
    durationRu: null,
    durationKz: null,
    theoryRu: "Модульная программа ПДД.",
    theoryKz: "Модульдік ЖҚЕ бағдарламасы.",
    practiceRu: "Практика на учебном автобусе.",
    practiceKz: "Оқу автобусындағы практика.",
    transmission: null,
    includesRu: "Теория\nПрактика с инструктором\nПодготовка к экзамену",
    includesKz: "Теория\nНұсқаушымен практика\nЕмтиханға дайындық",
    extrasRu: null,
    extrasKz: null,
    isActive: true,
    isPlaceholder: true,
    sortOrder: 4,
  },
] as const;

export type ProgramSeed = (typeof defaultPrograms)[number];
