import SensitivitySetting from './SensitivitySetting'

export default interface UnitDatasetMetadata {
  uuid: string,
  title: string,
  description: string,
  organization: string,
  publicity: boolean,
  extent: number[],
  attributes: { [key: string]: string },
  sensitivitySetting: SensitivitySetting,
}
