/**
 * Real student reviews, reproduced from the school's 2GIS firm card.
 * Each entry links back to the original source so a visitor can verify it.
 * Nothing here is written by us and no review text is invented.
 */

import { brand } from "./brand";

export type Review = {
  author: string;
  date: string;
  text: string;
  rating: number;
  verified: boolean;
  /** Short pull-quote used in the editorial layout. */
  highlight: string;
};

export const reviews: Review[] = [
  {
    author: "Kymbat Kobzhanova",
    date: "6 февраля 2026",
    rating: 5,
    verified: true,
    highlight: "Получила права — во многом благодаря инструкторам",
    text: "Хочу выразить огромную благодарность автошколе за профессиональное обучение и поддержку на каждом этапе. Сегодня я получила водительские права, и это во многом благодаря опытным инструкторам, их терпению и умению всё понятно объяснять. Занятия проходили в комфортной и дружелюбной атмосфере, теория была доступной и полезной, а практика — уверенной и спокойной.",
  },
  {
    author: "Расул Ахметов",
    date: "26 февраля 2026",
    rating: 5,
    verified: true,
    highlight: "Машины в хорошем состоянии",
    text: "Отличная автошкола, хорошие преподаватели и машины в хорошем состоянии. Особенно понравилось, как объясняют теорию, просто и по делу.",
  },
  {
    author: "Жания Куантбекова",
    date: "23 февраля 2026",
    rating: 5,
    verified: true,
    highlight: "Вождение проходило в дружеской атмосфере",
    text: "Вождение проходило в дружеской атмосфере, инструктор Бауржан всегда подсказывал и поддерживал, за что спасибо.",
  },
  {
    author: "Жансерик",
    date: "23 февраля 2026",
    rating: 5,
    verified: true,
    highlight: "Инструкторы спокойные и терпеливые",
    text: "Отличная автошкола! Всё понятно объясняют, инструкторы спокойные и терпеливые. С первого раза сдал экзамен.",
  },
  {
    author: "Жандос Жаксыбай",
    date: "22 февраля 2026",
    rating: 5,
    verified: true,
    highlight: "Теория и практика идеально сочетаются",
    text: "Прекрасная организация обучения, теория и практика идеально сочетаются. Преподаватели всегда готовы помочь. Очень доволен, что выбрал именно эту автошколу.",
  },
  {
    author: "Санжар Омеркулов",
    date: "22 февраля 2026",
    rating: 5,
    verified: true,
    highlight: "Начали с общих положений и обязанностей водителей",
    text: "Очень понравилось, что начали с общих положений и обязанностей водителей — хороший фундамент. Программа продуманная, основы ПДД разобрали подробно.",
  },
  {
    author: "Шынгыс Шын",
    date: "2 февраля 2026",
    rating: 5,
    verified: true,
    highlight: "Рядом с ним всё волнение на дороге исчезает",
    text: "Бауыржан аға обучает вождению прекрасно, позитивно, спокойно и уравновешенно — рядом с ним всё волнение на дороге исчезает, чувствуешь себя более уверенно.",
  },
  {
    author: "Тимур Сабиров",
    date: "30 января 2026",
    rating: 5,
    verified: true,
    highlight: "Научили всему, что нужно",
    text: "Спасибо этой автошколе, научили всему, что нужно. Отдельно отмечу инструктора Жандоса — терпеливый и понимающий человек.",
  },
  {
    author: "Роза Кисметова",
    date: "30 января 2026",
    rating: 5,
    verified: true,
    highlight: "Обучение было без спешки",
    text: "Очень понравилось, что обучение было без спешки. Каждое занятие давало уверенность в своих силах. Отдельно спасибо Жандосу.",
  },
];

export const reviewMeta = {
  rating: brand.rating.value,
  ratings: brand.rating.ratings,
  reviews: brand.rating.reviews,
  source: brand.rating.source,
  url: brand.links.gis2Reviews,
  checkedAt: brand.rating.checkedAt,
};
