export interface OrderData {
  expeditor: {
    name: string;
    phone1: string;
    phone2?: string;
    county: string;
    city: string;
    street: string;
    number: string;
    postalCode: string;
    block?: string;
    staircase?: string;
    floor?: string;
    apartment?: string;
  };
  destinatar: {
    name: string;
    phone1: string;
    phone2?: string;
    county: string;
    city: string;
    street: string;
    number: string;
    postalCode: string;
    block?: string;
    staircase?: string;
    floor?: string;
    apartment?: string;
  };
  packages: {
    length: number;
    width: number;
    height: number;
    weight: number;
  }[];
  extraServices: {
    returColetNelivrat?: boolean;
    documentSchimb?: boolean;
    coletSchimb?: boolean;
    deschidereColet?: boolean;
    asigurare?: number;
    transportRamburs?: boolean;
    rambursCont?: number;
  };
  isPlicSelected: boolean;
}
