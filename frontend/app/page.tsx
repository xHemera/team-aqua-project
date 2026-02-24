interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

export default async function Home() {
  let users: User[] = [];
  let error: string | null = null;

  try {
    const response = await fetch('http://backend:4000/api/users', {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch users`);
    }

    users = await response.json();
  } catch (e) {
    error = e instanceof Error ? e.message : 'Unknown error';
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center -mt-16">
      <h1 className="text-4xl font-bold mb-8 font-[family-name:var(--font-geist-sans)] text-[#333333]">
        Superblog
      </h1>
      {error && <p className="text-red-500 mb-4">Error: {error}</p>}
      {users.length > 0 ? (
        <ol className="list-decimal list-inside font-[family-name:var(--font-geist-sans)]">
          {users.map((user) => (
            <li key={user.id} className="mb-2">
              {user.username} ({user.email})
            </li>
          ))}
        </ol>
      ) : (
        !error && <p className="text-gray-500">No users found</p>
      )}
    </div>
  );
}
