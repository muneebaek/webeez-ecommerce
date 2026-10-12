# Neythra — E-Commerce Store

A full-stack e-commerce store built from the Neythra UI reference for the Webeez web development test.
Customers browse products, add them to a cart or buy instantly, check out with **Cash on Delivery**, get a
confirmation page and email, and every order shows up in the **admin dashboard**.

| | |
|---|---|
| **Live site** | https://webeez-ecommerce.vercel.app |
| **Admin dashboard** | https://webeez-ecommerce.vercel.app/admin |
| **Repository** | https://github.com/muneebaek/webeez-ecommerce |

## Admin access (for evaluation)

| | |
|---|---|
| URL | https://webeez-ecommerce.vercel.app/admin/login |
| Email | `admin@neythra.com` |
| Password | `neythra@123` |

These are test-only credentials for this review.

## Testing the full flow

1. **Home** → open any product from a product grid (or use **Add to Cart** / **Buy Now** / ♡ on the card).
2. **Product page** → pick a size → **Add to Cart** (opens the cart drawer) or **Buy Now** (straight to checkout).
3. **Checkout** → fill in name, email, phone and address → payment is **Cash on Delivery** → **Place Order**.
4. **Confirmation page** shows the order number, items, address and total. A **confirmation email** is sent to the
   email entered (check spam if it doesn't arrive within a minute).
5. **Admin** → log in → the new order is on the dashboard and under **Orders**. Open it to change its status,
   cancel it (stock goes back) or resend the email.
6. Optional: in the admin, change a product's price or stock → the store shows the new value right away.

## Features

**Storefront**
- Home page built from the reference PDF — all sections, responsive from 375px phones to wide desktops.
- Product cards with Add to Cart, Wishlist and Buy Now.
- Product listing (`/products`) with category / collection / price filters, sorting, live search and pagination.
- Product page: photo gallery, name, price, sizes (with size guide), stock warning, description, reviews and similar products.
- Cart drawer + cart page (quantity, remove, free shipping from ₹5,000, otherwise ₹150). Cart and wishlist persist in the browser.
- Checkout with validation; Cash on Delivery.
- Confirmation page and HTML confirmation email.
- Order tracking (`/orders`) by order number + email.
- Reviews with a 1–5 star rating, **only on products the customer bought**: the browser remembers its orders from the
  confirmation page, "Write a review" appears only on those products, and the server checks the order's secret token,
  that it isn't cancelled and that it contains the product (one review per product per order, shown as "✓ Verified buyer").
  The buyer can edit their review later from the same product page.
- Help pages: shipping, returns, size guide, contact, privacy, terms.

**Admin dashboard** (`/admin`, login required)
- Dashboard: orders, revenue, orders to fulfil, products, 7-day orders/revenue chart, to-do list, calendar, recent activity, low-stock list.
- Orders: search (number / name / email / phone), status filter, pagination, order detail, status update, cancel with restock, resend email.
- Products: list with stock filter and search, add / view / edit / delete, photo upload from computer or phone gallery.
- Reviews: each product's page in the admin lists its reviews with a delete option.
- Global search across orders and products; bell with orders to fulfil.

## Tech stack

| Area | Choice |
|---|---|
| Framework | **Next.js 16** (App Router, Server Components, Server Actions, Cache Components) + **React 19** |
| Styling | **Tailwind CSS v4** for layout + custom CSS (parent → child classes) for the design details |
| Database | **PostgreSQL on Neon** with **Prisma 6** (`@prisma/adapter-pg`) |
| Validation | **zod** (every form is validated again on the server) |
| Client state | **zustand** (cart + wishlist, saved in localStorage) |
| Email | **Nodemailer** with Gmail SMTP |
| Admin auth | Signed JWT in an httpOnly cookie (**jose**), checked in `proxy.ts` and again on every admin page and action |
| Hosting | **Vercel** (free tier) |

## How it works

```
Browser ──► Next.js on Vercel ──► Prisma ──► Neon Postgres
             │
             ├─ Server Components read data (lib/data/*)
             ├─ Server Actions handle every form (lib/actions/*)
             └─ Gmail SMTP sends the order email
```

- **Store pages are cached, admin is live.** Product and review reads use `'use cache'` with the tags `products` / `reviews`,
  so store pages load fast. When an order or an admin change affects them, the action calls `updateTag(...)`, and the
  store shows the change on the next view. Admin pages always read live data.
- **The server decides prices.** The cart in the browser only sends product ids, sizes and quantities. `placeOrder`
  loads real prices and stock from the database, then creates the order and lowers stock in **one transaction**
  (stock can't go below zero, even with two customers at once).
- **Email never blocks the order.** The email is sent with `after()` once the customer already sees the confirmation;
  if sending fails the order is still saved, and the admin can resend it.
- **Order snapshots.** Order items store the name, photo and price at the time of purchase, so old orders stay correct
  if a product is edited or deleted later.
- **Privacy.** The confirmation link carries a secret token (`/order/NYT-123456?t=…`), because order numbers are short and
  guessable. Order tracking needs the order number **and** the email, and never say which one was wrong.
- **Admin security.** `proxy.ts` redirects to the login page without a valid session cookie, and every admin page and
  Server Action checks the session again (`requireAdmin()`).

## Project structure

```
app/
  (store)/            storefront: home, products, product page, cart, checkout, order, orders (tracking), wishlist, help
  admin/login/        admin login
  admin/(dash)/       dashboard, orders, products with their reviews (behind login)
  media/[id]/         serves product photos uploaded in the admin
  styles/             custom CSS (base, components, sections, admin)
components/           UI by area: home, product, catalog, cart, checkout, order, admin, layout
lib/
  actions/            Server Actions (order, reviews, tracking, admin orders / products / reviews, admin login)
  data/               database reads (cached store reads, live admin reads)
  email/              order email template + sending
  auth/               admin session (sign / verify cookie)
  db.ts               Prisma client
store/                zustand stores (cart, wishlist, this browser's orders for reviews)
prisma/               schema, migrations, seed
proxy.ts              protects /admin
```

## Running locally

Requirements: Node.js 20+, a PostgreSQL database (a free [Neon](https://neon.tech) project works) and, for emails,
a Gmail account with an [App Password](https://myaccount.google.com/apppasswords).

```bash
git clone https://github.com/muneebaek/webeez-ecommerce.git
cd webeez-ecommerce
npm install                   # also runs `prisma generate`

cp .env.example .env          # then fill in the values (see below)

npx prisma migrate deploy     # create the tables
npm run db:seed               # add the 18 products and sample reviews

npm run dev                   # http://localhost:3000  (admin: /admin)
```

### Environment variables

| Name | What it's for |
|---|---|
| `DATABASE_URL` | Postgres connection used by the app (Neon pooled URL) |
| `DIRECT_URL` | Direct Postgres connection used by Prisma migrations |
| `SMTP_USER`, `SMTP_PASS` | Gmail address + App Password for the order email (leave empty to skip emails) |
| `MAIL_FROM` | Sender shown in the email, e.g. `Neythra <you@gmail.com>` |
| `NEXT_PUBLIC_SITE_URL` | Public URL of the site, used for links and images in the email |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Admin dashboard login |
| `AUTH_SECRET` | Long random string that signs the admin session cookie |

### Scripts

| Command | |
|---|---|
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build / run it |
| `npm run lint` | ESLint |
| `npm run db:seed` | Seed products and reviews |
| `npm run db:studio` | Prisma Studio (browse the database) |

## Deployment (Vercel)

1. Import the GitHub repository in Vercel (framework: Next.js).
2. Add all the environment variables above. Set `NEXT_PUBLIC_SITE_URL` to the production domain, e.g. `https://webeez-ecommerce.vercel.app`.
3. Deploy. `npm install` runs `prisma generate`; run `npx prisma migrate deploy` against the database once before the first deploy.

Every push to `main` deploys automatically.
