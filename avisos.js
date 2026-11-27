// Avisos fuera del panel: Telegram (gratis), correo (EmailJS) y WhatsApp (CallMeBot)
// La configuración vive en Firestore: ajustes/avisos (la edita el dueño desde el panel)
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export async function leerAvisos(db) {
  try { return (await getDoc(doc(db, "ajustes", "avisos"))).data() || {}; } catch { return {}; }
}

// datos = { empresa, cantidad, archivos: [nombres], periodo, tipo, nota }
export async function enviarAvisos(cfg, datos, linkPanel) {
  const tareas = [];
  const resumen = `${datos.empresa} envió ${datos.cantidad} documento${datos.cantidad > 1 ? "s" : ""}`
    + (datos.periodo ? ` · ${datos.periodo}` : "") + (datos.tipo ? ` · ${datos.tipo}` : "");
  const lista = datos.archivos.slice(0, 15).join("\n") + (datos.archivos.length > 15 ? `\n… y ${datos.archivos.length - 15} más` : "");

  const em = cfg.email || {};
  if (em.activo && em.serviceId && em.templateId && em.publicKey && em.para) {
    tareas.push(fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: em.serviceId, template_id: em.templateId, user_id: em.publicKey,
        template_params: {
          to_email: em.para, asunto: "📥 " + resumen, resumen, empresa: datos.empresa,
          cantidad: datos.cantidad, archivos: lista, periodo: datos.periodo || "—", tipo: datos.tipo || "—",
          nota: datos.nota || "—", link_panel: linkPanel
        }
      })
    }).then(r => { if (!r.ok) throw new Error("Correo: " + r.status); }));
  }

  const wa = cfg.whatsapp || {};
  if (wa.activo && wa.telefono && wa.apikey) {
    const texto = `*📥 ${resumen}*\n${lista}${datos.nota ? `\n\nNota: ${datos.nota}` : ""}\n\n${linkPanel}`;
    const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(wa.telefono)}&text=${encodeURIComponent(texto)}&apikey=${encodeURIComponent(wa.apikey)}`;
    // El servicio no permite leer la respuesta desde el navegador; se envía "a ciegas"
    tareas.push(fetch(url, { mode: "no-cors" }));
  }
  const tg = cfg.telegram || {};
  if (tg.activo && tg.token && tg.chatId) {
    const texto = `📥 ${resumen}\n\n${lista}${datos.nota ? `\n\nNota: ${datos.nota}` : ""}\n\nAbrir el panel: ${linkPanel}`;
    tareas.push(fetch(`https://api.telegram.org/bot${tg.token}/sendMessage`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: tg.chatId, text: texto, disable_web_page_preview: true })
    }).then(async r => { if (!r.ok) throw new Error("Telegram: " + ((await r.json().catch(() => ({}))).description || r.status)); }));
  }
  return Promise.allSettled(tareas);
}

// Busca el chat de quien le escribió al bot (para no tener que copiar el número de chat a mano)
export async function detectarChatTelegram(token) {
  const r = await fetch(`https://api.telegram.org/bot${token}/getUpdates`);
  const j = await r.json();
  if (!j.ok) throw new Error(j.description || "Token no válido");
  const m = [...(j.result || [])].reverse().map(u => u.message || u.channel_post || u.my_chat_member).find(x => x?.chat);
  if (!m) throw new Error("El bot aún no recibe mensajes. Escríbele /start desde Telegram y vuelve a intentar.");
  return { id: String(m.chat.id), nombre: m.chat.first_name || m.chat.title || m.chat.username || "" };
}
