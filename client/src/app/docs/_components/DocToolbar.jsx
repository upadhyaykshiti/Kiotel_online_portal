"use client";

import { useCallback, useRef, useState } from "react";

const FONT_FAMILIES = [
  "Arial", "Georgia", "Times New Roman", "Courier New",
  "Verdana", "Trebuchet MS", "Impact",
];

const FONT_SIZES = [
  "8", "9", "10", "11", "12", "14", "16", "18",
  "20", "24", "28", "32", "36", "48", "72",
];

const TEXT_COLORS = [
  "#000000", "#434343", "#666666", "#999999", "#b7b7b7",
  "#ffffff", "#ff0000", "#ff4500", "#ff9900", "#ffff00",
  "#00ff00", "#00ffff", "#4a86e8", "#0000ff", "#9900ff",
  "#ff00ff", "#ea9999", "#f9cb9c", "#ffe599", "#b6d7a8",
  "#a2c4c9", "#9fc5e8", "#b4a7d6", "#d5a6bd",
];

const HIGHLIGHT_COLORS = [
  "#ffff00", "#00ff00", "#00ffff", "#ff00ff",
  "#ff0000", "#0000ff", "#ffa500", "#ee82ee",
  "none",
];

function ToolbarButton({ active, disabled, onClick, title, children, className = "" }) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={`
        inline-flex items-center justify-center w-7 h-7 rounded text-sm
        transition-colors duration-100
        ${active
          ? "bg-blue-100 text-blue-700"
          : "text-gray-700 hover:bg-gray-100"
        }
        ${disabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}
        ${className}
      `}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="w-px h-5 bg-gray-200 mx-1 shrink-0" />;
}

