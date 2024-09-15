// Updated Discount.ts interface
import { OkCurierServicesEnum } from './okCurierServicesEnum'; // Assuming an enum file exists for OkCurierServicesEnum

export interface Discount {
  id: number; // The ID of the Discount record
  courierCompanyEnum: string; // Name of the courier company (assuming it's represented as a string)
  servicesEnumDoubleMap: { [key in OkCurierServicesEnum]?: number }; // Key-value map with the service as key and discount percentage as value
}
