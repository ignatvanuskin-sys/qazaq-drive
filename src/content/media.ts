/**
 * Editorial imagery used across the site.
 *
 * These are *atmosphere* shots, not photos of the school's own fleet or
 * staff, so every alt/caption says so. The owner replaces them with real
 * photography via the admin panel / repository, and the copy stays honest.
 */

export const media = {
  hero: {
    src: "/images/hero.jpg",
    width: 1024,
    height: 1536,
    altRu: "Автомобиль на вечерней дороге Алматы, силуэт гор на горизонте. Демонстрационное изображение",
    altKz: "Алматының кешкі жолындағы автомобиль, көкжиекте тау сұлбасы. Демонстрациялық сурет",
    captionRu: "Демонстрационное изображение",
    captionKz: "Демонстрациялық сурет",
  },
  practice: {
    src: "/images/practice.jpg",
    width: 1536,
    height: 1024,
    altRu: "Руки на руле учебного автомобиля, занятие с инструктором. Демонстрационное изображение",
    altKz: "Оқу автомобилінің рөліндегі қолдар, нұсқаушымен сабақ. Демонстрациялық сурет",
    captionRu: "Практика: занятие с инструктором",
    captionKz: "Практика: нұсқаушымен сабақ",
  },
  theory: {
    src: "/images/theory.jpg",
    width: 1536,
    height: 1024,
    altRu: "Учебный класс автошколы с экраном и схемой перекрёстка. Демонстрационное изображение",
    altKz: "Автомектептің экраны мен айқасқа схемасы бар оқу сыныбы. Демонстрациялық сурет",
    captionRu: "Теория: разбор ПДД",
    captionKz: "Теория: ЖҚЕ талдау",
  },
  fleet: {
    src: "/images/fleet.jpg",
    width: 1536,
    height: 1024,
    altRu: "Ряд учебных седанов на площадке в вечернем свете. Демонстрационное изображение",
    altKz: "Кешкі жарықта алаңдағы оқу седандарының қатары. Демонстрациялық сурет",
    captionRu: "Учебный автопарк",
    captionKz: "Оқу автопаркі",
  },
  city: {
    src: "/images/city.jpg",
    width: 1536,
    height: 1024,
    altRu: "Дорога в Алматы вечером, огни города и горы. Демонстрационное изображение",
    altKz: "Кешкі Алматы жолы, қала шамдары мен таулар. Демонстрациялық сурет",
    captionRu: "Городские маршруты",
    captionKz: "Қалалық маршруттар",
  },
  interior: {
    src: "/images/interior.jpg",
    width: 1536,
    height: 1024,
    altRu: "Салон учебного автомобиля: приборная панель и рычаг коробки передач. Демонстрационное изображение",
    altKz: "Оқу автомобилінің салоны: аспаптар тақтасы мен беріліс рычагі. Демонстрациялық сурет",
    captionRu: "Рабочее место ученика",
    captionKz: "Оқушының жұмыс орны",
  },
} as const;

export const galleryItems = ["practice", "theory", "fleet", "interior", "city"] as const;
