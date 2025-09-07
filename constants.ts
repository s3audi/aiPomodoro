
import type { Worker } from './types';

export const INITIAL_WORKERS: Worker[] = [
  { id: 'w1', name: 'Ahmet Yılmaz', avatar: 'https://cebi.com.tr/foto/1.png', company: 'SEMTA', position: 'Şef' },
  { id: 'w2', name: 'Mehmet Öztürk', avatar: 'https://cebi.com.tr/foto/2.png', company: 'SEMTA', position: 'Usta' },
  { id: 'w3', name: 'Hasan Kaya', avatar: 'https://cebi.com.tr/foto/3.png', company: 'YAPI MERKEZİ', position: 'Şef' },
  { id: 'w4', name: 'İsmail Demir', avatar: 'https://cebi.com.tr/foto/4.png', company: 'YAPI MERKEZİ', position: 'Yardımcı' },
  { id: 'w5', name: 'Ayşe Çelik', avatar: 'https://cebi.com.tr/foto/5.png', company: 'SEMTA', position: 'Usta' },
  { id: 'w6', name: 'Fatma Şahin', avatar: 'https://cebi.com.tr/foto/6.png', position: 'Yardımcı' },
];

export const POMODORO_DURATION_SECONDS = 25 * 60;
export const BREAK_DURATION_SECONDS = 5 * 60;