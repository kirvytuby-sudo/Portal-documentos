// Utilidades compartidas: periodos y checklist
export const CHECKLIST_BASE = ["Estados de cuenta", "Facturas emitidas", "Facturas recibidas", "Nómina", "Otros"];
const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const aClave = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
export const etiquetaPeriodo = p => { if (!p) return "Sin periodo"; const [y, m] = p.split("-"); return `${MESES[+m - 1]} ${y}`; };
// Mes actual y los anteriores
export function listaPeriodos(n = 18) {
  const out = [], d = new Date(); d.setDate(1);
  for (let i = 0; i < n; i++) { out.push(aClave(d)); d.setMonth(d.getMonth() - 1); }
  return out;
}
export const periodoAnterior = () => { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - 1); return aClave(d); };
export const esOtros = x => /^otro/i.test(x || "");
// Lista de la empresa, si no la general, si no la base
export const checklistDe = (empresa, general) =>
  empresa?.checklist?.length ? empresa.checklist : general?.length ? general : CHECKLIST_BASE;
// Opciones para "¿Qué documento es?": la lista + "Otros"
export const opcionesTipo = lista => lista.some(esOtros) ? lista : [...lista, "Otros"];
// Lo que se debe entregar (sin "Otros") y lo que ya llegó en ese periodo
export function estadoChecklist(lista, archivos, periodo) {
  const req = lista.filter(x => !esOtros(x));
  const llegaron = new Set(archivos.filter(a => a.periodo === periodo).map(a => a.categoria));
  return req.map(x => ({ item: x, ok: llegaron.has(x) }));
}
export const opcionesPeriodoHTML = (sel, conTodos = false) =>
  (conTodos ? `<option value="">Todos los periodos</option>` : "") +
  listaPeriodos().map(p => `<option value="${p}" ${p === sel ? "selected" : ""}>${etiquetaPeriodo(p)}</option>`).join("");
