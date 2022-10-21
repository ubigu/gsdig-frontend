import LayerSettings from '@src/interfaces/LayerSettings';

export default interface WorkspaceDefaults {
  title: string,
  center: number[],
  zoom: number,
  backgroundLayer: LayerSettings
}