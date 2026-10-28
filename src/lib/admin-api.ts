const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "";

export type GalleryProductApiRow = {
  id: string;
  name: string;
  title: string;
  category: string;
  price: string;
  originalPrice: string | null;
  dimensions: string;
  includedItems: string[];
  description: string;
  placeholder: string;
  staticImage: string;
  hoverImage: string | null;
  surface: string;
  frameFormat: string;
  width: number;
  aspectRatio: string;
  offset: number;
  rotate: number;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type OtherProjectApiRow = GalleryProductApiRow & {
  number: string;
  isActive: boolean;
};

export type GalleryProductInput = {
  name: string;
  title: string;
  category: string;
  price: string;
  originalPrice?: string;
  dimensions: string;
  includedItems: string[];
  description: string;
  placeholder: string;
  staticImage: string;
  hoverImage?: string;
  surface: string;
  frameFormat: string;
  width: number;
  aspectRatio: string;
  offset: number;
  rotate: number;
  sortOrder?: number;
};

export type GalleryImageAsset = {
  key: string;
  url: string;
  size: number;
  uploaded: string;
  contentType: string | null;
  area?: "quadros" | "outros-projetos" | "unassigned";
  isUsedInQuadros?: boolean;
  isUsedInOtherProjects?: boolean;
};

export type BucketFileAsset = GalleryImageAsset & {
  group: "gallery" | "orders" | "other";
};

export type AdminOrderStatus =
  | "awaiting_payment"
  | "received"
  | "payment_confirmed"
  | "in_production"
  | "awaiting_approval"
  | "finished";

export type AdminOrderType = "familinha" | "maker" | "galeria" | "outros";
export type AdminOrderSource = "manual" | "cart" | "maker";

export type AdminOrderRow = {
  id: string;
  code: string;
  product: string;
  size: string | null;
  colors: string | null;
  notes: string | null;
  status: AdminOrderStatus;
  order_type: AdminOrderType;
  source: AdminOrderSource;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  items?: AdminOrderItemRow[];
  files: AdminOrderFileRow[];
};

export type AdminOrderItemRow = {
  product_id: string | null;
  title: string;
  category: string | null;
  order_type: AdminOrderType | null;
  price: string | null;
  dimensions: string | null;
  quantity: number;
  notes: string | null;
  image_url: string | null;
  sort_order: number;
};

export type AdminOrderFileRow = {
  id: string;
  kind: "original" | "preview" | "final";
  file_name: string;
  content_type: string;
  size_bytes: number;
  created_at: string;
};

export type AdminOrdersResponse = {
  orders: AdminOrderRow[];
};

export type AdminUserRole = "owner" | "admin";

export type AdminUserRow = {
  id: string;
  username: string;
  email: string;
  role: AdminUserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
};

export type AdminUserInput = {
  username: string;
  email: string;
  password: string;
  role: AdminUserRole;
};

export async function listAdminOrders() {
  const response = await fetch(`${apiBaseUrl}/api/admin/orders`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(await readApiError(response));
  }

  return response.json() as Promise<AdminOrdersResponse>;
}

export async function updateAdminOrderStatus(code: string, status: AdminOrderStatus, note?: string) {
  const response = await fetch(`${apiBaseUrl}/api/admin/orders/${code}/status`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ status, note }),
  });

  if (!response.ok) {
    throw new Error(await readApiError(response));
  }

  return response.json() as Promise<{ code: string; status: AdminOrderStatus }>;
}

export async function deleteAdminOrder(code: string) {
  const response = await fetch(`${apiBaseUrl}/api/admin/orders/${code}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(await readApiError(response));
  }

  return response.json() as Promise<{ code: string }>;
}

export function adminOrderFileUrl(fileId: string) {
  return `${apiBaseUrl}/api/admin/files/${fileId}`;
}

export async function listAdminGalleryProducts() {
  const response = await fetch(`${apiBaseUrl}/api/admin/gallery-products`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(await readApiError(response));
  }

  return response.json() as Promise<{ products: GalleryProductApiRow[] }>;
}

export async function createAdminGalleryProduct(input: GalleryProductInput) {
  const response = await fetch(`${apiBaseUrl}/api/admin/gallery-products`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(await readApiError(response));
  }

  return response.json() as Promise<{ product: GalleryProductApiRow }>;
}

export async function updateAdminGalleryProduct(id: string, input: GalleryProductInput) {
  const response = await fetch(`${apiBaseUrl}/api/admin/gallery-products/${id}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(await readApiError(response));
  }

  return response.json() as Promise<{ product: GalleryProductApiRow }>;
}

