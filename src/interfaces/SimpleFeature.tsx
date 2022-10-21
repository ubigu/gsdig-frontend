export default interface SimpleFeature {
  id: string | number;
  properties: { [property: string]: any }
}
