# CULTURE BARBERSHOP — website

Static website (plain HTML/CSS/JS, no build step). Sukhumvit 89, Bangkok.

## Pages
- `index.html` — Home: scroll-controlled video hero (`media/hero.*`), Standard of Excellence, services & pricing, barbers, gallery, reviews, Reserve a Spot
- `services.html` — Full price menu, signature styles, how a visit works
- `lookbook.html` — Gallery of cuts and the shop (filter + lightbox)
- `book.html` — Booking: service, barber, date, time → opens WhatsApp with the booking written out

## Edit common details
- WhatsApp number, LINE, hours: top of `assets/site.js` (`SHOP`)
- Barber names: `BARBERS` in `assets/site.js` and the barber cards in each page

## Deploy (Cloudflare)
Connected to Cloudflare from GitHub: every push to `main` redeploys.
Framework preset: None · Build command: empty · Output directory: `/`.
`wrangler.jsonc` makes Cloudflare serve this folder as static assets if it's set up as a Worker.
