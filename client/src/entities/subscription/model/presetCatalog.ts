export interface ServicePreset {
  name: string;
  color: string;
  price?: number;
}

export interface PresetCategory {
  name: string;
  services: ServicePreset[];
}

export const presetCatalog: PresetCategory[] = [
  {
    name: "Нейросети",
    services: [
      { name: "ChatGPT Plus", color: "#10a37f", price: 1990 },
      { name: "Claude Pro", color: "#d97757", price: 1990 },
      { name: "Gemini Advanced", color: "#4285f4", price: 1899 },
      { name: "Grok Premium", color: "#555c66", price: 1900 },
      { name: "Midjourney", color: "#8f76f2", price: 990 },
      { name: "Kandinsky", color: "#7c5cf0", price: 550 },
      { name: "Kimi", color: "#4e6ef2" },
    ],
  },
  {
    name: "Развлечения",
    services: [
      { name: "Кинопоиск", color: "#ff5c00", price: 399 },
      { name: "Яндекс Плюс", color: "#fc3f1d", price: 399 },
      { name: "Netflix", color: "#e50914", price: 799 },
      { name: "YouTube Premium", color: "#ff0000", price: 299 },
      { name: "IVI", color: "#ea0029", price: 399 },
      { name: "Okko", color: "#a78bfa", price: 399 },
      { name: "START", color: "#7b2ff2", price: 299 },
      { name: "Wink", color: "#ff3b3b", price: 349 },
      { name: "Premier", color: "#00b3e3", price: 299 },
    ],
  },
  {
    name: "Музыка",
    services: [
      { name: "Spotify", color: "#1db954", price: 269 },
      { name: "Яндекс Музыка", color: "#f9d423", price: 299 },
      { name: "Apple Music", color: "#fa2d48", price: 169 },
      { name: "VK Музыка", color: "#0077ff", price: 199 },
      { name: "YouTube Music", color: "#ff0000", price: 249 },
      { name: "Deezer", color: "#a238ff", price: 199 },
      { name: "SoundCloud Go", color: "#ff5500", price: 399 },
    ],
  },
  {
    name: "Игры",
    services: [
      { name: "PlayStation Plus", color: "#0070d1", price: 749 },
      { name: "Xbox Game Pass", color: "#107c10", price: 699 },
      { name: "Nintendo Switch Online", color: "#e60012", price: 299 },
      { name: "EA Play", color: "#ff4747", price: 349 },
    ],
  },
  {
    name: "Облако",
    services: [
      { name: "iCloud+", color: "#3a9bf0", price: 149 },
      { name: "Google One", color: "#4285f4", price: 139 },
      { name: "Яндекс Диск", color: "#fc3f1d", price: 169 },
      { name: "Dropbox", color: "#0061ff", price: 999 },
      { name: "MEGA", color: "#d9272e", price: 499 },
    ],
  },
  {
    name: "Работа и учёба",
    services: [
      { name: "Notion Plus", color: "#9b9b9b", price: 800 },
      { name: "Figma Professional", color: "#a259ff", price: 1200 },
      { name: "Canva Pro", color: "#00c4cc", price: 750 },
      { name: "Adobe CC", color: "#fa0f00", price: 2990 },
      { name: "Microsoft 365", color: "#d83b01", price: 699 },
      { name: "Zoom Pro", color: "#2d8cff", price: 1399 },
      { name: "Skyeng", color: "#5b5bd6", price: 5990 },
    ],
  },
  {
    name: "Спорт и здоровье",
    services: [
      { name: "Фитнес-клуб", color: "#7c5cf0", price: 2500 },
      { name: "DDX Fitness", color: "#8a3ffc", price: 2190 },
      { name: "World Class", color: "#e01e2b", price: 9900 },
      { name: "Sekta", color: "#00c48c", price: 4900 },
      { name: "FitStars", color: "#38b000", price: 250 },
      { name: "Strava", color: "#fc4c02", price: 799 },
    ],
  },
  {
    name: "Связь",
    services: [
      { name: "Т2", color: "#4671eb", price: 550 },
      { name: "Yota", color: "#00c8f5", price: 600 },
      { name: "МегаФон", color: "#00b956", price: 650 },
      { name: "МТС", color: "#e30611", price: 700 },
      { name: "Билайн", color: "#ffd200", price: 600 },
      { name: "Т-Банк Мобайл", color: "#ffdd2d", price: 500 },
      { name: "Ростелеком", color: "#7700ff", price: 800 },
      { name: "Дом.ру", color: "#6f2dff", price: 750 },
    ],
  },
  {
    name: "Другое",
    services: [],
  },
];
