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
  // Destinos: el chat principal (dueño o grupo) + cada usuario que vinculó su Telegram
  const destinos = new Set();
  if (tg.activo && tg.chatId) destinos.add(String(tg.chatId));
  Object.values(tg.chats || {}).forEach(c => { if (c?.activo && c.chatId) destinos.add(String(c.chatId)); });
  if (tg.token && destinos.size) {
    const texto = `📥 ${resumen}\n\n${lista}${datos.nota ? `\n\nNota: ${datos.nota}` : ""}\n\nAbrir el panel: ${linkPanel}`;
    destinos.forEach(chatId => tareas.push(telegramEnviar(tg.token, chatId, texto)));
  }
  return Promise.allSettled(tareas);
}

export async function telegramEnviar(token, chatId, texto) {
  const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text: texto, disable_web_page_preview: true })
  });
  if (!r.ok) throw new Error("Telegram: " + ((await r.json().catch(() => ({}))).description || r.status));
}
export async function telegramBotUsuario(token) {
  const j = await (await fetch(`https://api.telegram.org/bot${token}/getMe`)).json();
  if (!j.ok) throw new Error(j.description || "Token no válido");
  return j.result.username;
}
// Espera a que llegue "/start <codigo>" al bot y devuelve ese chat
export async function telegramEsperarCodigo(token, codigo, cancelado, segundos = 180) {
  const fin = Date.now() + segundos * 1000;
  while (Date.now() < fin && !cancelado()) {
    try {
      const j = await (await fetch(`https://api.telegram.org/bot${token}/getUpdates?limit=100`)).json();
      const m = (j.result || []).map(u => u.message).find(x => x?.text?.trim() === "/start " + codigo);
      if (m) return { id: String(m.chat.id), nombre: [m.chat.first_name, m.chat.last_name].filter(Boolean).join(" ") || m.chat.username || "" };
    } catch {}
    await new Promise(r => setTimeout(r, 3000));
  }
  return null;
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
