export default interface JoinAttribute {
  property: string,  
  aggregate: ('COUNT' | 'MIN' | 'MAX' | 'SUM' | 'AVG')[]
}