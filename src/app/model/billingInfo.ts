import { Discount } from "./discount";

export interface BillingInfo {
  id: number;
  email: string;
  client_type: string;  // matches @Column(name = "client_type")

  // Common fields
  iban: string;
  iban_name: string;    // matches @Column(name = "iban_name")
  judet: string;
  oras: string;
  adresa: string;
  contract_number: string;  // matches @Column(name = "contract_number")
  phone_number: string;     // matches @Column(name = "phone_number")

  // Personal fields
  first_name: string;   // matches @Column(name = "first_name")
  last_name: string;    // matches @Column(name = "last_name")
  cnp: string;

  // Company fields
  company_name: string;     // matches @Column(name = "company_name")
  cui: string;
  registration_number: string;  // matches @Column(name = "registration_number")

  discounts: Discount[];
}
