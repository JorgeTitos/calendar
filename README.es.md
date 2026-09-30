# Madrid Booking Calendar

Un calendario de reservas donde **el cielo de Madrid cambia según la hora que eliges**. Recorre el día y verás amanecer, un mediodía azul, un atardecer naranja tras las Cuatro Torres y una noche estrellada con las ventanas encendidas.

Inspirado en [un diseño de @jonsouyang](https://x.com/jonsouyang/status/2105001165960466617). Es una versión independiente, hecha desde cero y de código abierto: la misma idea, pero con Madrid, y con una foto real.

[English](README.md)

## Qué lo hace especial

- **Una foto real** de las Cuatro Torres de Madrid (ver [Créditos](#créditos)), no una ilustración. La luz cambia con la posición real del sol: a las 20:00 se calienta y a las 23:30 es de noche.
- **El sol se mueve por la foto** y se pone *detrás de los edificios reales*: el skyline está trazado como máscara, así que sol, luna y estrellas quedan ocultos tras las torres y los tejados.
- **La noche sobre la misma foto**: baja la exposición, se aplica un tinte (naranja al atardecer, azul de noche), salen estrellas y luna y se encienden las plantas de las torres.
- **Sin líos de zona horaria**: todo se calcula en hora de Madrid (con cambio horario), estés donde estés.
- **Fluido**, **bilingüe** (español / inglés) y **ligero**: React + Vite + TypeScript, sin librerías de UI ni de fechas.

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
- **Recibir reservas:** no hay backend. Define `VITE_BOOKING_ENDPOINT` (ver `.env.example`) con una URL **https** que acepte un `POST` JSON (función serverless, Formspree, webhook de n8n o Zapier…).

> **Ojo:** es un sitio estático, así que las variables `VITE_*` acaban en el JavaScript público. Nunca metas un secreto en esa URL y valida en el servidor que recibe los datos. Ver [SECURITY.md](SECURITY.md).
>
> **Limitaciones:** la disponibilidad es de ejemplo hasta que conectes tu calendario; las reservas no llegan a ningún sitio hasta que definas un endpoint; la foto es una sola, de un día nublado, con la luz simulada.

## Despliegue

Es un sitio estático. El workflow incluido lo publica en **GitHub Pages** cuando lo lanzas desde la pestaña Actions (actívalo antes en Settings → Pages → Source: GitHub Actions). El build de producción incluye una Content-Security-Policy estricta.

## Licencia

[MIT](LICENSE) para el código. Crédito de inspiración de diseño a [@jonsouyang](https://x.com/jonsouyang).

## Créditos

Foto: [*Torres de Madrid*](https://commons.wikimedia.org/wiki/File:Torres_de_Madrid.JPG), de Archivaldo, Wikimedia Commons, dominio público. Solo está recortada y redimensionada; toda la iluminación se aplica en vivo en el navegador.
