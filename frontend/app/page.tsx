export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col justify-center gap-6 px-6">
      <h1 className="text-3xl font-semibold">Team Aqua Project</h1>
      <p className="text-zinc-600 dark:text-zinc-300">
        Frontend minimal avec Better Auth et page de connexion.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <a
          href="/login"
          className="rounded border px-4 py-2 text-center"
        >
          Aller à la connexion
        </a>
        <a
          href="http://localhost:4001/health"
          className="rounded border px-4 py-2 text-center"
        >
          Backend health
        </a>
        <a
          href="http://localhost:5432"
          className="rounded border px-4 py-2 text-center"
        >
          DB (port 5432)
        </a>
      </div>
      <p className="text-sm text-zinc-500">Stack Docker: frontend, backend, db, game-engine.</p>
    </main>
  );
}
