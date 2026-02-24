export async function GET() {
  try {
    // Call the backend API to get users
    const response = await fetch('http://localhost:3001/api/users', {
      cache: 'no-store',
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }
    
    const users = await response.json();
    return Response.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return Response.json([], { status: 500 });
  }
}
