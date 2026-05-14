export type City = string;

export interface Rating {
  label: string;
  bc: string;
}

export interface Restaurant {
  id: string;
  name: string;
  city: City;
  category?: 'to-an' | 'to-chup' | 'to-du-lich';
  type?: string;
  form?: string;
  rating: number;
  address: string;
  open: string;
  close: string;
  open2?: string;
  close2?: string;
  branch2Address?: string;
  branch2Open?: string;
  branch2Close?: string;
  branch2Open2?: string;
  branch2Close2?: string;
  info: string;
  img: string;
  images?: string[];
  imageTypes?: string[]; // New: Type for each image in gallery
  imgPath?: string;
  imagesPaths?: string[];
  createdAt?: any;
  createdBy?: string;
  updatedAt?: any;
  updatedBy?: string;
}

export const DEFAULT_CITIES = [
  { id: 'hanoi', label: 'Hà Nội' },
  { id: 'hcm', label: 'Hồ Chí Minh' },
  { id: 'hue', label: 'Huế' },
  { id: 'danang', label: 'Đà Nẵng' },
  { id: 'dalat', label: 'Đà Lạt' }
];

export const DEFAULT_CITIES_DULICH = [
  { id: 'thailand', label: 'Thái Lan' },
  { id: 'dalat_dl', label: 'Đà Lạt' },
  { id: 'saigon_dl', label: 'Sài Gòn' }
];

export const GALLERY_TYPES = [
  { id: 'máy film', label: 'Máy film' },
  { id: 'máy số', label: 'Máy số' },
  { id: 'điện thoại', label: 'Điện thoại' }
];

export const DEFAULT_TYPES = [
  { id: 'cafe', label: 'Cafe' },
  { id: 'food', label: 'Quán ăn' }
];

export const DEFAULT_FORMS = [
  { id: 'online', label: 'Online' },
  { id: 'offline', label: 'Offline' }
];

export const DEFAULT_RATINGS: Rating[] = [
  { label: 'Rất ngon', bc: 'bg-[#EAF7ED] text-[#4b8a5d] border-[#C8E8D2]' },
  { label: 'Cũng ngon', bc: 'bg-[#f0faee] text-[#5e9e62] border-[#cae6c3]' },
  { label: 'Ăn tạm được', bc: 'bg-[#fff5ea] text-[#916b41] border-[#fce3c7]' },
  { label: 'Không quay lại', bc: 'bg-[#fff2f3] text-[#b8626e] border-[#fcd7db]' },
];
