import {Courier} from "./courier";

export interface ServicePricing {
  id?: number;
  courierCompany: Courier;
  serviceName: string;
  basePrice: number;
  premiumAddedPrice: number;
  standardAddedPrice: number;
}
