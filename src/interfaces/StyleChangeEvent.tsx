import { StyleLike } from "ol/style/Style"
import StyleRule from "./StyleRule"

export default interface StyleChangeEvent {
    olStyle: StyleLike | undefined,
    rules: StyleRule[]
}
