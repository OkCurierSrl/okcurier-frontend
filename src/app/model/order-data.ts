import {Address} from "./address";

export interface OrderData {
    expeditor: Address;
    destinatar: Address;
    pickupDate: Date
    price: number
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
