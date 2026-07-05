# Bazaar Cards Template

Bazaar Cards is now structured like Mizar Premium.

## Main files

- `pages/Home.tsx` controls the storefront homepage.
- `components/PageShell.tsx` controls the header, footer, language switch, cart count, wishlist count, customer session and favicon sync.
- `components/helpers.ts` contains shared template helpers and data readers.
- `components/ProductCard.tsx` controls product card UI.
- `data/normalize-runtime-data.ts` normalizes the public storefront API response before rendering the template.
- `styles.module.css` controls all template styling and color tokens.

## Pages included

- Home
- Products
- Product details
- Cart
- Checkout
- Wishlist
- Account
- Login
- Register
- About
- Contact
- Blog list
- Blog post
- Order success

## Editing colors

Edit CSS variables at the top of `styles.module.css`.

## Adding homepage sections

Add the section to `pages/Home.tsx`, then use helpers from `components/helpers.ts` to read normalized data.
