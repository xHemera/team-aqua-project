# Hooks — patterns courants

## useState / useEffect

Pattern standard côté client :

```tsx
'use client';
const [count, setCount] = useState(0);

useEffect(() => {
  document.title = `Count: ${count}`;
}, [count]); // se relance quand count change

useEffect(() => {
  // une fois au montage
  fetchData();
  return () => cleanup(); // au démontage
}, []);
```

## Socket.IO

Toujours cleanup les listeners :

```tsx
useEffect(() => {
  socket.on("event", handler);
  return () => socket.off("event", handler);
}, []);
```

Pattern utilisé dans la game page :

```tsx
useEffect(() => {
  if (!socket.connected) socket.connect();
  socket.emit("login", userPseudo);

  return () => { socket.off("online_users"); };
}, [userPseudo]);
```

## Auth

```tsx
const { data: session } = await authClient.getSession();
if (session?.user) setUser(session.user.name);
```

## API calls

```tsx
const res = await fetch(`/api/user?pseudo=${name}`);
const data = await res.json();
```

## Race conditions

Attention : ne pas setState après un démontage.

```tsx
useEffect(() => {
  let cancelled = false;
  fetchData().then(data => {
    if (!cancelled) setData(data);
  });
  return () => { cancelled = true; };
}, []);
```

## localStorage

Pour éviter les erreurs SSR, wrap dans try/catch :

```tsx
useEffect(() => {
  try {
    const saved = localStorage.getItem("key");
    if (saved) setValue(JSON.parse(saved));
  } catch {}
}, []);
```

## Custom hooks existants

- `useAvatarPreference` — préférence d'avatar
- `useDeckPreferences` — préférence d'équipe
- `useHoveredItem` — survol d'élément
