import type { Credential, CreateCredentialRequest, CreateCredentialResponse, DecryptCredentialRequest, DecryptCredentialResponse } from "../types/Credential";
import type { MessageResponse, VaultSetupRequest, VaultStatusResponse } from "../types/vault";

const API = "http://localhost:5000/api";

async function parse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null);
    const message = body && typeof body === "object" && "message" in body && typeof body.message === "string"
      ? body.message : "Error inesperado";
    throw new Error(message);
  }
  return response.json();
}

function post(body: object): RequestInit {
  return { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) };
}

export async function getStatus(signal?: AbortSignal): Promise<VaultStatusResponse> {
  return parse(await fetch(`${API}/vault/status`, { signal }));
}

export async function setupVault(input: VaultSetupRequest): Promise<MessageResponse> {
  return parse(await fetch(`${API}/vault/setup`, post(input)));
}

export async function getCredentials(signal?: AbortSignal): Promise<Credential[]> {
  return parse(await fetch(`${API}/credentials`, { signal }));
}

export async function createCredential(input: CreateCredentialRequest): Promise<CreateCredentialResponse> {
  return parse(await fetch(`${API}/credentials`, post(input)));
}

export async function revealCredential(id: number, input: DecryptCredentialRequest): Promise<DecryptCredentialResponse> {
  return parse(await fetch(`${API}/credentials/${id}/reveal`, post(input)));
}
