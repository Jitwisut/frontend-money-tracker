const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

// ─── Token Management ───
function getToken() {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
}

export function setToken(token) {
  if (typeof window !== "undefined") {
    localStorage.setItem("token", token);
  }
}

export function removeToken() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
  }
}

export function isAuthenticated() {
  return !!getToken();
}

// ─── Centralized Request Helper (ตัวแก้บั๊กหลัก) ───
async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let res;
  try {
    res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });
  } catch (networkError) {
    // กรณีเน็ตหลุด หรือ Server ดับไปเลย
    throw new Error("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ (Network Error)");
  }

  // 1. ถ้า Server ตอบ 204 (เสร็จแต่ไม่มีเนื้อหา) ให้จบเลย
  if (res.status === 204) {
    return null;
  }

  // 2. อ่านเป็น Text ก่อนเสมอ (กันพังเวลา Server ส่ง HTML/Text มาตอน Error)
  const text = await res.text();
  let data = {};

  try {
    // พยายามแปลงเป็น JSON
    data = text ? JSON.parse(text) : {};
  } catch (err) {
    // ⚠️ ถ้าแปลงไม่ได้ แสดงว่า Server ส่ง Text ดิบมา (เช่น "Internal Server Error")
    // เราจะเก็บ Text นั้นไว้ใน field 'message' แทนที่จะให้แอปพัง
    console.warn("Non-JSON response from server:", text);
    data = { message: text || `Error ${res.status}: ${res.statusText}` };
  }

  // 3. เช็ค HTTP Error Code (4xx, 5xx)
  if (!res.ok) {
    // ดึงข้อความ Error มาแสดงให้รู้เรื่องที่สุด
    const errorMessage =
      data.message || data.error || `เกิดข้อผิดพลาด (${res.status})`;
    throw new Error(errorMessage);
  }

  return data;
}

// ─── Categories (แก้ให้มาใช้ request ตัวเดียวกัน) ───
export const getCategories = async () => {
  try {
    return await request("/api/transactions/category", { method: "GET" });
  } catch (err) {
    console.error("Failed to fetch categories:", err);
    // ถ้าพัง ให้คืนค่าว่าง แอปจะได้ไม่จอขาว
    return { data: [] };
  }
};

// ─── Auth ───
export async function login(username, password) {
  const data = await request("/auth/signin", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });
  if (data?.token) {
    setToken(data.token);
  }
  return data;
}

export async function register(username, password, name) {
  return request("/auth/register", {
    method: "POST",
    body: JSON.stringify({ username, password, name }),
  });
}

// ─── Transactions ───
export async function getTransactions({
  startDate,
  endDate,
  type,
  categoryId,
} = {}) {
  const params = new URLSearchParams();
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);
  if (type && type !== "ALL") params.append("type", type);

  // รองรับทั้งแบบหมวดเดียวและหลายหมวด (String ที่มี comma)
  if (categoryId && categoryId !== "ALL") {
    params.append("categoryId", categoryId);
  }

  const query = params.toString();
  return request(`/api/transactions${query ? `?${query}` : ""}`);
}

export async function createTransaction(body) {
  return request("/api/transactions", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateTransaction(id, body) {
  return request(`/api/transactions/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function deleteTransaction(id) {
  return request(`/api/transactions/${id}`, {
    method: "DELETE",
  });
}

// ─── Dashboard ───
export async function getDashboard({
  startDate,
  endDate,
  type,
  categoryId,
} = {}) {
  const params = new URLSearchParams();
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);
  if (type) params.append("type", type);

  if (categoryId && categoryId !== "ALL") {
    params.append("categoryId", categoryId);
  }

  const query = params.toString();
  return request(`/api/dashboard${query ? `?${query}` : ""}`);
}
