// Production server for the built site. The TanStack Start build emits a portable
// fetch handler (dist/server/server.js) plus static client assets (dist/client);
// this wraps them in a Bun server on port 3000 — static files first, SSR for the
// rest. Run `bun run build` before starting. Restart it with `bun run publish`.
//
// Starting a new instance supersedes the old one: it frees the port no matter
// which user owns the current server (provisioning starts it as `engine`; a team
// member's `bun run publish` runs as their own user), so publish never collides
// with an already-running server. Every sandbox user has passwordless sudo, so
// the takeover works across user boundaries.
import handler from "./dist/server/server.js";
import { execSync } from "node:child_process";

// Pinned, NOT read from the environment. The published preview URL
// (<label>.<PUBLIC_SITE_DOMAIN>) is reverse-proxied to 0.0.0.0:3000 inside the
// sandbox, so the default site MUST bind there. Bun auto-loads .env files, so
// honouring process.env.PORT/HOST would let a stray env var or a .env in the site
// dir silently move the site off :3000 (or onto loopback) and break the public URL.
const PORT = 3000;
const HOST = "0.0.0.0";
const CLIENT_DIR = `${import.meta.dir}/dist/client`;

// Free PORT regardless of which user owns the current listener. lsof runs under
// sudo so it can see (and the kill can signal) a process owned by another user;
// the loop waits for the socket to actually release before we bind.
const freePort =
  `for _ in $(seq 1 25); do ` +
  `pids=$(lsof -t -iTCP:${String(PORT)} -sTCP:LISTEN 2>/dev/null || true); ` +
  `if [ -z "$pids" ]; then exit 0; fi; ` +
  `kill $pids 2>/dev/null || true; sleep 0.2; ` +
  `done`;

// Take over the port, re-freeing and retrying if another publish grabbed it in the
// gap between freeing and binding (last publish wins). Bun.serve throws EADDRINUSE
// synchronously, so without this a raced publish would die while the shell already
// reported success.
for (let attempt = 1; ; attempt++) {
  await Bun.$`sudo sh -c ${freePort}`.quiet().nothrow();
  try {
    Bun.serve({
      port: PORT,
      hostname: HOST,
      async fetch(req) {
        const { pathname, searchParams } = new URL(req.url);

        // API Routes for Mobile App
        if (pathname === "/api/cars") {
            const result = execSync(`team-db "SELECT * FROM cars WHERE status = 'available'"`).toString();
            return new Response(result, { headers: { 'Content-Type': 'application/json' } });
        }
        if (pathname === "/api/user") {
            if (req.method === 'GET') {
                const email = searchParams.get('email');
                if (!email) return new Response('Email is required', { status: 400 });
                const result = execSync(`team-db "SELECT * FROM users WHERE email = '${email}'"`).toString();
                const users = JSON.parse(result);
                if (users.length === 0) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
                return new Response(JSON.stringify(users[0]), { headers: { 'Content-Type': 'application/json' } });
            }
            if (req.method === 'POST') {
                const body = await req.json();
                const postEmail = body.email;
                if (!postEmail) return new Response('Email is required', { status: 400 });
                // Check if exists
                const existingResult = execSync(`team-db "SELECT * FROM users WHERE email = '${postEmail}'"`).toString();
                const existing = JSON.parse(existingResult);
                if (existing.length > 0) return new Response(JSON.stringify(existing[0]), { headers: { 'Content-Type': 'application/json' } });
                // Create
                const id = crypto.randomUUID();
                execSync(`team-db "INSERT INTO users (id, email) VALUES ('${id}', '${postEmail}')"`);
                const createdResult = execSync(`team-db "SELECT * FROM users WHERE email = '${postEmail}'"`).toString();
                const created = JSON.parse(createdResult);
                return new Response(JSON.stringify(created[0]), { headers: { 'Content-Type': 'application/json' } });
            }
        }
        if (pathname === "/api/valuation" && req.method === 'POST') {
            const { email } = await req.json();
            if (!email) return new Response('Email is required', { status: 400 });
            execSync(`team-db "UPDATE users SET valuation_count = valuation_count + 1 WHERE email = '${email}'"`);
            return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
        }
        if (pathname === "/api/inspections" && req.method === 'GET') {
            const email = searchParams.get('email');
            if (!email) return new Response('Email is required', { status: 400 });
            const result = execSync(`team-db "SELECT i.* FROM inspections i JOIN users u ON i.user_id = u.id WHERE u.email = '${email}' ORDER BY i.created_at DESC"`).toString();
            return new Response(result, { headers: { 'Content-Type': 'application/json' } });
        }

        // PDF Download Route — serves the packaged Muscle Car Guides
        if (pathname.startsWith("/downloads/") && pathname.endsWith(".pdf")) {
          const filename = pathname.replace("/downloads/", "");
          const pdfPath = `/home/team/shared/assets/guides/${filename}`;
          const pdf = Bun.file(pdfPath);
          if (await pdf.exists()) {
            return new Response(pdf, {
              headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="${filename}"`,
              },
            });
          }
        }

        if (pathname !== "/") {
          const file = Bun.file(CLIENT_DIR + pathname);
          if (await file.exists()) return new Response(file);
        }
        return (
          handler as { fetch: (r: Request) => Response | Promise<Response> }
        ).fetch(req);
      },
    });
    break;
  } catch (err) {
    if (attempt >= 10) throw err;
    await Bun.sleep(200);
  }
}

console.log(`team-site serving on http://${HOST}:${String(PORT)}`);
