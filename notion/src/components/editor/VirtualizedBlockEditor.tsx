"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { FixedSizeList } from "react-window";
import { Block as BlockType, BlockType as BlockTypeEnum, TextContent } from "@/types/notion";
import { Block } from "./Block";
import { blocksAPI } from "@/lib/api";
import { debounce } from "@/lib/utils";

interface VirtualizedBlockEditorProps {
  pageId: string;
  initialBlocks?: BlockType[];
  onBlockChange?: () => void;
}

const BLOCK_HEIGHT = 50; // Estimated height per block
const INITIAL_LOAD_SIZE = 50; // Load first 50 blocks initially

export const VirtualizedBlockEditor: React.FC<VirtualizedBlockEditorProps> = ({
  pageId,
  initialBlocks = [],
  onBlockChange,
}) => {
  const [blocks, setBlocks] = useState<BlockType[]>(initialBlocks);
  const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadedCount, setLoadedCount] = useState(INITIAL_LOAD_SIZE);
  const listRef = useRef<FixedSizeList>(null);

  useEffect(() => {
    setBlocks(initialBlocks);
  }, [initialBlocks]);

  const loadBlocks = useCallback(async () => {
    try {
      setLoading(true);
      const response = await blocksAPI.list(pageId);
      setBlocks(response.blocks);
      setLoadedCount(Math.min(INITIAL_LOAD_SIZE, response.blocks.length));
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

      try {
        const newBlock = await blocksAPI.create({
          pageId,
          type: "paragraph",
          content: JSON.stringify([{ text: "" }]),
          order: currentBlock.order + 1,
        });

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

        setTimeout(() => {
          setFocusedBlockId(newBlock.block.id);
          // Scroll to new block
          listRef.current?.scrollToItem(currentIndex + 1, "smart");
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
      if (currentIndex === 0) return;

      const currentBlock = blocks[currentIndex];
      const content = JSON.parse(currentBlock.content || "[]") as TextContent[];
      const text = content.map((c) => c.text).join("");

      if (text.trim() === "") {
        await handleBlockDelete(blockId);
        if (currentIndex > 0) {
          setFocusedBlockId(blocks[currentIndex - 1].id);
          listRef.current?.scrollToItem(currentIndex - 1, "smart");
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
        listRef.current?.scrollToItem(currentIndex - 1, "smart");
      }
    },
    [blocks]
  );

  const handleBlockArrowDown = useCallback(
    (blockId: string) => {
      const currentIndex = blocks.findIndex((b) => b.id === blockId);
      if (currentIndex < blocks.length - 1) {
        setFocusedBlockId(blocks[currentIndex + 1].id);
        listRef.current?.scrollToItem(currentIndex + 1, "smart");
      }
    },
    [blocks]
  );

  // Render individual block item
  const renderBlock = useCallback(
    ({ index, style }: { index: number; style: React.CSSProperties }) => {
      const block = blocks[index];
      if (!block) return <div style={style} />;

      const content = JSON.parse(block.content || "[]") as TextContent[];
      const metadata = block.metadata
        ? JSON.parse(block.metadata)
        : undefined;

      return (
        <div style={style}>
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
        </div>
      );
    },
    [
      blocks,
      focusedBlockId,
      handleBlockUpdate,
      handleBlockTypeChange,
      handleBlockDelete,
      handleBlockEnter,
      handleBlockBackspace,
      handleBlockArrowUp,
      handleBlockArrowDown,
    ]
  );

  if (loading && blocks.length === 0) {
    return <div className="p-8">Loading...</div>;
  }

  if (blocks.length === 0) {
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
    return <div className="p-8">Creating initial block...</div>;
  }

  // Use virtual scrolling for pages with many blocks (>100)
  if (blocks.length > 100) {
    return (
      <div className="notion-page">
        <FixedSizeList
          ref={listRef}
          height={window.innerHeight - 200}
          itemCount={blocks.length}
          itemSize={BLOCK_HEIGHT}
          width="100%"
        >
          {renderBlock}
        </FixedSizeList>
      </div>
    );
  }

  // For smaller pages, use regular rendering
  return (
    <div className="notion-page">
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
    </div>
  );
};
