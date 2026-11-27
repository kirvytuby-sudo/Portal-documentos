// Registro de accesos y "quién está en línea"
import { doc, setDoc, addDoc, collection, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

let timer = null, actual = null;

export function dispositivo() {
  const ua = navigator.userAgent;
  const tipo = /iPad|Tablet/i.test(ua) ? "Tablet" : /Mobi|Android|iPhone/i.test(ua) ? "Celular" : "Computadora";
  const nav = /Edg\//.test(ua) ? "Edge" : /OPR\//.test(ua) ? "Opera" : /Firefox\//.test(ua) ? "Firefox"
    : /CriOS|Chrome\//.test(ua) ? "Chrome" : /Safari\//.test(ua) ? "Safari" : "Navegador";
  const so = /Windows/.test(ua) ? "Windows" : /Android/.test(ua) ? "Android" : /iPhone|iPad|iOS/.test(ua) ? "iPhone"
    : /Mac OS/.test(ua) ? "Mac" : /Linux/.test(ua) ? "Linux" : "";
  return `${tipo} · ${nav}${so ? " · " + so : ""}`;
}

// tipo: "panel" o "empresa"
export async function iniciarActividad(db, user, tipo, empresaId = null) {
  const quien = (user.email || "").toLowerCase();
  actual = { db, quien };
  const disp = dispositivo();
  // Un registro de acceso por sesión de pestaña (no en cada recarga)
  const clave = "acc_" + user.uid;
  let nuevo = false;
  try { nuevo = !sessionStorage.getItem(clave); sessionStorage.setItem(clave, "1"); } catch { nuevo = true; }
  if (nuevo) addDoc(collection(db, "accesos"), { quien, tipo, empresaId, dispositivo: disp, fecha: serverTimestamp() }).catch(() => {});
  const latido = () => setDoc(doc(db, "sesiones", quien),
    { quien, tipo, empresaId, dispositivo: disp, activo: true, ultimaVez: serverTimestamp() }).catch(() => {});
  latido();
  clearInterval(timer);
  timer = setInterval(() => { if (document.visibilityState === "visible") latido(); }, 60000);
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible" && actual) latido(); });
}

// Llamar ANTES de signOut
export async function cerrarActividad() {
  clearInterval(timer); timer = null;
  if (!actual) return;
  const { db, quien } = actual; actual = null;
  try { await setDoc(doc(db, "sesiones", quien), { activo: false, ultimaVez: serverTimestamp() }, { merge: true }); } catch {}
}
