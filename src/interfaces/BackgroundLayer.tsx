export default interface BackgroundLayer {
  uuid?: string,
  type: string,
  title: string,  
  options: { [key: string]: any }
}
