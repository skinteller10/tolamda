export type City = 'hanoi' | 'hcm' | 'hue' | 'danang' | 'dalat';

export interface Rating {
  label: string;
  bc: string;
}

export interface Restaurant {
  id: string;
  name: string;
  city: City;
  rating: number;
  address: string;
  info: string;
  open: string;
  close: string;
  img: string;
  imgPath?: string;
  createdAt?: any;
  createdBy?: string;
  updatedAt?: any;
  updatedBy?: string;
}

export const CITIES: Record<City, string> = {
  hanoi: 'Hà Nội',
  hcm: 'Hồ Chí Minh',
  hue: 'Huế',
  danang: 'Đà Nẵng',
  dalat: 'Đà Lạt',
};

export const DEFAULT_RATINGS: Rating[] = [
  { label: 'Rất ngon', bc: 'bg-[#EAF7ED] text-[#4b8a5d] border-[#C8E8D2]' },
  { label: 'Cũng ngon', bc: 'bg-[#f0faee] text-[#5e9e62] border-[#cae6c3]' },
  { label: 'Ăn tạm được', bc: 'bg-[#fff5ea] text-[#916b41] border-[#fce3c7]' },
  { label: 'Không quay lại', bc: 'bg-[#fff2f3] text-[#b8626e] border-[#fcd7db]' },
];
