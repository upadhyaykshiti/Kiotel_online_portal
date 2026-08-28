// // docs/_components/DocEditor.jsx

// "use client";

// import { useCallback, useEffect, useMemo, useState } from "react";
// import { useEditor, EditorContent } from "@tiptap/react";
// import StarterKit from "@tiptap/starter-kit";
// // Optional underline:
// // import Underline from "@tiptap/extension-underline";

// // import { debounce } from "../../workspace/_lib/debounce";
// import { useDebounce } from "../../workspace/_lib/useDebounce";
// import { workspaceFetch } from "../../workspace/_lib/workspaceApi";
// import DocToolbar from "../_components/DocToolbar";

// export default function DocEditor({ docId, userId, initialTitle, initialContent, readOnly }) {
//   const [title, setTitle] = useState(initialTitle || "Untitled document");
//   const [status, setStatus] = useState(readOnly ? "Read-only" : "Saved");
//   const [lastSavedAt, setLastSavedAt] = useState(null);

//   const editor = useEditor({
//     extensions: [
//       StarterKit,
//       // Underline, // uncomment if installed
//     ],
//     content: initialContent,
//     editable: !readOnly,
//     editorProps: {
//       attributes: {
//         class:
//           "prose max-w-none focus:outline-none min-h-[60vh] p-4 bg-white rounded-lg border",
//       },
//     },
//   });

// const saveNow = useCallback(
//   async ({ nextTitle, nextContent }) => {
//     if (readOnly) return;
//     setStatus("Saving…");
//     try {
//       await workspaceFetch("/api/workspace/docs/update", {
//         method: "PUT",
//         userId,
//         body: {
//           id: docId,
//           title: nextTitle,
//           content_json: nextContent,
//         },
//       });
//       setLastSavedAt(new Date());
//       setStatus("Saved");
//     } catch (e) {
//       setStatus("Save failed — will retry");
//       console.error("Autosave failed:", e);
//     }
//   },
//   [docId, userId, readOnly]
// );
//   // const saveDebounced = useMemo(() => debounce(saveNow, 3000), [saveNow]);
//   const saveDebounced = useDebounce(saveNow, 3000);

//   useEffect(() => {
//     if (!editor) return;
//     if (readOnly) return;

//     const onUpdate = () => {
//       const nextContent = editor.getJSON();
//       saveDebounced({ nextTitle: title, nextContent });
//     };

//     editor.on("update", onUpdate);
//     return () => editor.off("update", onUpdate);
//   }, [editor, title, readOnly, saveDebounced]);

//   useEffect(() => {
//     if (!editor) return;
//     if (readOnly) return;

//     // Title changes trigger save too
//     const nextContent = editor.getJSON();
//     saveDebounced({ nextTitle: title, nextContent });
//   }, [title, editor, readOnly, saveDebounced]);

//   return (
//     <div className="space-y-3">
//       <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
//         <input
//           className="w-full sm:w-[70%] rounded-lg border px-3 py-2 text-lg font-semibold"
//           value={title}
//           onChange={(e) => setTitle(e.target.value)}
//           disabled={readOnly}
//         />

//         <div className="text-sm text-gray-600 flex items-center gap-3">
//           <span>{status}</span>
//           {lastSavedAt && (
//             <span className="text-gray-400">{lastSavedAt.toLocaleTimeString()}</span>
//           )}
//         </div>
//       </div>

//       <DocToolbar editor={editor} disabled={readOnly} />

//       {readOnly && (
//         <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
//           You have view-only access.
//         </div>
//       )}

//       <EditorContent editor={editor} />
//     </div>
//   );
// }



// "use client";

// import { useCallback, useEffect, useRef, useState } from "react";
// import { useEditor, EditorContent } from "@tiptap/react";
// import StarterKit from "@tiptap/starter-kit";

// // Change 4: use React-safe debounce hook
// import { useDebounce } from "../../workspace/_lib/useDebounce";
// import { workspaceFetch } from "../../workspace/_lib/workspaceApi";
// import DocToolbar from "../_components/DocToolbar";

// export default function DocEditor({ docId, userId, initialTitle, initialContent, readOnly }) {
//   const [title, setTitle] = useState(initialTitle || "Untitled document");
//   const [status, setStatus] = useState(readOnly ? "Read-only" : "Saved");
//   const [lastSavedAt, setLastSavedAt] = useState(null);

//   // Change 14: mount guard — prevent save firing on initial render
//   const isMounted = useRef(false);

