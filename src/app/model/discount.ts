export interface Discount {
  id: number; // The ID of the Discount record
  service: string; // The name of the service for which the discount is applied
  amountPercentage: number; // The percentage of the discount (0 to 100)
}
