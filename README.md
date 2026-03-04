# kwek²

A flashcard and multiple-choice quiz app for studying — built with Next.js 16 and Tailwind CSS v4.

Named after *kwek kwek*, the Filipino street food of battered quail eggs. Kwek is kind of like "quick" which could mean like a "flash," a "kwek" card?!

**Live:** https://kwek-app.vercel.app

## Features

- **Flashcard mode** — 3D flip animation, Easy/Hard confidence rating, shuffle, category filter
- **Quiz mode** — Multiple-choice with instant feedback, explanations, and score summary
- **Custom decks** — Create your own decks with plain-text cards; optionally add MC quiz options per card
- **Built-in deck** — 23-card Java/Spring/JPA/DevSecOps/CS Fundamentals deck ready to go
- **localStorage persistence** — Progress, confidence ratings, and custom decks survive refresh
- **Keyboard shortcuts** — Space to flip, arrow keys to navigate

## Running locally

```bash
git clone https://github.com/nichoblina/kwek-app.git
cd kwek
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Tech stack

- [Next.js 16](https://nextjs.org/) (App Router, TypeScript)
- [Tailwind CSS v4](https://tailwindcss.com/) with `@theme inline` design tokens
- [Paytone One](https://fonts.google.com/specimen/Paytone+One) + [Outfit](https://fonts.google.com/specimen/Outfit) + [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono) via `next/font/google`
- localStorage for persistence (no backend required)
