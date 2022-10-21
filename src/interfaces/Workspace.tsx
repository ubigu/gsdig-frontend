import LayerSettings from "./LayerSettings";

export default interface Workspace {
  uuid: string,
  title: string,
  createdAt: Date,
  lastModifiedAt: Date,
  center: number[],
  zoom: number,
  backgroundLayers: LayerSettings[],
  dataLayer: LayerSettings
}
