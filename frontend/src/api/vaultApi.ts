import type { Credential } from "../types/Credential";

const API = "http://localhost:5000/api";

async function parse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.json().catch(() => ({ message: "Error inesperado" }));
    throw new Error(body.message ?? "Error inesperado");
  }
  return response.json();
}

export async function getStatus(): Promise<{ configured: boolean }> {
  return parse(await fetch(`${API}/vault/status`));
}

export async function setupVault(masterPassword: string): Promise<void> {
  await parse(await fetch(`${API}/vault/setup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ masterPassword })
  }));
}

export async function getCredentials(): Promise<Credential[]> {
  return parse(await fetch(`${API}/credentials`));
}

export async function createCredential(input: {
  service: string;
  username: string;
  password: string;
  masterPassword: string;
}): Promise<void> {
  await parse(await fetch(`${API}/credentials`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input)
  }));
}

export async function revealCredential(id: number, masterPassword: string): Promise<string> {
  const result = await parse<{ password: string }>(await fetch(`${API}/credentials/${id}/reveal`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ masterPassword })
  }));
  return result.password;
}
