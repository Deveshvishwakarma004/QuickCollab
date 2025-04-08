import React, { useState } from 'react'
import DcoumentHeader from './DcoumentHeader'
import DocumentInfo from './DocumentInfo'
import RichDocumentEditor from './RichDocumentEditor'
import { Button } from '@/components/ui/button'
import { MessageCircle, X } from 'lucide-react'
import CommentBox from './CommentBox'
import LiveblocksRichEditor from './LiveblocksRichEditor'
import TiptapEditor from './TiptapEditor'
import DraftEditor from './DraftEditor'
import CollaborativeEditor from './CollaborativeEditor'
function DocumentEditorSection({ params }) {

  const [openComment, setOpenComment] = useState(false);
  return (
    <div className='relative'>
      {/* Header  */}
      <DcoumentHeader />

      {/* Document Info  */}
      <DocumentInfo params={params} />

      {/* Rich Text Editor  */}
 
        {/* <RichDocumentEditor params={params} /> */}
        {/* <TextEditor params = {params}/> */}
        {/* <div className='max-w-4xl mx-auto py-8'>
        <TiptapEditor/>
        </div> */}
        {/* <LiveblocksRichEditor params={params} /> */}
       <div className='max-w-3xl mx-auto pb-8'>
        <DraftEditor/></div>

        {/* <div className='max-w-3xl mx-auto pb-8'>
        <CollaborativeEditor documentid={params.documentid}/>
        
        </div> */}
        
        
 
      <div className='fixed right-10 bottom-10 '>
        <Button onClick={() => setOpenComment(!openComment)}>
          {openComment ? <X /> : <MessageCircle />} </Button>
        {openComment && <CommentBox />}
      </div>
    
    </div>
  )
}

export default DocumentEditorSection