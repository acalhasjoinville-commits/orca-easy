import { Motor1Entry, Motor2Entry, InsumoEntry, RegraCalculo, ServicoTemplate, Orcamento } from './types';
import { seedMotor1, seedMotor2, seedInsumos, seedRegras, seedServicos } from './seedData';

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
  regras: 'orcacalhas_regras',
  servicos: 'orcacalhas_servicos',
  orcamentos: 'orcacalhas_orcamentos',
};

export const storage = {
  getMotor1: (): Motor1Entry[] => getOrSeed(KEYS.motor1, seedMotor1),
  setMotor1: (d: Motor1Entry[]) => save(KEYS.motor1, d),

  getMotor2: (): Motor2Entry[] => getOrSeed(KEYS.motor2, seedMotor2),
  setMotor2: (d: Motor2Entry[]) => save(KEYS.motor2, d),

  getInsumos: (): InsumoEntry[] => getOrSeed(KEYS.insumos, seedInsumos),
  setInsumos: (d: InsumoEntry[]) => save(KEYS.insumos, d),

  getRegras: (): RegraCalculo[] => getOrSeed(KEYS.regras, seedRegras),
  setRegras: (d: RegraCalculo[]) => save(KEYS.regras, d),

  getServicos: (): ServicoTemplate[] => getOrSeed(KEYS.servicos, seedServicos),
  setServicos: (d: ServicoTemplate[]) => save(KEYS.servicos, d),

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
