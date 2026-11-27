# Portal de Documentos — instalación

Cada empresa tiene **su link + PIN** y solo ve su espacio. Tú ves todo en `admin.html`.

| Archivo | Para qué |
|---|---|
| `index.html` | Portal del cliente (link `.../index.html?e=CODIGO`) |
| `admin.html` | Tu panel: bandeja de todo lo recibido y alta de empresas |
| `config.js` | Tu configuración de Firebase y tu correo |
| `firestore.rules` / `storage.rules` | Seguridad: aíslan cada empresa |

## 0. Modo gratis vs. Blaze
`config.js` trae `ALMACENAMIENTO = "firestore"`: funciona en el **plan Spark (gratis)**.
Los archivos se guardan en Firestore, las fotos se comprimen solas y el límite es 10 MB por archivo y ~1 GB en total. Es ideal para probar.
Cuando pases a producción: cambia al plan Blaze, activa Storage (paso 5), publica `storage.rules`
y pon `ALMACENAMIENTO = "storage"`. Lo ya subido se sigue abriendo normal.

## 1. Firebase
1. Crea un proyecto nuevo en https://console.firebase.google.com
2. *(Solo modo Blaze)* Cambia al plan Blaze y crea una alerta de presupuesto (ej. 10 USD).
3. **Authentication** → Comenzar → Método de acceso → habilita **Correo electrónico/contraseña**.
   - Pestaña *Usuarios* → **Agregar usuario** con tu correo y una contraseña fuerte (tu acceso de administrador).
   - *Configuración → Dominios autorizados* → agrega `kirvytuby-sudo.github.io`.
4. **Firestore Database** → Crear base de datos (modo producción) → pestaña *Reglas* → pega `firestore.rules` → Publicar.
5. *(Solo modo Blaze)* **Storage** → Comenzar → pestaña *Reglas* → pega `storage.rules` → Publicar. Si pregunta si Storage puede consultar Firestore, acepta.
6. ⚙ Configuración del proyecto → *Tus apps* → agrega una app **Web** → copia el `firebaseConfig`.

## 2. Edita
- `config.js`: pega `firebaseConfig`, tu correo en `ADMIN_EMAILS` y el nombre de tu despacho.
- `firestore.rules` y `storage.rules`: cambia `tu-correo@gmail.com` por el mismo correo (y vuelve a publicar).

## 3. Publica en GitHub Pages
Crea un repo nuevo, sube los archivos, y en *Settings → Pages* elige la rama `main`.
- Panel: `https://kirvytuby-sudo.github.io/NOMBRE-REPO/admin.html`

## 4. Primer uso
1. Entra a `admin.html` con tu correo.
2. La primera vez aparecerá un aviso amarillo **"Falta crear un índice"** → clic en el link → Guardar → espera 2–5 min → recarga.
3. Pestaña **Empresas** → Agregar. Se generan solos el link y el PIN de 6 dígitos.
4. Usa **WhatsApp** o **Copiar acceso** para mandarle al cliente su link + PIN.

## Uso diario
- **Bandeja**: abre por defecto en *Pendientes*. Abre, marca como revisado o elimina. Filtra por empresa o busca por nombre o nota.
- **Nuevo PIN**: si un cliente comparte su acceso, genera otro (el anterior deja de funcionar).
- **Desactivar**: bloquea la subida de una empresa sin borrar sus archivos.

## Seguridad (resumen)
- El cliente necesita link **y** PIN. Firebase bloquea temporalmente después de varios intentos fallidos.
- Las reglas se validan en el servidor de Google: aunque alguien modifique la página, no puede leer otra carpeta.
- Solo se aceptan PDF, imágenes, XML, CSV, Excel, Word y ZIP (10 MB en modo gratis, 25 MB en Blaze).
- Los PINs solo los puede leer tu cuenta de administrador.
