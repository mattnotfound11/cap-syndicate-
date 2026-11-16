# Cap Syndicate website

The official site for Cap Syndicate, a cap and streetwear shop in Iloilo City. **Built for the Streets.**

Plain HTML, CSS and JavaScript. No frameworks, no build step, nothing to install. Open a file, edit it, save, upload.

## Files

```
frontend/
├── index.html        Home: hero, Cap of the Week, new arrivals, weekly deal, categories, fit check, sign-up
├── products.html     Shop: search, filters, sort, product details, order list, services
├── deals.html        Weekly deals, promo code, drop countdown, drop calendar, Syndicate Member card
├── tips.html         5 articles, cap size guide, Fit Check Wall
├── about.html        Story, logo meaning, crew, milestones, map
├── contact.html      Contact form, Messenger/IG buttons, details, map, FAQ
├── privacy.html      Privacy Policy (RA 10173)
├── terms.html        Terms of Use + Return & Exchange Policy (RA 7394, RA 11967, RA 8293)
├── 404.html          "Page not found"
├── robots.txt, sitemap.xml
├── css/style.css     All styling. Brand colors are at the top in :root
├── js/products.js    ALL editable content: settings, deals, categories, products
├── js/main.js        Site behavior (you don't need to touch this)
└── images/
    ├── logo.png                 Original logo (black background)
    ├── logo-wordmark.png        Transparent logo for header/footer
    ├── logo-wordmark-lg.png     Transparent logo, large (hero, About)
    ├── favicon.png, apple-touch-icon.png, og-image.jpg
    ├── products/   put product photos here
    ├── crew/       put crew photos here
    └── fit-check/  put customer fit photos here (with their permission)
```

## Preview it on your computer

Double-click `index.html` to open it in a browser. Most things work that way. For the map and everything else to behave exactly like the live site, run a tiny local server from this folder:

```bash
cd frontend
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Editing content

Almost everything lives in **`js/products.js`**. Anything in `[SQUARE BRACKETS]` is a placeholder.

### Contact details, socials, map
At the top of `js/products.js`, in `SHOP_SETTINGS`:

```js
address: "[ADD ADDRESS HERE], Iloilo City, Philippines",
hours:   "[ADD STORE HOURS HERE]",
phone:   "[ADD PHONE NUMBER HERE]",
email:   "[ADD EMAIL HERE]",
mapQuery: "Iloilo City, Philippines",   // put your exact address here for the map
```

These fill the Contact, About, Shop and legal pages automatically. Once `email` is a real address, "Email order", the contact form and the sign-up form all send to it.

If you give your Facebook page a username, change `messengerUrl` to `https://m.me/yourusername`.

### Products
Each product is one `{ ... }` block in `PRODUCTS`. Copy one, paste it, change the values:

```js
{
  id: "cs-019",                       // unique, no spaces
  name: "Midnight Snapback",
  category: "snapback",               // snapback, fitted, dad-cap, bucket, shirt, hoodie, accessory
  price: 750,                         // pesos, numbers only
  salePrice: null,                    // or a number like 650 to show a sale
  sizes: ["One size / adjustable"],   // or ["7", "7 1/8", "7 1/4"] or ["S", "M", "L"]
  stock: "in",                        // "in", "low" or "out"
  isNew: true,
  added: "2026-11-20",                // newest items show first and in New Arrivals
  images: ["images/products/midnight-1.jpg", "images/products/midnight-2.jpg"],
  color: "#151515", accent: "#B3121B",// only used when there are no photos yet
  description: "Two or three short lines about the cap."
}
```

**Photos:** save them as `.jpg` or `.webp` in `images/products/`, around 800 × 1000 px (4:5, portrait), under 200 KB each. Free compressor: https://squoosh.app. While `images` is `[]`, the site draws a neutral placeholder.

When the real catalog is in, set `showSampleNotice: false` to hide the yellow "sample catalog" note on the Shop page.

### Cap of the Week
In `SHOP_SETTINGS.capOfTheWeek`, set `productId` to a product's `id` and write a short `story`.

### Weekly deal, promo code and countdown
In `SHOP_SETTINGS.weeklyDeal`:

