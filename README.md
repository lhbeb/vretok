# Vretok

Independent website starter using the existing storefront architecture. Brand references, metadata, domains, email addresses, browser storage keys, logo and icons use Vretok.

## Local setup

1. Run `npm ci`.
2. Copy `.env.example` to `.env.local` and supply this website's own database, payment, email and other service settings.
3. Run `npm run dev`.

The assumed domain is `vretok.com`; update it before launch if different. Email addresses on that domain are placeholders until configured. No production environment files or deployment linkage were copied. This folder has no upstream Git remote.

The layout, colors, catalog assets and storefront features are retained. Review inherited product photos (which may contain photographed branding), catalog content, business address, phone, policies, social links and third-party integrations before launch. Database catalog records were not copied. Configure a separate database using the schema/scripts in this project; never use another store's credentials for imports.

## Activewear brand direction

Vretok is a performance leggings and gym-fashion brand. The storefront copy, collection filters, FAQs, search categories, metadata, checkout messages, and email text are prepared for activewear. Product records have not been imported or relabeled; add the actual Vretok catalog to a dedicated database. Old copied product assets remain unused starter files and are not a published activewear catalog.

Contact channels are optional settings in `.env.example` and remain hidden until confirmed. Confirm shipping terms, returns, business details and service integrations before launch. Existing store verification and Meta Pixel identifiers have been removed. Payment and order architecture is retained.
