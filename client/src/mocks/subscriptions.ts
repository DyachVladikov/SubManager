export interface Subscription {
  id: string
  name: string
  price: number
  color: string
  letter: string
  icon?: string
  category: string
  nextDate: string
  daysLeft: string
  history: string[]
  split?: Array<{ name: string; username: string; amount: number; paid: boolean }>
  dark?: boolean
}

export const subscriptions: Subscription[] = [
  {
    id: 'netflix',
    name: 'Netflix',
    price: 799,
    color: '#e50914',
    letter: 'N',
    icon: 'netflix',
    category: 'Видео',
    nextDate: '28 июля',
    daysLeft: 'через 4 дня',
    history: ['28 июня', '28 мая', '28 апреля'],
    split: [
      { name: 'Костя', username: '@kostya', amount: 266, paid: false },
      { name: 'Егор', username: '@egor', amount: 266, paid: true },
    ],
  },
  {
    id: 'yandex',
    name: 'Яндекс Плюс',
    price: 399,
    color: '#ffd34d',
    letter: 'Я',
    category: 'Другое',
    nextDate: '25 июля',
    daysLeft: 'завтра',
    history: ['25 июня', '25 мая', '25 апреля'],
    dark: true,
  },
  {
    id: 'gpt',
    name: 'ChatGPT Plus',
    price: 1990,
    color: '#10a37f',
    letter: 'C',
    icon: 'openai',
    category: 'Нейросети',
    nextDate: '1 авг',
    daysLeft: 'через 8 дн',
    history: ['1 июля', '1 июня', '1 мая'],
  },
  {
    id: 'spotify',
    name: 'Spotify Family',
    price: 269,
    color: '#1db954',
    letter: 'S',
    icon: 'spotify',
    category: 'Музыка',
    nextDate: '3 авг',
    daysLeft: 'через 10 дн',
    history: ['3 июля', '3 июня', '3 мая'],
    split: [
      { name: 'Даня', username: '@danya', amount: 90, paid: false },
      { name: 'Миша', username: '@misha', amount: 90, paid: true },
      { name: 'Лера', username: '@lera', amount: 89, paid: true },
    ],
  },
  {
    id: 'icloud',
    name: 'iCloud+',
    price: 149,
    color: '#3a9bf0',
    letter: 'i',
    icon: 'icloud',
    category: 'Облако',
    nextDate: '10 авг',
    daysLeft: 'через 17 дн',
    history: ['10 июля', '10 июня', '10 мая'],
  },
  {
    id: 'youtube',
    name: 'YouTube Premium',
    price: 299,
    color: '#ff0033',
    letter: 'Y',
    icon: 'youtube',
    category: 'Видео',
    nextDate: '15 авг',
    daysLeft: 'через 22 дн',
    history: ['15 июля', '15 июня', '15 мая'],
  },
  {
    id: 'kion',
    name: 'Kion',
    price: 199,
    color: '#ff5a3c',
    letter: 'K',
    category: 'Видео',
    nextDate: '20 авг',
    daysLeft: 'через 27 дн',
    history: ['20 июля', '20 июня', '20 мая'],
  },
]

export const categories = [
  { name: 'Нейросети', amount: 1990, percent: '48%' },
  { name: 'Видео', amount: 1297, percent: '32%' },
  { name: 'Другое', amount: 399, percent: '10%' },
  { name: 'Музыка', amount: 269, percent: '7%' },
  { name: 'Облако', amount: 149, percent: '4%' },
]

export const monthlyData = [2114, 2114, 2313, 2313, 2114, 3660, 4104]
export const yearlyData = [2114, 2114, 2313, 2313, 2114, 3660, 4104, 4104, 4104, 4104, 4104, 4104]
export const monthLetters = ['Я', 'Ф', 'М', 'А', 'М', 'И', 'И']
export const monthNames = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл']
export const yearLetters = ['Я', 'Ф', 'М', 'А', 'М', 'И', 'И', 'А', 'С', 'О', 'Н', 'Д']
export const yearNames = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек']

export const heroData = {
  month: {
    value: 4104,
    delta: '+12% к июню',
    services: '7 активных сервисов',
    label: 'Расходы · Июль',
    paid: 'Списано в июле',
    paidValue: '2 906 ₽',
    remaining: 'Осталось',
    remainingValue: '1 198 ₽',
    progress: 71,
  },
  year: {
    value: 49248,
    delta: '+9% к 2025',
    services: 'в среднем 4 104 ₽ / мес',
    label: 'Расходы · 2026',
    paid: 'Списано в 2026',
    paidValue: '18 732 ₽',
    remaining: 'До конца года',
    remainingValue: '30 516 ₽',
    progress: 38,
  },
}
