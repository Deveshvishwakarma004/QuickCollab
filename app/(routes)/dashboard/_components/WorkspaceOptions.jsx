import { Link2Icon, MoreVertical, PenBox, Trash2 } from 'lucide-react'
import React from 'react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"

function WorkspaceOptions({doc,DeleteWorkspace}) {
  return (
    <div>
           
            <DropdownMenu>
            <DropdownMenuTrigger>
                <MoreVertical className='h-4 w-4'/>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem 
                onClick={()=>
                    DeleteWorkspace(doc?.id)}
                className="flex gap-1 text-red-500"> 
                <Trash2 className='h-4 w-4'/>Delete</DropdownMenuItem>
                
            </DropdownMenuContent>
            </DropdownMenu>
    
        </div>
  )
}

export default WorkspaceOptions
