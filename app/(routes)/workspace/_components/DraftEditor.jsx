"use client";
import React, { useEffect, useState } from 'react';
import { Editor } from "react-draft-wysiwyg";
import { EditorState, convertToRaw, convertFromRaw } from 'draft-js';
import { db } from '@/config/firebaseConfig';
import {
  doc,
  onSnapshot,
  updateDoc,
  setDoc,
} from 'firebase/firestore';
import { useUser } from '@clerk/nextjs';
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { useParams } from 'next/navigation';
import GenerateAITemplate from './GenerateAITemplate';


function DraftEditor() {
  const params = useParams();
  const documentid = params?.documentid;
  const { user } = useUser();

  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [editingBy, setEditingBy] = useState("");

  // Load & sync document content in real-time
  useEffect(() => {
    if (!documentid) return;
    const docRef = doc(db, 'documentOutput', documentid);
  
    const unsub = onSnapshot(docRef, (snapshot) => {
      const data = snapshot.data();
      if (!data) return;
  
      const incomingRaw = data.editorState;
      const currentRaw = JSON.stringify(convertToRaw(editorState.getCurrentContent()));
  
      // Only update if the content is truly different
      if (incomingRaw && incomingRaw !== currentRaw) {
        try {
          const content = convertFromRaw(JSON.parse(incomingRaw));
          const newState = EditorState.createWithContent(content);
          setEditorState(newState);
        } catch (err) {
          console.error("Failed to parse editor content:", err);
        }
      }
  
      setEditingBy(data?.editingBy || "");
    });
  
    return () => unsub();
  }, [documentid, editorState]);

  // Track who is editing
  useEffect(() => {
    if (!user || !documentid) return;

    const docRef = doc(db, 'documentOutput', documentid);
    const editInfo = {
      editingBy: user?.fullName || user?.primaryEmailAddress?.emailAddress,
    };

    setDoc(docRef, editInfo, { merge: true });

    return () => {
      updateDoc(docRef, { editingBy: "" });
    };
  }, [user, documentid]);

  // Save directly on every change
  const onEditorStateChange = async (newEditorState) => {
    setEditorState(newEditorState);

    const content = newEditorState.getCurrentContent();
    const raw = convertToRaw(content);

    if (!documentid) return;
    const docRef = doc(db, 'documentOutput', documentid);
    await updateDoc(docRef, {
      editorState: JSON.stringify(raw),
      editedBy: user?.primaryEmailAddress?.emailAddress,
    });
  };

  return (
    <>
    <div className='min-h-2xl p-4'>
      {editingBy && editingBy !== user?.fullName && (
        <p className="text-sm text-gray-500 italic mb-2">
          Currently editing: {editingBy}
        </p>
      )}
      <Editor
       key={editorState.getSelection().getStartKey()}
        editorState={editorState}
        onEditorStateChange={onEditorStateChange}
        editorClassName='bg-white shadow-lg p-4 min-h-[300px] text-black'
        wrapperClassName="border border-gray-200 rounded-md shadow-md bg-white"
        
      />
    </div>

    {/* <div className='fixed bottom-10 md:ml-80 left-0 z-10'>
  <GenerateAITemplate
    setGenerateAIOutput={(rawContent) => {
      const contentState = convertFromRaw(rawContent);
      setEditorState(EditorState.createWithContent(contentState));
    }}
  />
    </div> */}

    </>
  );
}

export default DraftEditor;