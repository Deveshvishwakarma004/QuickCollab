"use client";

import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Highlight from '@tiptap/extension-highlight';
import { lowlight } from 'lowlight';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import { useUser } from '@clerk/nextjs';
import Toolbar from './Toolbar';
import { useRoom } from '@liveblocks/react';
import { Collaboration } from '@tiptap/extension-collaboration';
import { CollaborationCursor } from '@tiptap/extension-collaboration-cursor';
import * as Y from 'yjs';
import { LiveblocksYjsProvider } from '@liveblocks/yjs';

function LiveblocksRichEditor({ params }) {
  const { user } = useUser();
  const [editorReady, setEditorReady] = useState(false);
  const [initialContent, setInitialContent] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const room = useRoom();
  const [provider, setProvider] = useState(null);
  
  console.log("Document ID:", params?.documentid);

  useEffect(() => {
    if (!room) return;

    // Create a new Yjs document
    const yDoc = new Y.Doc();
    
    // Create the XML fragment we'll sync
    const fragment = yDoc.getXmlFragment('documentOutput');
    
    // Create the Liveblocks provider that syncs the doc
    const yjsProvider = new LiveblocksYjsProvider(room, yDoc);

    // Set the provider state
    setProvider({ provider: yjsProvider, document: fragment });

    const fetchInitialContent = async () => {
      try {
        const unsubscribe = onSnapshot(doc(db, 'documentOutput', params?.documentid), (docSnapshot) => {
          if (docSnapshot.exists() && docSnapshot.data()?.output) {
            try {
              const content = JSON.parse(docSnapshot.data().output);
              setInitialContent(content);
            } catch (error) {
              console.error("Error parsing document content:", error);
            }
          } else {
            console.log("No existing document content found");
          }
          setEditorReady(true);
        });

        return unsubscribe;
      } catch (error) {
        console.error("Error fetching document:", error);
        setEditorReady(true);
        return () => {};
      }
    };

    const unsubFn = fetchInitialContent();
    
    return () => {
      yjsProvider.destroy();
      unsubFn.then(unsub => unsub && unsub());
    };
  }, [room, params?.documentid]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        history: false, // Disable history as it's handled by Yjs
      }),
      Placeholder.configure({
        placeholder: 'Start typing here...',
      }),
      Image,
      CodeBlockLowlight.configure({
        lowlight,
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableCell,
      TableHeader,
      Highlight,
      ...(provider ? [
        Collaboration.configure({
          document: provider.document, // Ensure this points to the Yjs XML Fragment
        }),
        CollaborationCursor.configure({
          provider: provider.provider,
          user: {
            name: user?.fullName || user?.username || "Anonymous",
            color: getRandomColor(user?.id || "anonymous"),
            avatar: user?.imageUrl,
          },
        }),
      ] : []),
    ],
    onUpdate: ({ editor }) => {
      if (!isSyncing) {
        saveToFirebase(editor.getJSON());
      }
    },
    content: initialContent,
  }, [provider, initialContent, user]);

  const saveToFirebase = async (content) => {
    try {
      if (!params?.documentid) {
        console.error("No document ID available for saving");
        return;
      }

      console.log("Saving to Firebase:", params.documentid);
      const docRef = doc(db, 'documentOutput', params.documentid);
      await updateDoc(docRef, {
        output: JSON.stringify(content),
        editedBy: user?.primaryEmailAddress?.emailAddress
      });
    } catch (error) {
      console.error("Error saving to Firebase:", error);
    }
  };

  useEffect(() => {
    if (editor && initialContent && !editor.isDestroyed) {
      setIsSyncing(true);
      editor.commands.setContent(initialContent);
      setIsSyncing(false);
    }
  }, [editor, initialContent]);

  if (!editorReady) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse text-gray-600">Loading collaborative editor...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-4">
      {editor && <Toolbar editor={editor} />}
      <div className="border border-gray-300 rounded-md p-4 min-h-[500px]">
        <EditorContent editor={editor} className="prose max-w-none" />
      </div>
    </div>
  );
}

function getRandomColor(userId) {
  if (!userId) return `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`;

  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }

  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 70%, 60%)`;
}

export default LiveblocksRichEditor;