export const avatarGradients: [string, string][] = [
  ['#8c6df6', '#6947e6'],
  ['#f6a76d', '#e65f47'],
  ['#6dc8f6', '#478ce6'],
  ['#f66da7', '#e6478c'],
  ['#8fe3b0', '#47b06d'],
]

export function gradientForName(name: string): [string, string] {
  return avatarGradients[name.charCodeAt(0) % avatarGradients.length]
}
