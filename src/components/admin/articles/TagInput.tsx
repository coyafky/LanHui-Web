"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { ArticleFormInput } from "@/lib/validations/article";

interface TagInputProps {
  tags: string[];
  onTagsChange: (v: string[]) => void;
  fieldErrors: Partial<Record<keyof ArticleFormInput, string>>;
  setFieldRef: (field: string, el: HTMLElement | null) => void;
}

export function TagInput({
  tags,
  onTagsChange,
  fieldErrors,
  setFieldRef,
}: TagInputProps) {
  const [tagInput, setTagInput] = useState("");

  function handleAddTag() {
    const tag = tagInput.trim();
    if (tag && !tags.includes(tag)) {
      onTagsChange([...tags, tag]);
    }
    setTagInput("");
  }

  function handleRemoveTag(tag: string) {
    onTagsChange(tags.filter((t) => t !== tag));
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  }

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-zinc-300">
        标签
      </label>
      <div className="flex gap-2">
        <input
          ref={(el) => setFieldRef("tags", el)}
          type="text"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="输入标签后按回车添加"
          className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-200 placeholder-zinc-600 outline-none focus:border-orange-500"
        />
        <button
          type="button"
          onClick={handleAddTag}
          className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-300 transition-colors hover:bg-zinc-800"
        >
          添加
        </button>
      </div>
      {tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-300"
            >
              {tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="text-zinc-500 hover:text-zinc-300"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      {fieldErrors["tags"] && (
        <p className="mt-1 text-xs text-red-400" role="alert">
          {fieldErrors["tags"]}
        </p>
      )}
    </div>
  );
}
