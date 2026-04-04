import { c as createLucideIcon, u as useAuth, s as supabase, a as cn } from "./index-BN5a_yey.js";
import { u as useQueryClient, a as useQuery, b as useMutation } from "./query-vendor-BLvK6anV.js";
import { r as reactExports, j as jsxRuntimeExports } from "./react-vendor-ivNAblfg.js";
import { u as useId, h as Primitive, i as composeRefs, e as Root, f as Portal, O as Overlay, b as Content } from "./radix-vendor-CEzLCFk2.js";
import "./dialog-ScvtRc5R.js";
import { S as Search } from "./search-CUbuJP2V.js";
/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Calculator = createLucideIcon("Calculator", [
  ["rect", { width: "16", height: "20", x: "4", y: "2", rx: "2", key: "1nb95v" }],
  ["line", { x1: "8", x2: "16", y1: "6", y2: "6", key: "x4nwl0" }],
  ["line", { x1: "16", x2: "16", y1: "14", y2: "18", key: "wjye3r" }],
  ["path", { d: "M16 10h.01", key: "1m94wz" }],
  ["path", { d: "M12 10h.01", key: "1nrarc" }],
  ["path", { d: "M8 10h.01", key: "19clt8" }],
  ["path", { d: "M12 14h.01", key: "1etili" }],
  ["path", { d: "M8 14h.01", key: "6423bh" }],
  ["path", { d: "M12 18h.01", key: "mhygvu" }],
  ["path", { d: "M8 18h.01", key: "lrp35t" }]
]);
/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ChevronsUpDown = createLucideIcon("ChevronsUpDown", [
  ["path", { d: "m7 15 5 5 5-5", key: "1hf1tw" }],
  ["path", { d: "m7 9 5-5 5 5", key: "sgt6xg" }]
]);
const MOTOR1_IDS = {
  aluminio: "10000000-0000-0000-0000-000000000001",
  acoGalvanizado: "10000000-0000-0000-0000-000000000002",
  cobre: "10000000-0000-0000-0000-000000000003"
};
const MOTOR2_IDS = {
  alu05_300: "20000000-0000-0000-0000-000000000001",
  alu05_500: "20000000-0000-0000-0000-000000000002",
  alu07_300: "20000000-0000-0000-0000-000000000003",
  aco05_300: "20000000-0000-0000-0000-000000000004",
  aco05_500: "20000000-0000-0000-0000-000000000005"
};
const INSUMO_IDS = {
  tuboPU: "30000000-0000-0000-0000-000000000001",
  rebite306: "30000000-0000-0000-0000-000000000002",
  suporteNormal: "30000000-0000-0000-0000-000000000003"
};
const REGRA_IDS = {
  beiral: "40000000-0000-0000-0000-000000000001",
  rufoPingadeira: "40000000-0000-0000-0000-000000000002",
  rufoEncosto: "40000000-0000-0000-0000-000000000003",
  americana: "40000000-0000-0000-0000-000000000004"
};
const SERVICO_IDS = {
  calhaBeiral: "50000000-0000-0000-0000-000000000001",
  rufoPingadeira: "50000000-0000-0000-0000-000000000002",
  rufoEncosto: "50000000-0000-0000-0000-000000000003",
  calhaAmericana: "50000000-0000-0000-0000-000000000004"
};
const seedMotor1 = [
  { id: MOTOR1_IDS.aluminio, material: "Alumínio", densidade: 2.7, precoQuilo: 37.5 },
  { id: MOTOR1_IDS.acoGalvanizado, material: "Aço Galvanizado", densidade: 7.85, precoQuilo: 12 },
  { id: MOTOR1_IDS.cobre, material: "Cobre", densidade: 8.96, precoQuilo: 85 }
];
const seedMotor2 = [
  { id: MOTOR2_IDS.alu05_300, material: "Alumínio", espessura: 0.5, corte: 300, precoMetroLinear: 22.87 },
  { id: MOTOR2_IDS.alu05_500, material: "Alumínio", espessura: 0.5, corte: 500, precoMetroLinear: 38.12 },
  { id: MOTOR2_IDS.alu07_300, material: "Alumínio", espessura: 0.7, corte: 300, precoMetroLinear: 31.5 },
  { id: MOTOR2_IDS.aco05_300, material: "Aço Galvanizado", espessura: 0.5, corte: 300, precoMetroLinear: 15.4 },
  { id: MOTOR2_IDS.aco05_500, material: "Aço Galvanizado", espessura: 0.5, corte: 500, precoMetroLinear: 25.6 }
];
const seedInsumos = [
  { id: INSUMO_IDS.tuboPU, nomeEmbalagemCompra: "Tubo PU 930g", nomeUnidadeConsumo: "Tubo de PU", precoEmbalagem: 29, qtdEmbalagem: 1 },
  { id: INSUMO_IDS.rebite306, nomeEmbalagemCompra: "Caixa Rebite 306 c/ 1000", nomeUnidadeConsumo: "Rebite 306 un.", precoEmbalagem: 45, qtdEmbalagem: 1e3 },
  { id: INSUMO_IDS.suporteNormal, nomeEmbalagemCompra: "Suporte Normal un.", nomeUnidadeConsumo: "Suporte Normal", precoEmbalagem: 4.5, qtdEmbalagem: 1 }
];
const seedRegras = [
  {
    id: REGRA_IDS.beiral,
    nomeRegra: "Beiral",
    itensRegra: [
      { id: "r1i1", insumoId: INSUMO_IDS.suporteNormal, metodoCalculo: "dividir", fator: 0.6 },
      { id: "r1i2", insumoId: INSUMO_IDS.tuboPU, metodoCalculo: "dividir", fator: 30 },
      { id: "r1i3", insumoId: INSUMO_IDS.rebite306, metodoCalculo: "multiplicar", fator: 8 }
    ]
  },
  {
    id: REGRA_IDS.rufoPingadeira,
    nomeRegra: "Rufo Pingadeira",
    itensRegra: [
      { id: "r2i1", insumoId: INSUMO_IDS.tuboPU, metodoCalculo: "dividir", fator: 30 },
      { id: "r2i2", insumoId: INSUMO_IDS.rebite306, metodoCalculo: "multiplicar", fator: 6 }
    ]
  },
  {
    id: REGRA_IDS.rufoEncosto,
    nomeRegra: "Rufo Encosto",
    itensRegra: [
      { id: "r3i1", insumoId: INSUMO_IDS.tuboPU, metodoCalculo: "dividir", fator: 25 },
      { id: "r3i2", insumoId: INSUMO_IDS.rebite306, metodoCalculo: "multiplicar", fator: 10 }
    ]
  },
  {
    id: REGRA_IDS.americana,
    nomeRegra: "Americana",
    itensRegra: [
      { id: "r4i1", insumoId: INSUMO_IDS.suporteNormal, metodoCalculo: "dividir", fator: 0.5 },
      { id: "r4i2", insumoId: INSUMO_IDS.tuboPU, metodoCalculo: "dividir", fator: 25 },
      { id: "r4i3", insumoId: INSUMO_IDS.rebite306, metodoCalculo: "multiplicar", fator: 10 }
    ]
  }
];
const seedServicos = [
  {
    id: SERVICO_IDS.calhaBeiral,
    nomeServico: "Calha Beiral Alumínio 0.5mm",
    regraId: REGRA_IDS.beiral,
    motorType: "motor1",
    materialPadrao: "Alumínio",
    espessuraPadrao: 0.5,
    cortePadrao: 300,
    dificuldadeFacil: 2.6,
    dificuldadeMedia: 3.5,
    dificuldadeDificil: 4.6
  },
  {
    id: SERVICO_IDS.rufoPingadeira,
    nomeServico: "Rufo Pingadeira Alumínio 0.5mm",
    regraId: REGRA_IDS.rufoPingadeira,
    motorType: "motor1",
    materialPadrao: "Alumínio",
    espessuraPadrao: 0.5,
    cortePadrao: 200,
    dificuldadeFacil: 2.4,
    dificuldadeMedia: 3.2,
    dificuldadeDificil: 4.2
  },
  {
    id: SERVICO_IDS.rufoEncosto,
    nomeServico: "Rufo Encosto Galvanizado 0.5mm",
    regraId: REGRA_IDS.rufoEncosto,
    motorType: "motor2",
    materialPadrao: "Aço Galvanizado",
    espessuraPadrao: 0.5,
    cortePadrao: 300,
    dificuldadeFacil: 2.8,
    dificuldadeMedia: 3.6,
    dificuldadeDificil: 4.8
  },
  {
    id: SERVICO_IDS.calhaAmericana,
    nomeServico: "Calha Americana Alumínio 0.7mm",
    regraId: REGRA_IDS.americana,
    motorType: "motor1",
    materialPadrao: "Alumínio",
    espessuraPadrao: 0.7,
    cortePadrao: 500,
    dificuldadeFacil: 2.8,
    dificuldadeMedia: 3.8,
    dificuldadeDificil: 5
  }
];
const db = supabase;
function dbToMotor1(row) {
  return { id: row.id, material: row.material, densidade: Number(row.densidade), precoQuilo: Number(row.preco_quilo) };
}
function motor1ToDb(e, empresaId) {
  return { id: e.id, material: e.material, densidade: e.densidade, preco_quilo: e.precoQuilo, empresa_id: empresaId };
}
function dbToMotor2(row) {
  return { id: row.id, material: row.material, espessura: Number(row.espessura), corte: Number(row.corte), precoMetroLinear: Number(row.preco_metro_linear) };
}
function motor2ToDb(e, empresaId) {
  return { id: e.id, material: e.material, espessura: e.espessura, corte: e.corte, preco_metro_linear: e.precoMetroLinear, empresa_id: empresaId };
}
function dbToInsumo(row) {
  return { id: row.id, nomeEmbalagemCompra: row.nome_embalagem_compra, nomeUnidadeConsumo: row.nome_unidade_consumo, precoEmbalagem: Number(row.preco_embalagem), qtdEmbalagem: Number(row.qtd_embalagem) };
}
function insumoToDb(e, empresaId) {
  return { id: e.id, nome_embalagem_compra: e.nomeEmbalagemCompra, nome_unidade_consumo: e.nomeUnidadeConsumo, preco_embalagem: e.precoEmbalagem, qtd_embalagem: e.qtdEmbalagem, empresa_id: empresaId };
}
function dbToRegra(row) {
  return { id: row.id, nomeRegra: row.nome_regra, itensRegra: row.itens_regra || [] };
}
function regraToDb(e, empresaId) {
  return { id: e.id, nome_regra: e.nomeRegra, itens_regra: e.itensRegra, empresa_id: empresaId };
}
function dbToServico(row) {
  return {
    id: row.id,
    nomeServico: row.nome_servico,
    regraId: row.regra_id,
    motorType: row.motor_type || "motor1",
    materialPadrao: row.material_padrao,
    espessuraPadrao: Number(row.espessura_padrao),
    cortePadrao: Number(row.corte_padrao),
    dificuldadeFacil: Number(row.dificuldade_facil),
    dificuldadeMedia: Number(row.dificuldade_media),
    dificuldadeDificil: Number(row.dificuldade_dificil)
  };
}
function servicoToDb(e, empresaId) {
  return {
    id: e.id,
    nome_servico: e.nomeServico,
    regra_id: e.regraId,
    motor_type: e.motorType,
    material_padrao: e.materialPadrao,
    espessura_padrao: e.espessuraPadrao,
    corte_padrao: e.cortePadrao,
    dificuldade_facil: e.dificuldadeFacil,
    dificuldade_media: e.dificuldadeMedia,
    dificuldade_dificil: e.dificuldadeDificil,
    empresa_id: empresaId
  };
}
const SEED_CACHE_PREFIX = "orcacalhas_seeded:";
function isSeedCached(table, empresaId) {
  return localStorage.getItem(`${SEED_CACHE_PREFIX}${table}:${empresaId}`) === "1";
}
function markSeedCached(table, empresaId) {
  localStorage.setItem(`${SEED_CACHE_PREFIX}${table}:${empresaId}`, "1");
}
async function seedIfEmpty(table, seedData, mapper, empresaId) {
  if (isSeedCached(table, empresaId)) return;
  const { data: claimed, error: claimErr } = await db.rpc("claim_seed", {
    _empresa_id: empresaId,
    _table_name: table
  });
  if (claimErr) {
    console.error(`claim_seed error for ${table}:`, claimErr);
    markSeedCached(table, empresaId);
    return;
  }
  if (!claimed) {
    markSeedCached(table, empresaId);
    return;
  }
  if (seedData.length > 0) {
    const rows = seedData.map((r) => mapper(r, empresaId));
    const { error: insertErr } = await db.from(table).insert(rows);
    if (insertErr) {
      console.error(`Seed insert error for ${table}:`, insertErr);
      return;
    }
  }
  markSeedCached(table, empresaId);
}
function useMotor1() {
  const qc = useQueryClient();
  const { empresaId } = useAuth();
  const query = useQuery({
    queryKey: ["motor1"],
    queryFn: async () => {
      if (empresaId) await seedIfEmpty("motor1", seedMotor1, motor1ToDb, empresaId);
      const { data, error } = await db.from("motor1").select("*").order("created_at");
      if (error) throw error;
      return (data || []).map(dbToMotor1);
    }
  });
  const addMotor1 = useMutation({
    mutationFn: async (e) => {
      if (!empresaId) throw new Error("Empresa não vinculada");
      const { error } = await db.from("motor1").insert(motor1ToDb(e, empresaId));
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["motor1"] })
  });
  const updateMotor1 = useMutation({
    mutationFn: async (e) => {
      if (!empresaId) throw new Error("Empresa não vinculada");
      const { error } = await db.from("motor1").update(motor1ToDb(e, empresaId)).eq("id", e.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["motor1"] })
  });
  const deleteMotor1 = useMutation({
    mutationFn: async (id) => {
      const { error } = await db.from("motor1").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["motor1"] })
  });
  return { motor1: query.data || [], isLoading: query.isLoading, addMotor1, updateMotor1, deleteMotor1 };
}
function useMotor2() {
  const qc = useQueryClient();
  const { empresaId } = useAuth();
  const query = useQuery({
    queryKey: ["motor2"],
    queryFn: async () => {
      if (empresaId) await seedIfEmpty("motor2", seedMotor2, motor2ToDb, empresaId);
      const { data, error } = await db.from("motor2").select("*").order("created_at");
      if (error) throw error;
      return (data || []).map(dbToMotor2);
    }
  });
  const addMotor2 = useMutation({
    mutationFn: async (e) => {
      if (!empresaId) throw new Error("Empresa não vinculada");
      const { error } = await db.from("motor2").insert(motor2ToDb(e, empresaId));
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["motor2"] })
  });
  const updateMotor2 = useMutation({
    mutationFn: async (e) => {
      if (!empresaId) throw new Error("Empresa não vinculada");
      const { error } = await db.from("motor2").update(motor2ToDb(e, empresaId)).eq("id", e.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["motor2"] })
  });
  const deleteMotor2 = useMutation({
    mutationFn: async (id) => {
      const { error } = await db.from("motor2").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["motor2"] })
  });
  return { motor2: query.data || [], isLoading: query.isLoading, addMotor2, updateMotor2, deleteMotor2 };
}
function useInsumos() {
  const qc = useQueryClient();
  const { empresaId } = useAuth();
  const query = useQuery({
    queryKey: ["insumos"],
    queryFn: async () => {
      if (empresaId) await seedIfEmpty("insumos", seedInsumos, insumoToDb, empresaId);
      const { data, error } = await db.from("insumos").select("*").order("created_at");
      if (error) throw error;
      return (data || []).map(dbToInsumo);
    }
  });
  const addInsumo = useMutation({
    mutationFn: async (e) => {
      if (!empresaId) throw new Error("Empresa não vinculada");
      const { error } = await db.from("insumos").insert(insumoToDb(e, empresaId));
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["insumos"] })
  });
  const updateInsumo = useMutation({
    mutationFn: async (e) => {
      if (!empresaId) throw new Error("Empresa não vinculada");
      const { error } = await db.from("insumos").update(insumoToDb(e, empresaId)).eq("id", e.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["insumos"] })
  });
  const deleteInsumo = useMutation({
    mutationFn: async (id) => {
      const { error } = await db.from("insumos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["insumos"] })
  });
  return { insumos: query.data || [], isLoading: query.isLoading, addInsumo, updateInsumo, deleteInsumo };
}
function useRegras() {
  const qc = useQueryClient();
  const { empresaId } = useAuth();
  const query = useQuery({
    queryKey: ["regras"],
    queryFn: async () => {
      if (empresaId) await seedIfEmpty("regras_calculo", seedRegras, regraToDb, empresaId);
      const { data, error } = await db.from("regras_calculo").select("*").order("created_at");
      if (error) throw error;
      return (data || []).map(dbToRegra);
    }
  });
  const addRegra = useMutation({
    mutationFn: async (e) => {
      if (!empresaId) throw new Error("Empresa não vinculada");
      const { error } = await db.from("regras_calculo").insert(regraToDb(e, empresaId));
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["regras"] })
  });
  const updateRegra = useMutation({
    mutationFn: async (e) => {
      if (!empresaId) throw new Error("Empresa não vinculada");
      const { error } = await db.from("regras_calculo").update(regraToDb(e, empresaId)).eq("id", e.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["regras"] })
  });
  const deleteRegra = useMutation({
    mutationFn: async (id) => {
      const { error } = await db.from("regras_calculo").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["regras"] })
  });
  return { regras: query.data || [], isLoading: query.isLoading, addRegra, updateRegra, deleteRegra };
}
function useServicos() {
  const qc = useQueryClient();
  const { empresaId } = useAuth();
  const query = useQuery({
    queryKey: ["servicos"],
    queryFn: async () => {
      if (empresaId) await seedIfEmpty("servicos_catalogo", seedServicos, servicoToDb, empresaId);
      const { data, error } = await db.from("servicos_catalogo").select("*").order("created_at");
      if (error) throw error;
      return (data || []).map(dbToServico);
    }
  });
  const addServico = useMutation({
    mutationFn: async (e) => {
      if (!empresaId) throw new Error("Empresa não vinculada");
      const { error } = await db.from("servicos_catalogo").insert(servicoToDb(e, empresaId));
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["servicos"] })
  });
  const updateServico = useMutation({
    mutationFn: async (e) => {
      if (!empresaId) throw new Error("Empresa não vinculada");
      const { error } = await db.from("servicos_catalogo").update(servicoToDb(e, empresaId)).eq("id", e.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["servicos"] })
  });
  const deleteServico = useMutation({
    mutationFn: async (id) => {
      const { error } = await db.from("servicos_catalogo").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["servicos"] })
  });
  return { servicos: query.data || [], isLoading: query.isLoading, addServico, updateServico, deleteServico };
}
var U = 1, Y$1 = 0.9, H = 0.8, J = 0.17, p = 0.1, u = 0.999, $ = 0.9999;
var k$1 = 0.99, m = /[\\\/_+.#"@\[\(\{&]/, B$1 = /[\\\/_+.#"@\[\(\{&]/g, K$1 = /[\s-]/, X = /[\s-]/g;
function G(_, C, h, P2, A, f, O) {
  if (f === C.length) return A === _.length ? U : k$1;
  var T2 = `${A},${f}`;
  if (O[T2] !== void 0) return O[T2];
  for (var L2 = P2.charAt(f), c = h.indexOf(L2, A), S = 0, E, N2, R, M; c >= 0; ) E = G(_, C, h, P2, c + 1, f + 1, O), E > S && (c === A ? E *= U : m.test(_.charAt(c - 1)) ? (E *= H, R = _.slice(A, c - 1).match(B$1), R && A > 0 && (E *= Math.pow(u, R.length))) : K$1.test(_.charAt(c - 1)) ? (E *= Y$1, M = _.slice(A, c - 1).match(X), M && A > 0 && (E *= Math.pow(u, M.length))) : (E *= J, A > 0 && (E *= Math.pow(u, c - A))), _.charAt(c) !== C.charAt(f) && (E *= $)), (E < p && h.charAt(c - 1) === P2.charAt(f + 1) || P2.charAt(f + 1) === P2.charAt(f) && h.charAt(c - 1) !== P2.charAt(f)) && (N2 = G(_, C, h, P2, c + 1, f + 2, O), N2 * p > E && (E = N2 * p)), E > S && (S = E), c = h.indexOf(L2, c + 1);
  return O[T2] = S, S;
}
function D(_) {
  return _.toLowerCase().replace(X, " ");
}
function W(_, C, h) {
  return _ = h && h.length > 0 ? `${_ + " " + h.join(" ")}` : _, G(_, C, D(_), D(C), 0, 0, {});
}
var N = '[cmdk-group=""]', Y = '[cmdk-group-items=""]', be = '[cmdk-group-heading=""]', le = '[cmdk-item=""]', ce = `${le}:not([aria-disabled="true"])`, Z = "cmdk-item-select", T = "data-value", Re = (r, o, n) => W(r, o, n), ue = reactExports.createContext(void 0), K = () => reactExports.useContext(ue), de = reactExports.createContext(void 0), ee = () => reactExports.useContext(de), fe = reactExports.createContext(void 0), me = reactExports.forwardRef((r, o) => {
  let n = L(() => {
    var e, a;
    return { search: "", value: (a = (e = r.value) != null ? e : r.defaultValue) != null ? a : "", selectedItemId: void 0, filtered: { count: 0, items: /* @__PURE__ */ new Map(), groups: /* @__PURE__ */ new Set() } };
  }), u2 = L(() => /* @__PURE__ */ new Set()), c = L(() => /* @__PURE__ */ new Map()), d = L(() => /* @__PURE__ */ new Map()), f = L(() => /* @__PURE__ */ new Set()), p2 = pe(r), { label: b, children: m2, value: R, onValueChange: x, filter: C, shouldFilter: S, loop: A, disablePointerSelection: ge = false, vimBindings: j = true, ...O } = r, $2 = useId(), q = useId(), _ = useId(), I = reactExports.useRef(null), v = ke();
  k(() => {
    if (R !== void 0) {
      let e = R.trim();
      n.current.value = e, E.emit();
    }
  }, [R]), k(() => {
    v(6, ne);
  }, []);
  let E = reactExports.useMemo(() => ({ subscribe: (e) => (f.current.add(e), () => f.current.delete(e)), snapshot: () => n.current, setState: (e, a, s) => {
    var i, l, g, y;
    if (!Object.is(n.current[e], a)) {
      if (n.current[e] = a, e === "search") J2(), z(), v(1, W2);
      else if (e === "value") {
        if (document.activeElement.hasAttribute("cmdk-input") || document.activeElement.hasAttribute("cmdk-root")) {
          let h = document.getElementById(_);
          h ? h.focus() : (i = document.getElementById($2)) == null || i.focus();
        }
        if (v(7, () => {
          var h;
          n.current.selectedItemId = (h = M()) == null ? void 0 : h.id, E.emit();
        }), s || v(5, ne), ((l = p2.current) == null ? void 0 : l.value) !== void 0) {
          let h = a != null ? a : "";
          (y = (g = p2.current).onValueChange) == null || y.call(g, h);
          return;
        }
      }
      E.emit();
    }
  }, emit: () => {
    f.current.forEach((e) => e());
  } }), []), U2 = reactExports.useMemo(() => ({ value: (e, a, s) => {
    var i;
    a !== ((i = d.current.get(e)) == null ? void 0 : i.value) && (d.current.set(e, { value: a, keywords: s }), n.current.filtered.items.set(e, te(a, s)), v(2, () => {
      z(), E.emit();
    }));
  }, item: (e, a) => (u2.current.add(e), a && (c.current.has(a) ? c.current.get(a).add(e) : c.current.set(a, /* @__PURE__ */ new Set([e]))), v(3, () => {
    J2(), z(), n.current.value || W2(), E.emit();
  }), () => {
    d.current.delete(e), u2.current.delete(e), n.current.filtered.items.delete(e);
    let s = M();
    v(4, () => {
      J2(), (s == null ? void 0 : s.getAttribute("id")) === e && W2(), E.emit();
    });
  }), group: (e) => (c.current.has(e) || c.current.set(e, /* @__PURE__ */ new Set()), () => {
    d.current.delete(e), c.current.delete(e);
  }), filter: () => p2.current.shouldFilter, label: b || r["aria-label"], getDisablePointerSelection: () => p2.current.disablePointerSelection, listId: $2, inputId: _, labelId: q, listInnerRef: I }), []);
  function te(e, a) {
    var i, l;
    let s = (l = (i = p2.current) == null ? void 0 : i.filter) != null ? l : Re;
    return e ? s(e, n.current.search, a) : 0;
  }
  function z() {
    if (!n.current.search || p2.current.shouldFilter === false) return;
    let e = n.current.filtered.items, a = [];
    n.current.filtered.groups.forEach((i) => {
      let l = c.current.get(i), g = 0;
      l.forEach((y) => {
        let h = e.get(y);
        g = Math.max(h, g);
      }), a.push([i, g]);
    });
    let s = I.current;
    V().sort((i, l) => {
      var h, F;
      let g = i.getAttribute("id"), y = l.getAttribute("id");
      return ((h = e.get(y)) != null ? h : 0) - ((F = e.get(g)) != null ? F : 0);
    }).forEach((i) => {
      let l = i.closest(Y);
      l ? l.appendChild(i.parentElement === l ? i : i.closest(`${Y} > *`)) : s.appendChild(i.parentElement === s ? i : i.closest(`${Y} > *`));
    }), a.sort((i, l) => l[1] - i[1]).forEach((i) => {
      var g;
      let l = (g = I.current) == null ? void 0 : g.querySelector(`${N}[${T}="${encodeURIComponent(i[0])}"]`);
      l == null || l.parentElement.appendChild(l);
    });
  }
  function W2() {
    let e = V().find((s) => s.getAttribute("aria-disabled") !== "true"), a = e == null ? void 0 : e.getAttribute(T);
    E.setState("value", a || void 0);
  }
  function J2() {
    var a, s, i, l;
    if (!n.current.search || p2.current.shouldFilter === false) {
      n.current.filtered.count = u2.current.size;
      return;
    }
    n.current.filtered.groups = /* @__PURE__ */ new Set();
    let e = 0;
    for (let g of u2.current) {
      let y = (s = (a = d.current.get(g)) == null ? void 0 : a.value) != null ? s : "", h = (l = (i = d.current.get(g)) == null ? void 0 : i.keywords) != null ? l : [], F = te(y, h);
      n.current.filtered.items.set(g, F), F > 0 && e++;
    }
    for (let [g, y] of c.current) for (let h of y) if (n.current.filtered.items.get(h) > 0) {
      n.current.filtered.groups.add(g);
      break;
    }
    n.current.filtered.count = e;
  }
  function ne() {
    var a, s, i;
    let e = M();
    e && (((a = e.parentElement) == null ? void 0 : a.firstChild) === e && ((i = (s = e.closest(N)) == null ? void 0 : s.querySelector(be)) == null || i.scrollIntoView({ block: "nearest" })), e.scrollIntoView({ block: "nearest" }));
  }
  function M() {
    var e;
    return (e = I.current) == null ? void 0 : e.querySelector(`${le}[aria-selected="true"]`);
  }
  function V() {
    var e;
    return Array.from(((e = I.current) == null ? void 0 : e.querySelectorAll(ce)) || []);
  }
  function X2(e) {
    let s = V()[e];
    s && E.setState("value", s.getAttribute(T));
  }
  function Q(e) {
    var g;
    let a = M(), s = V(), i = s.findIndex((y) => y === a), l = s[i + e];
    (g = p2.current) != null && g.loop && (l = i + e < 0 ? s[s.length - 1] : i + e === s.length ? s[0] : s[i + e]), l && E.setState("value", l.getAttribute(T));
  }
  function re(e) {
    let a = M(), s = a == null ? void 0 : a.closest(N), i;
    for (; s && !i; ) s = e > 0 ? we(s, N) : De(s, N), i = s == null ? void 0 : s.querySelector(ce);
    i ? E.setState("value", i.getAttribute(T)) : Q(e);
  }
  let oe = () => X2(V().length - 1), ie = (e) => {
    e.preventDefault(), e.metaKey ? oe() : e.altKey ? re(1) : Q(1);
  }, se = (e) => {
    e.preventDefault(), e.metaKey ? X2(0) : e.altKey ? re(-1) : Q(-1);
  };
  return reactExports.createElement(Primitive.div, { ref: o, tabIndex: -1, ...O, "cmdk-root": "", onKeyDown: (e) => {
    var s;
    (s = O.onKeyDown) == null || s.call(O, e);
    let a = e.nativeEvent.isComposing || e.keyCode === 229;
    if (!(e.defaultPrevented || a)) switch (e.key) {
      case "n":
      case "j": {
        j && e.ctrlKey && ie(e);
        break;
      }
      case "ArrowDown": {
        ie(e);
        break;
      }
      case "p":
      case "k": {
        j && e.ctrlKey && se(e);
        break;
      }
      case "ArrowUp": {
        se(e);
        break;
      }
      case "Home": {
        e.preventDefault(), X2(0);
        break;
      }
      case "End": {
        e.preventDefault(), oe();
        break;
      }
      case "Enter": {
        e.preventDefault();
        let i = M();
        if (i) {
          let l = new Event(Z);
          i.dispatchEvent(l);
        }
      }
    }
  } }, reactExports.createElement("label", { "cmdk-label": "", htmlFor: U2.inputId, id: U2.labelId, style: Te }, b), B(r, (e) => reactExports.createElement(de.Provider, { value: E }, reactExports.createElement(ue.Provider, { value: U2 }, e))));
}), he = reactExports.forwardRef((r, o) => {
  var _, I;
  let n = useId(), u2 = reactExports.useRef(null), c = reactExports.useContext(fe), d = K(), f = pe(r), p2 = (I = (_ = f.current) == null ? void 0 : _.forceMount) != null ? I : c == null ? void 0 : c.forceMount;
  k(() => {
    if (!p2) return d.item(n, c == null ? void 0 : c.id);
  }, [p2]);
  let b = ve(n, u2, [r.value, r.children, u2], r.keywords), m2 = ee(), R = P((v) => v.value && v.value === b.current), x = P((v) => p2 || d.filter() === false ? true : v.search ? v.filtered.items.get(n) > 0 : true);
  reactExports.useEffect(() => {
    let v = u2.current;
    if (!(!v || r.disabled)) return v.addEventListener(Z, C), () => v.removeEventListener(Z, C);
  }, [x, r.onSelect, r.disabled]);
  function C() {
    var v, E;
    S(), (E = (v = f.current).onSelect) == null || E.call(v, b.current);
  }
  function S() {
    m2.setState("value", b.current, true);
  }
  if (!x) return null;
  let { disabled: A, value: ge, onSelect: j, forceMount: O, keywords: $2, ...q } = r;
  return reactExports.createElement(Primitive.div, { ref: composeRefs(u2, o), ...q, id: n, "cmdk-item": "", role: "option", "aria-disabled": !!A, "aria-selected": !!R, "data-disabled": !!A, "data-selected": !!R, onPointerMove: A || d.getDisablePointerSelection() ? void 0 : S, onClick: A ? void 0 : C }, r.children);
}), Ee = reactExports.forwardRef((r, o) => {
  let { heading: n, children: u2, forceMount: c, ...d } = r, f = useId(), p2 = reactExports.useRef(null), b = reactExports.useRef(null), m2 = useId(), R = K(), x = P((S) => c || R.filter() === false ? true : S.search ? S.filtered.groups.has(f) : true);
  k(() => R.group(f), []), ve(f, p2, [r.value, r.heading, b]);
  let C = reactExports.useMemo(() => ({ id: f, forceMount: c }), [c]);
  return reactExports.createElement(Primitive.div, { ref: composeRefs(p2, o), ...d, "cmdk-group": "", role: "presentation", hidden: x ? void 0 : true }, n && reactExports.createElement("div", { ref: b, "cmdk-group-heading": "", "aria-hidden": true, id: m2 }, n), B(r, (S) => reactExports.createElement("div", { "cmdk-group-items": "", role: "group", "aria-labelledby": n ? m2 : void 0 }, reactExports.createElement(fe.Provider, { value: C }, S))));
}), ye = reactExports.forwardRef((r, o) => {
  let { alwaysRender: n, ...u2 } = r, c = reactExports.useRef(null), d = P((f) => !f.search);
  return !n && !d ? null : reactExports.createElement(Primitive.div, { ref: composeRefs(c, o), ...u2, "cmdk-separator": "", role: "separator" });
}), Se = reactExports.forwardRef((r, o) => {
  let { onValueChange: n, ...u2 } = r, c = r.value != null, d = ee(), f = P((m2) => m2.search), p2 = P((m2) => m2.selectedItemId), b = K();
  return reactExports.useEffect(() => {
    r.value != null && d.setState("search", r.value);
  }, [r.value]), reactExports.createElement(Primitive.input, { ref: o, ...u2, "cmdk-input": "", autoComplete: "off", autoCorrect: "off", spellCheck: false, "aria-autocomplete": "list", role: "combobox", "aria-expanded": true, "aria-controls": b.listId, "aria-labelledby": b.labelId, "aria-activedescendant": p2, id: b.inputId, type: "text", value: c ? r.value : f, onChange: (m2) => {
    c || d.setState("search", m2.target.value), n == null || n(m2.target.value);
  } });
}), Ce = reactExports.forwardRef((r, o) => {
  let { children: n, label: u2 = "Suggestions", ...c } = r, d = reactExports.useRef(null), f = reactExports.useRef(null), p2 = P((m2) => m2.selectedItemId), b = K();
  return reactExports.useEffect(() => {
    if (f.current && d.current) {
      let m2 = f.current, R = d.current, x, C = new ResizeObserver(() => {
        x = requestAnimationFrame(() => {
          let S = m2.offsetHeight;
          R.style.setProperty("--cmdk-list-height", S.toFixed(1) + "px");
        });
      });
      return C.observe(m2), () => {
        cancelAnimationFrame(x), C.unobserve(m2);
      };
    }
  }, []), reactExports.createElement(Primitive.div, { ref: composeRefs(d, o), ...c, "cmdk-list": "", role: "listbox", tabIndex: -1, "aria-activedescendant": p2, "aria-label": u2, id: b.listId }, B(r, (m2) => reactExports.createElement("div", { ref: composeRefs(f, b.listInnerRef), "cmdk-list-sizer": "" }, m2)));
}), xe = reactExports.forwardRef((r, o) => {
  let { open: n, onOpenChange: u2, overlayClassName: c, contentClassName: d, container: f, ...p2 } = r;
  return reactExports.createElement(Root, { open: n, onOpenChange: u2 }, reactExports.createElement(Portal, { container: f }, reactExports.createElement(Overlay, { "cmdk-overlay": "", className: c }), reactExports.createElement(Content, { "aria-label": r.label, "cmdk-dialog": "", className: d }, reactExports.createElement(me, { ref: o, ...p2 }))));
}), Ie = reactExports.forwardRef((r, o) => P((u2) => u2.filtered.count === 0) ? reactExports.createElement(Primitive.div, { ref: o, ...r, "cmdk-empty": "", role: "presentation" }) : null), Pe = reactExports.forwardRef((r, o) => {
  let { progress: n, children: u2, label: c = "Loading...", ...d } = r;
  return reactExports.createElement(Primitive.div, { ref: o, ...d, "cmdk-loading": "", role: "progressbar", "aria-valuenow": n, "aria-valuemin": 0, "aria-valuemax": 100, "aria-label": c }, B(r, (f) => reactExports.createElement("div", { "aria-hidden": true }, f)));
}), _e = Object.assign(me, { List: Ce, Item: he, Input: Se, Group: Ee, Separator: ye, Dialog: xe, Empty: Ie, Loading: Pe });
function we(r, o) {
  let n = r.nextElementSibling;
  for (; n; ) {
    if (n.matches(o)) return n;
    n = n.nextElementSibling;
  }
}
function De(r, o) {
  let n = r.previousElementSibling;
  for (; n; ) {
    if (n.matches(o)) return n;
    n = n.previousElementSibling;
  }
}
function pe(r) {
  let o = reactExports.useRef(r);
  return k(() => {
    o.current = r;
  }), o;
}
var k = typeof window == "undefined" ? reactExports.useEffect : reactExports.useLayoutEffect;
function L(r) {
  let o = reactExports.useRef();
  return o.current === void 0 && (o.current = r()), o;
}
function P(r) {
  let o = ee(), n = () => r(o.snapshot());
  return reactExports.useSyncExternalStore(o.subscribe, n, n);
}
function ve(r, o, n, u2 = []) {
  let c = reactExports.useRef(), d = K();
  return k(() => {
    var b;
    let f = (() => {
      var m2;
      for (let R of n) {
        if (typeof R == "string") return R.trim();
        if (typeof R == "object" && "current" in R) return R.current ? (m2 = R.current.textContent) == null ? void 0 : m2.trim() : c.current;
      }
    })(), p2 = u2.map((m2) => m2.trim());
    d.value(r, f, p2), (b = o.current) == null || b.setAttribute(T, f), c.current = f;
  }), c;
}
var ke = () => {
  let [r, o] = reactExports.useState(), n = L(() => /* @__PURE__ */ new Map());
  return k(() => {
    n.current.forEach((u2) => u2()), n.current = /* @__PURE__ */ new Map();
  }, [r]), (u2, c) => {
    n.current.set(u2, c), o({});
  };
};
function Me(r) {
  let o = r.type;
  return typeof o == "function" ? o(r.props) : "render" in o ? o.render(r.props) : r;
}
function B({ asChild: r, children: o }, n) {
  return r && reactExports.isValidElement(o) ? reactExports.cloneElement(Me(o), { ref: o.ref }, n(o.props.children)) : n(o);
}
var Te = { position: "absolute", width: "1px", height: "1px", padding: "0", margin: "-1px", overflow: "hidden", clip: "rect(0, 0, 0, 0)", whiteSpace: "nowrap", borderWidth: "0" };
const Command = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  _e,
  {
    ref,
    className: cn(
      "flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground",
      className
    ),
    ...props
  }
));
Command.displayName = _e.displayName;
const CommandInput = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center border-b px-3", "cmdk-input-wrapper": "", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "mr-2 h-4 w-4 shrink-0 opacity-50" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx(
    _e.Input,
    {
      ref,
      className: cn(
        "flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
        className
      ),
      ...props
    }
  )
] }));
CommandInput.displayName = _e.Input.displayName;
const CommandList = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  _e.List,
  {
    ref,
    className: cn("max-h-[300px] overflow-y-auto overflow-x-hidden", className),
    ...props
  }
));
CommandList.displayName = _e.List.displayName;
const CommandEmpty = reactExports.forwardRef((props, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(_e.Empty, { ref, className: "py-6 text-center text-sm", ...props }));
CommandEmpty.displayName = _e.Empty.displayName;
const CommandGroup = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  _e.Group,
  {
    ref,
    className: cn(
      "overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground",
      className
    ),
    ...props
  }
));
CommandGroup.displayName = _e.Group.displayName;
const CommandSeparator = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(_e.Separator, { ref, className: cn("-mx-1 h-px bg-border", className), ...props }));
CommandSeparator.displayName = _e.Separator.displayName;
const CommandItem = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  _e.Item,
  {
    ref,
    className: cn(
      "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled=true]:pointer-events-none data-[selected='true']:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50",
      className
    ),
    ...props
  }
));
CommandItem.displayName = _e.Item.displayName;
export {
  ChevronsUpDown as C,
  useRegras as a,
  useMotor1 as b,
  useMotor2 as c,
  useInsumos as d,
  Command as e,
  CommandInput as f,
  CommandList as g,
  CommandEmpty as h,
  CommandGroup as i,
  CommandItem as j,
  Calculator as k,
  useServicos as u
};
