type R2Bucket = {
  put(key: string, value: ReadableStream | ArrayBuffer | string, options?: { httpMetadata?: { contentType?: string } }): Promise<unknown>;
  get(key: string): Promise<{ body: ReadableStream; httpMetadata?: { contentType?: string } } | null>;
  list(options?: { prefix?: string; cursor?: string; limit?: number }): Promise<{
    objects: Array<{ key: string; size: number; uploaded: Date; httpMetadata?: { contentType?: string } }>;
    truncated: boolean;
    cursor?: string;
  }>;
  delete(key: string | string[]): Promise<void>;
};

type D1PreparedStatement = {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<{ results: T[] }>;
  run(): Promise<unknown>;
};

type D1Database = {
  prepare(query: string): D1PreparedStatement;
};

type Env = {
  FILES: R2Bucket;
  DB?: D1Database;
  APP_ORIGIN: string;
  ADMIN_EMAILS: string;
  ADMIN_OWNER_USERNAME?: string;
  ADMIN_OWNER_EMAIL?: string;
  ADMIN_OWNER_PASSWORD?: string;
  WHATSAPP_NUMBER: string;
};

type AdminIdentity = {
  id: string;
  username: string;
  email: string;
  role: "owner" | "admin";
};

class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

const allowedOrderFileTypes = new Set(["image/jpeg", "image/png", "application/pdf"]);
const allowedGalleryImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxOrderFileBytes = 50 * 1024 * 1024;
const maxGalleryImageBytes = 8 * 1024 * 1024;
const maxJsonBodyBytes = 64 * 1024;
const adminSessionCookieName = "maiara_admin_session";
const adminSessionDurationMs = 1000 * 60 * 60 * 24 * 7;
const passwordHashIterations = 100000;
const minuteMs = 1000 * 60;
const hourMs = minuteMs * 60;
const dayMs = hourMs * 24;

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") {
      return withCors(new Response(null, { status: 204 }), env);
    }

    const url = new URL(request.url);

    try {
      const adminOriginError = rejectCrossSiteAdminMutation(request, env, url);
      if (adminOriginError) return adminOriginError;

      if (url.pathname === "/health") {
        return json({ ok: true, storage: env.DB ? "d1" : "disabled" }, 200, env);
      }

      if (request.method === "POST" && url.pathname === "/api/orders") {
        return createOrder(request, env);
      }

      if (request.method === "POST" && url.pathname === "/api/admin/login") {
        return loginAdmin(request, env);
      }

      if (request.method === "POST" && url.pathname === "/api/admin/logout") {
        return logoutAdmin(request, env);
      }

      if (request.method === "GET" && url.pathname === "/api/gallery-products") {
        return listGalleryProducts(env);
      }

      if (request.method === "GET" && url.pathname === "/api/other-projects") {
        return listOtherProjects(env);
      }

      const galleryImageMatch = url.pathname.match(/^\/api\/gallery-images\/(.+)$/);
      if (request.method === "GET" && galleryImageMatch) {
        return getGalleryImage(env, galleryImageMatch[1]);
      }

      const orderMatch = url.pathname.match(/^\/api\/orders\/([^/]+)$/);
      if (request.method === "GET" && orderMatch) {
        return getOrder(orderMatch[1], url.searchParams.get("token"), env);
      }

      const uploadMatch = url.pathname.match(/^\/api\/orders\/([^/]+)\/files\/([^/]+)$/);
      if (request.method === "PUT" && uploadMatch) {
        return uploadOrderFile(request, env, uploadMatch[1], uploadMatch[2], url.searchParams.get("token"));
      }

      if (request.method === "GET" && url.pathname === "/api/admin/orders") {
        const admin = await requireAdmin(request, env);
        if (admin instanceof Response) return admin;
        return listAdminOrders(env);
      }

      if (request.method === "GET" && url.pathname === "/api/admin/session") {
        const admin = await requireAdmin(request, env);
        if (admin instanceof Response) return admin;
        return json({ user: admin }, 200, env);
      }

      if (request.method === "GET" && url.pathname === "/api/admin/users") {
        const admin = await requireAdmin(request, env);
        if (admin instanceof Response) return admin;
        if (admin.role !== "owner") return json({ error: "Somente o admin principal pode gerenciar usuarios." }, 403, env);
        return listAdminUsers(env);
      }

      if (request.method === "POST" && url.pathname === "/api/admin/users") {
        const admin = await requireAdmin(request, env);
        if (admin instanceof Response) return admin;
        if (admin.role !== "owner") return json({ error: "Somente o admin principal pode cadastrar usuarios." }, 403, env);
        return createAdminUser(request, env, admin);
      }

      if (request.method === "GET" && url.pathname === "/api/admin/gallery-products") {
        const admin = await requireAdmin(request, env);
        if (admin instanceof Response) return admin;
        return listGalleryProducts(env);
      }

      if (request.method === "POST" && url.pathname === "/api/admin/gallery-products") {
        const admin = await requireAdmin(request, env);
        if (admin instanceof Response) return admin;
        return createGalleryProduct(request, env);
      }

      const adminGalleryProductMatch = url.pathname.match(/^\/api\/admin\/gallery-products\/([^/]+)$/);
      if (adminGalleryProductMatch && request.method === "PATCH") {
        const admin = await requireAdmin(request, env);
        if (admin instanceof Response) return admin;
        return updateGalleryProduct(request, env, adminGalleryProductMatch[1]);
      }

      if (adminGalleryProductMatch && request.method === "DELETE") {
        const admin = await requireAdmin(request, env);
        if (admin instanceof Response) return admin;
        return deleteGalleryProduct(env, adminGalleryProductMatch[1]);
      }

      if (request.method === "GET" && url.pathname === "/api/admin/other-projects") {
        const admin = await requireAdmin(request, env);
        if (admin instanceof Response) return admin;
        return listOtherProjects(env);
      }

      if (request.method === "POST" && url.pathname === "/api/admin/other-projects") {
        const admin = await requireAdmin(request, env);
        if (admin instanceof Response) return admin;
        return createOtherProject(request, env);
      }

      const adminOtherProjectMatch = url.pathname.match(/^\/api\/admin\/other-projects\/([^/]+)$/);
      if (adminOtherProjectMatch && request.method === "PATCH") {
        const admin = await requireAdmin(request, env);
        if (admin instanceof Response) return admin;
        return updateOtherProject(request, env, adminOtherProjectMatch[1]);
      }

      if (adminOtherProjectMatch && request.method === "DELETE") {
        const admin = await requireAdmin(request, env);
        if (admin instanceof Response) return admin;
        return deleteOtherProject(env, adminOtherProjectMatch[1]);
      }

      if (request.method === "PUT" && url.pathname === "/api/admin/gallery-images") {
        const admin = await requireAdmin(request, env);
        if (admin instanceof Response) return admin;
        return uploadGalleryImage(request, env);
      }

      if (request.method === "GET" && url.pathname === "/api/admin/gallery-images") {
        const admin = await requireAdmin(request, env);
        if (admin instanceof Response) return admin;
        return listGalleryImages(env, url.searchParams.get("cursor"));
      }

      if (request.method === "GET" && url.pathname === "/api/admin/bucket-files") {
        const admin = await requireAdmin(request, env);
        if (admin instanceof Response) return admin;
        return listBucketFiles(env, url.searchParams.get("prefix"), url.searchParams.get("cursor"));
      }

      const adminGalleryImageMatch = url.pathname.match(/^\/api\/admin\/gallery-images\/(.+)$/);
      if (adminGalleryImageMatch && request.method === "DELETE") {
        const admin = await requireAdmin(request, env);
        if (admin instanceof Response) return admin;
        return deleteGalleryImage(env, adminGalleryImageMatch[1]);
      }

      const adminBucketFileMatch = url.pathname.match(/^\/api\/admin\/bucket-files\/(.+)$/);
      if (adminBucketFileMatch && request.method === "GET") {
        const admin = await requireAdmin(request, env);
        if (admin instanceof Response) return admin;
        return getBucketFile(env, adminBucketFileMatch[1]);
      }

      if (adminBucketFileMatch && request.method === "DELETE") {
        const admin = await requireAdmin(request, env);
        if (admin instanceof Response) return admin;
        return deleteBucketFile(env, adminBucketFileMatch[1]);
      }

      const adminStatusMatch = url.pathname.match(/^\/api\/admin\/orders\/([^/]+)\/status$/);
      if (request.method === "PATCH" && adminStatusMatch) {
        const admin = await requireAdmin(request, env);
        if (admin instanceof Response) return admin;
        return updateOrderStatus(request, env, adminStatusMatch[1]);
      }

      const adminOrderMatch = url.pathname.match(/^\/api\/admin\/orders\/([^/]+)$/);
      if (request.method === "DELETE" && adminOrderMatch) {
        const admin = await requireAdmin(request, env);
        if (admin instanceof Response) return admin;
        return deleteAdminOrder(env, adminOrderMatch[1]);
      }

      const adminFileMatch = url.pathname.match(/^\/api\/admin\/files\/([^/]+)$/);
      if (request.method === "GET" && adminFileMatch) {
        const admin = await requireAdmin(request, env);
        if (admin instanceof Response) return admin;
        return getAdminFile(env, adminFileMatch[1]);
      }

      return json({ error: "Not found" }, 404, env);
    } catch (error) {
      if (error instanceof HttpError) {
        return json({ error: error.message }, error.status, env);
      }

      return json({ error: error instanceof Error ? error.message : "Unexpected error" }, 500, env);
    }
  },

  async scheduled(_controller: ScheduledController, env: Env, _ctx: ExecutionContext): Promise<void> {
    await deleteExpiredUnpaidOrders(env);
    await deleteExpiredRateLimits(env);
  },
};

