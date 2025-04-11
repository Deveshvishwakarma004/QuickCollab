"use client";
import React, { useEffect, useState } from 'react';
import { Editor } from "react-draft-wysiwyg";
import {EditorState,convertToRaw, convertFromRaw,} from 'draft-js';
import { db } from '@/config/firebaseConfig';
import {doc,onSnapshot,updateDoc,setDoc,} from 'firebase/firestore';
import { useUser } from '@clerk/nextjs';
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { useParams } from 'next/navigation';
import GenerateAITemplate from './GenerateAITemplate';

function MainEditor() {
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

  // Save on every change
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

  // Insert AI content at cursor position
  const handleInsertAIContent = async (rawContent) => {
    const contentState = editorState.getCurrentContent();
    const selectionState = editorState.getSelection();

    const aiContentState = convertFromRaw(rawContent);
    const aiRaw = convertToRaw(aiContentState);

    const currentRaw = convertToRaw(contentState);
    const currentBlocks = currentRaw.blocks;

    const anchorKey = selectionState.getAnchorKey();
    const insertIndex = currentBlocks.findIndex(block => block.key === anchorKey);

    const before = currentBlocks.slice(0, insertIndex + 1);
    const after = currentBlocks.slice(insertIndex + 1);

    const mergedBlocks = [...before, ...aiRaw.blocks, ...after];
    const mergedEntityMap = {
      ...currentRaw.entityMap,
      ...aiRaw.entityMap,
    };

    const mergedContentState = convertFromRaw({
      blocks: mergedBlocks,
      entityMap: mergedEntityMap,
    });

    const newEditorState = EditorState.push(editorState, mergedContentState, 'insert-fragment');
    setEditorState(EditorState.moveFocusToEnd(newEditorState));

    // Save merged content to Firestore
    if (documentid) {
      const docRef = doc(db, 'documentOutput', documentid);
      await updateDoc(docRef, {
        editorState: JSON.stringify({
          blocks: mergedBlocks,
          entityMap: mergedEntityMap,
        }),
        editedBy: user?.primaryEmailAddress?.emailAddress,
      });
    }
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

      <div className='fixed bottom-10 md:ml-80 left-0 z-10'>
        <GenerateAITemplate
          setGenerateAIOutput={handleInsertAIContent}
        />
      </div>
    </>
  );
}

export default MainEditor;