//   const editor = useEditor({
//     extensions: [StarterKit],
//     content: initialContent,
//     editable: !readOnly,
//     editorProps: {
//       attributes: {
//         class:
//           "prose max-w-none focus:outline-none min-h-[60vh] p-4 bg-white rounded-lg border",
//       },
//     },
//   });

//   // Change 5: autosave error handling
//   const saveNow = useCallback(
//     async ({ nextTitle, nextContent }) => {
//       if (readOnly) return;
//       setStatus("Saving…");
//       try {
//         await workspaceFetch("/api/workspace/docs/update", {
//           method: "PUT",
//           userId,
//           body: {
//             id: docId,
//             title: nextTitle,
//             content_json: nextContent,
//           },
//         });
//         setLastSavedAt(new Date());
//         setStatus("Saved");
//       } catch (e) {
//         setStatus("Save failed — will retry");
//         console.error("Autosave failed:", e);
//       }
//     },
//     [docId, userId, readOnly]
//   );

//   // Change 4: React-safe debounce
//   const saveDebounced = useDebounce(saveNow, 3000);

//   // Save on editor content change
//   useEffect(() => {
//     if (!editor) return;
//     if (readOnly) return;

//     const onUpdate = () => {
//       const nextContent = editor.getJSON();
//       saveDebounced({ nextTitle: title, nextContent });
//     };

//     editor.on("update", onUpdate);
//     return () => editor.off("update", onUpdate);
//   }, [editor, title, readOnly, saveDebounced]);

//   // Change 14: save on title change — skip on mount
//   useEffect(() => {
//     if (!editor) return;
//     if (readOnly) return;

//     if (!isMounted.current) {
//       isMounted.current = true;
//       return;
//     }

//     const nextContent = editor.getJSON();
//     saveDebounced({ nextTitle: title, nextContent });
//   }, [title, editor, readOnly, saveDebounced]);

//   return (
//     <div className="space-y-3">
//       <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
//         <input
//           className="w-full sm:w-[70%] rounded-lg border px-3 py-2 text-lg font-semibold"
//           value={title}
//           onChange={(e) => setTitle(e.target.value)}
//           disabled={readOnly}
//         />

//         <div className="text-sm text-gray-600 flex items-center gap-3">
//           <span>{status}</span>
//           {lastSavedAt && (
//             <span className="text-gray-400">{lastSavedAt.toLocaleTimeString()}</span>
//           )}
//         </div>
//       </div>

//       <DocToolbar editor={editor} disabled={readOnly} />

//       {readOnly && (
//         <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
//           You have view-only access.
//         </div>
//       )}

//       <EditorContent editor={editor} />
//     </div>
//   );
// }




"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";

import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextStyle from "@tiptap/extension-text-style";
import FontFamily from "@tiptap/extension-font-family";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import  { Table } from "@tiptap/extension-table";
import {TableRow} from "@tiptap/extension-table-row";
import {TableCell} from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TextAlign from "@tiptap/extension-text-align";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import CharacterCount from "@tiptap/extension-character-count";
import Placeholder from "@tiptap/extension-placeholder";

import { FloatingMenu } from "@tiptap/react";

import { useDebounce } from "../../workspace/_lib/useDebounce";
import { workspaceFetch } from "../../workspace/_lib/workspaceApi";
import DocToolbar from "./DocToolbar";
import BubbleMenuBar from "./BubbleMenuBar";
import WordCount from "./WordCount";

import { Extension } from "@tiptap/core";

const FontSize = Extension.create({
  name: "fontSize",
  addOptions() {
    return { types: ["textStyle"] };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (el) => el.style.fontSize || null,
            renderHTML: (attrs) => {
              if (!attrs.fontSize) return {};
              return { style: `font-size: ${attrs.fontSize}` };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setFontSize:
        (fontSize) =>
        ({ chain }) =>
          chain().setMark("textStyle", { fontSize }).run(),
      unsetFontSize:
        () =>
        ({ chain }) =>
          chain().setMark("textStyle", { fontSize: null }).removeEmptyTextStyle().run(),
    };
  },
});

