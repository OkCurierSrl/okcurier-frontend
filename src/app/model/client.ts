import { Identity } from "./identity";
import { Role } from "./role";
import {Discount} from "./discount";
import {BillingInfo} from "./billingInfo";

export interface Client {
  user_id: string;
  email: string;
  name: string;
  picture: string;
  family_name: string;
  given_name: string;
  nickname: string;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
  last_login: string;
  last_ip: string;
  logins_count: number;
  identities: Identity[];
  roles?: Role[];  // Optional, since roles might be fetched separately
  billing_info?: BillingInfo; // Optional to reflect the backend structure
}
