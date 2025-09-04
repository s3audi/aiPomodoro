
import type { Worker } from './types';

export const INITIAL_WORKERS: Worker[] = [
  { id: 'w1', name: 'Ahmet Yılmaz', avatar: 'https://i.pravatar.cc/150?u=ahmet' },
  { id: 'w2', name: 'Mehmet Öztürk', avatar: 'https://i.pravatar.cc/150?u=mehmet' },
  { id: 'w3', name: 'Hasan Kaya', avatar: 'https://i.pravatar.cc/150?u=hasan' },
  { id: 'w4', name: 'İsmail Demir', avatar: 'https://i.pravatar.cc/150?u=ismail' },
  { id: 'w5', name: 'Ayşe Çelik', avatar: 'https://i.pravatar.cc/150?u=ayse' },
  { id: 'w6', name: 'Fatma Şahin', avatar: 'https://i.pravatar.cc/150?u=fatma' },
];

export const POMODORO_DURATION_SECONDS = 25 * 60;
export const BREAK_DURATION_SECONDS = 5 * 60;