const orderStatuses = ["awaiting_payment", "received", "payment_confirmed", "in_production", "awaiting_approval", "finished"] as const;
const orderTypes = ["familinha", "maker", "galeria", "outros"] as const;
const automaticOrderSources = ["cart", "maker"] as const;
const pendingOrderDurationMs = 1000 * 60 * 60 * 48;

async function createOrder(request: Request, env: Env) {
  const db = requireDb(env);
  if (db instanceof Response) return db;

  const bodySizeError = rejectOversizedJson(request, env);
  if (bodySizeError) return bodySizeError;

  const body = await readJson(request);
  const customerName = requireBoundedString(body.customerName, "customerName", 2, 80);
  const phone = normalizeRequiredPhone(body.phone);
  const email = optionalEmail(body.email);
  const notes = optionalBoundedString(body.notes, "notes", 600);
  const colors = optionalBoundedString(body.colors, "colors", 80);
  const size = optionalBoundedString(body.size, "size", 80);
  const items = normalizeOrderItems(body.items, body);
  const product = summarizeOrderItems(items);
  const orderType = requireEnum(body.orderType ?? inferOrderType(items), "orderType", orderTypes);
  const source = requireEnum(body.source ?? "cart", "source", automaticOrderSources);
  const nowDate = new Date();
  const now = nowDate.toISOString();
  const expiresAt = new Date(nowDate.getTime() + pendingOrderDurationMs).toISOString();
  const customerId = crypto.randomUUID();
  const orderId = crypto.randomUUID();
  const code = orderCode();
  const token = randomToken();

  const ipLimit = await checkRateLimit(env, "order_ip", clientFingerprint(request), 8, hourMs);
  if (ipLimit) return ipLimit;

  const phoneLimit = await checkRateLimit(env, "order_phone", phone, 5, dayMs);
  if (phoneLimit) return phoneLimit;

  const existingCustomer = await db.prepare("SELECT id FROM customers WHERE phone = ? LIMIT 1")
    .bind(phone)
    .first<{ id: string }>();

  const finalCustomerId = existingCustomer?.id ?? customerId;

  if (existingCustomer) {
    await db.prepare("UPDATE customers SET name = ?, email = COALESCE(?, email), updated_at = ? WHERE id = ?")
      .bind(customerName, email, now, finalCustomerId)
      .run();
  } else {
    await db.prepare("INSERT INTO customers (id, name, phone, email, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)")
      .bind(finalCustomerId, customerName, phone, email, now, now)
      .run();
  }

  await db.prepare(
    `INSERT INTO orders (id, code, customer_id, token, product, size, colors, notes, status, order_type, source, expires_at, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(orderId, code, finalCustomerId, token, product, size, colors, notes, "awaiting_payment", orderType, source, expiresAt, now, now)
    .run();

  await db.prepare(
    "INSERT INTO status_events (id, order_id, status, note, created_at) VALUES (?, ?, ?, ?, ?)",
  )
    .bind(crypto.randomUUID(), orderId, "awaiting_payment", "Pedido criado pelo site, aguardando pagamento", now)
    .run();

  for (let index = 0; index < items.length; index += 1) {
    const item = items[index];
    await db.prepare(
      `INSERT INTO order_items
        (id, order_id, product_id, title, category, order_type, price, dimensions, quantity, notes, image_url, sort_order, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(
        crypto.randomUUID(),
        orderId,
        item.productId,
        item.title,
        item.category,
        item.orderType,
        item.price,
        item.dimensions,
        item.quantity,
        item.notes,
        item.imageUrl,
        index,
        now,
      )
      .run();
  }

  const whatsappUrl = buildWhatsAppUrl(env.WHATSAPP_NUMBER, {
    code,
    customerName,
    phone,
    email,
    product,
    orderType,
    source,
    size,
    colors,
    notes,
    items,
    expiresAt,
  });

  return json({
    code,
    token,
    statusUrl: `/pedido/${code}?token=${token}`,
    uploadUrl: `/api/orders/${code}/files/original?token=${token}`,
    whatsappUrl,
    storage: "d1",
  }, 201, env);
}

async function getOrder(code: string, token: string | null, env: Env) {
  const db = requireDb(env);
  if (db instanceof Response) return db;
  if (!token) return json({ error: "Token is required" }, 401, env);

  const order = await db.prepare(
    `SELECT orders.id, orders.code, orders.token, orders.product, orders.size, orders.colors,
            orders.notes, orders.status, orders.order_type, orders.source, orders.expires_at, orders.created_at, orders.updated_at,
            customers.name AS customer_name, customers.phone AS customer_phone, customers.email AS customer_email
     FROM orders
     INNER JOIN customers ON customers.id = orders.customer_id
     WHERE orders.code = ?
     LIMIT 1`,
  )
    .bind(code)
    .first<OrderRow>();

  if (!order || order.token !== token) {
    return json({ error: "Order not found" }, 404, env);
  }

  const { results: items } = await db.prepare(
    `SELECT product_id, title, category, order_type, price, dimensions, quantity, notes, image_url, sort_order
     FROM order_items
     WHERE order_id = ?
     ORDER BY sort_order ASC`,
  )
    .bind(order.id)
    .all<OrderItemRow>();

  const { results: events } = await db.prepare(
    `SELECT status, note, created_at
     FROM status_events
     WHERE order_id = ?
     ORDER BY created_at ASC`,
  )
    .bind(order.id)
    .all<StatusEventRow>();

  const { results: files } = await db.prepare(
    `SELECT id, kind, file_name, content_type, size_bytes, created_at
     FROM order_files
     WHERE order_id = ?
     ORDER BY created_at ASC`,
  )
    .bind(order.id)
    .all<OrderFileRow>();

  return json({
    code: order.code,
    product: order.product,
    size: order.size,
    colors: order.colors,
    notes: order.notes,
    status: order.status,
    orderType: order.order_type,
    source: order.source,
    expiresAt: order.expires_at,
    customerName: order.customer_name,
    createdAt: order.created_at,
    updatedAt: order.updated_at,
    items,
    events,
    files,
  }, 200, env);
}

async function listAdminOrders(env: Env) {
  const db = requireDb(env);
  if (db instanceof Response) return db;

  const { results } = await db.prepare(
    `SELECT orders.id, orders.code, orders.product, orders.size, orders.colors, orders.notes, orders.status, orders.order_type, orders.source, orders.expires_at, orders.created_at, orders.updated_at,
            customers.name AS customer_name, customers.phone AS customer_phone, customers.email AS customer_email
     FROM orders
     INNER JOIN customers ON customers.id = orders.customer_id
     ORDER BY orders.created_at DESC
     LIMIT 100`,
  ).all<AdminOrderRow>();

  const orders = [];
  for (const order of results) {
    const { results: items } = await db.prepare(
      `SELECT product_id, title, category, order_type, price, dimensions, quantity, notes, image_url, sort_order
       FROM order_items
       WHERE order_id = ?
       ORDER BY sort_order ASC`,
    )
      .bind(order.id)
      .all<AdminOrderItemRow>();

    const { results: files } = await db.prepare(
      `SELECT id, kind, file_name, content_type, size_bytes, created_at
       FROM order_files
       WHERE order_id = ?
       ORDER BY created_at ASC`,
    )
      .bind(order.id)
      .all<AdminOrderFileRow>();

    orders.push({ ...order, items, files });
  }

  return json({ orders }, 200, env);
}

async function updateOrderStatus(request: Request, env: Env, code: string) {
  const db = requireDb(env);
  if (db instanceof Response) return db;

  const body = await readJson(request);
  const status = requireEnum(body.status, "status", orderStatuses);
  const note = optionalString(body.note);
  const now = new Date().toISOString();
  const order = await db.prepare("SELECT id FROM orders WHERE code = ? LIMIT 1").bind(code).first<{ id: string }>();

  if (!order) {
    return json({ error: "Order not found" }, 404, env);
  }

  await db.prepare("UPDATE orders SET status = ?, updated_at = ? WHERE code = ?")
    .bind(status, now, code)
    .run();

  await db.prepare(
    "INSERT INTO status_events (id, order_id, status, note, created_at) VALUES (?, ?, ?, ?, ?)",
  )
    .bind(crypto.randomUUID(), order.id, status, note, now)
    .run();

  return json({ code, status }, 200, env);
}

async function deleteAdminOrder(env: Env, code: string) {
  const db = requireDb(env);
  if (db instanceof Response) return db;

  const order = await db.prepare("SELECT id FROM orders WHERE code = ? LIMIT 1").bind(code).first<{ id: string }>();

  if (!order) {
    return json({ error: "Order not found" }, 404, env);
  }

  const { results: files } = await db.prepare("SELECT object_key FROM order_files WHERE order_id = ?")
    .bind(order.id)
    .all<{ object_key: string }>();

  const objectKeys = files.map((file) => file.object_key).filter(Boolean);
  if (objectKeys.length > 0) {
    await env.FILES.delete(objectKeys);
  }

  await db.prepare("DELETE FROM orders WHERE id = ?").bind(order.id).run();

  return json({ code }, 200, env);
}

async function loginAdmin(request: Request, env: Env) {
  const db = requireDb(env);
  if (db instanceof Response) return db;

  await ensureBootstrapAdmin(env, request);

  const bodySizeError = rejectOversizedJson(request, env);
  if (bodySizeError) return bodySizeError;

  const body = await readJson(request);
  const login = requireString(body.login, "login").toLowerCase();
  const password = requireString(body.password, "password");

  const ipLimit = await checkRateLimit(env, "admin_login_ip", clientFingerprint(request), 20, 15 * minuteMs);
  if (ipLimit) return ipLimit;

  const loginLimit = await checkRateLimit(env, "admin_login_user", login, 10, 15 * minuteMs);
  if (loginLimit) return loginLimit;

  const user = await db.prepare(
    `SELECT id, username, email, password_hash, role, is_active, created_at, updated_at, last_login_at
     FROM admin_users
     WHERE lower(username) = ? OR lower(email) = ?
     LIMIT 1`,
  )
    .bind(login, login)
    .first<AdminUserWithPasswordRow>();

  if (!user || user.is_active !== 1) {
    return json({ error: "Usuario ou senha invalidos." }, 401, env);
  }

  const passwordMatches = await verifyPassword(password, user.password_hash);
  if (!passwordMatches) {
    return json({ error: "Usuario ou senha invalidos." }, 401, env);
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + adminSessionDurationMs);
  const token = randomToken();
  const tokenHash = await sha256Hex(token);

  await db.prepare(
    "INSERT INTO admin_sessions (id, user_id, token_hash, expires_at, created_at, last_seen_at) VALUES (?, ?, ?, ?, ?, ?)",
  )
    .bind(crypto.randomUUID(), user.id, tokenHash, expiresAt.toISOString(), now.toISOString(), now.toISOString())
    .run();

  await db.prepare("UPDATE admin_users SET last_login_at = ?, updated_at = ? WHERE id = ?")
    .bind(now.toISOString(), now.toISOString(), user.id)
    .run();

  const response = json({ user: toAdminUserIdentity(user) }, 200, env);
  response.headers.append("set-cookie", buildAdminSessionCookie(token, expiresAt, request, env));
  return response;
}

async function logoutAdmin(request: Request, env: Env) {
  const db = requireDb(env);

  if (!(db instanceof Response)) {
    const token = getCookie(request, adminSessionCookieName);
    if (token) {
      await db.prepare("DELETE FROM admin_sessions WHERE token_hash = ?")
        .bind(await sha256Hex(token))
        .run()
        .catch(() => undefined);
    }
  }

  const response = json({ ok: true }, 200, env);
  response.headers.append("set-cookie", clearAdminSessionCookie(request, env));
  return response;
}

async function listAdminUsers(env: Env) {
  const db = requireDb(env);
  if (db instanceof Response) return db;

  await ensureBootstrapAdmin(env);

  const { results } = await db.prepare(
    `SELECT id, username, email, role, is_active, created_at, updated_at, last_login_at
     FROM admin_users
     ORDER BY role DESC, created_at ASC`,
  ).all<AdminUserRow>();

  return json({ users: results.map(toAdminUserResponse) }, 200, env);
}

async function createAdminUser(request: Request, env: Env, admin: AdminIdentity) {
  const db = requireDb(env);
  if (db instanceof Response) return db;

  const body = await readJson(request);
  const username = normalizeUsername(requireString(body.username, "username"));
  const email = requireString(body.email, "email").toLowerCase();
  const password = requireString(body.password, "password");
  const role = requireEnum(body.role ?? "admin", "role", ["owner", "admin"]);

  if (password.length < 8) {
    return json({ error: "A senha precisa ter pelo menos 8 caracteres." }, 400, env);
  }

  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  const passwordHash = await hashPassword(password);

  await db.prepare(
    `INSERT INTO admin_users (id, username, email, password_hash, role, is_active, created_by, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?)`,
  )
    .bind(id, username, email, passwordHash, role, admin.id, now, now)
    .run();

  const user = await db.prepare(
    `SELECT id, username, email, role, is_active, created_at, updated_at, last_login_at
     FROM admin_users
     WHERE id = ?`,
  )
    .bind(id)
    .first<AdminUserRow>();

  return json({ user: user ? toAdminUserResponse(user) : null }, 201, env);
}

async function uploadOrderFile(request: Request, env: Env, code: string, kind: string, token: string | null) {
  const db = requireDb(env);
  if (db instanceof Response) return db;
  if (!token) return json({ error: "Token is required" }, 401, env);
  if (!["original", "preview", "final"].includes(kind)) return json({ error: "Invalid file kind" }, 400, env);

  const order = await db.prepare("SELECT id, token FROM orders WHERE code = ? LIMIT 1")
    .bind(code)
    .first<{ id: string; token: string }>();

  if (!order || order.token !== token) {
    return json({ error: "Order not found" }, 404, env);
  }

  const contentType = request.headers.get("content-type") ?? "";
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  const fileName = request.headers.get("x-file-name") ?? `${kind}`;

  if (!allowedOrderFileTypes.has(contentType)) return json({ error: "Envie um arquivo PNG, JPG ou PDF" }, 415, env);
  if (!contentLength || contentLength > maxOrderFileBytes) return json({ error: "O arquivo precisa ter ate 50 MB" }, 413, env);
  if (!request.body) return json({ error: "Missing file body" }, 400, env);

  const fileId = crypto.randomUUID();
  const objectKey = `orders/${safePathPart(code)}/${fileId}-${safeFileName(fileName)}`;

  await env.FILES.put(objectKey, request.body, { httpMetadata: { contentType } });

  await db.prepare(
    `INSERT INTO order_files
      (id, order_id, kind, object_key, file_name, content_type, size_bytes, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(fileId, order.id, kind, objectKey, fileName, contentType, contentLength, new Date().toISOString())
    .run();

  return json({ fileId, objectKey, storage: "d1+r2" }, 201, env);
}

async function getAdminFile(env: Env, fileId: string) {
  const db = requireDb(env);
  if (db instanceof Response) return db;

  const file = await db.prepare(
    "SELECT object_key, file_name, content_type FROM order_files WHERE id = ? LIMIT 1",
  )
    .bind(fileId)
    .first<{ object_key: string; file_name: string; content_type: string }>();

  if (!file) return json({ error: "File not found" }, 404, env);

  const object = await env.FILES.get(file.object_key);
  if (!object) return json({ error: "File object not found" }, 404, env);

  return new Response(object.body, {
    headers: {
      "content-type": object.httpMetadata?.contentType ?? file.content_type,
      "content-disposition": `attachment; filename="${file.file_name.replaceAll('"', "")}"`,
    },
  });
}

