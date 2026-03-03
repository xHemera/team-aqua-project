export async function GET() {
  try {
    const response = await fetch('http://websockets:4000/api/users', {
      cache: 'no-store',
    });

    if (!response.ok) {
      return Response.json(
        { error: 'Failed to fetch users' },
        { status: response.status }
      );
    }

    const users = await response.json();
    return Response.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
