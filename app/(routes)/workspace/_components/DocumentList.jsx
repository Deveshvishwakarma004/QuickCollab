import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React from 'react'
import DocumentOptions from './DocumentOptions';
import { deleteDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import { toast } from 'sonner';
import {jsPDF} from 'jspdf'

function DocumentList({documentList,params}) {
    const router=useRouter();

    const DeleteDocument=async(docId)=>{
      await deleteDoc(doc(db, "workspaceDocuments", docId));
      toast('Document Deleted !')
    }

    const SaveAsPDF = async (docId, documentName) => {
      try {
          const docRef = doc(db, 'documentOutput', docId);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
              const outputData = JSON.parse(docSnap.data().output);

              // Create a new PDF instance
              let pdf = new jsPDF();
              let y = 10; // Starting position for text

              outputData.blocks.forEach(block => {
                  if (block.type === 'paragraph') {
                      pdf.text(block.data.text, 10, y);
                      y += 10;
                  } else if (block.type === 'header') {
                      pdf.setFontSize(16);
                      pdf.text(block.data.text, 10, y);
                      y += 12;
                  } else if (block.type === 'list') {
                      block.data.items.forEach(item => {
                          pdf.text('- ' + item, 10, y);
                          y += 8;

                      });
                      
                  }
                  // else if (block.type === 'image') {
                  //   block.data.items.forEach(item => {
                  //       pdf.text('- ' + item, 10, y);
                  //       y += 8;
                  //   });
              });

              pdf.save(`${documentName || 'Untitled_Document'}.pdf`);
              toast('PDF Downloaded!');
          } else {
              toast('No content found for this document.');
          }
      } catch (error) {
          console.error('Error saving PDF:', error);
          toast('Error generating PDF!');
      }
  };

  return (
    <div>
        {documentList.map((doc,index)=>(
            <div key={index} 
            onClick={()=>router.push('/workspace/'+params?.workspaceid+"/"+doc?.id)}
            className={`mt-3 p-2 px-3 hover:bg-gray-200 
            rounded-lg cursor-pointer flex justify-between items-center
            ${doc?.id==params?.documentid&&'bg-white'}
            `}>
                <div className='flex gap-2 items-center'>
                  {!doc.emoji&&  <Image src={'/loopdocument.svg'} width={20} height={20}/>}
                    <h2 className='flex gap-2'> {doc?.emoji} {doc.documentName}</h2>
                </div>
                <div className="flex gap-2">
                        {/* <button
                            className="bg-blue-500 text-white px-2 py-1 rounded text-sm"
                            onClick={(e) => { e.stopPropagation(); SaveAsPDF(docItem.id, docItem.documentName); }}>
                            Save as PDF
                        </button> */}
                        <DocumentOptions doc={doc} deleteDocument={(docId) => DeleteDocument(docId)}  SaveAsPDF={(docId)=> SaveAsPDF(docId, doc.documentName)}/>
                    </div>
                {/* <DocumentOptions doc={doc} deleteDocument={(docId)=>DeleteDocument(docId)} /> */}
            </div>
        ))}
    </div>
  )
}

export default DocumentList