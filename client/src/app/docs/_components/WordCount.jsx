"use client";

export default function WordCount({ editor }) {
  if (!editor) return null;

  const words = editor.storage?.characterCount?.words?.() ?? 0;
  const chars = editor.storage?.characterCount?.characters?.() ?? 0;

  return (
    <div className="flex items-center gap-3 text-xs text-gray-400 select-none">
      <span>{words.toLocaleString()} words</span>
      <span>{chars.toLocaleString()} characters</span>
    </div>
  );
}