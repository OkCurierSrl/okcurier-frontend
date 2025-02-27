import {Discount} from "./discount";

export interface BillingInfo {
  adresa: string;
  oras: string;
  judet: string;
  cnp: string;
  lastName: string;
  firstName: string;
  clientType: string;
  phone_number: string;
  name: string;
  id: number;
  email: string;
  contract_number: string;
  iban: string;
  company_name: string;
  cui: string;
  registration_number: string;
  discounts: Discount[];
}
