// CPU Options - Covering minimum system requirements (Quad-core Intel/AMD, 3.2 GHz+) through current gen

// Intel CPUs - 8th gen through 14th gen
const intelCPUs = [
  // 14th Gen (Raptor Lake Refresh)
  'Intel Core i9-14900K', 'Intel Core i9-14900KF', 'Intel Core i9-14900', 'Intel Core i9-14900F',
  'Intel Core i7-14700K', 'Intel Core i7-14700KF', 'Intel Core i7-14700', 'Intel Core i7-14700F',
  'Intel Core i5-14600K', 'Intel Core i5-14600KF', 'Intel Core i5-14600', 'Intel Core i5-14600F',
  'Intel Core i5-14400', 'Intel Core i5-14400F',
  'Intel Core i3-14100', 'Intel Core i3-14100F',
  
  // 13th Gen (Raptor Lake)
  'Intel Core i9-13900K', 'Intel Core i9-13900KF', 'Intel Core i9-13900', 'Intel Core i9-13900F',
  'Intel Core i7-13700K', 'Intel Core i7-13700KF', 'Intel Core i7-13700', 'Intel Core i7-13700F',
  'Intel Core i5-13600K', 'Intel Core i5-13600KF', 'Intel Core i5-13600', 'Intel Core i5-13600F',
  'Intel Core i5-13500', 'Intel Core i5-13500F', 'Intel Core i5-13400', 'Intel Core i5-13400F',
  'Intel Core i3-13100', 'Intel Core i3-13100F',
  
  // 12th Gen (Alder Lake)
  'Intel Core i9-12900K', 'Intel Core i9-12900KF', 'Intel Core i9-12900', 'Intel Core i9-12900F',
  'Intel Core i7-12700K', 'Intel Core i7-12700KF', 'Intel Core i7-12700', 'Intel Core i7-12700F',
  'Intel Core i5-12600K', 'Intel Core i5-12600KF', 'Intel Core i5-12600', 'Intel Core i5-12600F',
  'Intel Core i5-12500', 'Intel Core i5-12500F', 'Intel Core i5-12400', 'Intel Core i5-12400F',
  'Intel Core i3-12300', 'Intel Core i3-12300F', 'Intel Core i3-12100', 'Intel Core i3-12100F',
  
  // 11th Gen (Rocket Lake)
  'Intel Core i9-11900K', 'Intel Core i9-11900KF', 'Intel Core i9-11900', 'Intel Core i9-11900F',
  'Intel Core i7-11700K', 'Intel Core i7-11700KF', 'Intel Core i7-11700', 'Intel Core i7-11700F',
  'Intel Core i5-11600K', 'Intel Core i5-11600KF', 'Intel Core i5-11600', 'Intel Core i5-11600F',
  'Intel Core i5-11500', 'Intel Core i5-11400', 'Intel Core i5-11400F',
  'Intel Core i3-11100', 'Intel Core i3-11100F',
  
  // 10th Gen (Comet Lake)
  'Intel Core i9-10900K', 'Intel Core i9-10900KF', 'Intel Core i9-10900', 'Intel Core i9-10900F',
  'Intel Core i7-10700K', 'Intel Core i7-10700KF', 'Intel Core i7-10700', 'Intel Core i7-10700F',
  'Intel Core i5-10600K', 'Intel Core i5-10600KF', 'Intel Core i5-10600', 'Intel Core i5-10600F',
  'Intel Core i5-10500', 'Intel Core i5-10400', 'Intel Core i5-10400F',
  'Intel Core i3-10300', 'Intel Core i3-10300F', 'Intel Core i3-10100', 'Intel Core i3-10100F',
  
  // 9th Gen (Coffee Lake Refresh)
  'Intel Core i9-9900K', 'Intel Core i9-9900KF', 'Intel Core i9-9900', 'Intel Core i9-9900F',
  'Intel Core i7-9700K', 'Intel Core i7-9700KF', 'Intel Core i7-9700', 'Intel Core i7-9700F',
  'Intel Core i5-9600K', 'Intel Core i5-9600KF', 'Intel Core i5-9600', 'Intel Core i5-9600F',
  'Intel Core i5-9500', 'Intel Core i5-9400', 'Intel Core i5-9400F',
  'Intel Core i3-9350K', 'Intel Core i3-9300', 'Intel Core i3-9100',
  
  // 8th Gen (Coffee Lake)
  'Intel Core i7-8700K', 'Intel Core i7-8700', 'Intel Core i7-8700T',
  'Intel Core i5-8600K', 'Intel Core i5-8600', 'Intel Core i5-8500', 'Intel Core i5-8400',
  'Intel Core i3-8350K', 'Intel Core i3-8300', 'Intel Core i3-8100',
]

