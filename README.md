# Weather — Ajker Akash

**Live demo:** https://weather-app-nine-red-79.vercel.app

A small weather dashboard built with **Next.js 15**, **React 19**, **TypeScript**, and **Tailwind CSS**. Search any city and see live weather with a sky that changes with the actual conditions — data from [Open-Meteo](https://open-meteo.com) (free, no API key needed).

## Features

- Live current weather: temperature, feels-like, humidity, wind, pressure
- Dynamic sky gradient that matches the real weather (clear / cloudy / rain / night)
- City search with autocomplete (Open-Meteo geocoding)
- 5-day forecast strip
- Server-side rendering with 10-minute revalidation
- Fully responsive, mobile-first

## Tech stack

- Next.js 15 (App Router, Server Components)
- React 19 + TypeScript (strict)
- Tailwind CSS 3
- Open-Meteo API

## Getting started

Requires Node.js 18+.

```bash
npm install
npm run dev
```

Open http://localhost:3000 — defaults to Dhaka.

## How it works

- `src/lib/weather.ts` — Open-Meteo API helpers, WMO code mapping, sky gradients
- `src/app/page.tsx` — server component, fetches weather with `?lat=&lon=&name=` params
- `src/components/SearchBox.tsx` — client-side city search with debounced suggestions
