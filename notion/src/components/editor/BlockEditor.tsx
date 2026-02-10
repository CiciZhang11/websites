"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Block as BlockType, BlockType as BlockTypeEnum, TextContent } from "@/types/notion";
import { Block } from "./Block";
import { blocksAPI } from "@/lib/api";
import { debounce } from "@/lib/utils";

interface BlockEditorProps {
  pageId: string;
  initialBlocks?: BlockType[];
  onBlockChange?: () => void;
}

export const BlockEditor: React.FC<BlockEditorProps> = ({
  pageId,
  initialBlocks = [],
  onBlockChange,
}) => {
  const [blocks, setBlocks] = useState<BlockType[]>(initialBlocks);
  const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setBlocks(initialBlocks);
  }, [initialBlocks]);

  const loadBlocks = useCallback(async () => {
    try {
      setLoading(true);
      const response = await blocksAPI.list(pageId);
      setBlocks(response.blocks);
    } catch (error) {
      console.error("Failed to load blocks:", error);
    } finally {
      setLoading(false);
    }
  }, [pageId]);

  useEffect(() => {
    if (!initialBlocks.length) {
      loadBlocks();
    }
  }, [pageId, initialBlocks.length, loadBlocks]);

  const debouncedUpdateBlock = debounce(async (blockId: string, updates: any) => {
    try {
      await blocksAPI.update(blockId, updates);
      onBlockChange?.();
    } catch (error) {
      console.error("Failed to update block:", error);
    }
  }, 500);

  const handleBlockUpdate = useCallback(
    (blockId: string, content: TextContent[]) => {
      setBlocks((prev) =>
        prev.map((block) =>
          block.id === blockId
            ? { ...block, content: JSON.stringify(content) }
            : block
        )
      );

      debouncedUpdateBlock(blockId, {
        content: JSON.stringify(content),
      });
    },
    [debouncedUpdateBlock]
  );

  const handleBlockTypeChange = useCallback(
    async (blockId: string, newType: BlockTypeEnum) => {
      try {
        await blocksAPI.update(blockId, { type: newType });
        setBlocks((prev) =>
          prev.map((block) =>
            block.id === blockId ? { ...block, type: newType } : block
          )
        );
        onBlockChange?.();
      } catch (error) {
        console.error("Failed to change block type:", error);
      }
    },
    [onBlockChange]
  );

  const handleBlockDelete = useCallback(
    async (blockId: string) => {
      try {
        await blocksAPI.delete(blockId);
        setBlocks((prev) => prev.filter((block) => block.id !== blockId));
        onBlockChange?.();
      } catch (error) {
        console.error("Failed to delete block:", error);
      }
    },
    [onBlockChange]
  );

  const handleBlockEnter = useCallback(
    async (blockId: string) => {
      const currentBlock = blocks.find((b) => b.id === blockId);
      if (!currentBlock) return;

      const currentIndex = blocks.findIndex((b) => b.id === blockId);
      const content = JSON.parse(currentBlock.content || "[]") as TextContent[];
      const text = content.map((c) => c.text).join("");

      try {
        // Create new block after current one
        const newBlock = await blocksAPI.create({
          pageId,
          type: "paragraph",
          content: JSON.stringify([{ text: "" }]),
          order: currentBlock.order + 1,
        });

        // Update orders of subsequent blocks
        const subsequentBlocks = blocks
          .filter((b) => b.order > currentBlock.order)
          .map((b) => ({ id: b.id, order: b.order + 1 }));

        if (subsequentBlocks.length > 0) {
          await blocksAPI.reorder(subsequentBlocks);
        }

        setBlocks((prev) => {
          const newBlocks = [...prev];
          newBlocks.splice(currentIndex + 1, 0, newBlock.block);
          return newBlocks.map((b, i) => ({ ...b, order: i }));
        });

        // Focus new block
        setTimeout(() => {
          setFocusedBlockId(newBlock.block.id);
        }, 0);
      } catch (error) {
        console.error("Failed to create new block:", error);
      }
    },
    [blocks, pageId]
  );

  const handleBlockBackspace = useCallback(
    async (blockId: string) => {
      const currentIndex = blocks.findIndex((b) => b.id === blockId);
      if (currentIndex === 0) return; // Can't delete first block

      const currentBlock = blocks[currentIndex];
      const content = JSON.parse(currentBlock.content || "[]") as TextContent[];
      const text = content.map((c) => c.text).join("");

      if (text.trim() === "") {
        // Delete empty block
        await handleBlockDelete(blockId);
        // Focus previous block
        if (currentIndex > 0) {
          setFocusedBlockId(blocks[currentIndex - 1].id);
        }
      }
    },
    [blocks, handleBlockDelete]
  );

  const handleBlockArrowUp = useCallback(
    (blockId: string) => {
      const currentIndex = blocks.findIndex((b) => b.id === blockId);
      if (currentIndex > 0) {
        setFocusedBlockId(blocks[currentIndex - 1].id);
      }
    },
    [blocks]
  );

  const handleBlockArrowDown = useCallback(
    (blockId: string) => {
      const currentIndex = blocks.findIndex((b) => b.id === blockId);
      if (currentIndex < blocks.length - 1) {
        setFocusedBlockId(blocks[currentIndex + 1].id);
      }
    },
    [blocks]
  );

  if (loading && blocks.length === 0) {
    return <div className="p-8">Loading...</div>;
  }

  if (blocks.length === 0) {
    // Create initial block
    blocksAPI
      .create({
        pageId,
        type: "paragraph",
        content: JSON.stringify([{ text: "" }]),
        order: 0,
      })
      .then((response) => {
        setBlocks([response.block]);
      })
      .catch(console.error);
  }

  const handleEditorClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    // If clicking on the editor container (not on a block), create a new block at the end
    if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains("notion-page")) {
      try {
        const lastBlock = blocks[blocks.length - 1];
        const newOrder = lastBlock ? lastBlock.order + 1 : 0;
        
        const newBlock = await blocksAPI.create({
          pageId,
          type: "paragraph",
          content: JSON.stringify([{ text: "" }]),
          order: newOrder,
        });

        setBlocks((prev) => [...prev, newBlock.block]);
        setTimeout(() => {
          setFocusedBlockId(newBlock.block.id);
        }, 0);
      } catch (error) {
        console.error("Failed to create block:", error);
      }
    }
  };

  return (
    <div className="notion-page" onClick={handleEditorClick}>
      {blocks.map((block, index) => {
        const content = JSON.parse(block.content || "[]") as TextContent[];
        const metadata = block.metadata
          ? JSON.parse(block.metadata)
          : undefined;

        return (
          <Block
            key={block.id}
            id={block.id}
            type={block.type as BlockTypeEnum}
            content={content}
            metadata={metadata}
            isFocused={focusedBlockId === block.id}
            onUpdate={(content) => handleBlockUpdate(block.id, content)}
            onTypeChange={(type) => handleBlockTypeChange(block.id, type)}
            onDelete={() => handleBlockDelete(block.id)}
            onFocus={() => setFocusedBlockId(block.id)}
            onBlur={() => {
              // Don't clear focus immediately to allow menu interactions
              setTimeout(() => {
                if (document.activeElement?.closest(".notion-block") === null) {
                  setFocusedBlockId(null);
                }
              }, 200);
            }}
            onEnter={() => handleBlockEnter(block.id)}
            onBackspace={() => handleBlockBackspace(block.id)}
            onArrowUp={() => handleBlockArrowUp(block.id)}
            onArrowDown={() => handleBlockArrowDown(block.id)}
          />
        );
      })}
      {/* Invisible clickable area at the end */}
      <div 
        className="min-h-[100px] cursor-text"
        onClick={(e) => {
          e.stopPropagation();
          handleEditorClick(e as any);
        }}
      />
    </div>
  );
};