async function listGalleryProducts(env: Env) {
  const db = requireDb(env);
  if (db instanceof Response) return db;

  const { results } = await db.prepare(
    `SELECT id, name, title, category, price, original_price, dimensions, included_items, description, placeholder,
            static_image_key, hover_image_key, surface, frame_format, width, aspect_ratio, offset, rotate, sort_order, created_at, updated_at
     FROM gallery_products
     ORDER BY sort_order ASC, created_at ASC`,
  ).all<GalleryProductRow>();

  return json({ products: results.map(toGalleryProductResponse) }, 200, env);
}

async function createGalleryProduct(request: Request, env: Env) {
  const db = requireDb(env);
  if (db instanceof Response) return db;

  const body = await readJson(request);
  const id = crypto.randomUUID();
  const name = requireString(body.name, "name");
  const title = requireString(body.title, "title");
  const category = requireString(body.category, "category");
  const price = requireString(body.price, "price");
  const originalPrice = optionalString(body.originalPrice);
  const dimensions = requireString(body.dimensions, "dimensions");
  const includedItems = requireStringArray(body.includedItems, "includedItems");
  const description = requireString(body.description, "description");
  const placeholder = optionalString(body.placeholder) ?? title;
  const staticImageKey = requireObjectKey(body.staticImage, "staticImage");
  const hoverImageKey = optionalObjectKey(body.hoverImage);
  const surface = optionalString(body.surface) ?? "#ead4c6";
  const frameFormat = requireEnum(body.frameFormat, "frameFormat", ["landscape", "portrait", "square", "wide", "classic"]);
  const width = requireNumber(body.width, "width");
  const aspectRatio = requireString(body.aspectRatio, "aspectRatio");
  const offset = requireNumber(body.offset, "offset");
  const rotate = requireNumber(body.rotate, "rotate");
  const sortOrder = Number(body.sortOrder ?? Date.now());
  const now = new Date().toISOString();

  await db.prepare(
    `INSERT INTO gallery_products
      (id, name, title, category, price, original_price, dimensions, included_items, description, placeholder,
       static_image_key, hover_image_key, surface, frame_format, width, aspect_ratio, offset, rotate, sort_order, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      id,
      name,
      title,
      category,
      price,
      originalPrice,
      dimensions,
      JSON.stringify(includedItems),
      description,
      placeholder,
      staticImageKey,
      hoverImageKey,
      surface,
      frameFormat,
      width,
      aspectRatio,
      offset,
      rotate,
      sortOrder,
      now,
      now,
    )
    .run();

  const row = await db.prepare(
    `SELECT id, name, title, category, price, original_price, dimensions, included_items, description, placeholder,
            static_image_key, hover_image_key, surface, frame_format, width, aspect_ratio, offset, rotate, sort_order, created_at, updated_at
     FROM gallery_products
     WHERE id = ?`,
  )
    .bind(id)
    .first<GalleryProductRow>();

  return json({ product: row ? toGalleryProductResponse(row) : null }, 201, env);
}

async function updateGalleryProduct(request: Request, env: Env, id: string) {
  const db = requireDb(env);
  if (db instanceof Response) return db;

  const body = await readJson(request);
  const name = requireString(body.name, "name");
  const title = requireString(body.title, "title");
  const category = requireString(body.category, "category");
  const price = requireString(body.price, "price");
  const originalPrice = optionalString(body.originalPrice);
  const dimensions = requireString(body.dimensions, "dimensions");
  const includedItems = requireStringArray(body.includedItems, "includedItems");
  const description = requireString(body.description, "description");
  const placeholder = optionalString(body.placeholder) ?? title;
  const staticImageKey = requireObjectKey(body.staticImage, "staticImage");
  const hoverImageKey = optionalObjectKey(body.hoverImage);
  const surface = optionalString(body.surface) ?? "#ead4c6";
  const frameFormat = requireEnum(body.frameFormat, "frameFormat", ["landscape", "portrait", "square", "wide", "classic"]);
  const width = requireNumber(body.width, "width");
  const aspectRatio = requireString(body.aspectRatio, "aspectRatio");
  const offset = requireNumber(body.offset, "offset");
  const rotate = requireNumber(body.rotate, "rotate");
  const sortOrder = Number(body.sortOrder ?? Date.now());
  const now = new Date().toISOString();

  await db.prepare(
    `UPDATE gallery_products
     SET name = ?, title = ?, category = ?, price = ?, original_price = ?, dimensions = ?,
         included_items = ?, description = ?, placeholder = ?, static_image_key = ?, hover_image_key = ?,
         surface = ?, frame_format = ?, width = ?, aspect_ratio = ?, offset = ?, rotate = ?,
         sort_order = ?, updated_at = ?
     WHERE id = ?`,
  )
    .bind(
      name,
      title,
      category,
      price,
      originalPrice,
      dimensions,
      JSON.stringify(includedItems),
      description,
      placeholder,
      staticImageKey,
      hoverImageKey,
      surface,
      frameFormat,
      width,
      aspectRatio,
      offset,
      rotate,
      sortOrder,
      now,
      id,
    )
    .run();

  const row = await db.prepare(
    `SELECT id, name, title, category, price, original_price, dimensions, included_items, description, placeholder,
            static_image_key, hover_image_key, surface, frame_format, width, aspect_ratio, offset, rotate, sort_order, created_at, updated_at
     FROM gallery_products
     WHERE id = ?`,
  )
    .bind(id)
    .first<GalleryProductRow>();

  if (!row) return json({ error: "Gallery product not found" }, 404, env);
  return json({ product: toGalleryProductResponse(row) }, 200, env);
}

async function deleteGalleryProduct(env: Env, id: string) {
  const db = requireDb(env);
  if (db instanceof Response) return db;

  await db.prepare("DELETE FROM gallery_products WHERE id = ?").bind(id).run();
  return json({ id }, 200, env);
}

async function listOtherProjects(env: Env) {
  const db = requireDb(env);
  if (db instanceof Response) return db;

  const { results } = await db.prepare(
    `SELECT id, number, name, title, category, price, original_price, dimensions, included_items, description, placeholder,
            static_image_key, hover_image_key, surface, frame_format, width, aspect_ratio, offset, rotate, sort_order, is_active, created_at, updated_at
     FROM other_projects
     WHERE is_active = 1
     ORDER BY sort_order ASC, created_at ASC`,
  ).all<OtherProjectRow>();

  return json({ products: results.map(toOtherProjectResponse) }, 200, env);
}

async function createOtherProject(request: Request, env: Env) {
  const db = requireDb(env);
  if (db instanceof Response) return db;

  const body = await readJson(request);
  const id = crypto.randomUUID();
  const number = optionalString(body.number) ?? "00";
  const name = requireString(body.name, "name");
  const title = requireString(body.title, "title");
  const category = requireString(body.category, "category");
  const price = requireString(body.price, "price");
  const originalPrice = optionalString(body.originalPrice);
  const dimensions = requireString(body.dimensions, "dimensions");
  const includedItems = requireStringArray(body.includedItems, "includedItems");
  const description = requireString(body.description, "description");
  const placeholder = optionalString(body.placeholder) ?? title;
  const staticImageKey = requireObjectKey(body.staticImage, "staticImage");
  const hoverImageKey = optionalObjectKey(body.hoverImage);
  const surface = optionalString(body.surface) ?? "#ead4c6";
  const frameFormat = requireEnum(body.frameFormat, "frameFormat", ["landscape", "portrait", "square", "wide", "classic"]);
  const width = requireNumber(body.width, "width");
  const aspectRatio = requireString(body.aspectRatio, "aspectRatio");
  const offset = requireNumber(body.offset, "offset");
  const rotate = requireNumber(body.rotate, "rotate");
  const sortOrder = Number(body.sortOrder ?? Date.now());
  const now = new Date().toISOString();

  await db.prepare(
    `INSERT INTO other_projects
      (id, number, name, title, category, price, original_price, dimensions, included_items, description, placeholder,
       static_image_key, hover_image_key, surface, frame_format, width, aspect_ratio, offset, rotate, sort_order, is_active, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`,
  )
    .bind(
      id,
      number,
      name,
      title,
      category,
      price,
      originalPrice,
      dimensions,
      JSON.stringify(includedItems),
      description,
      placeholder,
      staticImageKey,
      hoverImageKey,
      surface,
      frameFormat,
      width,
      aspectRatio,
      offset,
      rotate,
      sortOrder,
      now,
      now,
    )
    .run();

  const row = await db.prepare(
    `SELECT id, number, name, title, category, price, original_price, dimensions, included_items, description, placeholder,
            static_image_key, hover_image_key, surface, frame_format, width, aspect_ratio, offset, rotate, sort_order, is_active, created_at, updated_at
     FROM other_projects
     WHERE id = ?`,
  )
    .bind(id)
    .first<OtherProjectRow>();

  return json({ product: row ? toOtherProjectResponse(row) : null }, 201, env);
}

async function updateOtherProject(request: Request, env: Env, id: string) {
  const db = requireDb(env);
  if (db instanceof Response) return db;

  const body = await readJson(request);
  const number = optionalString(body.number) ?? "00";
  const name = requireString(body.name, "name");
  const title = requireString(body.title, "title");
  const category = requireString(body.category, "category");
  const price = requireString(body.price, "price");
  const originalPrice = optionalString(body.originalPrice);
  const dimensions = requireString(body.dimensions, "dimensions");
  const includedItems = requireStringArray(body.includedItems, "includedItems");
  const description = requireString(body.description, "description");
  const placeholder = optionalString(body.placeholder) ?? title;
  const staticImageKey = requireObjectKey(body.staticImage, "staticImage");
  const hoverImageKey = optionalObjectKey(body.hoverImage);
  const surface = optionalString(body.surface) ?? "#ead4c6";
  const frameFormat = requireEnum(body.frameFormat, "frameFormat", ["landscape", "portrait", "square", "wide", "classic"]);
  const width = requireNumber(body.width, "width");
  const aspectRatio = requireString(body.aspectRatio, "aspectRatio");
  const offset = requireNumber(body.offset, "offset");
  const rotate = requireNumber(body.rotate, "rotate");
  const sortOrder = Number(body.sortOrder ?? Date.now());
  const now = new Date().toISOString();

  await db.prepare(
    `UPDATE other_projects
     SET number = ?, name = ?, title = ?, category = ?, price = ?, original_price = ?, dimensions = ?,
         included_items = ?, description = ?, placeholder = ?, static_image_key = ?, hover_image_key = ?,
         surface = ?, frame_format = ?, width = ?, aspect_ratio = ?, offset = ?, rotate = ?,
         sort_order = ?, is_active = 1, updated_at = ?
     WHERE id = ?`,
  )
    .bind(
      number,
      name,
      title,
      category,
      price,
      originalPrice,
      dimensions,
      JSON.stringify(includedItems),
      description,
      placeholder,
      staticImageKey,
      hoverImageKey,
      surface,
      frameFormat,
      width,
      aspectRatio,
      offset,
      rotate,
      sortOrder,
      now,
      id,
    )
    .run();

  const row = await db.prepare(
    `SELECT id, number, name, title, category, price, original_price, dimensions, included_items, description, placeholder,
            static_image_key, hover_image_key, surface, frame_format, width, aspect_ratio, offset, rotate, sort_order, is_active, created_at, updated_at
     FROM other_projects
     WHERE id = ?`,
  )
    .bind(id)
    .first<OtherProjectRow>();

  if (!row) return json({ error: "Other project not found" }, 404, env);
  return json({ product: toOtherProjectResponse(row) }, 200, env);
}

async function deleteOtherProject(env: Env, id: string) {
  const db = requireDb(env);
  if (db instanceof Response) return db;

  await db.prepare("UPDATE other_projects SET is_active = 0, updated_at = ? WHERE id = ?")
    .bind(new Date().toISOString(), id)
    .run();
  return json({ id }, 200, env);
}

async function uploadGalleryImage(request: Request, env: Env) {
  const contentType = request.headers.get("content-type") ?? "";
  const fileName = request.headers.get("x-file-name") ?? "gallery-image";

  if (!allowedGalleryImageTypes.has(contentType)) return json({ error: "Unsupported gallery image type" }, 415, env);
  if (!request.body) return json({ error: "Missing image body" }, 400, env);

  const fileBuffer = await request.arrayBuffer();
  if (fileBuffer.byteLength === 0 || fileBuffer.byteLength > maxGalleryImageBytes) {
    return json({ error: "Gallery image must be up to 8 MB" }, 413, env);
  }

  const fileId = crypto.randomUUID();
  const objectKey = `gallery/${fileId}-${safeFileName(fileName)}`;

  await env.FILES.put(objectKey, fileBuffer, { httpMetadata: { contentType } });

  return json({ fileId, objectKey, url: `/api/gallery-images/${objectKey}` }, 201, env);
}

async function listGalleryImages(env: Env, cursor: string | null) {
  const listed = await env.FILES.list({
    prefix: "gallery/",
    cursor: cursor ?? undefined,
    limit: 100,
  });

  return json({
    images: listed.objects.map((object) => ({
      key: object.key,
      url: `/api/gallery-images/${object.key}`,
      size: object.size,
      uploaded: object.uploaded.toISOString(),
      contentType: object.httpMetadata?.contentType ?? inferContentTypeFromKey(object.key),
    })),
    cursor: listed.cursor ?? null,
    truncated: listed.truncated,
  }, 200, env);
}

async function listBucketFiles(env: Env, prefix: string | null, cursor: string | null) {
  const safePrefix = sanitizeBucketPrefix(prefix);
  const listed = await env.FILES.list({
    prefix: safePrefix || undefined,
    cursor: cursor ?? undefined,
    limit: 100,
  });

  return json({
    files: listed.objects.map((object) => ({
      key: object.key,
      url: `/api/admin/bucket-files/${encodeURIComponent(object.key)}`,
      size: object.size,
      uploaded: object.uploaded.toISOString(),
      contentType: object.httpMetadata?.contentType ?? inferContentTypeFromKey(object.key),
      group: object.key.startsWith("gallery/") ? "gallery" : object.key.startsWith("orders/") ? "orders" : "other",
    })),
    cursor: listed.cursor ?? null,
    truncated: listed.truncated,
    prefix: safePrefix,
  }, 200, env);
}

async function deleteGalleryImage(env: Env, objectKey: string) {
  const safeKey = decodeURIComponent(objectKey);
  if (!safeKey.startsWith("gallery/")) return json({ error: "Invalid gallery image key" }, 400, env);

  await env.FILES.delete(safeKey);

  return json({ key: safeKey }, 200, env);
}

async function deleteBucketFile(env: Env, objectKey: string) {
  const safeKey = sanitizeBucketKey(objectKey);
  if (!safeKey) return json({ error: "Invalid bucket file key" }, 400, env);

  await env.FILES.delete(safeKey);

  return json({ key: safeKey }, 200, env);
}

async function getGalleryImage(env: Env, objectKey: string) {
  const safeKey = decodeURIComponent(objectKey);
  if (!safeKey.startsWith("gallery/")) return json({ error: "Invalid gallery image key" }, 400, env);

  const object = await env.FILES.get(safeKey);
  if (!object) return json({ error: "Gallery image not found" }, 404, env);

  return withCors(new Response(object.body, {
    headers: {
      "content-type": object.httpMetadata?.contentType ?? inferContentTypeFromKey(safeKey) ?? "application/octet-stream",
      "cache-control": "public, max-age=31536000, immutable",
    },
  }), env);
}

async function getBucketFile(env: Env, objectKey: string) {
  const safeKey = sanitizeBucketKey(objectKey);
  if (!safeKey) return json({ error: "Invalid bucket file key" }, 400, env);

  const object = await env.FILES.get(safeKey);
  if (!object) return json({ error: "Bucket file not found" }, 404, env);

  return withCors(new Response(object.body, {
    headers: {
      "content-type": object.httpMetadata?.contentType ?? inferContentTypeFromKey(safeKey) ?? "application/octet-stream",
      "content-disposition": `inline; filename="${safeFileName(safeKey.split("/").pop() ?? "arquivo")}"`,
      "cache-control": "private, max-age=60",
    },
  }), env);
}

function inferContentTypeFromKey(objectKey: string) {
  const extension = objectKey.split(".").pop()?.toLowerCase();
  const contentTypes: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/gif",
    svg: "image/svg+xml",
    pdf: "application/pdf",
  };

  return extension ? contentTypes[extension] ?? null : null;
}

function sanitizeBucketPrefix(prefix: string | null) {
  const value = (prefix ?? "").trim();
  if (!value || value === "all") return "";
  if (value === "gallery/" || value === "orders/") return value;
  return "";
}

function sanitizeBucketKey(objectKey: string) {
  const safeKey = decodeURIComponent(objectKey).trim();
  if (!safeKey || safeKey.startsWith("/") || safeKey.includes("..")) return "";
  return safeKey;
}

async function readJson(request: Request) {
  try {
    return (await request.json()) as Record<string, unknown>;
  } catch {
    throw new Error("Invalid JSON body");
  }
}

type GalleryProductRow = {
  id: string;
  name: string;
  title: string;
  category: string;
  price: string;
  original_price: string | null;
  dimensions: string;
  included_items: string;
  description: string;
  placeholder: string;
  static_image_key: string;
  hover_image_key: string | null;
  surface: string;
  frame_format: string;
  width: number;
  aspect_ratio: string;
  offset: number;
  rotate: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

type OtherProjectRow = GalleryProductRow & {
  number: string;
  is_active: number;
};

type AdminOrderRow = {
  id: string;
  code: string;
  product: string;
  size: string | null;
  colors: string | null;
  notes: string | null;
  status: string;
  order_type: string;
  source: string;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
};

type AdminOrderFileRow = {
  id: string;
  kind: string;
  file_name: string;
  content_type: string;
  size_bytes: number;
  created_at: string;
};

type AdminOrderItemRow = {
  product_id: string | null;
  title: string;
  category: string | null;
  order_type: string | null;
  price: string | null;
  dimensions: string | null;
  quantity: number;
  notes: string | null;
  image_url: string | null;
  sort_order: number;
};

type OrderRow = AdminOrderRow & {
  token: string;
  notes: string | null;
};

type OrderItemRow = {
  product_id: string | null;
  title: string;
  category: string | null;
  order_type: string | null;
  price: string | null;
  dimensions: string | null;
  quantity: number;
  notes: string | null;
  image_url: string | null;
  sort_order: number;
};

type StatusEventRow = {
  status: string;
  note: string | null;
  created_at: string;
};

type OrderFileRow = {
  id: string;
  kind: string;
  file_name: string;
  content_type: string;
  size_bytes: number;
  created_at: string;
};

type AdminUserRow = {
  id: string;
  username: string;
  email: string;
  role: "owner" | "admin";
  is_active: number;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
};

type AdminUserWithPasswordRow = AdminUserRow & {
  password_hash: string;
};

type AdminSessionRow = AdminUserWithPasswordRow & {
  session_id: string;
  expires_at: string;
};

type OrderItemInput = {
  productId: string | null;
  title: string;
  category: string | null;
  orderType: string | null;
  price: string | null;
  dimensions: string | null;
  quantity: number;
  notes: string | null;
  imageUrl: string | null;
};

function toGalleryProductResponse(row: GalleryProductRow) {
  return {
    id: row.id,
    name: row.name,
    title: row.title,
    category: row.category,
    price: row.price,
    originalPrice: row.original_price,
    dimensions: row.dimensions,
    includedItems: parseStringArray(row.included_items),
    description: row.description,
    placeholder: row.placeholder,
    staticImage: galleryImageUrl(row.static_image_key),
    hoverImage: row.hover_image_key ? galleryImageUrl(row.hover_image_key) : null,
    surface: row.surface,
    frameFormat: row.frame_format,
    width: row.width,
    aspectRatio: row.aspect_ratio,
    offset: row.offset,
    rotate: row.rotate,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toOtherProjectResponse(row: OtherProjectRow) {
  return {
    ...toGalleryProductResponse(row),
    number: row.number,
    isActive: row.is_active === 1,
  };
}

function normalizeOrderItems(value: unknown, fallbackBody: Record<string, unknown>): OrderItemInput[] {
  if (!Array.isArray(value) || value.length === 0) {
    const product = requireBoundedString(fallbackBody.product, "product", 1, 120);
    return [{
      productId: null,
      title: product,
      category: null,
      orderType: requireEnum(fallbackBody.orderType ?? inferOrderTypeFromText(product), "orderType", orderTypes),
      price: null,
      dimensions: optionalBoundedString(fallbackBody.size, "size", 80),
      quantity: 1,
      notes: optionalBoundedString(fallbackBody.notes, "notes", 300),
      imageUrl: null,
    }];
  }

  return value.slice(0, 20).map((item, index) => {
    if (!isRecord(item)) throw new HttpError(400, `items.${index} is invalid`);

    const quantity = Number(item.quantity ?? 1);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
      throw new HttpError(400, `items.${index}.quantity is invalid`);
    }

    return {
      productId: optionalBoundedString(item.productId, `items.${index}.productId`, 80),
      title: requireBoundedString(item.title, `items.${index}.title`, 1, 120),
      category: optionalBoundedString(item.category, `items.${index}.category`, 80),
      orderType: optionalOrderType(item.orderType, item),
      price: optionalBoundedString(item.price, `items.${index}.price`, 40),
      dimensions: optionalBoundedString(item.dimensions, `items.${index}.dimensions`, 80),
      quantity,
      notes: optionalBoundedString(item.notes, `items.${index}.notes`, 300),
      imageUrl: optionalBoundedString(item.imageUrl, `items.${index}.imageUrl`, 300),
    };
  });
}

function optionalOrderType(value: unknown, item: Record<string, unknown>) {
  if (typeof value === "string" && orderTypes.includes(value as (typeof orderTypes)[number])) return value;
  return inferOrderType([{
    productId: optionalBoundedString(item.productId, "productId", 80),
    title: typeof item.title === "string" ? item.title : "",
    category: optionalBoundedString(item.category, "category", 80),
    orderType: null,
    price: null,
    dimensions: null,
    quantity: 1,
    notes: null,
    imageUrl: null,
  }]);
}

function summarizeOrderItems(items: OrderItemInput[]) {
  if (items.length === 1) {
    const item = items[0];
    return item.quantity > 1 ? `${item.quantity}x ${item.title}` : item.title;
  }

  return `${items.length} itens: ${items.slice(0, 3).map((item) => item.title).join(", ")}${items.length > 3 ? "..." : ""}`;
}

function inferOrderType(items: OrderItemInput[]) {
  const explicitTypes = items.map((item) => item.orderType).filter(Boolean);
  const uniqueExplicitTypes = Array.from(new Set(explicitTypes));

  if (uniqueExplicitTypes.length === 1) return uniqueExplicitTypes[0];
  if (uniqueExplicitTypes.length > 1) return "outros";

  const categories = items.map((item) => `${item.productId ?? ""} ${item.category ?? ""} ${item.title}`.toLowerCase());

  if (categories.some((value) => value.includes("maker"))) return "maker";
  if (categories.every((value) => value.includes("galeria") || value.includes("kit"))) return "galeria";
  if (categories.every((value) => value.includes("familinha"))) return "familinha";

  return "outros";
}

function inferOrderTypeFromText(value: string) {
  return inferOrderType([{
    productId: null,
    title: value,
    category: null,
    orderType: null,
    price: null,
    dimensions: null,
    quantity: 1,
    notes: null,
    imageUrl: null,
  }]);
}

function normalizePhone(value: string) {
  return value.replace(/\D/g, "") || value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requireString(value: unknown, field: string) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new HttpError(400, `${field} is required`);
  }

  return value.trim();
}

function optionalString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function requireBoundedString(value: unknown, field: string, minLength: number, maxLength: number) {
  const text = requireString(value, field);
  if (text.length < minLength || text.length > maxLength) {
    throw new HttpError(400, `${field} must be between ${minLength} and ${maxLength} characters`);
  }

  return text;
}

function optionalBoundedString(value: unknown, field: string, maxLength: number) {
  const text = optionalString(value);
  if (!text) return null;
  if (text.length > maxLength) {
    throw new HttpError(400, `${field} must be up to ${maxLength} characters`);
  }

  return text;
}

function normalizeRequiredPhone(value: unknown) {
  const phone = requireString(value, "phone");
  const digits = normalizePhone(phone);
  if (!/^\d{10,15}$/.test(digits)) {
    throw new HttpError(400, "phone is invalid");
  }

  return digits;
}

function optionalEmail(value: unknown) {
  const email = optionalBoundedString(value, "email", 120);
  if (!email) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new HttpError(400, "email is invalid");
  }

  return email.toLowerCase();
}

function requireStringArray(value: unknown, field: string) {
  if (!Array.isArray(value)) {
    throw new HttpError(400, `${field} is required`);
  }

  const items = value.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean);
  if (items.length === 0) {
    throw new HttpError(400, `${field} is required`);
  }

  return items;
}

function requireNumber(value: unknown, field: string) {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    throw new HttpError(400, `${field} is invalid`);
  }

  return number;
}

function requireEnum<T extends string>(value: unknown, field: string, allowed: readonly T[]) {
  if (typeof value !== "string" || !allowed.includes(value as T)) {
    throw new HttpError(400, `${field} is invalid`);
  }

  return value as T;
}

function requireObjectKey(value: unknown, field: string) {
  const key = objectKeyFromValue(value);
  if (!key) {
    throw new HttpError(400, `${field} is required`);
  }

  return key;
}

function optionalObjectKey(value: unknown) {
  return objectKeyFromValue(value);
}

function objectKeyFromValue(value: unknown) {
  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  const localGalleryPrefix = "/api/gallery-images/";
  if (trimmed.startsWith(localGalleryPrefix)) {
    return decodeURIComponent(trimmed.slice(localGalleryPrefix.length));
  }

  try {
    const url = new URL(trimmed);
    const pathPrefix = "/api/gallery-images/";
    const prefixIndex = url.pathname.indexOf(pathPrefix);
    if (prefixIndex >= 0) {
      return decodeURIComponent(url.pathname.slice(prefixIndex + pathPrefix.length));
    }
  } catch {
    // Plain object keys such as "gallery/file.webp" are expected here.
  }

  return trimmed.replace(/^\/+/, "");
}

function galleryImageUrl(objectKey: string) {
  return `/api/gallery-images/${objectKey}`;
}

function parseStringArray(value: string) {
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is string => typeof item === "string");
    }
  } catch {
    return [];
  }

  return [];
}

function rejectOversizedJson(request: Request, env: Env) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > maxJsonBodyBytes) {
    return json({ error: "A mensagem enviada está muito grande." }, 413, env);
  }

  return null;
}

function rejectCrossSiteAdminMutation(request: Request, env: Env, url: URL) {
  if (!url.pathname.startsWith("/api/admin/")) return null;
  if (["GET", "HEAD", "OPTIONS"].includes(request.method)) return null;
  if (!env.APP_ORIGIN) return null;

  const expectedOrigin = normalizeOrigin(env.APP_ORIGIN);
  const origin = normalizeOrigin(request.headers.get("origin"));
  const referer = normalizeOrigin(request.headers.get("referer"));
  const actualOrigin = origin ?? referer;

  if (actualOrigin && expectedOrigin && actualOrigin !== expectedOrigin) {
    return json({ error: "Origem da requisição não permitida." }, 403, env);
  }

  return null;
}

function normalizeOrigin(value: string | null | undefined) {
  if (!value) return null;

  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

function clientFingerprint(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = request.headers.get("cf-connecting-ip") ?? request.headers.get("x-real-ip") ?? forwardedFor;
  return ip || request.headers.get("user-agent") || "unknown-client";
}

async function checkRateLimit(env: Env, scope: string, identifier: string, limit: number, windowMs: number) {
  const db = requireDb(env);
  if (db instanceof Response) return db;

  const now = Date.now();
  const key = await sha256Hex(`${scope}:${identifier}`);
  const existing = await db.prepare(
    "SELECT count, window_start, expires_at FROM rate_limits WHERE key = ? LIMIT 1",
  )
    .bind(key)
    .first<{ count: number; window_start: number; expires_at: number }>();

  if (existing && existing.expires_at > now) {
    if (existing.count >= limit) {
      return rateLimitResponse(env, existing.expires_at - now);
    }

    await db.prepare("UPDATE rate_limits SET count = ?, updated_at = ? WHERE key = ?")
      .bind(existing.count + 1, new Date().toISOString(), key)
      .run();
    return null;
  }

  await db.prepare(
    `INSERT OR REPLACE INTO rate_limits (key, scope, count, window_start, expires_at, updated_at)
     VALUES (?, ?, 1, ?, ?, ?)`,
  )
    .bind(key, scope, now, now + windowMs, new Date().toISOString())
    .run();

  return null;
}

function rateLimitResponse(env: Env, retryAfterMs: number) {
  const retryAfterSeconds = Math.max(1, Math.ceil(retryAfterMs / 1000));
  const response = json({
    error: "Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente novamente.",
  }, 429, env);
  response.headers.set("retry-after", String(retryAfterSeconds));
  return response;
}

function requireDb(env: Env) {
  if (!env.DB) {
    return json({ error: "DB is not configured" }, 503, env);
  }

  return env.DB;
}

function randomToken() {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function orderCode() {
  const bytes = new Uint8Array(3);
  crypto.getRandomValues(bytes);
  const suffix = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("").toUpperCase();
  return `PED-${suffix}`;
}

function safePathPart(value: string) {
  return value.replace(/[^\w.-]+/g, "-").replace(/^-+|-+$/g, "") || "temporary";
}

function safeFileName(fileName: string) {
  return fileName.normalize("NFKD").replace(/[^\w.-]+/g, "-").replace(/^-+|-+$/g, "") || "upload";
}

type WhatsAppOrderSummary = {
  code: string;
  customerName: string;
  phone: string;
  email: string | null;
  product: string;
  orderType: string;
  source: string;
  size: string | null;
  colors: string | null;
  notes: string | null;
  items: OrderItemInput[];
  expiresAt: string;
};

function buildWhatsAppUrl(number: string, summary: WhatsAppOrderSummary) {
  if (!number) return null;

  const isMakerOrder = summary.orderType === "maker" || summary.source === "maker";
  const messageLines = isMakerOrder ? buildMakerWhatsAppMessage(summary) : buildCartWhatsAppMessage(summary);

  const message = encodeURIComponent(messageLines.join("\n"));
  return `https://api.whatsapp.com/send?phone=${number.replace(/\D/g, "")}&text=${message}`;
}

function buildMakerWhatsAppMessage(summary: WhatsAppOrderSummary) {
  const note = noteReader(summary.notes);
  const subtitle = note("Subtitulo");
  const orientation = note("Orientacao");
  const background = note("Fundo");
  const outline = note("Traco");
  const uploadedFile = note("Arquivo enviado");
  const designerNotes = note("Observacoes da designer");

  return [
    `Olá, Maiara! Chegou um novo pedido Maker pelo site: ${summary.code}.`,
    `Pagamento: aguardando confirmação até ${formatBrazilianDateTime(summary.expiresAt)}.`,
    "",
    "Cliente:",
    `Nome: ${summary.customerName}`,
    `WhatsApp: ${summary.phone}`,
    `E-mail: ${summary.email ?? "não informado"}`,
    "",
    "Projeto Maker:",
    `Título: ${summary.product.replace(/^Maker:\s*/i, "") || "não informado"}`,
    `Subtítulo: ${subtitle ?? "não informado"}`,
    `Tamanho: ${summary.size ?? "não informado"}`,
    `Orientação: ${orientation ?? "não informado"}`,
    `Cores: fundo ${background ?? "não informado"} e traço ${outline ?? "não informado"}`,
    `Arquivo de referência: ${uploadedFile ?? "cliente enviará pelo WhatsApp"}`,
    `Observações: ${designerNotes ?? "sem observações"}`,
    "",
    "Próximo passo:",
    "Confirmar o pagamento com a cliente e, depois, alterar o status do pedido para Pago no painel.",
  ];
}

function buildCartWhatsAppMessage(summary: WhatsAppOrderSummary) {
  const typeLabels = Array.from(new Set(summary.items.map((item) => item.orderType ?? summary.orderType).filter(Boolean)))
    .map((type) => orderTypeLabel(type));
  const itemLines = summary.items.map((item, index) => {
    const itemType = orderTypeLabel(item.orderType ?? summary.orderType);
    const details = [
      `Tipo: ${itemType}`,
      item.price ? `Valor: ${item.price}` : null,
      item.dimensions ? `Tamanho: ${item.dimensions}` : null,
      item.category ? `Categoria: ${item.category}` : null,
    ].filter(Boolean).join(" | ");

    return `${index + 1}. ${item.quantity}x ${item.title}${details ? ` (${details})` : ""}${item.notes ? `\n   Observações do item: ${item.notes}` : ""}`;
  });

  return [
    `Olá, Maiara! Novo pedido ${summary.code} pelo site.`,
    `Status: aguardando pagamento até ${formatBrazilianDateTime(summary.expiresAt)}`,
    `Categoria principal: ${orderTypeLabel(summary.orderType)}`,
    `Tipos no pedido: ${typeLabels.join(", ") || orderTypeLabel(summary.orderType)}`,
    `Origem: ${summary.source === "maker" ? "Maker" : "Carrinho"}`,
    "",
    "Cliente:",
    `Nome: ${summary.customerName}`,
    `WhatsApp: ${summary.phone}`,
    `E-mail: ${summary.email ?? "não informado"}`,
    "",
    "Itens:",
    ...itemLines,
    "",
    "Detalhes:",
    `Resumo: ${summary.product}`,
    `Tamanho: ${summary.size ?? "não informado"}`,
    `Cores: ${summary.colors ?? "não informado"}`,
    `Observações: ${summary.notes ?? "sem observações"}`,
    "",
    "Próximo passo:",
    "Confirmar pagamento com a cliente e ajustar o status no painel.",
  ];
}

function noteReader(notes: string | null) {
  const values = new Map<string, string>();

  for (const line of (notes ?? "").split("\n")) {
    const separatorIndex = line.indexOf(":");
    if (separatorIndex <= 0) continue;

    const key = normalizeNoteKey(line.slice(0, separatorIndex));
    const value = line.slice(separatorIndex + 1).trim();
    if (value) values.set(key, value);
  }

  return (key: string) => values.get(normalizeNoteKey(key));
}

function normalizeNoteKey(key: string) {
  return key
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function orderTypeLabel(value: string) {
  const labels: Record<string, string> = {
    familinha: "Familinha",
    maker: "Maker",
    galeria: "Galeria",
    outros: "Outros projetos",
  };

  return labels[value] ?? value;
}

function formatBrazilianDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Cuiaba",
  }).format(date);
}

