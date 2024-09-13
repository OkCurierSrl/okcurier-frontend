import {Discount} from "./discount";

export interface BillingInfo {
  phone_number: string;
  id: number;
  email: string;
  contract_number: string;
  iban: string;
  company_name: string;
  cui: string;
  registration_number: string;
  discounts: Discount[];
}
