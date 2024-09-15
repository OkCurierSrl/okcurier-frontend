export enum OkCurierServicesEnum {
  PRET_COLET = 'PRET_COLET',
  PRET_PLIC = 'PRET_PLIC',
  GREUTATE_BAZA_COLET = 'GREUTATE_BAZA_COLET',
  GREUTATE_EXTRA = 'GREUTATE_EXTRA',
  KILOMETRII_EXTRA = 'KILOMETRII_EXTRA',
  RAMBURS_IN_CONT = 'RAMBURS_IN_CONT',
  RETUR_COLET_NELIVRAT = 'RETUR_COLET_NELIVRAT',
  RECANTARIRE = 'RECANTARIRE',
  COLET_EXTRA = 'COLET_EXTRA',
  COLET_ATIPIC = 'COLET_ATIPIC',
  COLET_LA_SCHIMB = 'COLET_LA_SCHIMB',
  DOCUMENT_LA_SCHIMB = 'DOCUMENT_LA_SCHIMB',
  REDIRECTIONARE = 'REDIRECTIONARE',
  DESCHIDERE_LA_LIVRARE = 'DESCHIDERE_LA_LIVRARE',
  ASIGURARE = 'ASIGURARE',
  INDEX_TRANSPORT = 'INDEX_TRANSPORT',
  TVA = 'TVA',
}

// Mapping of enum values to their display strings
export const OkCurierServicesDisplayMap: { [key in OkCurierServicesEnum]: string } = {
  [OkCurierServicesEnum.PRET_COLET]: 'Pret colet',
  [OkCurierServicesEnum.PRET_PLIC]: 'Pret plic',
  [OkCurierServicesEnum.GREUTATE_BAZA_COLET]: 'Greutate Baza Colet',
  [OkCurierServicesEnum.GREUTATE_EXTRA]: 'Greutate Extra',
  [OkCurierServicesEnum.KILOMETRII_EXTRA]: 'Kilometrii Extra',
  [OkCurierServicesEnum.RAMBURS_IN_CONT]: 'Ramburs In Cont',
  [OkCurierServicesEnum.RETUR_COLET_NELIVRAT]: 'Retur Colet Nelivrat',
  [OkCurierServicesEnum.RECANTARIRE]: 'Recantarire',
  [OkCurierServicesEnum.COLET_EXTRA]: 'Colet Extra',
  [OkCurierServicesEnum.COLET_ATIPIC]: 'Colet Atipic',
  [OkCurierServicesEnum.COLET_LA_SCHIMB]: 'Colet La Schimb',
  [OkCurierServicesEnum.DOCUMENT_LA_SCHIMB]: 'Document La Schimb',
  [OkCurierServicesEnum.REDIRECTIONARE]: 'Redirectionare',
  [OkCurierServicesEnum.DESCHIDERE_LA_LIVRARE]: 'Deschidere La Livrare',
  [OkCurierServicesEnum.ASIGURARE]: 'Asigurare',
  [OkCurierServicesEnum.INDEX_TRANSPORT]: 'Index Transport',
  [OkCurierServicesEnum.TVA]: 'TVA',
};

// Example usage to get the display name
const displayName = OkCurierServicesDisplayMap[OkCurierServicesEnum.PRET_COLET]; // "Pret colet"
