import AttributeInfo from './AttributeInfo'

export default interface ArealDivisionMetadata {
  uuid: string,
  title: string,
  description: string,
  organization: string,
  publicity: boolean,
  extent: number[],
  attributes: { [key: string]: AttributeInfo },
  createdByUser?: boolean
}