import LayerSettings from "./LayerSettings";

export default interface NewWorkspace {
  title: string,
  center: number[],
  zoom: number,
  backgroundLayers: LayerSettings[],  
}
