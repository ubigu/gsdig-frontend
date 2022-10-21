export default interface SensitivitySetting {
  aggregate: 'COUNT' | 'MIN' | 'MAX' | 'SUM' | 'AVG',
  property?: string,
  minValue: number
}