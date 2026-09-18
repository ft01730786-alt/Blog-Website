# Faisal Dev — Local-First Developer Blog

A premium personal developer blog/portfolio built with React + TypeScript + Vite.

## Run

```bash
npm install
npm run dev
```

Then open the local URL shown by Vite.

## Production build

```bash
npm run build
npm run preview
```

## Storage

- Articles, projects, labs, skills, journey, achievements and settings use `localStorage`.
- Uploaded media uses IndexedDB.
- No external database or paid API is required.

## Admin

There is no public admin link. Tap/click the site logo 5 times quickly to reveal the admin login.

On first access, create local admin credentials. The password is never intentionally stored as plaintext; verification material is derived with the browser Web Crypto API.

This is **not server-side authentication**. A browser-only application cannot provide a true security boundary against someone who controls the browser/application files.

## Backup

Use Admin → Backup to export/import your local content as JSON. Media backup is kept simple in this starter build; large media should remain in IndexedDB.

## Notes

This is a complete working starter implementation designed to be extended with more CMS fields and richer media management.
