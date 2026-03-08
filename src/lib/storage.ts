import { Motor1Entry, Motor2Entry, InsumoEntry, ReceitaServico, Orcamento } from './types';
import { seedMotor1, seedMotor2, seedInsumos, seedReceitas } from './seedData';

function getOrSeed<T>(key: string, seed: T[]): T[] {
  const stored = localStorage.getItem(key);
  if (stored) return JSON.parse(stored);
  localStorage.setItem(key, JSON.stringify(seed));
  return seed;
}

function save<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

const KEYS = {
  motor1: 'orcacalhas_motor1',
  motor2: 'orcacalhas_motor2',
  insumos: 'orcacalhas_insumos',
  receitas: 'orcacalhas_receitas',
  orcamentos: 'orcacalhas_orcamentos',
};

export const storage = {
  getMotor1: (): Motor1Entry[] => getOrSeed(KEYS.motor1, seedMotor1),
  setMotor1: (d: Motor1Entry[]) => save(KEYS.motor1, d),

  getMotor2: (): Motor2Entry[] => getOrSeed(KEYS.motor2, seedMotor2),
  setMotor2: (d: Motor2Entry[]) => save(KEYS.motor2, d),

  getInsumos: (): InsumoEntry[] => getOrSeed(KEYS.insumos, seedInsumos),
  setInsumos: (d: InsumoEntry[]) => save(KEYS.insumos, d),

  getReceitas: (): ReceitaServico[] => getOrSeed(KEYS.receitas, seedReceitas),
  setReceitas: (d: ReceitaServico[]) => save(KEYS.receitas, d),

  getOrcamentos: (): Orcamento[] => {
    const stored = localStorage.getItem(KEYS.orcamentos);
    return stored ? JSON.parse(stored) : [];
  },
  addOrcamento: (o: Orcamento) => {
    const list = storage.getOrcamentos();
    list.unshift(o);
    save(KEYS.orcamentos, list);
  },
  deleteOrcamento: (id: string) => {
    const list = storage.getOrcamentos().filter(o => o.id !== id);
    save(KEYS.orcamentos, list);
  },
};
