// =====================================================================
//  CONFIGURACIÓN — edita solo este archivo (y los correos en los .rules)
// =====================================================================

// 1) Pega aquí la configuración de tu app web de Firebase
//    (Firebase Console → ⚙ Configuración del proyecto → Tus apps → SDK config)
export const firebaseConfig = {
  apiKey: "AIzaSyBte33daF3dobCLmt26ourqauGfYGN9FDs",
  authDomain: "almacenamiento-de-documentos.firebaseapp.com",
  projectId: "almacenamiento-de-documentos",
  storageBucket: "almacenamiento-de-documentos.firebasestorage.app",
  messagingSenderId: "1079674215548",
  appId: "1:1079674215548:web:73ffee5a387e088d6e3df9"
};

// 2) Correo(s) de administrador. Deben ser EXACTAMENTE los mismos
//    que pongas en firestore.rules y storage.rules.
export const ADMIN_EMAILS = ["kirvytuby@gmail.com"];

// 3) Nombre que verán tus clientes en el portal
export const NOMBRE_DESPACHO = "Portal de Documentos";

// Dominio interno para las cuentas de las empresas (no se envían correos).
// Si lo cambias, cámbialo también en los dos archivos .rules
export const DOMINIO_EMPRESAS = "empresas.example.com";

// 4) Dónde se guardan los archivos:
//    "firestore" → plan Spark (GRATIS). Fotos se comprimen solas; máx. 10 MB por archivo
//                  y ~1 GB en total. Ideal para pruebas.
//    "storage"   → plan Blaze. Hasta 25 MB por archivo, sin límite práctico.
//                  Requiere activar Storage y publicar storage.rules.
export const ALMACENAMIENTO = "firestore";

// Tamaño máximo por archivo
export const MAX_MB = ALMACENAMIENTO === "storage" ? 25 : 10;
