import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React from 'react'
import DocumentOptions from './DocumentOptions';
import { deleteDoc, doc, getDoc } from 'firebase/firestore';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';
import { db } from '@/config/firebaseConfig';
import { toast } from 'sonner';
import {jsPDF} from 'jspdf'

function DocumentList({documentList,params}) {
    const router=useRouter();

    const DeleteDocument=async(docId)=>{
      await deleteDoc(doc(db, "workspaceDocuments", docId));
      toast('Document Deleted !')
    }

//     const SaveAsPDF = async (docId, documentName) => {
//       try {
//           const docRef = doc(db, 'documentOutput', docId);
//           const docSnap = await getDoc(docRef);

//           if (docSnap.exists()) {
//               const outputData = JSON.parse(docSnap.data().editorState);

//               // Create a new PDF instance
//               let pdf = new jsPDF();
//               let y = 10; // Starting position for text

//               outputData.blocks.text.forEach(block => {
//                   if (block.type === 'paragraph') {
//                       pdf.text(block.data.text, 10, y);
//                       y += 10;
//                   } else if (block.type === 'header') {
//                       pdf.setFontSize(16);
//                       pdf.text(block.data.text, 10, y);
//                       y += 12;
//                   } else if (block.type === 'list') {
//                       block.data.items.forEach(item => {
//                           pdf.text('- ' + item, 10, y);
//                           y += 8;

//                       });
                      
//                   }
//                   // else if (block.type === 'image') {
//                   //   block.data.items.forEach(item => {
//                   //       pdf.text('- ' + item, 10, y);
//                   //       y += 8;
//                   //   });
//               });

//               pdf.save(`${documentName || 'Untitled_Document'}.pdf`);
//               toast('PDF Downloaded!');
//           } else {
//               toast('No content found for this document.');
//           }
//       } catch (error) {
//           console.error('Error saving PDF:', error);
//           toast('Error generating PDF!');
//       }
//   };


const SaveAsPDF = async (docId, documentName) => {
  try {
    const docRef = doc(db, 'documentOutput', docId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      toast('No content found for this document.');
      return;
    }

    const rawEditorState = docSnap.data().editorState;
    const content = JSON.parse(rawEditorState);

    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 10;
    const maxLineWidth = pageWidth - margin * 2;

    let y = 20;

    content.blocks.forEach((block, index) => {
      const text = block.text || "";

      let fontSize = 12;
      let fontStyle = "normal";

      switch (block.type) {
        case "header-one":
          fontSize = 18;
          fontStyle = "bold";
          break;
        case "header-two":
          fontSize = 16;
          fontStyle = "bold";
          break;
        case "unordered-list-item":
          fontStyle = "normal";
          break;
        case "ordered-list-item":
          fontStyle = "normal";
          break;
        default:
          fontStyle = "normal";
      }

      pdf.setFont("helvetica", fontStyle);
      pdf.setFontSize(fontSize);

      // Prefix for list items
      let displayText = text;
      if (block.type === "unordered-list-item") displayText = `• ${text}`;
      if (block.type === "ordered-list-item") displayText = `${index + 1}. ${text}`;

      const lines = pdf.splitTextToSize(displayText, maxLineWidth);

      // Page break if needed
      if (y + lines.length * fontSize * 0.5 > 280) {
        pdf.addPage();
        y = 20;
      }

      lines.forEach(line => {
        pdf.text(line, margin, y);
        y += fontSize * 0.5 + 2;
      });

      y += 4; // Extra spacing between blocks
    });

    pdf.save(`${documentName || 'Untitled_Document'}.pdf`);
    toast.success('✅ PDF Downloaded!');
  } catch (error) {
    console.error('Error saving PDF:', error);
    toast.error('❌ Error generating PDF!');
  }
};

const SaveAsWord = async (docId, documentName) => {
  try {
    const docRef = doc(db, 'documentOutput', docId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      toast('No content found for this document.');
      return;
    }

    const rawEditorState = docSnap.data().editorState;
    const content = JSON.parse(rawEditorState);

    const children = content.blocks.map((block, index) => {
      const text = block.text || "";
      let style = {};

      switch (block.type) {
        case 'header-one':
          style = { bold: true, size: 32 };
          break;
        case 'header-two':
          style = { bold: true, size: 26 };
          break;
        case 'unordered-list-item':
          return new Paragraph({ text: `• ${text}`, bullet: { level: 0 } });
        case 'ordered-list-item':
          return new Paragraph({ text: `${index + 1}. ${text}` });
        default:
          style = { size: 22 };
      }

      return new Paragraph({
        children: [
          new TextRun({
            text: text,
            ...style,
          }),
        ],
      });
    });

    const docxDoc = new Document({
      sections: [{
        properties: {},
        children,
      }],
    });

    const blob = await Packer.toBlob(docxDoc);
    saveAs(blob, `${documentName || 'Untitled_Document'}.docx`);
    toast.success('✅ Word Document Downloaded!');
  } catch (error) {
    console.error('Error saving Word document:', error);
    toast.error('❌ Error generating Word document!');
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
                        <DocumentOptions doc={doc} deleteDocument={(docId) => DeleteDocument(docId)}  
                        SaveAsPDF={(docId)=> SaveAsPDF(docId, doc.documentName)}
                        SaveAsWord={(docId) => SaveAsWord(docId, doc.documentName)}/>
                    </div>
            </div>
        ))}
    </div>
  )
}

export default DocumentList