"use client";

import React, { forwardRef, useState, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import { FormField, FormFieldProps } from "./FormField";

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface FileWithPreview extends File {
  preview?: string;
  id: string;
}

export interface FormFileUploadProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "type" | "value" | "onChange">,
    Omit<FormFieldProps, "children" | "size"> {
  /** Upload size variant */
  inputSize?: "sm" | "md" | "lg";
  /** Accepted file types (MIME types or extensions) */
  accept?: string;
  /** Maximum file size in bytes */
  maxSize?: number;
  /** Maximum number of files (for multiple uploads) */
  maxFiles?: number;
  /** Whether to allow multiple file selection */
  multiple?: boolean;
  /** Loading state */
  isLoading?: boolean;
  /** Upload progress (0-100) */
  progress?: number;
  /** Currently selected files */
  value?: FileWithPreview[];
  /** Callback when files change */
  onChange?: (files: FileWithPreview[]) => void;
  /** Callback when a file is removed */
  onRemove?: (file: FileWithPreview) => void;
  /** Custom dropzone text */
  dropzoneText?: string;
  /** Custom drag active text */
  dragActiveText?: string;
  /** Show file list */
  showFileList?: boolean;
  /** Variant style */
  variant?: "default" | "compact" | "avatar";
}

// ============================================================================
// Form File Upload Component
// ============================================================================

/**
 * FormFileUpload - A comprehensive file upload component with drag-and-drop support
 * 
 * Features:
 * - Drag and drop support
 * - File type and size validation
 * - Multiple file upload
 * - Progress indicator
 * - File preview and removal
 * - Size variants
 * - Full accessibility support
 */
export const FormFileUpload = forwardRef<HTMLInputElement, FormFileUploadProps>(
  (
    {
      // FormField props
      label,
      required,
      error,
      helperText,
      labelElement,
      hideLabel,
      touched,
      
      // File upload props
      className,
      inputSize = "md",
      accept,
      maxSize,
      maxFiles = 1,
      multiple = false,
      isLoading = false,
      progress,
      value = [],
      onChange,
      onRemove,
      dropzoneText = "Drag and drop files here, or click to select",
      dragActiveText = "Drop files here",
      showFileList = true,
      variant = "default",
      disabled,
      onDragOver,
      onDragLeave,
      onDrop,
      ...props
    },
    ref
  ) => {
    const [isDragActive, setIsDragActive] = useState(false);
    const [internalError, setInternalError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Combine refs
    const combinedRef = useCallback(
      (node: HTMLInputElement | null) => {
        inputRef.current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
        }
      },
      [ref]
    );

    // Format file size
    const formatFileSize = (bytes: number): string => {
      if (bytes === 0) return "0 Bytes";
      const k = 1024;
      const sizes = ["Bytes", "KB", "MB", "GB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    // Validate file
    const validateFile = (file: File): string | null => {
      if (maxSize && file.size > maxSize) {
        return `File size exceeds ${formatFileSize(maxSize)}`;
      }
      if (accept) {
        const acceptedTypes = accept.split(",").map((t) => t.trim());
        const isAccepted = acceptedTypes.some((type) => {
          if (type.includes("/*")) {
            return file.type.startsWith(type.replace("/*", ""));
          }
          return file.type === type || file.name.endsWith(type);
        });
        if (!isAccepted) {
          return `File type not accepted. Allowed: ${accept}`;
        }
      }
      return null;
    };

    // Process files
    const processFiles = useCallback(
      (files: FileList | null) => {
        if (!files) return;

        setInternalError(null);
        const newFiles: FileWithPreview[] = [];
        const errors: string[] = [];

        Array.from(files).forEach((file) => {
          const validationError = validateFile(file);
          if (validationError) {
            errors.push(`${file.name}: ${validationError}`);
            return;
          }

          const fileWithPreview: FileWithPreview = Object.assign(file, {
            id: `${file.name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            preview: file.type.startsWith("image/")
              ? URL.createObjectURL(file)
              : undefined,
          });
          newFiles.push(fileWithPreview);
        });

        if (errors.length > 0) {
          setInternalError(errors.join("; "));
        }

        if (newFiles.length > 0) {
          const updatedFiles = multiple
            ? [...value, ...newFiles].slice(0, maxFiles)
            : newFiles.slice(0, maxFiles);
          onChange?.(updatedFiles);
        }
      },
      [value, multiple, maxFiles, maxSize, accept, onChange]
    );

    // Handle drag over
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragActive(true);
      onDragOver?.(e);
    };

    // Handle drag leave
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragActive(false);
      onDragLeave?.(e);
    };

    // Handle drop
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragActive(false);
      processFiles(e.dataTransfer.files);
      onDrop?.(e);
    };

    // Handle input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      processFiles(e.target.files);
      // Reset input value to allow selecting the same file again
      e.target.value = "";
    };

    // Handle file removal
    const handleRemove = (fileToRemove: FileWithPreview) => {
      if (fileToRemove.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      const updatedFiles = value.filter((f) => f.id !== fileToRemove.id);
      onChange?.(updatedFiles);
      onRemove?.(fileToRemove);
    };

    // Size variants
    const sizeClasses = {
      sm: {
        dropzone: "p-4",
        icon: "w-6 h-6",
        text: "text-xs",
        fileItem: "p-2",
        preview: "w-10 h-10",
      },
      md: {
        dropzone: "p-6",
        icon: "w-8 h-8",
        text: "text-sm",
        fileItem: "p-3",
        preview: "w-12 h-12",
      },
      lg: {
        dropzone: "p-8",
        icon: "w-10 h-10",
        text: "text-base",
        fileItem: "p-4",
        preview: "w-16 h-16",
      },
    };

    const displayError = error || internalError;
    const showError = displayError && touched;
    const isDisabled = disabled || isLoading;

    return (
      <FormField
        label={label}
        required={required}
        error={displayError || undefined}
        helperText={helperText}
        labelElement={labelElement}
        hideLabel={hideLabel}
        touched={touched}
        isLoading={isLoading}
        size={inputSize}
      >
        <div className={cn("space-y-3", className)}>
          {/* Dropzone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !isDisabled && inputRef.current?.click()}
            className={cn(
              // Base styles
              "relative border-2 border-dashed rounded-lg cursor-pointer",
              "transition-all duration-200 ease-in-out",
              sizeClasses[inputSize].dropzone,
              
              // Default state
              "border-input bg-background hover:bg-accent/50 hover:border-accent",
              
              // Drag active state
              isDragActive && "border-primary bg-primary/5",
              
              // Error state
              showError && "border-destructive bg-destructive/5",
              
              // Disabled state
              isDisabled && "cursor-not-allowed opacity-50 hover:bg-background hover:border-input",
              
              // Compact variant
              variant === "compact" && "py-3 px-4",
              
              // Avatar variant
              variant === "avatar" && "rounded-full aspect-square flex items-center justify-center p-4"
            )}
          >
            <input
              ref={combinedRef}
              type="file"
              accept={accept}
              multiple={multiple}
              disabled={isDisabled}
              onChange={handleInputChange}
              className="hidden"
              {...props}
            />

            <div className="flex flex-col items-center justify-center text-center space-y-2">
              {/* Icon */}
              <div
                className={cn(
                  "text-muted-foreground transition-colors",
                  isDragActive && "text-primary",
                  showError && "text-destructive"
                )}
              >
                {variant === "avatar" ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={sizeClasses[inputSize].icon}
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={sizeClasses[inputSize].icon}
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                )}
              </div>

              {/* Text */}
              <p
                className={cn(
                  "text-muted-foreground transition-colors",
                  sizeClasses[inputSize].text,
                  isDragActive && "text-primary",
                  showError && "text-destructive"
                )}
              >
                {isDragActive ? dragActiveText : dropzoneText}
              </p>

              {/* File requirements */}
              {(accept || maxSize) && (
                <p className={cn("text-muted-foreground/70", sizeClasses[inputSize].text)}>
                  {accept && `Accepted: ${accept}`}
                  {accept && maxSize && " • "}
                  {maxSize && `Max: ${formatFileSize(maxSize)}`}
                </p>
              )}
            </div>

            {/* Progress overlay */}
            {progress !== undefined && progress > 0 && progress < 100 && (
              <div className="absolute inset-x-0 bottom-0 h-1 bg-muted rounded-b-lg overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </div>

          {/* File List */}
          {showFileList && value.length > 0 && (
            <div className="space-y-2">
              {value.map((file) => (
                <div
                  key={file.id}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border bg-background",
                    sizeClasses[inputSize].fileItem
                  )}
                >
                  {/* Preview */}
                  {file.preview ? (
                    <img
                      src={file.preview}
                      alt={file.name}
                      className={cn(
                        "object-cover rounded",
                        sizeClasses[inputSize].preview
                      )}
                    />
                  ) : (
                    <div
                      className={cn(
                        "flex items-center justify-center rounded bg-muted",
                        sizeClasses[inputSize].preview
                      )}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-5 h-5 text-muted-foreground"
                      >
                        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                    </div>
                  )}

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                  </div>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(file);
                    }}
                    disabled={isDisabled}
                    className="p-1.5 rounded-md hover:bg-destructive/10 hover:text-destructive transition-colors disabled:opacity-50"
                    aria-label={`Remove ${file.name}`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-4 h-4"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </FormField>
    );
  }
);

FormFileUpload.displayName = "FormFileUpload";

export default FormFileUpload;
