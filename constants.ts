
import type { Worker } from './types';

export const INITIAL_WORKERS: Worker[] = [
  { id: 'w1', name: 'Ahmet Yılmaz', avatar: 'https://cebi.com.tr/foto/1.png' },
  { id: 'w2', name: 'Mehmet Öztürk', avatar: 'https://cebi.com.tr/foto/2.png' },
  { id: 'w3', name: 'Hasan Kaya', avatar: 'https://cebi.com.tr/foto/3.png' },
  { id: 'w4', name: 'İsmail Demir', avatar: 'https://cebi.com.tr/foto/4.png' },
  { id: 'w5', name: 'Ayşe Çelik', avatar: 'https://cebi.com.tr/foto/5.png' },
  { id: 'w6', name: 'Fatma Şahin', avatar: 'https://cebi.com.tr/foto/6.png' },
];

export const POMODORO_DURATION_SECONDS = 25 * 60;
export const BREAK_DURATION_SECONDS = 5 * 60;