// Core Notion-like types

export type BlockType =
  | "paragraph"
  | "heading1"
  | "heading2"
  | "heading3"
  | "bullet"
  | "numbered"
  | "code"
  | "quote"
  | "toggle"
  | "table"
  | "divider"
  | "image"
  | "embed"
  | "callout";

export interface TextContent {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
  link?: string;
}

export interface BlockContent {
  type: BlockType;
  content: TextContent[];
  metadata?: BlockMetadata;
}

export interface BlockMetadata {
  language?: string; // For code blocks
  tableData?: TableData; // For table blocks
  url?: string; // For image/embed blocks
  caption?: string; // For image blocks
  collapsed?: boolean; // For toggle blocks
}

export interface TableData {
  rows: TextContent[][];
  columns: number;
}

export interface Page {
  id: string;
  title: string;
  icon?: string;
  emoji?: string;
  parentId?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  order: number;
  isArchived: boolean;
  isPublished: boolean;
  children?: Page[];
  blocks?: Block[];
}

export interface Block {
  id: string;
  type: BlockType;
  content: string; // JSON string
  pageId: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  metadata?: string; // JSON string
}

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SearchResult {
  type: "page" | "block";
  id: string;
  pageId?: string;
  title?: string;
  content?: string;
  highlight?: string;
}

export interface PageTreeItem extends Page {
  children: PageTreeItem[];
  depth: number;
}
