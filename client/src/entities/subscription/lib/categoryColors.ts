export const categoryColors: Record<string, string> = {
  Нейросети: '#a78bfa',
  Развлечения: '#ff5c00',
  Музыка: '#1db954',
  Игры: '#3a9bf0',
  Облако: '#ffd34d',
  'Работа и учёба': '#fa2d48',
  'Спорт и здоровье': '#00c4cc',
  Другое: '#6b6b85',
  Остальное: '#4a4763',
}

export const fallbackColors = ['#a78bfa', '#3a9bf0', '#1db954', '#ff7a00', '#6b6b85']

export function getCategoryColor(name: string, index: number): string {
  return categoryColors[name] || fallbackColors[index % fallbackColors.length]
}
