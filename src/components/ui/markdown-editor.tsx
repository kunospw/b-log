"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Bold, Italic, List, Link, Code, Heading1, Heading2 } from "lucide-react";
import { Button } from "./button";
import { Textarea } from "./textarea";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  required?: boolean;
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder = "Write your content here...",
  rows = 12,
  required = false,
}: MarkdownEditorProps) {
  const [showPreview, setShowPreview] = useState(false);

  const insertText = (before: string, after: string = "") => {
    const textarea = document.activeElement as HTMLTextAreaElement;
    if (!textarea || textarea.tagName !== "TEXTAREA") return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);
    
    onChange(newText);
    
    // Set cursor position after inserted text
    setTimeout(() => {
      textarea.focus();
      const newPosition = start + before.length + selectedText.length + after.length;
      textarea.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  const formatButtons = [
    { icon: Bold, label: "Bold", action: () => insertText("**", "**") },
    { icon: Italic, label: "Italic", action: () => insertText("*", "*") },
    { icon: Code, label: "Code", action: () => insertText("`", "`") },
    { icon: Heading1, label: "Heading 1", action: () => insertText("# ", "") },
    { icon: Heading2, label: "Heading 2", action: () => insertText("## ", "") },
    { icon: List, label: "List", action: () => insertText("- ", "") },
    {
      icon: Link,
      label: "Link",
      action: () => insertText("[", "](url)"),
    },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 rounded-md border border-gray-200 bg-white p-1">
          {formatButtons.map((btn, idx) => {
            const Icon = btn.icon;
            return (
              <Button
                key={idx}
                type="button"
                variant="ghost"
                size="sm"
                onClick={btn.action}
                className="h-8 w-8 p-0"
                title={btn.label}
              >
                <Icon className="h-4 w-4" />
              </Button>
            );
          })}
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant={!showPreview ? "default" : "outline"}
            size="sm"
            onClick={() => setShowPreview(false)}
          >
            Edit
          </Button>
          <Button
            type="button"
            variant={showPreview ? "default" : "outline"}
            size="sm"
            onClick={() => setShowPreview(true)}
          >
            Preview
          </Button>
        </div>
      </div>

      {showPreview ? (
        <div className="min-h-[300px] rounded-md border border-gray-200 bg-white p-4">
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {value || "*No content to preview*"}
            </ReactMarkdown>
          </div>
        </div>
      ) : (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          required={required}
          className="font-mono text-sm"
        />
      )}

      <p className="text-xs text-gray-500">
        Use Markdown syntax for formatting. Switch to Preview to see how it looks.
      </p>
    </div>
  );
}

