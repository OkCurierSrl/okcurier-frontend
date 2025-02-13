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
  blocked: boolean;
  created_at: string;
  updated_at: string;
  last_login: string;
  last_ip: string;
  logins_count: number;
  identities: Identity[];
  roles?: Role[];
  billing_info?: BillingInfo;
}
