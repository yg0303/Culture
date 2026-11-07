# CULTURE BARBERSHOP — website

Static website (plain HTML/CSS/JS, no build step). Sukhumvit 89, Bangkok.

## Pages
- `index.html` — Home: scroll-controlled video hero (`media/hero.*`), Standard of Excellence, services & pricing, barbers, gallery, reviews, Reserve a Spot
- `services.html` — Full price menu, signature styles, how a visit works
- `lookbook.html` — Gallery of cuts and the shop (filter + lightbox)
- Booking: every "Book" button goes to Fresha (link in `assets/site.js` → `SHOP.book`, and in each page). Old `/book.html` links redirect to Fresha (see `worker.js`).

## Edit common details
- WhatsApp number, LINE, hours: top of `assets/site.js` (`SHOP`)
- Barber names, photos and specialties: the barber cards in `index.html` (cut-out photos in `img/barber-*.webp`)
- Logo: `assets/c.svg` (the C) + the word "ULTURE" set in Lilita One (`assets/fonts/`)

## Deploy (Cloudflare)
Connected to Cloudflare from GitHub: every push to `main` redeploys.
Framework preset: None · Build command: empty · Output directory: `/`.
`wrangler.jsonc` makes Cloudflare serve this folder as static assets if it's set up as a Worker.

## Live Google reviews
`worker.js` adds `/api/reviews`: the homepage shows the live Google star rating, review count and the latest reviews.
- Google is asked **at most once a day**; the result is saved in Cloudflare KV (`REVIEWS`) and served to every visitor. ~30 Google calls/month vs 1,000 free → no cost.
- Setup once: Cloudflare → Workers & Pages → culture-barbershop → Settings → Variables and Secrets → add **Secret** `GOOGLE_API_KEY`.
- Optional Secret `PLACE_ID` if the shop is ever matched wrongly (the Worker otherwise finds it by name).
- Until the key is set (or if Google is down), the hand-picked reviews already in `index.html` are shown.
