/*
 * CULTURE BARBERSHOP — site Worker
 *
 * Serves the static site as before, plus one extra route:
 *   GET /api/reviews  →  live Google rating, review count and up to 5 reviews
 *   GET /book.html    →  redirects to the Fresha booking page
 *
 * Staying free: Google is asked at most once a day. The answer is saved in
 * Cloudflare KV (free tier) and every visitor is served that saved copy.
 * That's about 30 Google calls a month, against 1,000 free ones.
 *
 * Setup (once): in Cloudflare → Workers → culture-barbershop → Settings →
 * Variables and Secrets, add a Secret named GOOGLE_API_KEY.
 * Optional Secret PLACE_ID if the shop is ever matched wrongly; otherwise the
 * Worker finds the shop by name (that lookup is free and is saved too).
 */

const REFRESH_EVERY = 24 * 60 * 60 * 1000;       // 1 day
const RETRY_AFTER_ERROR = 60 * 60 * 1000;        // if Google fails, wait 1 hour before trying again
const SEARCH_TEXT = 'CULTURE BARBERSHOP Sukhumvit 89 Bangkok';
const KEY_DATA = 'reviews:v1';
const KEY_PLACE = 'place_id';
const KEY_LOCK = 'reviews:last_attempt';
const FRESHA = 'https://www.fresha.com/a/culture-barbershop-sukhumvit-89-bangkok-2249-sukhumvit-89-alley-f60gp0az/booking?pId=3025168';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === '/api/reviews') return reviews(env, ctx);
    // the old on-site booking page now sends people straight to Fresha
    if (url.pathname === '/book' || url.pathname === '/book.html') return Response.redirect(FRESHA, 302);
    return env.ASSETS.fetch(request);
  },
};

async function reviews(env, ctx) {
  if (!env.GOOGLE_API_KEY || !env.REVIEWS) {
    return json({ ok: false, error: 'not-configured' }, 503, 60);
  }

  const saved = await env.REVIEWS.get(KEY_DATA, 'json');
  const fresh = saved && Date.now() - saved.fetchedAt < REFRESH_EVERY;

  if (fresh) return json(saved, 200, 3600);

  if (saved) {
    // Out of date: show the saved copy now, update it in the background.
    ctx.waitUntil(refresh(env).catch(() => {}));
    return json(saved, 200, 300);
  }

  // Very first visit ever: nothing saved yet, so fetch now.
  try {
    return json(await refresh(env), 200, 3600);
  } catch (e) {
    return json({ ok: false, error: String(e.message || e) }, 502, 60);
  }
}

async function refresh(env) {
  // Simple guard so a burst of visitors doesn't trigger a burst of Google calls.
  const last = Number(await env.REVIEWS.get(KEY_LOCK)) || 0;
  const saved = await env.REVIEWS.get(KEY_DATA, 'json');
  const wait = saved ? RETRY_AFTER_ERROR : 60 * 1000;
  if (Date.now() - last < wait && saved) return saved;
  await env.REVIEWS.put(KEY_LOCK, String(Date.now()));

  const placeId = await getPlaceId(env);
  const res = await fetch(
    `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?languageCode=en`,
    {
      headers: {
        'X-Goog-Api-Key': env.GOOGLE_API_KEY,
        'X-Goog-FieldMask': 'displayName,rating,userRatingCount,reviews,googleMapsUri',
      },
    }
  );
  if (!res.ok) throw new Error(`google ${res.status}`);
  const p = await res.json();

  const data = {
    ok: true,
    fetchedAt: Date.now(),
    name: p.displayName?.text || '',
    rating: p.rating ?? null,
    total: p.userRatingCount ?? null,
    mapsUrl: p.googleMapsUri || '',
    reviews: (p.reviews || []).map((r) => ({
      name: r.authorAttribution?.displayName || 'Google user',
      profile: r.authorAttribution?.uri || '',
      photo: r.authorAttribution?.photoUri || '',
      stars: r.rating || 5,
      text: r.text?.text || r.originalText?.text || '',
      when: r.relativePublishTimeDescription || '',
      link: r.googleMapsUri || '',
    })),
  };

  await env.REVIEWS.put(KEY_DATA, JSON.stringify(data));
  return data;
}

async function getPlaceId(env) {
  if (env.PLACE_ID) return env.PLACE_ID;
  const known = await env.REVIEWS.get(KEY_PLACE);
  if (known) return known;

  // Asking only for the ID keeps this lookup in Google's free "IDs only" tier.
  const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': env.GOOGLE_API_KEY,
      'X-Goog-FieldMask': 'places.id',
    },
    body: JSON.stringify({ textQuery: SEARCH_TEXT, maxResultCount: 1 }),
  });
  if (!res.ok) throw new Error(`google search ${res.status}`);
  const id = (await res.json()).places?.[0]?.id;
  if (!id) throw new Error('shop not found on Google');
  await env.REVIEWS.put(KEY_PLACE, id);
  return id;
}

function json(body, status, maxAge) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': `public, max-age=${maxAge}`,
    },
  });
}
