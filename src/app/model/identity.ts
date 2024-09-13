// identity.model.ts
export interface Identity {
  provider: string;
  isSocial: boolean;
  access_token: string;
  expires_in: number;
  connection: string;
  user_id: string;
}
