import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Placeholder from '@tiptap/extension-placeholder'
import { useEffect } from 'react'
import {
  Bold, Italic, Underline as UnderlineIcon, List, ListOrdered,
  AlignLeft, AlignCenter, AlignRight, Minus, Heading2, Heading3,
} from 'lucide-react'

const GOLD = '#C9A227'

interface Props {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  minHeight?: number
  lightMode?: boolean
}

export default function RichTextEditor({ value, onChange, placeholder = 'Write product description...', minHeight = 200, lightMode = false }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ bulletList: {}, orderedList: {}, heading: { levels: [2, 3] } }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: 'rte-content',
        style: `min-height:${minHeight}px`,
      },
    },
  })

  // Sync external value changes (e.g. when switching edit targets)
  useEffect(() => {
    if (!editor) return
    const current = editor.getHTML()
    if (current !== value && value !== undefined) {
      editor.commands.setContent(value || '', { emitUpdate: false })
    }
  }, [value, editor])

  if (!editor) return null

  const btn = (active: boolean, onClick: () => void, title: string, children: React.ReactNode) => (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="rte-btn"
      style={active ? { color: GOLD, background: 'rgba(212,175,55,0.12)', borderRadius: 6 } : {}}
    >
      {children}
    </button>
  )

  return (
    <div className={`rte-wrapper ${lightMode ? 'rte-light' : ''}`}>
      {/* Toolbar */}
      <div className="rte-toolbar">
        {/* History */}
        <div className="rte-group">
          {btn(editor.isActive('heading', { level: 2 }), () => editor.chain().focus().toggleHeading({ level: 2 }).run(), 'Heading 2', <Heading2 className="h-3.5 w-3.5" />)}
          {btn(editor.isActive('heading', { level: 3 }), () => editor.chain().focus().toggleHeading({ level: 3 }).run(), 'Heading 3', <Heading3 className="h-3.5 w-3.5" />)}
        </div>
        <div className="rte-divider" />
        {/* Inline marks */}
        <div className="rte-group">
          {btn(editor.isActive('bold'),      () => editor.chain().focus().toggleBold().run(),      'Bold',      <Bold className="h-3.5 w-3.5" />)}
          {btn(editor.isActive('italic'),    () => editor.chain().focus().toggleItalic().run(),    'Italic',    <Italic className="h-3.5 w-3.5" />)}
          {btn(editor.isActive('underline'), () => editor.chain().focus().toggleUnderline().run(), 'Underline', <UnderlineIcon className="h-3.5 w-3.5" />)}
        </div>
        <div className="rte-divider" />
        {/* Lists */}
        <div className="rte-group">
          {btn(editor.isActive('bulletList'),  () => editor.chain().focus().toggleBulletList().run(),  'Bullet list',   <List className="h-3.5 w-3.5" />)}
          {btn(editor.isActive('orderedList'), () => editor.chain().focus().toggleOrderedList().run(), 'Numbered list', <ListOrdered className="h-3.5 w-3.5" />)}
          {btn(false, () => editor.chain().focus().setHorizontalRule().run(), 'Horizontal rule', <Minus className="h-3.5 w-3.5" />)}
        </div>
        <div className="rte-divider" />
        {/* Alignment */}
        <div className="rte-group">
          {btn(editor.isActive({ textAlign: 'left' }),   () => editor.chain().focus().setTextAlign('left').run(),   'Align left',   <AlignLeft className="h-3.5 w-3.5" />)}
          {btn(editor.isActive({ textAlign: 'center' }), () => editor.chain().focus().setTextAlign('center').run(), 'Align center', <AlignCenter className="h-3.5 w-3.5" />)}
          {btn(editor.isActive({ textAlign: 'right' }),  () => editor.chain().focus().setTextAlign('right').run(),  'Align right',  <AlignRight className="h-3.5 w-3.5" />)}
        </div>
      </div>

      {/* Editor Area */}
      <EditorContent editor={editor} />
    </div>
  )
}
