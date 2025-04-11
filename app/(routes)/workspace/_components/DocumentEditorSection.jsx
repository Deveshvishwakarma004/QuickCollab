import React, { useState } from 'react'
import DcoumentHeader from './DcoumentHeader'
import DocumentInfo from './DocumentInfo'
import { Button } from '@/components/ui/button'
import { MessageCircle, X } from 'lucide-react'
import CommentBox from './CommentBox'
import MainEditor from './MainEditor'

function DocumentEditorSection({ params }) {

  const [openComment, setOpenComment] = useState(false);
  return (
    <div className='relative'>
      {/* Header  */}
      <DcoumentHeader />

      {/* Document Info  */}
      <DocumentInfo params={params} />

      
       <div className='max-w-3xl mx-auto pb-8'>
        <MainEditor/>
        </div>

        
 
      <div className='fixed right-10 bottom-10 '>
        <Button onClick={() => setOpenComment(!openComment)}>
          {openComment ? <X /> : <MessageCircle />} </Button>
        {openComment && <CommentBox />}
      </div>
    
    </div>
  )
}

export default DocumentEditorSection