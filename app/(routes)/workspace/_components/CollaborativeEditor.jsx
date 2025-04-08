"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Editor,
  EditorState,
  convertToRaw,
  convertFromRaw,
} from "draft-js";
import { useUser } from "@clerk/nextjs";
import {
  useMutation,
  useMyPresence,
  useOthers,
  useUpdateMyPresence,
} from "@liveblocks/react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/config/firebaseConfig";
import CursorOverlay from "./CursorOverlay"; // 👈 component defined below

export default function CollaborativeDraftEditor({ documentid }) {
  const { user } = useUser();
  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty()
  );
  const [editorRef, setEditorRef] = useState(null);
  const [contentLoaded, setContentLoaded] = useState(false);

  const [myPresence, updateMyPresence] = useMyPresence();
  const others = useOthers();

  // Load initial content from Firestore
  useEffect(() => {
    const fetchDoc = async () => {
      const docRef = doc(db, "documentOutput", documentid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data?.editorState) {
          const content = convertFromRaw(JSON.parse(data.editorState));
          setEditorState(EditorState.createWithContent(content));
        }
        setContentLoaded(true);
      }
    };
    fetchDoc();
  }, [documentid]);

  // Save editor changes to Firestore
  const persistChanges = useCallback(async (state) => {
    const raw = convertToRaw(state.getCurrentContent());
    const docRef = doc(db, "documentOutput", documentid);
    await updateDoc(docRef, {
      editorState: JSON.stringify(raw),
      editedBy: user?.primaryEmailAddress?.emailAddress,
    });
  }, [documentid, user]);

  const handleEditorChange = (state) => {
    setEditorState(state);
    persistChanges(state);

    const selection = state.getSelection();
    const anchorKey = selection.getAnchorKey();
    const anchorOffset = selection.getAnchorOffset();

    updateMyPresence({
      cursor: {
        key: anchorKey,
        offset: anchorOffset,
        color: user?.imageUrl || "#d1d5db",
        name: user?.firstName || "Anonymous",
      },
    });
  };

  return (
    <div className="relative border p-4 rounded-xl shadow bg-white">
      {contentLoaded ? (
        <>
          <Editor
            editorState={editorState}
            onChange={handleEditorChange}
            ref={(ref) => setEditorRef(ref)}
          />
          <CursorOverlay
            others={others}
            editorState={editorState}
            editorRef={editorRef}
          />
        </>
      ) : (
        <p>Loading document...</p>
      )}
    </div>
  );
}