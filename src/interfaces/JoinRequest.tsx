import JoinAttribute from './JoinAttribute'

export default interface JoinRequest {
  title: string,
  description?: string
  arealDivision: string,
  areaAttributes: string[],
  unitDataset: string,
  dataAttributes: JoinAttribute[],
  additionalGroupingProperty?: string
}