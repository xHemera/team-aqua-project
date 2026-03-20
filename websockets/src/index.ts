const port = Number(process.env.PORT || 4001);

type User = {
	id: string;
	name: string;
};

const users: User[] = [
	{ id: "1", name: "SunMiaou" },
	{ id: "2", name: "Xoco" },
	{ id: "3", name: "Sauralt" },
];

const json = (data: unknown, status = 200) =>
	new Response(JSON.stringify(data), {
		status,
		headers: { "Content-Type": "application/json" },
	});

Bun.serve({
	port,
	fetch(req) {
		const url = new URL(req.url);

		if (url.pathname === "/health") {
			return json({ status: "ok", service: "websockets" });
		}

		if (url.pathname === "/api/users") {
			return json(users);
		}

		return json({ error: "not_found" }, 404);
	},
});

console.log(`websockets service listening on :${port}`);