async function deleteExpiredUnpaidOrders(env: Env) {
  const db = requireDb(env);
  if (db instanceof Response) return;

  await db.prepare(
    "DELETE FROM orders WHERE status = 'awaiting_payment' AND expires_at IS NOT NULL AND expires_at <= ?",
  )
    .bind(new Date().toISOString())
    .run();
}

async function deleteExpiredRateLimits(env: Env) {
  const db = requireDb(env);
  if (db instanceof Response) return;

  await db.prepare("DELETE FROM rate_limits WHERE expires_at <= ?")
    .bind(Date.now())
    .run();
}

async function ensureBootstrapAdmin(env: Env, request?: Request) {
  const db = requireDb(env);
  if (db instanceof Response) return;

  const existing = await db.prepare("SELECT id FROM admin_users LIMIT 1").first<{ id: string }>();
  if (existing) return;

  const isLocalRequest = request ? ["localhost", "127.0.0.1"].includes(new URL(request.url).hostname) : false;
  const username = normalizeUsername(optionalString(env.ADMIN_OWNER_USERNAME) ?? "admin");
  const email = (optionalString(env.ADMIN_OWNER_EMAIL) ?? (isLocalRequest ? "admin@local.test" : null))?.toLowerCase();
  const password = optionalString(env.ADMIN_OWNER_PASSWORD) ?? (isLocalRequest ? "admin123456" : null);

  if (!email || !password) return;

  const now = new Date().toISOString();
  await db.prepare(
    `INSERT INTO admin_users (id, username, email, password_hash, role, is_active, created_at, updated_at)
     VALUES (?, ?, ?, ?, 'owner', 1, ?, ?)`,
  )
    .bind(crypto.randomUUID(), username, email, await hashPassword(password), now, now)
    .run();
}

