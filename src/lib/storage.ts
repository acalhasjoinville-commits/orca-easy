import { Motor1Entry, Motor2Entry, InsumoEntry, RegraCalculo, ServicoTemplate, Orcamento, Cliente, PoliticaComercial, MinhaEmpresa } from './types';
import { seedMotor1, seedMotor2, seedInsumos, seedRegras, seedServicos, seedPoliticas } from './seedData';

function getOrSeed<T>(key: string, seed: T[], version?: number): T[] {
  const versionKey = key + '_v';
  const currentVersion = version ?? 1;
  const storedVersion = localStorage.getItem(versionKey);
  if (storedVersion && parseInt(storedVersion) >= currentVersion) {
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored);
  }
  localStorage.setItem(key, JSON.stringify(seed));
  localStorage.setItem(versionKey, String(currentVersion));
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
  clientes: 'orcacalhas_clientes',
  politicas: 'orcacalhas_politicas',
};

export const storage = {
  getMotor1: (): Motor1Entry[] => getOrSeed(KEYS.motor1, seedMotor1),
  setMotor1: (d: Motor1Entry[]) => save(KEYS.motor1, d),

  getMotor2: (): Motor2Entry[] => getOrSeed(KEYS.motor2, seedMotor2),
  setMotor2: (d: Motor2Entry[]) => save(KEYS.motor2, d),

  getInsumos: (): InsumoEntry[] => getOrSeed(KEYS.insumos, seedInsumos, 3),
  setInsumos: (d: InsumoEntry[]) => { save(KEYS.insumos, d); localStorage.setItem(KEYS.insumos + '_v', '3'); },

  getRegras: (): RegraCalculo[] => getOrSeed(KEYS.regras, seedRegras, 2),
  setRegras: (d: RegraCalculo[]) => { save(KEYS.regras, d); localStorage.setItem(KEYS.regras + '_v', '2'); },

  getServicos: (): ServicoTemplate[] => getOrSeed(KEYS.servicos, seedServicos),
  setServicos: (d: ServicoTemplate[]) => save(KEYS.servicos, d),

  getPoliticas: (): PoliticaComercial[] => getOrSeed(KEYS.politicas, seedPoliticas, 2),
  setPoliticas: (d: PoliticaComercial[]) => { save(KEYS.politicas, d); localStorage.setItem(KEYS.politicas + '_v', '2'); },

  getMinhaEmpresa: (): MinhaEmpresa | null => {
    const stored = localStorage.getItem('orcacalhas_minha_empresa');
    return stored ? JSON.parse(stored) : null;
  },
  setMinhaEmpresa: (e: MinhaEmpresa) => {
    localStorage.setItem('orcacalhas_minha_empresa', JSON.stringify(e));
  },

  getOrcamentos: (): Orcamento[] => {
    const stored = localStorage.getItem(KEYS.orcamentos);
    return stored ? JSON.parse(stored) : [];
  },
  getNextNumeroOrcamento: (): number => {
    const list = storage.getOrcamentos();
    if (list.length === 0) return 1001;
    const max = Math.max(...list.map(o => o.numeroOrcamento ?? 0));
    return Math.max(max + 1, 1001);
  },
  addOrcamento: (o: Orcamento) => {
    const list = storage.getOrcamentos();
    list.unshift(o);
    save(KEYS.orcamentos, list);
  },
  updateOrcamento: (updated: Orcamento) => {
    const list = storage.getOrcamentos().map(o => o.id === updated.id ? updated : o);
    save(KEYS.orcamentos, list);
  },

  getClientes: (): Cliente[] => {
    const stored = localStorage.getItem(KEYS.clientes);
    return stored ? JSON.parse(stored) : [];
  },
  addCliente: (c: Cliente) => {
    const list = storage.getClientes();
    list.unshift(c);
    save(KEYS.clientes, list);
  },
  updateCliente: (updated: Cliente) => {
    const list = storage.getClientes().map(c => c.id === updated.id ? updated : c);
    save(KEYS.clientes, list);
  },
  deleteCliente: (id: string) => {
    const list = storage.getClientes().filter(c => c.id !== id);
    save(KEYS.clientes, list);
  },
};