// AMD CPUs - Ryzen 1000 through 7000 series
const amdCPUs = [
  // Ryzen 7000 series (Zen 4)
  'AMD Ryzen 9 7950X', 'AMD Ryzen 9 7950X3D', 'AMD Ryzen 9 7900X', 'AMD Ryzen 9 7900X3D',
  'AMD Ryzen 7 7800X3D', 'AMD Ryzen 7 7700X', 'AMD Ryzen 7 7700',
  'AMD Ryzen 5 7600X', 'AMD Ryzen 5 7600', 'AMD Ryzen 5 7500F',
  'AMD Ryzen 3 7300X',
  
  // Ryzen 5000 series (Zen 3)
  'AMD Ryzen 9 5950X', 'AMD Ryzen 9 5900X', 'AMD Ryzen 9 5900', 'AMD Ryzen 9 5800X3D',
  'AMD Ryzen 7 5800X', 'AMD Ryzen 7 5800', 'AMD Ryzen 7 5700X', 'AMD Ryzen 7 5700G',
  'AMD Ryzen 5 5600X', 'AMD Ryzen 5 5600', 'AMD Ryzen 5 5600G', 'AMD Ryzen 5 5500',
  'AMD Ryzen 3 5300G',
  
  // Ryzen 3000 series (Zen 2)
  'AMD Ryzen 9 3950X', 'AMD Ryzen 9 3900X', 'AMD Ryzen 9 3900',
  'AMD Ryzen 7 3800X', 'AMD Ryzen 7 3800', 'AMD Ryzen 7 3700X', 'AMD Ryzen 7 3700',
  'AMD Ryzen 5 3600X', 'AMD Ryzen 5 3600', 'AMD Ryzen 5 3600XT', 'AMD Ryzen 5 3500X',
  'AMD Ryzen 3 3300X', 'AMD Ryzen 3 3100',
  
  // Ryzen 2000 series (Zen+)
  'AMD Ryzen 7 2700X', 'AMD Ryzen 7 2700', 'AMD Ryzen 7 2700E',
  'AMD Ryzen 5 2600X', 'AMD Ryzen 5 2600', 'AMD Ryzen 5 2600E',
  'AMD Ryzen 3 2300X',
  
  // Ryzen 1000 series (Zen)
  'AMD Ryzen 7 1800X', 'AMD Ryzen 7 1700X', 'AMD Ryzen 7 1700',
  'AMD Ryzen 5 1600X', 'AMD Ryzen 5 1600', 'AMD Ryzen 5 1500X',
  'AMD Ryzen 3 1300X', 'AMD Ryzen 3 1200',
]

export const CPU_OPTIONS = [...intelCPUs, ...amdCPUs, 'Other'].sort()

// GPU Options - Covering minimum system requirements (GTX 1070 / RX 5700) through current gen

