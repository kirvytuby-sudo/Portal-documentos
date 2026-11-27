// Instalar como app (PWA)
export function iniciarPWA(boton) {
  if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});
  if (!boton) return;
  const instalada = matchMedia("(display-mode: standalone)").matches || navigator.standalone;
  if (instalada) return;
  const ios = /iPhone|iPad|iPod/.test(navigator.userAgent);
  let evento = null;
  window.addEventListener("beforeinstallprompt", e => { e.preventDefault(); evento = e; boton.classList.remove("hidden"); });
  window.addEventListener("appinstalled", () => boton.classList.add("hidden"));
  if (ios) boton.classList.remove("hidden");
  boton.onclick = async () => {
    if (evento) { evento.prompt(); await evento.userChoice; evento = null; boton.classList.add("hidden"); }
    else if (ios) alert('Para instalar: toca el botón Compartir (el cuadro con la flecha ↑) y luego "Agregar a pantalla de inicio".');
    else alert('Abre el menú del navegador (⋮) y elige "Instalar app" o "Agregar a pantalla de inicio".');
  };
}