```js
title: "10% off all caps",
description: "Use the code when you message your order...",
code: "SYNDICATE10",      // change every week
endsAt: ""                // "" = auto-ends every Sunday 11:59 PM PH time
                          // or a date: "2026-11-29T23:59:00+08:00"
```

The code shows in the top bar, on Home and on Deals, with a copy button.

### Next drop countdown
In `SHOP_SETTINGS.nextDrop`, set `name`, `description` and `date`. Leave `date: ""` and it counts down to next Friday 8:00 PM PH time. Always include `+08:00` in dates.

### Promo cards, past deals, drop calendar
In `DEALS`:
- `thisWeek`: the promo cards. `style: "hot"` makes one red. `icon` can be `tag`, `gift` or `users`.
- `past`: old deals, shown with an ENDED stamp.
- `calendar`: upcoming dates (`YYYY-MM-DD`). Past dates hide themselves.

### Crew, story, timeline, fit check photos
These are in the HTML files. Search for `[ADD` or `[EDIT` in `about.html`, `tips.html` and `index.html`. To show a photo, replace a placeholder slot with an image, for example:

```html
<div class="fit-slot"><img src="images/fit-check/fit-01.jpg" alt="Customer wearing the Red Light Snapback" loading="lazy"></div>
<div class="crew-photo"><img src="images/crew/founder.jpg" alt="[Nickname], founder of Cap Syndicate" loading="lazy"></div>
```

Only post customer photos you have permission to use, and don't add reviews or testimonials that customers didn't actually give.

### Colors and fonts
Brand colors are CSS variables at the top of `css/style.css` (`--black`, `--red`, `--red-deep`, `--white`, `--gray`). Change them there and the whole site updates. Fonts are Anton (headlines), Poppins (text) and Permanent Marker (small accents), loaded from Google Fonts in each page's `<head>`.

## Forms (contact + drop alerts)

There's no server, so by default:
- the **contact form** opens the visitor's email app with the message ready (once `email` is set), or copies it for Messenger;
- the **sign-up form** opens an email to you with their address.

To receive submissions directly instead, create a free form at https://formspree.io, copy the endpoint (like `https://formspree.io/f/abcdwxyz`) and paste it into `SHOP_SETTINGS.formEndpoint`. Both forms will post there and show a real success message.

## Orders

The site doesn't take payments. Visitors build an **order list** (saved in their own browser), then tap **Send order via Messenger** or **Email order**. The order is written out for them (and copied, in case Messenger doesn't pre-fill it). You confirm stock, shipping and payment in chat.

## Going live for free

Pick one. All three are free for a site like this.

**Netlify (easiest):** go to https://app.netlify.com/drop and drag the `frontend` folder onto the page. Done. To update, drag it again, or connect the GitHub repo and set **Base directory** to `frontend`.

**Vercel:** import the GitHub repo at https://vercel.com/new, set **Root Directory** to `frontend`, framework preset **Other**, then Deploy.

**GitHub Pages:** Pages only serves the repo root or a `/docs` folder. Either copy the contents of `frontend/` into a separate repo and enable Pages on `main` / root, or set Pages to **GitHub Actions** and use the "Static HTML" starter workflow with `path: frontend`.

### After you have a domain
Search the HTML files, `robots.txt` and `sitemap.xml` for `https://capsyndicate.com/` and replace it with your real address (it's used for search engines and link previews). Then submit `sitemap.xml` in Google Search Console.

## Before launch checklist

- [ ] Real contact details in `SHOP_SETTINGS` (address, hours, phone, email)
- [ ] Real products, prices, sizes and photos; `showSampleNotice: false`
- [ ] This week's promo code and deal text; next drop name and date
- [ ] Story, crew nicknames and photos, timeline dates (`about.html`)
- [ ] Courier, payment methods, return days, bulk minimums (`contact.html` FAQ, `terms.html`)
- [ ] Business name/registration, DPO contact and retention periods (`privacy.html`, `terms.html`)
- [ ] Have the Privacy Policy and Terms reviewed (they're templates, not legal advice)
- [ ] Replace `https://capsyndicate.com/` with your domain
- [ ] Only if you add analytics: set `usesTracking: true` to turn on the cookie consent banner