function ColorPicker({ colors, onSelect, trigger }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center justify-center w-7 h-7 rounded text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
      >
        {trigger}
      </button>
      {open && (
        <div className="absolute top-8 left-0 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-2 grid grid-cols-6 gap-1 w-40">
          {colors.map((c) => (
            <button
              key={c}
              type="button"
              title={c}
              onClick={() => { onSelect(c); setOpen(false); }}
              className="w-5 h-5 rounded border border-gray-300 cursor-pointer hover:scale-110 transition-transform"
              style={{ backgroundColor: c === "none" ? "transparent" : c }}
            >
              {c === "none" && (
                <span className="text-[8px] text-gray-500 leading-none">✕</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function DocToolbar({ editor, disabled }) {
  if (!editor) return null;

  const can = editor.can().chain().focus();

  return (
    <div className="flex flex-wrap items-center gap-0.5 px-3 py-1.5 bg-[#f8f9fa] border-b border-gray-200 select-none">

      {/* Undo / Redo */}
      <ToolbarButton
        title="Undo (Ctrl+Z)"
        disabled={disabled || !can.undo().run()}
        onClick={() => editor.chain().focus().undo().run()}
      >
        ↩
      </ToolbarButton>
      <ToolbarButton
        title="Redo (Ctrl+Y)"
        disabled={disabled || !can.redo().run()}
        onClick={() => editor.chain().focus().redo().run()}
      >
        ↪
      </ToolbarButton>

      <Divider />

      {/* Font Family */}
      <select
        disabled={disabled}
        className="h-7 text-xs border border-gray-200 rounded px-1 bg-white text-gray-700 cursor-pointer hover:border-gray-400 focus:outline-none"
        value={editor.getAttributes("textStyle").fontFamily || "Arial"}
        onChange={(e) => editor.chain().focus().setFontFamily(e.target.value).run()}
      >
        {FONT_FAMILIES.map((f) => (
          <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>
        ))}
      </select>

      {/* Font Size */}
      <select
        disabled={disabled}
        className="h-7 text-xs border border-gray-200 rounded px-1 bg-white text-gray-700 cursor-pointer hover:border-gray-400 focus:outline-none w-14"
        value={editor.getAttributes("textStyle").fontSize?.replace("px", "") || "12"}
        onChange={(e) =>
          editor.chain().focus().setFontSize(`${e.target.value}px`).run()
        }
      >
        {FONT_SIZES.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      <Divider />

      {/* Bold */}
      <ToolbarButton
        active={editor.isActive("bold")}
        disabled={disabled}
        title="Bold (Ctrl+B)"
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <strong>B</strong>
      </ToolbarButton>

      {/* Italic */}
      <ToolbarButton
        active={editor.isActive("italic")}
        disabled={disabled}
        title="Italic (Ctrl+I)"
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <em>I</em>
      </ToolbarButton>

      {/* Underline */}
      <ToolbarButton
        active={editor.isActive("underline")}
        disabled={disabled}
        title="Underline (Ctrl+U)"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <span className="underline">U</span>
      </ToolbarButton>

      {/* Strikethrough */}
      <ToolbarButton
        active={editor.isActive("strike")}
        disabled={disabled}
        title="Strikethrough"
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <span className="line-through">S</span>
      </ToolbarButton>

      {/* Text Color */}
      <ColorPicker
        colors={TEXT_COLORS}
        onSelect={(c) => editor.chain().focus().setColor(c).run()}
        trigger={
          <span className="flex flex-col items-center leading-none">
            <span className="text-xs font-bold">A</span>
            <span
              className="w-4 h-0.5 mt-0.5 rounded"
              style={{
                backgroundColor: editor.getAttributes("textStyle").color || "#000",
              }}
            />
          </span>
        }
      />

      {/* Highlight */}
      <ColorPicker
        colors={HIGHLIGHT_COLORS}
        onSelect={(c) =>
          c === "none"
            ? editor.chain().focus().unsetHighlight().run()
            : editor.chain().focus().setHighlight({ color: c }).run()
        }
        trigger={
          <span className="flex flex-col items-center leading-none">
            <span className="text-xs">🖊</span>
          </span>
        }
      />

      <Divider />

      {/* Subscript */}
      <ToolbarButton
        active={editor.isActive("subscript")}
        disabled={disabled}
        title="Subscript"
        onClick={() => editor.chain().focus().toggleSubscript().run()}
      >
        <span className="text-xs">X<sub>2</sub></span>
      </ToolbarButton>

      {/* Superscript */}
      <ToolbarButton
        active={editor.isActive("superscript")}
        disabled={disabled}
        title="Superscript"
        onClick={() => editor.chain().focus().toggleSuperscript().run()}
      >
        <span className="text-xs">X<sup>2</sup></span>
      </ToolbarButton>

      <Divider />

      {/* Headings */}
      <select
        disabled={disabled}
        className="h-7 text-xs border border-gray-200 rounded px-1 bg-white text-gray-700 cursor-pointer hover:border-gray-400 focus:outline-none w-28"
        value={
          editor.isActive("heading", { level: 1 }) ? "h1"
          : editor.isActive("heading", { level: 2 }) ? "h2"
          : editor.isActive("heading", { level: 3 }) ? "h3"
          : editor.isActive("heading", { level: 4 }) ? "h4"
          : editor.isActive("heading", { level: 5 }) ? "h5"
          : editor.isActive("heading", { level: 6 }) ? "h6"
          : "paragraph"
        }
        onChange={(e) => {
          const val = e.target.value;
          if (val === "paragraph") {
            editor.chain().focus().setParagraph().run();
          } else {
            const level = parseInt(val.replace("h", ""));
            editor.chain().focus().toggleHeading({ level }).run();
          }
        }}
      >
        <option value="paragraph">Normal text</option>
        <option value="h1">Heading 1</option>
        <option value="h2">Heading 2</option>
        <option value="h3">Heading 3</option>
        <option value="h4">Heading 4</option>
        <option value="h5">Heading 5</option>
        <option value="h6">Heading 6</option>
      </select>

      <Divider />

      {/* Text Align */}
      <ToolbarButton
        active={editor.isActive({ textAlign: "left" })}
        disabled={disabled}
        title="Align Left"
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
      >
        ≡
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive({ textAlign: "center" })}
        disabled={disabled}
        title="Align Center"
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
      >
        ☰
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive({ textAlign: "right" })}
        disabled={disabled}
        title="Align Right"
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
      >
        ≡
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive({ textAlign: "justify" })}
        disabled={disabled}
        title="Justify"
        onClick={() => editor.chain().focus().setTextAlign("justify").run()}
      >
        ☰
      </ToolbarButton>

      <Divider />

      {/* Lists */}
      <ToolbarButton
        active={editor.isActive("bulletList")}
        disabled={disabled}
        title="Bullet List"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        •≡
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive("orderedList")}
        disabled={disabled}
        title="Numbered List"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        1≡
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive("taskList")}
        disabled={disabled}
        title="Task List"
        onClick={() => editor.chain().focus().toggleTaskList().run()}
      >
        ☑
      </ToolbarButton>

      <Divider />

      {/* Blockquote */}
      <ToolbarButton
        active={editor.isActive("blockquote")}
        disabled={disabled}
        title="Blockquote"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        ❝
      </ToolbarButton>

      {/* Code Block */}
      <ToolbarButton
        active={editor.isActive("codeBlock")}
        disabled={disabled}
        title="Code Block"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
      >
        {"</>"}
      </ToolbarButton>

      {/* Horizontal Rule */}
      <ToolbarButton
        disabled={disabled}
        title="Insert Horizontal Rule"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
      >
        ─
      </ToolbarButton>

      <Divider />

      {/* Table */}
      <ToolbarButton
        disabled={disabled}
        title="Insert Table"
        onClick={() =>
          editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
        }
      >
        ⊞
      </ToolbarButton>

      {/* Link */}
      <ToolbarButton
        active={editor.isActive("link")}
        disabled={disabled}
        title="Insert Link"
        onClick={() => {
          const url = window.prompt("Enter URL:", editor.getAttributes("link").href || "https://");
          if (url === null) return;
          if (url === "") {
            editor.chain().focus().unsetLink().run();
          } else {
            editor.chain().focus().setLink({ href: url, target: "_blank" }).run();
          }
        }}
      >
        🔗
      </ToolbarButton>

      {/* Image */}
      <ToolbarButton
        disabled={disabled}
        title="Insert Image"
        onClick={() => {
          const url = window.prompt("Enter image URL:");
          if (url) editor.chain().focus().setImage({ src: url }).run();
        }}
      >
        🖼
      </ToolbarButton>

      <Divider />

      {/* Clear Formatting */}
      <ToolbarButton
        disabled={disabled}
        title="Clear Formatting"
        onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
      >
        T✕
      </ToolbarButton>

    </div>
  );
}