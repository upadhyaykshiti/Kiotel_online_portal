"use client";

import { BubbleMenu } from "@tiptap/react";
// import { BubbleMenu } from "@tiptap/extension-bubble-menu";

export default function BubbleMenuBar({ editor, disabled }) {
  if (!editor || disabled) return null;

  return (
    <BubbleMenu
      editor={editor}
      tippyOptions={{ duration: 100, placement: "top" }}
      className="flex items-center gap-0.5 bg-gray-900 rounded-lg shadow-xl px-2 py-1.5"
    >
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`px-2 py-1 rounded text-xs font-bold transition-colors ${
          editor.isActive("bold") ? "bg-white text-gray-900" : "text-white hover:bg-gray-700"
        }`}
      >
        B
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`px-2 py-1 rounded text-xs italic transition-colors ${
          editor.isActive("italic") ? "bg-white text-gray-900" : "text-white hover:bg-gray-700"
        }`}
      >
        I
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`px-2 py-1 rounded text-xs underline transition-colors ${
          editor.isActive("underline") ? "bg-white text-gray-900" : "text-white hover:bg-gray-700"
        }`}
      >
        U
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={`px-2 py-1 rounded text-xs line-through transition-colors ${
          editor.isActive("strike") ? "bg-white text-gray-900" : "text-white hover:bg-gray-700"
        }`}
      >
        S
      </button>
      <div className="w-px h-4 bg-gray-600 mx-1" />
      <button
        type="button"
        onClick={() => {
          const url = window.prompt("URL:", editor.getAttributes("link").href || "https://");
          if (url === null) return;
          if (url === "") {
            editor.chain().focus().unsetLink().run();
          } else {
            editor.chain().focus().setLink({ href: url, target: "_blank" }).run();
          }
        }}
        className={`px-2 py-1 rounded text-xs transition-colors ${
          editor.isActive("link") ? "bg-white text-gray-900" : "text-white hover:bg-gray-700"
        }`}
      >
        🔗
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().unsetAllMarks().run()}
        className="px-2 py-1 rounded text-xs text-gray-400 hover:bg-gray-700 transition-colors"
        title="Clear formatting"
      >
        T✕
      </button>
    </BubbleMenu>
  );
}