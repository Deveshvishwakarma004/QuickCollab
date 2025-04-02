import { Download, Link2Icon, MoreVertical, PenBox, Trash2 } from 'lucide-react'
import React from 'react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"

  
function DocumentOptions({doc,deleteDocument, SaveAsPDF}) {
  return (
    <div>
       
        <DropdownMenu>
        <DropdownMenuTrigger>
            <MoreVertical className='h-4 w-4'/>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
        <DropdownMenuItem 
            onClick={()=>SaveAsPDF(doc?.id)}
            className="flex gap-2 text-blue-500"> 
            <Download className='h-4 w-4'/>Save as PDF</DropdownMenuItem>
            <DropdownMenuItem 
            onClick={()=>deleteDocument(doc?.id)}
            className="flex gap-2 text-red-500"> 
            <Trash2 className='h-4 w-4'/>Delete</DropdownMenuItem>
            
        </DropdownMenuContent>
        </DropdownMenu>

    </div>
  )
}

export default DocumentOptions