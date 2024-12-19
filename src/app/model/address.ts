export interface Address {
    shortName: string;
    name: string;
    phone1: string;
    phone2?: string;
    county: string;
    locality: string;
    street: string;
    number: string;
    postalCode: string;
    block?: string;
    staircase?: string;
    floor?: string;
    apartment?: string;
}
