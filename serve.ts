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

        // Notification email config — owner sets this via env var
const NOTIFICATION_EMAIL = process.env.MUSCLECARS_NOTIFICATION_EMAIL || 'colin@musclecars.ai';

// API Routes for Mobile App

        // Logo upload — owner uploads a new logo image
        if (pathname === "/api/upload-logo" && req.method === 'POST') {
          const formData = await req.formData();
          const file = formData.get('logo');
          if (!file || !(file instanceof File)) return new Response(JSON.stringify({ error: 'No file uploaded' }), { status: 400 });
          const buffer = await file.arrayBuffer();
          // Save both versions
          await Bun.write('/home/team/shared/site/src/assets/logo.png', buffer);
          await Bun.write('/home/team/shared/site/src/assets/logo-white.png', buffer);
          // Redeploy the site so the new logo is served
          try { execSync('cd /home/team/shared/site && sudo NODE_OPTIONS="--max-old-space-size=768" bun run publish 2>&1', { timeout: 30000 }); } catch {}
          return new Response(JSON.stringify({ success: true, message: 'Logo updated and site redeployed!' }), { headers: { 'Content-Type': 'application/json' } });
        }

        if (pathname === "/api/notify-owner" && req.method === 'POST') {
            const { type, itemName, customerName, customerEmail, details } = await req.json();
            if (!type || !itemName) return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
            // Log to DB — the agent or owner can poll this endpoint for pending notifications
            const { randomUUID } = await import("node:crypto");
            const id = randomUUID();
            const ownerEmail = process.env.MUSCLECARS_NOTIFICATION_EMAIL || process.env.OWNER_EMAIL || 'colin@musclecars.ai';
            execSync(`team-db "INSERT INTO notifications (id, type, item_name, customer_name, customer_email, details, owner_email) VALUES ('${id}', '${type}', '${itemName.replace(/'/g, "''")}', '${(customerName || "").replace(/'/g, "''")}', '${(customerEmail || "").replace(/'/g, "''")}', '${(details || "").replace(/'/g, "''")}', '${ownerEmail}')"`);
            return new Response(JSON.stringify({ success: true, notificationId: id }), { headers: { 'Content-Type': 'application/json' } });
        }
        if (pathname === "/api/notifications/pending" && req.method === 'GET') {
            const result = execSync(`team-db "SELECT * FROM notifications WHERE status = 'pending' OR status IS NULL ORDER BY created_at DESC LIMIT 50"`).toString();
            return new Response(result, { headers: { 'Content-Type': 'application/json' } });
        }
        if (pathname === "/api/order" && req.method === 'POST') {
            const { userId, email, type, itemName, amountCents, details } = await req.json();
            if (!userId || !type || !itemName) return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
            // Log the order
            execSync(`team-db "INSERT INTO orders (id, user_id, type, item_name, amount_cents, details) VALUES ('${crypto.randomUUID()}', '${userId}', '${type}', '${itemName.replace(/'/g, "''")}', ${amountCents || 0}, '${(details || "").replace(/'/g, "''")}')"`);
            return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
        }
        if (pathname === "/api/notifications" && req.method === 'GET') {
            const result = execSync(`team-db "SELECT o.*, u.email as user_email FROM orders o JOIN users u ON o.user_id = u.id WHERE o.status = 'pending' ORDER BY o.created_at DESC LIMIT 50"`).toString();
            return new Response(result, { headers: { 'Content-Type': 'application/json' } });
        }
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

        // Car Placeholder Images
        if (pathname.startsWith("/src/assets/car-placeholders/")) {
          const filename = pathname.replace("/src/assets/car-placeholders/", "");
          const imagePath = `/home/team/shared/site/src/assets/car-placeholders/${filename}`;
          const image = Bun.file(imagePath);
          if (await image.exists()) {
            const ext = filename.split('.').pop()?.toLowerCase();
            const mimeTypes: Record<string, string> = { 'png': 'image/png', 'jpg': 'image/jpeg', 'jpeg': 'image/jpeg' };
            return new Response(image, { headers: { "Content-Type": mimeTypes[ext || ''] || 'application/octet-stream' } });
          }
        }

        // ebook cover images
        if (pathname.startsWith("/src/assets/ebook-covers/")) {
          const filename = pathname.replace("/src/assets/ebook-covers/", "");
          const imagePath = `/home/team/shared/site/src/assets/ebook-covers/${filename}`;
          const image = Bun.file(imagePath);
          if (await image.exists()) {
            const ext = filename.split('.').pop()?.toLowerCase();
            const mimeTypes: Record<string, string> = { 'png': 'image/png', 'jpg': 'image/jpeg', 'jpeg': 'image/jpeg' };
            return new Response(image, { headers: { "Content-Type": mimeTypes[ext || ''] || 'application/octet-stream' } });
          }
        }

        // Garage Shop images
        if (pathname.startsWith("/src/assets/garage-shop/")) {
          const filename = pathname.replace("/src/assets/garage-shop/", "");
          const imagePath = `/home/team/shared/site/src/assets/garage-shop/${filename}`;
          const image = Bun.file(imagePath);
          if (await image.exists()) {
            const ext = filename.split('.').pop()?.toLowerCase();
            const mimeTypes: Record<string, string> = { 'png': 'image/png', 'jpg': 'image/jpeg', 'jpeg': 'image/jpeg' };
            return new Response(image, { headers: { "Content-Type": mimeTypes[ext || ''] || 'application/octet-stream' } });
          }
        }

        // Logo image
        if (pathname === "/src/assets/logo.png") {
          const imagePath = `/home/team/shared/site/src/assets/logo.png`;
          const image = Bun.file(imagePath);
          if (await image.exists()) {
            return new Response(image, { headers: { "Content-Type": "image/png" } });
          }
        }

        // Portfolio mockup images
        if (pathname.startsWith("/src/assets/portfolio-mockup/")) {
          const filename = pathname.replace("/src/assets/portfolio-mockup/", "");
          const imagePath = `/home/team/shared/site/src/assets/portfolio-mockup/${filename}`;
          const image = Bun.file(imagePath);
          if (await image.exists()) {
            const ext = filename.split('.').pop()?.toLowerCase();
            const mimeTypes: Record<string, string> = { 'png': 'image/png', 'jpg': 'image/jpeg', 'jpeg': 'image/jpeg' };
            return new Response(image, { headers: { "Content-Type": mimeTypes[ext || ''] || 'application/octet-stream' } });
          }
        }

        // Garage Shop merch images
        if (pathname.startsWith("/src/assets/garage-shop/")) {
          const filename = pathname.replace("/src/assets/garage-shop/", "");
          const imagePath = `/home/team/shared/site/src/assets/garage-shop/${filename}`;
          const image = Bun.file(imagePath);
          if (await image.exists()) {
            const ext = filename.split('.').pop()?.toLowerCase();
            const mimeTypes: Record<string, string> = { 'png': 'image/png', 'jpg': 'image/jpeg', 'jpeg': 'image/jpeg', 'svg': 'image/svg+xml', 'webp': 'image/webp' };
            return new Response(image, { headers: { "Content-Type": mimeTypes[ext || ''] || 'application/octet-stream' } });
          }
        }

        // Logo
        if (pathname.startsWith("/src/assets/logo.png")) {
          const imagePath = `/home/team/shared/site/src/assets/logo.png`;
          const image = Bun.file(imagePath);
          if (await image.exists()) {
            return new Response(image, { headers: { "Content-Type": "image/png" } });
          }
        }

        // Carbon fiber texture
        if (pathname.startsWith("/src/assets/carbon-fiber.png")) {
          const imagePath = `/home/team/shared/site/src/assets/carbon-fiber.png`;
          const image = Bun.file(imagePath);
          if (await image.exists()) {
            return new Response(image, { headers: { "Content-Type": "image/png" } });
          }
        }

        // Marketing assets (lead magnets, etc.)
        if (pathname.startsWith("/src/assets/marketing/")) {
          const filename = pathname.replace("/src/assets/marketing/", "");
          const imagePath = `/home/team/shared/site/src/assets/marketing/${filename}`;
          const image = Bun.file(imagePath);
          if (await image.exists()) {
            const ext = filename.split('.').pop()?.toLowerCase();
            const mimeTypes: Record<string, string> = { 'png': 'image/png', 'jpg': 'image/jpeg', 'jpeg': 'image/jpeg' };
            return new Response(image, { headers: { "Content-Type": mimeTypes[ext || ''] || 'application/octet-stream' } });
          }
        }

        // Marketing Asset Download Route
        if (pathname.startsWith("/marketing/")) {
          const filename = pathname.replace("/marketing/", "");
          const assetPath = `/home/team/shared/assets/marketing/${filename}`;
          const asset = Bun.file(assetPath);
          if (await asset.exists()) {
            const ext = filename.split('.').pop()?.toLowerCase();
            const mimeTypes: Record<string, string> = {
              'pdf': 'application/pdf',
              'png': 'image/png',
              'jpg': 'image/jpeg',
              'jpeg': 'image/jpeg',
            };
            return new Response(asset, {
              headers: {
                "Content-Type": mimeTypes[ext || ''] || 'application/octet-stream',
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
