import React from "react";
import { getVisibleSelectionRect } from "draft-js";

export default function CursorOverlay({ others, editorRef, editorState }) {
  if (!editorRef) return null;

  const content = editorState.getCurrentContent();
  const selectionRects = {};

  Array.from(others).forEach(({ presence }) => {
    if (!presence?.cursor) return;
  
    const { key, offset, color, name } = presence.cursor;
  
    try {
      const block = content.getBlockForKey(key);
      const range = document.createRange();
      const element = editorRef?.editor?.querySelector(`[data-offset-key="${key}-0-0"]`);
      if (element && block) {
        const textNode = element.childNodes[0];
        range.setStart(textNode, offset);
        range.setEnd(textNode, offset);
        const rect = range.getBoundingClientRect();
  
        selectionRects[name] = { rect, color, name };
      }
    } catch (err) {
      // block might not be rendered yet — safe to ignore
    }
  });

  return (
    <div className="pointer-events-none absolute top-0 left-0 w-full h-full">
      {Object.values(selectionRects).map(({ rect, color, name }, index) => (
        <div
          key={index}
          className="absolute px-2 py-1 text-xs font-semibold text-white rounded"
          style={{
            top: rect?.top - 40 + window.scrollY,
            left: rect?.left,
            backgroundColor: color || "#6366f1",
            transform: "translateY(-50%)",
            zIndex: 10,
          }}
        >
          {name}
        </div>
      ))}
    </div>
  );
}