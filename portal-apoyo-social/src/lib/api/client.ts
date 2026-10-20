const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const esFormData = options.body instanceof FormData;

  const headers: Record<string, string> = esFormData
    ? { ...(options.headers as Record<string, string>) }
    : { "Content-Type": "application/json", ...(options.headers as Record<string, string>) };

  const respuesta = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!respuesta.ok) {
    const error = await respuesta.json().catch(() => null);
    throw new Error(
      error?.mensaje ?? "Ocurrió un error al comunicarse con el servidor."
    );
  }

  if (respuesta.status === 204) return null as T;
  return respuesta.json();
}
