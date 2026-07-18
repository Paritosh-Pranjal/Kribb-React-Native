# Clerk + Supabase + Zustand Integration

How authentication (Clerk), data (Supabase), and client state (Zustand) are
wired together in this app.

## Overview

```
ClerkProvider (app/_layout.tsx)
   └─ useAuth() / useUser()
        └─ useSupabase()            lib/supabase.ts, hooks/useSupabase.ts
             └─ useUserSync()       hooks/useUserSync.ts
                  └─ useUserStore   store/userStore.ts
```

1. **Clerk** authenticates the user and issues a session token.
2. **Supabase** is called with that Clerk token attached, so Row Level
   Security (RLS) policies can key off the signed-in Clerk user.
3. On sign-in, the Clerk user is synced into a `users` table in Supabase
   (creating the row if it doesn't exist).
4. Derived state from that sync (e.g. `isAdmin`) is cached in a **Zustand**
   store so any component can read it without re-querying Supabase.

## Environment variables

Set in `.env.local` (not committed):

```
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_KEY=
```

All three must be prefixed `EXPO_PUBLIC_` to be readable on the client at
runtime (Expo inlines these at build time).

## Clerk setup — `app/_layout.tsx`

The root layout wraps the whole app in `ClerkProvider`, using
`@clerk/expo/token-cache` so sessions persist across app restarts (backed by
`expo-secure-store`).

```tsx
<ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
  <Slot />
</ClerkProvider>
```

`app/(root)/_layout.tsx` gates the authenticated part of the app:

```tsx
const { isSignedIn, isLoaded } = useAuth();
useUserSync();

if (!isLoaded) return null;
if (!isSignedIn) return <Redirect href="/(auth)/sign-in" />;

return <Slot />;
```

## Supabase client — `lib/supabase.ts`

Two clients are exported:

- `supabase` — a plain client for unauthenticated/public access.
- `createClerkSupabaseClient(getToken)` — a client whose `accessToken()`
  hook pulls the current Clerk session token on every request. This is how
  Supabase RLS policies can check `auth.jwt()` claims against the signed-in
  Clerk user, without Supabase's own auth system.

```ts
export function createClerkSupabaseClient(getToken: () => Promise<string | null>) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    async accessToken() {
      return getToken();
    },
  });
}
```

> Supabase must be configured to accept Clerk as a third-party auth
> provider (Supabase dashboard → Authentication → add Clerk as a JWT
> issuer) for RLS policies referencing the Clerk JWT to work.

## Bridging Clerk → Supabase — `hooks/useSupabase.ts`

A thin hook that memoizes an authenticated Supabase client using Clerk's
`getToken`:

```ts
export function useSupabase() {
  const { getToken } = useAuth();
  return useMemo(() => createClerkSupabaseClient(() => getToken()), [getToken]);
}
```

Use this hook (not the raw `supabase` export) anywhere you need to read or
write data that's subject to RLS tied to the signed-in user.

## Syncing the user — `hooks/useUserSync.ts`

Runs once per signed-in user (`useEffect` keyed on `user`):

1. Looks up the Clerk user by `clerk_id` in the Supabase `users` table.
2. If found, syncs `is_admin` into the Zustand store.
3. If not found, inserts a new row (`clerk_id`, `email`, `first_name`,
   `last_name`, `avatar_url` from the Clerk user object) and seeds
   `is_admin` from the insert result.

This hook is invoked once in `app/(root)/_layout.tsx`, so the sync happens
as soon as the user lands inside the authenticated app shell.

## Client state — `store/userStore.ts`

A minimal Zustand store holding state derived from the Supabase sync:

```ts
interface UserStore {
  isAdmin: boolean;
  setIsAdmin: (isAdmin: boolean) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  isAdmin: false,
  setIsAdmin: (value) => set({ isAdmin: value }),
}));
```

Any component can read `isAdmin` directly without touching Supabase or
Clerk:

```ts
const isAdmin = useUserStore((state) => state.isAdmin);
```

## Adding a new synced field

1. Add the column to the Supabase `users` table.
2. Add it to `UserStore` in `store/userStore.ts` plus a setter.
3. Read/write it in `hooks/useUserSync.ts`'s `syncUser()` (both the
   existing-user `select` and the new-user `insert`).

## Adding a new authenticated Supabase query elsewhere

```ts
const supabase = useSupabase();
const { data, error } = await supabase.from("some_table").select("*");
```

Don't import the plain `supabase` client from `lib/supabase.ts` for
user-scoped data — it has no Clerk token attached and RLS will reject or
silently return nothing.