export default function DocEditor({
  docId,
  userId,
  initialTitle,
  initialContent,
  readOnly,
}) {
  const [title, setTitle] = useState(initialTitle || "Untitled document");
  const [status, setStatus] = useState(readOnly ? "Read-only" : "Saved");
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [unsaved, setUnsaved] = useState(false);
  const isMounted = useRef(false);

  // Warn on unsaved changes
  useEffect(() => {
    const handler = (e) => {
      if (unsaved) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [unsaved]);

  console.log("Table", Table);
console.log("TableRow", TableRow);
console.log("TableCell", TableCell);
console.log("TableHeader", TableHeader);
console.log("FloatingMenu =", FloatingMenu);
console.log("BubbleMenuBar =", BubbleMenuBar);
console.log("DocToolbar =", DocToolbar);
console.log("WordCount =", WordCount);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      FontFamily,
      FontSize,
      Color,
      Highlight.configure({ multicolor: true }),
      Link.configure({ openOnClick: false, HTMLAttributes: { target: "_blank", rel: "noopener noreferrer" } }),
      Image.configure({ inline: false, allowBase64: true }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Subscript,
      Superscript,
      CharacterCount,
      Placeholder.configure({
        placeholder: "Start typing your document…",
      }),
    ],
    content: initialContent,
    editable: !readOnly,
    editorProps: {
      attributes: {
        class: "outline-none min-h-[calc(100vh-280px)]",
        spellcheck: "true",
      },
    },
  });

  // Save function
  const saveNow = useCallback(
    async ({ nextTitle, nextContent }) => {
      if (readOnly) return;
      setStatus("Saving…");
      try {
        await workspaceFetch("/api/workspace/docs/update", {
          method: "PUT",
          userId,
          body: { id: docId, title: nextTitle, content_json: nextContent },
        });
        setLastSavedAt(new Date());
        setStatus("Saved");
        setUnsaved(false);
      } catch (e) {
        setStatus("Save failed — will retry");
        console.error("Autosave failed:", e);
      }
    },
    [docId, userId, readOnly]
  );

  const saveDebounced = useDebounce(saveNow, 2000);

  // Save on editor update
  useEffect(() => {
    if (!editor || readOnly) return;
    const onUpdate = () => {
      setUnsaved(true);
      setStatus("Unsaved…");
      saveDebounced({ nextTitle: title, nextContent: editor.getJSON() });
    };
    editor.on("update", onUpdate);
    return () => editor.off("update", onUpdate);
  }, [editor, title, readOnly, saveDebounced]);

  // Save on title change (skip mount)
  useEffect(() => {
    if (!editor || readOnly) return;
    if (!isMounted.current) { isMounted.current = true; return; }
    setUnsaved(true);
    saveDebounced({ nextTitle: title, nextContent: editor.getJSON() });
  }, [title, editor, readOnly, saveDebounced]);

  const statusColor =
    status === "Saved" ? "text-green-600"
    : status.includes("failed") ? "text-red-500"
    : status === "Unsaved…" ? "text-yellow-500"
    : "text-gray-400";

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <DocToolbar editor={editor} disabled={readOnly} />
      </div>

      {/* Editor canvas — white page on gray bg */}
      <div className="flex-1 overflow-auto bg-[#f0f4f8] py-8 px-4">
        <div className="mx-auto bg-white shadow-md rounded-sm"
          style={{ width: "816px", minHeight: "1056px", padding: "96px 96px 96px 96px" }}
        >
          {readOnly && (
            <div className="mb-4 rounded border border-yellow-200 bg-yellow-50 px-4 py-2 text-sm text-yellow-700">
              You have view-only access to this document.
            </div>
          )}

          {/* Tiptap content */}
          <EditorContent
            editor={editor}
            className="prose prose-sm max-w-none
              prose-headings:font-semibold
              prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl
              prose-h4:text-lg prose-h5:text-base prose-h6:text-sm
              prose-p:leading-relaxed prose-p:my-2
              prose-blockquote:border-l-4 prose-blockquote:border-blue-400 prose-blockquote:pl-4 prose-blockquote:italic
              prose-code:bg-gray-100 prose-code:rounded prose-code:px-1 prose-code:text-sm
              prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-lg prose-pre:p-4
              prose-table:border-collapse prose-table:w-full
              prose-td:border prose-td:border-gray-300 prose-td:px-3 prose-td:py-2
              prose-th:border prose-th:border-gray-300 prose-th:px-3 prose-th:py-2 prose-th:bg-gray-50
              prose-img:rounded-lg prose-img:shadow-sm
              prose-a:text-blue-600 prose-a:underline
              [&_.task-list]:list-none [&_.task-list]:pl-0
              [&_.task-list-item]:flex [&_.task-list-item]:items-start [&_.task-list-item]:gap-2
            "
          />
        </div>
      </div>

      {/* Bottom status bar */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-white border-t border-gray-200 text-xs shrink-0">
        <WordCount editor={editor} />
        <div className="flex items-center gap-3 text-gray-400">
          <span className={statusColor}>{status}</span>
          {lastSavedAt && (
            <span>Last saved {lastSavedAt.toLocaleTimeString()}</span>
          )}
        </div>
      </div>
    </div>
  );
}