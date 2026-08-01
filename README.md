# Kribb

A cross-platform real-estate listing app built with [Expo](https://expo.dev), [Expo Router](https://docs.expo.dev/router/introduction/), [Clerk](https://clerk.com) authentication, and a [Supabase](https://supabase.com) backend. Browse, search, filter, list, and manage property listings on iOS, Android, and web.

## Features

- **Authentication** — email/password sign-in and sign-up via Clerk, with sessions persisted through `expo-secure-store`.
- **Home feed** — featured and recommended property listings pulled from Supabase.
- **Search & filters** — debounced text search plus filters for type, bedrooms, and price range (`components/FilterModal.tsx`, `store/filterStore.ts`).
- **Property details** — full listing view with an image gallery, and a map screen (OpenStreetMap embed + a "open in Google Maps" shortcut).
- **Create & edit listings** — a shared property form (`components/PropertyForm.tsx`) used for both creating and editing listings, including image picking via `expo-image-picker` and location tagging via `expo-location`.
- **Saved properties** — bookmark listings for later (`hooks/useSavedProperty.ts`).
- **Profile** — signed-in user info and account actions.
- **Toast notifications** — lightweight global toasts (`store/toastStore.ts`, `components/Toast.tsx`).
- **Styling** — [NativeWind](https://www.nativewind.dev) (Tailwind for React Native).

## Tech stack

| Layer          | Choice                                             |
| -------------- | --------------------------------------------------- |
| Framework      | Expo SDK 54, React Native 0.81, React 19            |
| Routing        | Expo Router (file-based, typed routes)               |
| Auth           | Clerk (`@clerk/expo`)                                |
| Database       | Supabase (Postgres + Row Level Security)             |
| Client state   | Zustand                                              |
| Styling        | NativeWind / Tailwind CSS                            |
| Maps           | `react-native-webview` + OpenStreetMap, Google Maps deep link |

See [docs/clerk-supabase-zustand.md](docs/clerk-supabase-zustand.md) for a deep dive into how Clerk, Supabase, and Zustand are wired together.

## Prerequisites

- [Node.js](https://nodejs.org/) 20+
- npm (comes with Node)
- The [Expo Go](https://expo.dev/go) app on your phone, or an iOS/Android simulator, for running the app
- A [Clerk](https://clerk.com) application (for the publishable/secret key)
- A [Supabase](https://supabase.com) project (for the URL/anon key), with Clerk configured as a third-party JWT issuer if you want RLS policies keyed off the Clerk session

## Getting started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment variables**

   Create a `.env.local` file in the project root:

   ```
   EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=
   CLERK_SECRET_KEY=
   EXPO_PUBLIC_SUPABASE_URL=
   EXPO_PUBLIC_SUPABASE_KEY=
   ```

   All client-readable variables must be prefixed `EXPO_PUBLIC_` — Expo inlines these at build time. This file is git-ignored and should never be committed.

3. **Start the dev server**

   ```bash
   npm start
   ```

   From the Expo CLI output you can open the app in:

   - a [development build](https://docs.expo.dev/develop/development-builds/introduction/)
   - an Android emulator (`npm run android`)
   - an iOS simulator (`npm run ios`)
   - a web browser (`npm run web`)
   - [Expo Go](https://expo.dev/go), for quick testing in a limited sandbox

## Available scripts

| Script                | Description                                   |
| --------------------- | ---------------------------------------------- |
| `npm start`           | Start the Expo dev server                       |
| `npm run android`     | Start the dev server and open on Android        |
| `npm run ios`         | Start the dev server and open on iOS            |
| `npm run web`         | Start the dev server and open in a web browser  |
| `npm run lint`        | Run ESLint (`expo lint`)                        |
| `npm run format`      | Format the codebase with Prettier               |
| `npm run reset-project` | Move the starter code aside and scaffold a blank `app/` directory |

## Project structure

```
app/                      Expo Router routes (file-based routing)
  (auth)/                 Sign-in / sign-up screens
  (root)/
    (tabs)/                Home, search, create, saved, profile tabs
    property/              Property detail, edit, and map screens
components/               Reusable UI (property cards, forms, filters, toast)
hooks/                    Custom hooks (Supabase client, debounce, saved properties, user sync)
lib/                      Supabase client setup, shared utilities
store/                    Zustand stores (filters, toasts, user)
types/                    Shared TypeScript types
docs/                     Architecture notes
```

## Notes

- This project targets **Expo SDK 54** — when adding new Expo APIs, check the [versioned docs](https://docs.expo.dev/versions/v54.0.0/) rather than the latest docs, since APIs can change between SDK versions.
- New Architecture (`newArchEnabled`) and the React Compiler are both enabled (see `app.json`).

## Learn more

- [Expo documentation](https://docs.expo.dev/)
- [Expo Router documentation](https://docs.expo.dev/router/introduction/)
- [Clerk + Expo documentation](https://clerk.com/docs/quickstarts/expo)
- [Supabase documentation](https://supabase.com/docs)
