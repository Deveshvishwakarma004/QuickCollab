"use client"
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React from 'react'
import { toast } from 'sonner';
import WorkspaceOptions from './WorkspaceOptions';
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';

function WorkspaceItemList({workspaceList}) {

  
  const router=useRouter();
  const OnClickWorkspaceItem=(workspaceId)=>{
      router.push('/workspace/'+workspaceId)
  }
  const DeleteWorkspace=async(docId)=>{
        await deleteDoc(doc(db, "Workspace", docId));
        console.log("delete")
        toast('Workspace Deleted !')
      }

  return (
    <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6'>
        {workspaceList&&workspaceList.map((workspace,index)=>(
            <div key={index} className='border shadow-xl rounded-xl
            hover:scale-105 transition-all cursor-pointer'
            onClick={()=>OnClickWorkspaceItem(workspace.id)}
            >
                <Image src={workspace?.coverImage} 
                width={400} height={200} alt='cover'
                className='h-[150px] object-cover rounded-t-xl'
                />
                <div className='p-4 rounded-b-xl flex justify-between'>
                    <h2 className='flex gap-1'>{workspace?.Emoji} {workspace.workspaceName}</h2>     
                <WorkspaceOptions doc={doc} DeleteWorkspace={(docId)=>DeleteWorkspace(docId)}/>
                </div>
                </div>
        ))}
    </div>
  )
}

export default WorkspaceItemList