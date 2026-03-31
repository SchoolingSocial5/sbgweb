declare module 'jsbarcode' {
  interface JsBarcodeOptions {
    format?: string
    lineColor?: string
    width?: number
    height?: number
    displayValue?: boolean
    [key: string]: unknown
  }

  function JsBarcode(
    element: SVGSVGElement | HTMLCanvasElement | string,
    text: string,
    options?: JsBarcodeOptions
  ): void

  export = JsBarcode
}
