export const machines = [
  {
    slot: 'main machine',
    name: 'Desktop PC',
    tagline: 'Ryzen 5 · Radeon',
    icon: 'cpu',
    badge: 'AMD',
    specs: [
      { label: 'cpu', icon: 'cpu', value: 'Ryzen 5 7600X' },
      { label: 'gpu', icon: 'gpu', value: 'Radeon RX 6750 XT' },
      { label: 'memory', icon: 'memory', value: '32GB DDR5' },
      { label: 'storage', icon: 'drive', value: '1TB' },
    ],
  },
  {
    slot: 'second machine',
    name: 'Mac mini',
    tagline: 'macOS 26.4',
    icon: 'apple',
    badge: 'Apple',
    href: 'https://www.apple.com/mac-mini/',
    specs: [
      { label: 'chip', icon: 'cpu', value: 'M4 Pro' },
      { label: 'cores', icon: 'layers', value: '14' },
      { label: 'memory', icon: 'memory', value: '64GB' },
      { label: 'storage', icon: 'drive', value: '8TB' },
    ],
  },
];

export const desk = [
  { name: '32G2WG8', brand: 'AOC', detail: '32 inch, 1080p, 240Hz', icon: 'monitor' },
  { name: 'Ornata V3 X', brand: 'Razer', detail: 'membrane, low profile', icon: 'keyboard' },
  { name: 'Basilisk V3', brand: 'Razer', detail: '26K dpi, 11 buttons', icon: 'mouse' },
  { name: 'Kraken V3', brand: 'Razer', detail: 'wired, 7.1 surround', icon: 'headphones' },
  { name: 'Yeti GX', brand: 'Logitech', detail: 'dynamic, RGB', icon: 'mic' },
  { name: 'AirPods Pro', brand: 'Apple', detail: 'wireless, daily', icon: 'headphones' },
];

export const software = [
  { name: 'VS Code Insiders', role: 'editor', icon: 'vscode' },
  { name: 'Warp', role: 'terminal', icon: 'warp' },
  { name: 'Brave Nightly', role: 'browser', icon: 'brave' },
  { name: 'Termius', role: 'ssh', icon: 'termius' },
  { name: 'DBeaver', role: 'databases', icon: 'dbeaver' },
  { name: 'OBS', role: 'capture', icon: 'obs' },
  { name: 'Mullvad', role: 'vpn', icon: 'mullvad' },
  { name: 'Discord', role: 'chat', icon: 'discord' },
  { name: 'AyuGram', role: 'telegram client', icon: 'telegram' },
  { name: 'Spotify', role: 'music', icon: 'spotify' },
];

export const tools = [
  { name: 'Bun', version: '1.3', icon: 'bun' },
  { name: 'Node', version: '25.9', icon: 'nodejs' },
  { name: 'TypeScript', version: 'strict', icon: 'typescript' },
  { name: 'Python', version: '3.14', icon: 'python' },
  { name: 'Java', version: 'temurin 21', icon: 'java' },
  { name: 'zsh', version: 'shell', icon: 'zsh' },
  { name: 'Git', version: '2.50', icon: 'git' },
  { name: 'Homebrew', version: 'packages', icon: 'homebrew' },
];
