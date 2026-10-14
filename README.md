# 💌 Para Tania, con amor de Isaí — GitHub Pages

Invitación romántica creada por Isaí para su novia Tania. HTML, CSS y JavaScript, sin Node.js, backend, cuentas externas ni proceso de compilación.

## Funciones

- Tania aparece por defecto; opcionalmente el nombre se personaliza con `?nombre=Tania`.
- Botón «No» que se mueve y selección de cuatro planes.
- **Calendario**: selección de fecha y hora, validación de que sean futuras y descarga de un evento `.ics` para añadirlo a Google Calendar, Apple Calendar u Outlook.
- Botón «Compartir respuesta» con el menú nativo o el portapapeles del navegador.
- **Sin notificaciones automáticas, Formspree ni envío de datos a servidores de formularios.** Compartir la respuesta requiere una acción explícita de la persona.

## Flujo

**Pregunta → Elegir plan → Elegir fecha y hora → Resumen → Descargar calendario**.

El calendario usa la zona horaria local del navegador. El evento dura 90 minutos por defecto; puedes cambiar la constante `duration` en `assets/app.js`. No se consulta disponibilidad ni se sincroniza automáticamente con ninguna cuenta de calendario.

## Estructura

```text
invitacion-github-pages/
├── index.html
├── assets/
│   ├── app.js
│   └── styles.css
├── .nojekyll
└── README.md
```

## Probar localmente

```bash
python3 -m http.server 8080
```

Abre `http://localhost:8080/`.

## Publicar en GitHub Pages

1. Sube el contenido de esta carpeta a la rama `main` del repositorio.
2. En **Settings → Pages → Build and deployment** elige **Deploy from a branch**.
3. Selecciona **main** y **/(root)**, y guarda.
4. Abre `https://TU-USUARIO.github.io/NOMBRE-REPO/`.

La página puede cargar fuentes de Google Fonts; no se transmiten los detalles de la cita a un servicio de formularios.

## Personalización

Los mensajes de Isaí para Tania están en `index.html` y `assets/app.js`. La paleta romántica está en `assets/styles.css`. No se envían notificaciones ni se guardan respuestas en servidores. La fecha es una propuesta hasta que ambos la acuerden.
