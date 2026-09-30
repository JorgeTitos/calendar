# Madrid Booking Calendar

Un calendario de reservas donde **el cielo de Madrid cambia según la hora que eliges**. Recorre el día y verás amanecer, un mediodía azul, un atardecer naranja tras las Cuatro Torres y una noche estrellada con las ventanas encendidas.

Inspirado en [un diseño de @jonsouyang](https://x.com/jonsouyang/status/2105001165960466617). Es una versión independiente, hecha desde cero y de código abierto: la misma idea, pero con Madrid, y toda la escena dibujada con código.

[English](README.md)

## Qué lo hace especial

- **Sin fotos ni licencias.** El skyline (las Cuatro Torres, la Sierra de Guadarrama al fondo y cientos de tejados) es un SVG procedural generado con una semilla fija. No se descarga nada.
- **Un cielo real, no una presentación.** Para la fecha y hora que señalas se calcula la posición real del sol sobre Madrid y de ahí se interpola la paleta. El atardecer del 30 de septiembre no cae a la misma hora que el del 21 de diciembre.
- **Fluido.** El cielo se desliza hacia la hora elegida en vez de saltar, y respeta `prefers-reduced-motion`.
- **Sin líos de zona horaria.** Todo se calcula en hora de Madrid (con cambio horario incluido), estés donde estés.
- **Bilingüe** (español / inglés, según el navegador) y **ligero**: React + Vite + TypeScript, sin librerías de UI ni de fechas.

## Arrancar

```bash
npm install
npm run dev      # http://localhost:5173
npm test
npm run build    # sitio estático en dist/
```

## Personalizarlo

Todo lo que querrás cambiar está en [`src/config.ts`](src/config.ts): tu nombre, duración y plataforma de la reunión, días y horas, antelación mínima, idioma…

- **Disponibilidad real:** ahora mismo los bloques "ocupado" son de ejemplo. Implementa `AvailabilityProvider` en [`src/lib/availability.ts`](src/lib/availability.ts) para leer tu calendario real.
- **Recibir reservas:** no hay backend. Define `VITE_BOOKING_ENDPOINT` (ver `.env.example`) con una URL que acepte un `POST` JSON (función serverless, Formspree, webhook de n8n o Zapier…).

## Despliegue

Es un sitio estático. El workflow incluido lo publica en **GitHub Pages** en cada push a `main` (actívalo en Settings → Pages → Source: GitHub Actions).

## Licencia

[MIT](LICENSE). Crédito de inspiración de diseño a [@jonsouyang](https://x.com/jonsouyang).
