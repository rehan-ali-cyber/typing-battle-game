const API_BASE_URL = (import.meta as any).env.VITE_API_URL || "http://localhost:5001";

/**
 * Gets a cookie value by name.
 */
export function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
}

interface RequestOptions extends RequestInit {
  body?: any;
}

/**
 * Wrapper for API fetch requests that automatically handles CSRF tokens and cookies.
 */
async function request(path: string, options: RequestOptions = {}) {
  const url = `${API_BASE_URL}${path}`;

  // Default headers
  const headers = new Headers(options.headers || {});
  
  // Set JSON headers if not uploading files
  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  // Double-Submit Cookie CSRF protection
  // Non-GET requests need the CSRF header
  const isSafeMethod = ["GET", "HEAD", "OPTIONS"].includes(options.method || "GET");
  if (!isSafeMethod) {
    let csrfToken = getCookie("csrf-token");
    
    // If CSRF token cookie is missing, bootstrap it first
    if (!csrfToken) {
      try {
        const bootstrapRes = await fetch(`${API_BASE_URL}/csrf-token`, { credentials: "include" });
        const bootstrapData = await bootstrapRes.json();
        if (bootstrapData.success) {
          csrfToken = bootstrapData.token;
        }
      } catch (err) {
        console.error("Failed to bootstrap CSRF token", err);
      }
    }

    if (csrfToken) {
      headers.set("X-CSRF-Token", csrfToken);
    }
  }

  const fetchOptions: RequestInit = {
    ...options,
    headers,
    credentials: "include", // Essential to send/receive cookies
  };

  // Stringify JSON body if necessary
  if (options.body && !(options.body instanceof FormData) && typeof options.body !== "string") {
    fetchOptions.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, fetchOptions);

  // Parse response
  let data;
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    data = await response.json();
  } else {
    data = { text: await response.text() };
  }

  if (!response.ok) {
    throw new Error(data.error || `HTTP error! status: ${response.status}`);
  }

  return data;
}

export const api = {
  get: (path: string, options?: RequestOptions) => request(path, { ...options, method: "GET" }),
  post: (path: string, body?: any, options?: RequestOptions) => request(path, { ...options, method: "POST", body }),
  put: (path: string, body?: any, options?: RequestOptions) => request(path, { ...options, method: "PUT", body }),
  delete: (path: string, options?: RequestOptions) => request(path, { ...options, method: "DELETE" }),
};