export async function deleteAdminGalleryProduct(id: string) {
  const response = await fetch(`${apiBaseUrl}/api/admin/gallery-products/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(await readApiError(response));
  }

  return response.json() as Promise<{ id: string }>;
}

export async function listAdminOtherProjects() {
  const response = await fetch(`${apiBaseUrl}/api/admin/other-projects`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(await readApiError(response));
  }

  return response.json() as Promise<{ products: OtherProjectApiRow[] }>;
}

export async function createAdminOtherProject(input: GalleryProductInput) {
  const response = await fetch(`${apiBaseUrl}/api/admin/other-projects`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(await readApiError(response));
  }

  return response.json() as Promise<{ product: OtherProjectApiRow }>;
}

export async function updateAdminOtherProject(id: string, input: GalleryProductInput) {
  const response = await fetch(`${apiBaseUrl}/api/admin/other-projects/${id}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(await readApiError(response));
  }

  return response.json() as Promise<{ product: OtherProjectApiRow }>;
}

export async function deleteAdminOtherProject(id: string) {
  const response = await fetch(`${apiBaseUrl}/api/admin/other-projects/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(await readApiError(response));
  }

  return response.json() as Promise<{ id: string }>;
}

export async function uploadAdminGalleryImage(file: File, area?: string) {
  const headers: Record<string, string> = {
    "content-type": file.type,
    "x-file-name": file.name,
  };
  if (area) {
    headers["x-area"] = area;
  }

  const response = await fetch(`${apiBaseUrl}/api/admin/gallery-images`, {
    method: "PUT",
    headers,
    credentials: "include",
    body: file,
  });

  if (!response.ok) {
    throw new Error(await readApiError(response));
  }

  return response.json() as Promise<{ fileId: string; objectKey: string; url: string }>;
}

export async function listAdminGalleryImages(cursor?: string) {
  const params = cursor ? `?cursor=${encodeURIComponent(cursor)}` : "";
  const response = await fetch(`${apiBaseUrl}/api/admin/gallery-images${params}`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(await readApiError(response));
  }

  return response.json() as Promise<{ images: GalleryImageAsset[]; cursor: string | null; truncated: boolean }>;
}

export async function deleteAdminGalleryImage(key: string) {
  const response = await fetch(`${apiBaseUrl}/api/admin/gallery-images/${encodeURIComponent(key)}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(await readApiError(response));
  }

  return response.json() as Promise<{ key: string }>;
}

export async function listAdminBucketFiles(prefix = "", cursor?: string) {
  const params = new URLSearchParams();
  if (prefix) params.set("prefix", prefix);
  if (cursor) params.set("cursor", cursor);
  const query = params.toString() ? `?${params.toString()}` : "";

  const response = await fetch(`${apiBaseUrl}/api/admin/bucket-files${query}`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(await readApiError(response));
  }

  return response.json() as Promise<{ files: BucketFileAsset[]; cursor: string | null; truncated: boolean; prefix: string }>;
}

export function adminBucketFileUrl(key: string) {
  return `${apiBaseUrl}/api/admin/bucket-files/${encodeURIComponent(key)}`;
}

export async function deleteAdminBucketFile(key: string) {
  const response = await fetch(adminBucketFileUrl(key), {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(await readApiError(response));
  }

  return response.json() as Promise<{ key: string }>;
}

export async function listAdminUsers() {
  const response = await fetch(`${apiBaseUrl}/api/admin/users`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(await readApiError(response));
  }

  return response.json() as Promise<{ users: AdminUserRow[] }>;
}

export async function createAdminUser(input: AdminUserInput) {
  const response = await fetch(`${apiBaseUrl}/api/admin/users`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(await readApiError(response));
  }

  return response.json() as Promise<{ user: AdminUserRow }>;
}

async function readApiError(response: Response) {
  try {
    const body = await response.json();
    return typeof body.error === "string" ? body.error : "Erro na API";
  } catch {
    return "Erro na API";
  }
}
