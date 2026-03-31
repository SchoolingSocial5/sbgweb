declare module 'react-quill' {
  import * as React from 'react'
  import type Delta from 'quill-delta'
  import type Quill from 'quill'

  // Define RangeStatic manually because it's not exported directly
  export interface RangeStatic {
    index: number
    length: number
  }

  export type Sources = 'user' | 'api' | 'silent'

  export interface ReactQuillProps {
    value?: string
    defaultValue?: string
    onChange?: (
      value: string,
      delta: Delta,
      source: Sources,
      editor: Quill
    ) => void
    onChangeSelection?: (
      range: RangeStatic | null,
      source: Sources,
      editor: Quill
    ) => void
    onFocus?: (
      range: RangeStatic | null,
      source: Sources,
      editor: Quill
    ) => void
    onBlur?: (
      previousRange: RangeStatic | null,
      source: Sources,
      editor: Quill
    ) => void
    modules?: Record<string, unknown>
    formats?: string[]
    bounds?: string | HTMLElement
    placeholder?: string
    readOnly?: boolean
    theme?: string
    className?: string
    style?: React.CSSProperties
    id?: string
  }

  export default class ReactQuill extends React.Component<ReactQuillProps> {}
}