// NVIDIA GPUs
const nvidiaGPUs = [
  // RTX 40 series
  'NVIDIA GeForce RTX 4090', 'NVIDIA GeForce RTX 4080', 'NVIDIA GeForce RTX 4070 Ti', 'NVIDIA GeForce RTX 4070',
  'NVIDIA GeForce RTX 4060 Ti', 'NVIDIA GeForce RTX 4060',
  
  // RTX 30 series
  'NVIDIA GeForce RTX 3090 Ti', 'NVIDIA GeForce RTX 3090', 'NVIDIA GeForce RTX 3080 Ti', 'NVIDIA GeForce RTX 3080',
  'NVIDIA GeForce RTX 3070 Ti', 'NVIDIA GeForce RTX 3070', 'NVIDIA GeForce RTX 3060 Ti', 'NVIDIA GeForce RTX 3060',
  'NVIDIA GeForce RTX 3050',
  
  // RTX 20 series (includes RTX 2070 recommended)
  'NVIDIA GeForce RTX 2080 Ti', 'NVIDIA GeForce RTX 2080 Super', 'NVIDIA GeForce RTX 2080',
  'NVIDIA GeForce RTX 2070 Super', 'NVIDIA GeForce RTX 2070',
  'NVIDIA GeForce RTX 2060 Super', 'NVIDIA GeForce RTX 2060',
  
  // GTX 16 series
  'NVIDIA GeForce GTX 1660 Ti', 'NVIDIA GeForce GTX 1660 Super', 'NVIDIA GeForce GTX 1660',
  'NVIDIA GeForce GTX 1650 Super', 'NVIDIA GeForce GTX 1650',
  
  // GTX 10 series (includes GTX 1070 minimum requirement)
  'NVIDIA GeForce GTX 1080 Ti', 'NVIDIA GeForce GTX 1080', 'NVIDIA GeForce GTX 1070 Ti', 'NVIDIA GeForce GTX 1070',
  'NVIDIA GeForce GTX 1060', 'NVIDIA GeForce GTX 1050 Ti', 'NVIDIA GeForce GTX 1050',
]

// AMD GPUs
const amdGPUs = [
  // RX 7000 series
  'AMD Radeon RX 7900 XTX', 'AMD Radeon RX 7900 XT', 'AMD Radeon RX 7800 XT', 'AMD Radeon RX 7700 XT',
  'AMD Radeon RX 7600',
  
  // RX 6000 series (includes RX 6700 XT recommended)
  'AMD Radeon RX 6950 XT', 'AMD Radeon RX 6900 XT', 'AMD Radeon RX 6800 XT', 'AMD Radeon RX 6800',
  'AMD Radeon RX 6750 XT', 'AMD Radeon RX 6700 XT', 'AMD Radeon RX 6700',
  'AMD Radeon RX 6650 XT', 'AMD Radeon RX 6600 XT', 'AMD Radeon RX 6600',
  'AMD Radeon RX 6500 XT',
  
  // RX 5000 series (includes RX 5700 minimum requirement)
  'AMD Radeon RX 5700 XT', 'AMD Radeon RX 5700',
  'AMD Radeon RX 5600 XT', 'AMD Radeon RX 5600',
  'AMD Radeon RX 5500 XT',
  
  // RX 500 series
  'AMD Radeon RX 590', 'AMD Radeon RX 580', 'AMD Radeon RX 570', 'AMD Radeon RX 560', 'AMD Radeon RX 550',
  
  // RX 400 series
  'AMD Radeon RX 480', 'AMD Radeon RX 470', 'AMD Radeon RX 460',
]

export const GPU_OPTIONS = [...nvidiaGPUs, ...amdGPUs, 'Other'].sort()

// RAM Options - Covering minimum (16GB) and recommended (32GB) system requirements
export const RAM_OPTIONS = [
  { value: '4GB', label: '4GB' },
  { value: '8GB', label: '8GB' },
  { value: '16GB', label: '16GB (Minimum)' },
  { value: '32GB', label: '32GB (Recommended)' },
  { value: '64GB', label: '64GB' },
  { value: '128GB', label: '128GB' },
  { value: 'Other', label: 'Other' },
]

// Storage Options
export const STORAGE_OPTIONS = [
  { value: 'NVMe SSD', label: 'NVMe SSD' },
  { value: 'SATA SSD', label: 'SATA SSD' },
  { value: 'Hard Drive (HDD)', label: 'Hard Drive (HDD)' },
  { value: 'Other', label: 'Other' },
]

