import React, { useState } from 'react'
import dynamic from 'next/dynamic'
import 'quill/dist/quill.snow.css'

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })
interface RichTextEditorProps {
  contentValue?: string
  placeHolder?: string
  initialValue?: string
  onChange?: (content: string) => void
}

const QuillEditor: React.FC<RichTextEditorProps> = ({
  contentValue,
  placeHolder,
  initialValue = '',
  onChange,
}) => {
  const [content, setValue] = useState<string>(initialValue)

  const handleChange = (content: string) => {
    setValue(content)
    if (onChange) onChange(content)
  }

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ script: 'sub' }, { script: 'super' }],
      [{ align: [] }],
      [{ color: [] }, { background: [] }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['blockquote', 'code-block'],
      ['undo', 'redo'],
      ['link', 'image'],
      ['clean'],
    ],
    // toolbar: { container: '#custom-toolbar', },

    history: {
      delay: 1000,
      userOnly: true,
    },
    clipboard: {
      matchVisual: false,
    },
  }

  const formats = [
    'header',
    'bold',
    'italic',
    'underline',
    'strike',
    'script',
    'align',
    'color',
    'background',
    'list',
    'blockquote',
    'code-block',
    'link',
    'image',
  ]
  return (
    <div>
      <div className="absolute hidden">{content}</div>
      <ReactQuill
        modules={modules}
        formats={formats}
        onChange={handleChange}
        theme="snow"
        value={contentValue}
        placeholder={placeHolder ? placeHolder : 'Write something amazing...'}
      />
    </div>
  )
}

export default QuillEditor
