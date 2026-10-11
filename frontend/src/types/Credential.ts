export interface Credential {
  id: number;
  service: string;
  username: string;
  createdAtUtc: string;
}

export interface CreateCredentialRequest {
  service: string;
  username: string;
  password: string;
  masterPassword: string;
}

export interface CreateCredentialResponse { id: number; }
export interface DecryptCredentialRequest { masterPassword: string; }
export interface DecryptCredentialResponse { password: string; }