function toAdminUserIdentity(user: AdminUserRow): AdminIdentity {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
  };
}

function toAdminUserResponse(user: AdminUserRow) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    isActive: user.is_active === 1,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
    lastLoginAt: user.last_login_at,
  };
}

function normalizeUsername(value: string) {
  const username = value.trim().toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
  if (username.length < 3) throw new Error("username is invalid");
  return username;
}

async function hashPassword(password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations: passwordHashIterations },
    key,
    256,
  );

  return `pbkdf2-sha256:${passwordHashIterations}:${bytesToBase64Url(salt)}:${bytesToBase64Url(new Uint8Array(bits))}`;
}

async function verifyPassword(password: string, storedHash: string) {
  const [algorithm, iterationsText, saltText, hashText] = storedHash.split(":");
  const iterations = Number(iterationsText);
  if (algorithm !== "pbkdf2-sha256" || !Number.isInteger(iterations) || !saltText || !hashText) return false;

  const salt = base64UrlToBytes(saltText);
  const expectedHash = base64UrlToBytes(hashText);
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations },
    key,
    expectedHash.byteLength * 8,
  );

  return timingSafeEqual(new Uint8Array(bits), expectedHash);
}

async function sha256Hex(value: string) {
  const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(hash), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function timingSafeEqual(left: Uint8Array, right: Uint8Array) {
  if (left.byteLength !== right.byteLength) return false;

  let diff = 0;
  for (let index = 0; index < left.byteLength; index += 1) {
    diff |= left[index] ^ right[index];
  }

  return diff === 0;
}

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToBytes(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(base64);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function getCookie(request: Request, name: string) {
  const cookies = request.headers.get("cookie") ?? "";
  const match = cookies.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
}

function buildAdminSessionCookie(token: string, expiresAt: Date, request: Request, env: Env) {
  const secure = isSecureRequest(request, env) ? "; Secure" : "";
  return `${adminSessionCookieName}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Expires=${expiresAt.toUTCString()}; Max-Age=${Math.floor(adminSessionDurationMs / 1000)}${secure}`;
}

function clearAdminSessionCookie(request: Request, env: Env) {
  const secure = isSecureRequest(request, env) ? "; Secure" : "";
  return `${adminSessionCookieName}=; Path=/; HttpOnly; SameSite=Lax; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0${secure}`;
}

function isSecureRequest(request: Request, env: Env) {
  const url = new URL(request.url);
  return url.protocol === "https:";
}

async function requireAdmin(request: Request, env: Env): Promise<AdminIdentity | Response> {
  const db = requireDb(env);
  if (db instanceof Response) return db;

  await ensureBootstrapAdmin(env);

  const token = getCookie(request, adminSessionCookieName);
  if (!token) return json({ error: "Acesso nao autenticado." }, 401, env);

  const tokenHash = await sha256Hex(token);
  const session = await db.prepare(
    `SELECT admin_users.id, admin_users.username, admin_users.email, admin_users.password_hash,
            admin_users.role, admin_users.is_active, admin_users.created_at, admin_users.updated_at,
            admin_users.last_login_at, admin_sessions.id AS session_id, admin_sessions.expires_at
     FROM admin_sessions
     INNER JOIN admin_users ON admin_users.id = admin_sessions.user_id
     WHERE admin_sessions.token_hash = ?
     LIMIT 1`,
  )
    .bind(tokenHash)
    .first<AdminSessionRow>();

  if (!session || session.is_active !== 1 || new Date(session.expires_at).getTime() <= Date.now()) {
    await db.prepare("DELETE FROM admin_sessions WHERE token_hash = ?").bind(tokenHash).run().catch(() => undefined);
    return json({ error: "Sessao expirada." }, 401, env);
  }

  await db.prepare("UPDATE admin_sessions SET last_seen_at = ? WHERE id = ?")
    .bind(new Date().toISOString(), session.session_id)
    .run();

  return toAdminUserIdentity(session);
}

function json(body: unknown, status = 200, env?: Env) {
  return withCors(new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  }), env);
}

function withCors(response: Response, env?: Env) {
  const headers = new Headers(response.headers);
  headers.set("access-control-allow-origin", env?.APP_ORIGIN ?? "*");
  headers.set("access-control-allow-methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  headers.set("access-control-allow-headers", "content-type,x-file-name");
  if (env?.APP_ORIGIN) {
    headers.set("access-control-allow-credentials", "true");
  }
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}
