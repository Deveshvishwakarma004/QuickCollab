"use client"
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { toast } from 'sonner';
import WorkspaceOptions from './WorkspaceOptions';
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import { Link2Icon, MoreVertical, PenBox, Trash2 } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"

function WorkspaceItemList({workspaceList}) {

  const [workspaces, setWorkspaces] = useState(workspaceList); 
  const router=useRouter();
  const OnClickWorkspaceItem=(workspaceId)=>{
      router.push('/workspace/'+workspaceId)
  }
  const DeleteWorkspace = async (docId) => {
    try {
      await deleteDoc(doc(db, "Workspace", docId));
      setWorkspaces(prev => prev.filter(item => item.id !== docId)); // Remove from UI
      toast.success('Workspace Deleted!');
    } catch (error) {
      toast.error("Failed to delete workspace");
      console.error("Error deleting workspace:", error);
    }
  }

  return (
    <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6'>
        {workspaces&&workspaces.map((workspace,index)=>(
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
                {/* <WorkspaceOptions doc={doc} DeleteWorkspace={(docId)=>DeleteWorkspace(docId)}/> */}

                <DropdownMenu onClick={(e) => e.stopPropagation()}>
            <DropdownMenuTrigger>
                <MoreVertical className='h-4 w-4'/>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem 
               onClick={() => DeleteWorkspace(workspace.id)}
                className="flex gap-1 text-red-500"> 
                <Trash2 className='h-4 w-4'/>Delete</DropdownMenuItem>
                
            </DropdownMenuContent>
            </DropdownMenu>


                </div>
                </div>
        ))}
    </div>
  )
}

export default WorkspaceItemList