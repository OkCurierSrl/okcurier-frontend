
export interface FlatShipment {
  pages: number;
  awb: string,
  courier: string,
  senderName: string,
  senderAddress: string,
  recipientName: string,
  recipientAddress: string,
  creationDate: string,
  pickupDate: string,
  count: number,
  iban: string,
  orderNumber: string,
  packageCount: number,
  weight: number,
  weightRechecked: number,
  extraPriceWeighRecheck: number,
  cashOnDelivery: number,
  status: string
  isSelected: string
}
