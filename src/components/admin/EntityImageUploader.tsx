"use client";

/**
 * 共享图片上传组件（PRD §4.3.1）
 *
 * 本期只实现 entity="store" 分支。
 * 架构预留：entity 枚举含 province / article / product，未来可平滑扩展。
 * 显式不含 "city"——城市不需要图片。
 *
 * 功能：拖拽 + 点击上传 / 进度条 / 预览 / 替换 / 删除
 */

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { Loader2, Upload, Trash2, Replace, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/* ── 类型 ── */

// 本期只支持 "store"；其他枚举值仅作未来扩展预留
export type ImageEntity = "store" | "province" | "article" | "product";

export interface EntityImageUploaderProps {
  entity: ImageEntity;
  entityId: string;
  currentPath: string | null;
  placeholderPath: string;
  onUploadSuccess?: (
    newPath: string,
    meta: { size: number; width: number; height: number }
  ) => void;
  onDeleteSuccess?: () => void;
}

type UploadState = "idle" | "uploading" | "error";

interface ErrorState {
  message: string;
}

const ACCEPT_MIME = "image/jpeg,image/png,image/webp";

/* ── 主组件 ── */

export function EntityImageUploader({
  entity,
  entityId,
  currentPath,
  placeholderPath,
  onUploadSuccess,
  onDeleteSuccess,
}: EntityImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<UploadState>("idle");
  const [error, setError] = useState<ErrorState | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const displayPath = currentPath ?? placeholderPath;

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      setState("uploading");

      const formData = new FormData();
      formData.append("file", file);
      formData.append("entity", entity);
      formData.append("entityId", entityId);

      try {
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.error ?? `上传失败 (${res.status})`);
        }
        setState("idle");
        onUploadSuccess?.(json.data.path, {
          size: json.data.size,
          width: json.data.width,
          height: json.data.height,
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : "上传失败";
        setError({ message: msg });
        setState("error");
      }
    },
    [entity, entityId, onUploadSuccess]
  );

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void handleFile(file);
    e.target.value = ""; // 允许同名文件再次选择
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void handleFile(file);
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const handleReplace = () => {
    openFileDialog();
  };

  const handleDelete = async () => {
    if (!currentPath) return;
    if (!window.confirm("确认删除当前图片？")) return;

    setState("uploading");
    setError(null);
    try {
      const res = await fetch(
        `/api/upload?entity=${entity}&entityId=${encodeURIComponent(entityId)}`,
        { method: "DELETE" }
      );
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error ?? `删除失败 (${res.status})`);
      }
      setState("idle");
      onDeleteSuccess?.();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "删除失败";
      setError({ message: msg });
      setState("error");
    }
  };

  const isUploading = state === "uploading";
  const hasImage = !!currentPath;

  return (
    <div className="space-y-4">
      {/* ── 上传区 / 预览区 ── */}
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={hasImage ? undefined : openFileDialog}
        className={cn(
          "relative flex aspect-[3/2] w-full items-center justify-center overflow-hidden rounded-xl border-2 transition-colors",
          hasImage
            ? "border-zinc-800 bg-zinc-900"
            : isDragging
              ? "border-orange-500 bg-orange-500/5"
              : "border-dashed border-zinc-700 bg-zinc-900/50 hover:border-zinc-500 cursor-pointer"
        )}
      >
        {isUploading ? (
          <div className="flex flex-col items-center gap-3 text-zinc-400">
            <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
            <span className="text-sm">处理中...</span>
          </div>
        ) : (
          <Image
            src={displayPath}
            alt="门店主图"
            width={600}
            height={400}
            unoptimized={displayPath.startsWith("/images/")}
            className="h-full w-full object-cover"
          />
        )}

        {!hasImage && !isUploading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center">
            <div className="rounded-full bg-zinc-800 p-3">
              {isDragging ? (
                <Upload className="h-6 w-6 text-orange-500" />
              ) : (
                <ImageIcon className="h-6 w-6 text-zinc-400" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-200">
                {isDragging ? "松开鼠标以上传" : "拖拽图片到此处，或点击选择"}
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                支持 jpg / png / webp，最大 5MB
              </p>
            </div>
          </div>
        )}

        {/* 隐藏的 file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPT_MIME}
          onChange={onFileChange}
          className="hidden"
        />
      </div>

      {/* ── 错误提示 ── */}
      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">
          {error.message}
        </div>
      )}

      {/* ── 操作按钮 ── */}
      <div className="flex flex-wrap gap-3">
        {hasImage ? (
          <>
            <button
              type="button"
              onClick={handleReplace}
              disabled={isUploading}
              className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600 disabled:opacity-50"
            >
              <Replace className="h-4 w-4" />
              替换图片
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isUploading}
              className="inline-flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              删除图片
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={openFileDialog}
            disabled={isUploading}
            className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-orange-600 disabled:opacity-50"
          >
            <Upload className="h-4 w-4" />
            选择文件
          </button>
        )}
      </div>
    </div>
  );
}
