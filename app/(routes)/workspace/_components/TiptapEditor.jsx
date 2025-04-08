"use client"
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import React from 'react'
import MenuBar from './MenuBar'
import TextAlign from '@tiptap/extension-text-align'

function TiptapEditor() {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                bulletList:
                {
                    HTMLAttributes:{
                        class:"list-disc ml-3"
                    }
                },
                orderedList:
                {
                    HTMLAttributes:{
                        class:"list-decimal ml-3"
                    }
                },
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
              }),
            ],
        content: '<p>Hello World</p>',
        editorProps : {
            attributes : {
                class: "min-h-[200px] border-none ml-4  py-3 px-2"
            }
        }

    })
  return (
    <div>
        <MenuBar editor = {editor}/>
        <EditorContent editor={editor} />
    </div>
 
  )
}

export default TiptapEditor