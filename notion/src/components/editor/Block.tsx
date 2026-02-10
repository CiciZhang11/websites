"use client";

import React, { useState, useRef, useEffect } from "react";
import { BlockType, TextContent } from "@/types/notion";
import { cn } from "@/lib/utils";
import {
  MoreHorizontal,
  ChevronRight,
  ChevronDown,
  Trash2,
  Copy,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface BlockProps {
  id: string;
  type: BlockType;
  content: TextContent[];
  metadata?: any;
  isFocused?: boolean;
  placeholder?: string;
  onUpdate: (content: TextContent[]) => void;
  onTypeChange?: (type: BlockType) => void;
  onDelete?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onEnter?: () => void;
  onBackspace?: () => void;
  onArrowUp?: () => void;
  onArrowDown?: () => void;
}

export const Block: React.FC<BlockProps> = ({
  id,
  type,
  content,
  metadata,
  isFocused,
  placeholder,
  onUpdate,
  onTypeChange,
  onDelete,
  onFocus,
  onBlur,
  onEnter,
  onBackspace,
  onArrowUp,
  onArrowDown,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const contentEditableRef = useRef<HTMLDivElement>(null);
  const [toggleCollapsed, setToggleCollapsed] = useState(
    metadata?.collapsed ?? false
  );
  const isUpdatingRef = useRef(false);

  // Callback ref to initialize content when element is mounted
  const setContentEditableRef = (element: HTMLDivElement | null) => {
    contentEditableRef.current = element;
    if (element) {
      const contentText = content.map((c) => c.text).join("");
      if (element.textContent !== contentText) {
        element.textContent = contentText;
      }
    }
  };

  // Update contentEditable text content when content prop changes
  useEffect(() => {
    if (contentEditableRef.current) {
      const currentText = contentEditableRef.current.textContent || "";
      const contentText = content.map((c) => c.text).join("");
      const isActive = document.activeElement === contentEditableRef.current;
      
      // Update if content changed from outside (not from user input)
      if (currentText !== contentText && (!isEditing || !isActive)) {
        contentEditableRef.current.textContent = contentText;
      }
    }
  }, [content, isEditing]);

  useEffect(() => {
    if (isFocused && contentEditableRef.current) {
      contentEditableRef.current.focus();
      // Move cursor to end if content exists
      const text = contentEditableRef.current.textContent || "";
      if (text) {
        const range = document.createRange();
        const selection = window.getSelection();
        range.selectNodeContents(contentEditableRef.current);
        range.collapse(false);
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    }
  }, [isFocused]);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const text = e.currentTarget.textContent || "";
    const newContent: TextContent[] = [{ text }];
    isUpdatingRef.current = true;
    onUpdate(newContent);
    // Reset flag after a brief delay
    setTimeout(() => {
      isUpdatingRef.current = false;
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onEnter?.();
    } else if (e.key === "Backspace" && e.currentTarget.textContent === "") {
      e.preventDefault();
      onBackspace?.();
    } else if (e.key === "ArrowUp" && e.currentTarget.selectionStart === 0) {
      e.preventDefault();
      onArrowUp?.();
    } else if (
      e.key === "ArrowDown" &&
      e.currentTarget.textContent &&
      e.currentTarget.selectionStart === e.currentTarget.textContent.length
    ) {
      e.preventDefault();
      onArrowDown?.();
    }
  };

  const getText = () => {
    return content.map((c) => c.text).join("");
  };

  const renderContent = () => {
    const text = getText();

    switch (type) {
      case "heading1":
        return (
          <div
            ref={setContentEditableRef}
            contentEditable
            suppressContentEditableWarning
            className={cn(
              "notion-block notion-heading1",
              !text && "notion-block-placeholder"
            )}
            data-placeholder={placeholder || "Heading 1"}
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              setIsEditing(true);
              onFocus?.();
            }}
            onBlur={() => {
              setIsEditing(false);
              onBlur?.();
            }}
          />
        );

      case "heading2":
        return (
          <div
            ref={setContentEditableRef}
            contentEditable
            suppressContentEditableWarning
            className={cn(
              "notion-block notion-heading2",
              !text && "notion-block-placeholder"
            )}
            data-placeholder={placeholder || "Heading 2"}
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              setIsEditing(true);
              onFocus?.();
            }}
            onBlur={() => {
              setIsEditing(false);
              onBlur?.();
            }}
          />
        );

      case "heading3":
        return (
          <div
            ref={setContentEditableRef}
            contentEditable
            suppressContentEditableWarning
            className={cn(
              "notion-block notion-heading3",
              !text && "notion-block-placeholder"
            )}
            data-placeholder={placeholder || "Heading 3"}
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              setIsEditing(true);
              onFocus?.();
            }}
            onBlur={() => {
              setIsEditing(false);
              onBlur?.();
            }}
          />
        );

      case "code":
        return (
          <div className="notion-code-block">
            <div
              ref={setContentEditableRef}
              contentEditable
              suppressContentEditableWarning
              className={cn(
                "notion-block font-mono",
                !text && "notion-block-placeholder"
              )}
              data-placeholder={placeholder || "Code"}
              onInput={handleInput}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                setIsEditing(true);
                onFocus?.();
              }}
              onBlur={() => {
                setIsEditing(false);
                onBlur?.();
              }}
            />
          </div>
        );

      case "quote":
        return (
          <div className="notion-quote">
            <div
              ref={setContentEditableRef}
              contentEditable
              suppressContentEditableWarning
              className={cn(
                "notion-block",
                !text && "notion-block-placeholder"
              )}
              data-placeholder={placeholder || "Quote"}
              onInput={handleInput}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                setIsEditing(true);
                onFocus?.();
              }}
              onBlur={() => {
                setIsEditing(false);
                onBlur?.();
              }}
            />
          </div>
        );

      case "divider":
        return <div className="notion-divider" />;

      case "toggle":
        return (
          <div className="notion-toggle">
            <div className="flex items-start gap-1">
              <button
                onClick={() => setToggleCollapsed(!toggleCollapsed)}
                className="mt-1"
              >
                {toggleCollapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
              <div
                ref={setContentEditableRef}
                contentEditable
                suppressContentEditableWarning
                className={cn(
                  "notion-block flex-1",
                  !text && "notion-block-placeholder"
                )}
                data-placeholder={placeholder || "Toggle"}
                onInput={handleInput}
                onKeyDown={handleKeyDown}
                onFocus={() => {
                  setIsEditing(true);
                  onFocus?.();
                }}
                onBlur={() => {
                  setIsEditing(false);
                  onBlur?.();
                }}
              />
            </div>
            {!toggleCollapsed && (
              <div className="notion-toggle-content">
                {/* Toggle content blocks would go here */}
              </div>
            )}
          </div>
        );

      case "image":
        return (
          <div className="notion-image">
            {metadata?.url ? (
              <img
                src={metadata.url}
                alt={metadata.caption || ""}
                className="max-w-full rounded"
              />
            ) : (
              <div
                ref={setContentEditableRef}
                contentEditable
                suppressContentEditableWarning
                className="notion-block notion-block-placeholder"
                data-placeholder="Image URL"
                onInput={(e) => {
                  const url = e.currentTarget.textContent || "";
                  onUpdate([{ text: url }]);
                }}
                onKeyDown={handleKeyDown}
                onFocus={() => {
                  setIsEditing(true);
                  onFocus?.();
                }}
                onBlur={() => {
                  setIsEditing(false);
                  onBlur?.();
                }}
              />
            )}
            {metadata?.caption && (
              <div className="text-sm text-gray-500 mt-2">{metadata.caption}</div>
            )}
          </div>
        );

      case "table":
        return (
          <div className="notion-table-wrapper">
            <table className="notion-table">
              <tbody>
                {metadata?.tableData?.rows?.map((row: TextContent[], i: number) => (
                  <tr key={i}>
                    {row.map((cell, j) => (
                      <td key={j}>
                        <div
                          contentEditable
                          suppressContentEditableWarning
                          className="notion-block"
                          onInput={(e) => {
                            const newRows = [...(metadata.tableData.rows || [])];
                            newRows[i][j] = {
                              text: e.currentTarget.textContent || "",
                            };
                            // Update would need to handle table structure
                          }}
                        >
                          {cell.text}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case "bullet":
        return (
          <div className="notion-bullet flex items-start gap-2">
            <span className="mt-2">•</span>
            <div
              ref={setContentEditableRef}
              contentEditable
              suppressContentEditableWarning
              className={cn(
                "notion-block flex-1",
                !text && "notion-block-placeholder"
              )}
              data-placeholder={placeholder || "List item"}
              onInput={handleInput}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                setIsEditing(true);
                onFocus?.();
              }}
              onBlur={() => {
                setIsEditing(false);
                onBlur?.();
              }}
            />
          </div>
        );

      case "numbered":
        return (
          <div className="notion-numbered flex items-start gap-2">
            <span className="mt-2">1.</span>
            <div
              ref={setContentEditableRef}
              contentEditable
              suppressContentEditableWarning
              className={cn(
                "notion-block flex-1",
                !text && "notion-block-placeholder"
              )}
              data-placeholder={placeholder || "Numbered item"}
              onInput={handleInput}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                setIsEditing(true);
                onFocus?.();
              }}
              onBlur={() => {
                setIsEditing(false);
                onBlur?.();
              }}
            />
          </div>
        );

      default: // paragraph
        return (
          <div
            ref={setContentEditableRef}
            contentEditable
            suppressContentEditableWarning
            className={cn(
              "notion-block notion-paragraph",
              !text && "notion-block-placeholder"
            )}
            data-placeholder={placeholder || "Type '/' for commands"}
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              setIsEditing(true);
              onFocus?.();
            }}
            onBlur={() => {
              setIsEditing(false);
              onBlur?.();
            }}
          />
        );
    }
  };

  return (
    <div
      className={cn(
        "group relative flex items-start gap-2",
        isFocused && "bg-blue-50"
      )}
    >
      <div className="flex-1">{renderContent()}</div>
      {(isFocused || isEditing) && (
        <DropdownMenu>
          <DropdownMenuTrigger className="opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreHorizontal className="h-4 w-4 text-gray-400" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {onTypeChange && (
              <>
                <DropdownMenuItem onClick={() => onTypeChange("paragraph")}>
                  Paragraph
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onTypeChange("heading1")}>
                  Heading 1
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onTypeChange("heading2")}>
                  Heading 2
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onTypeChange("heading3")}>
                  Heading 3
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onTypeChange("bullet")}>
                  Bullet List
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onTypeChange("numbered")}>
                  Numbered List
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onTypeChange("code")}>
                  Code
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onTypeChange("quote")}>
                  Quote
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onTypeChange("divider")}>
                  Divider
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem>
              <Copy className="h-4 w-4 mr-2" />
              Duplicate
            </DropdownMenuItem>
            {onDelete && (
              <DropdownMenuItem
                onClick={onDelete}
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};
