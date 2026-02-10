import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create a default user
  const hashedPassword = await bcrypt.hash("password123", 10);
  const user = await prisma.user.upsert({
    where: { email: "demo@notion.com" },
    update: {},
    create: {
      email: "demo@notion.com",
      name: "Demo User",
      password: hashedPassword,
    },
  });

  console.log("Created user:", user.email);

  // Delete existing pages for clean seed
  await prisma.block.deleteMany({});
  await prisma.page.deleteMany({});

  // Create root pages
  const welcomePage = await prisma.page.create({
    data: {
      title: "Welcome to Notion",
      userId: user.id,
      order: 0,
      blocks: {
        create: [
          {
            type: "heading1",
            content: JSON.stringify([{ text: "Welcome to Notion" }]),
            order: 0,
          },
          {
            type: "paragraph",
            content: JSON.stringify([
              { text: "This is a " },
              { text: "full-stack Notion replica", bold: true },
              { text: " built with Next.js, React, TypeScript, and Prisma." },
            ]),
            order: 1,
          },
          {
            type: "heading2",
            content: JSON.stringify([{ text: "Getting Started" }]),
            order: 2,
          },
          {
            type: "bullet",
            content: JSON.stringify([{ text: "Create new pages using the sidebar" }]),
            order: 3,
          },
          {
            type: "bullet",
            content: JSON.stringify([{ text: "Type '/' to see block commands" }]),
            order: 4,
          },
          {
            type: "bullet",
            content: JSON.stringify([{ text: "Use Ctrl+K to search" }]),
            order: 5,
          },
          {
            type: "heading2",
            content: JSON.stringify([{ text: "Features" }]),
            order: 6,
          },
          {
            type: "numbered",
            content: JSON.stringify([{ text: "Block-based editor with multiple block types" }]),
            order: 7,
          },
          {
            type: "numbered",
            content: JSON.stringify([{ text: "Page hierarchy with up to 10 levels of nesting" }]),
            order: 8,
          },
          {
            type: "numbered",
            content: JSON.stringify([{ text: "Full-text search across pages and blocks" }]),
            order: 9,
          },
          {
            type: "numbered",
            content: JSON.stringify([{ text: "Recently viewed pages" }]),
            order: 10,
          },
          {
            type: "divider",
            content: JSON.stringify([]),
            order: 11,
          },
          {
            type: "quote",
            content: JSON.stringify([
              { text: "Start writing and see your ideas come to life!" },
            ]),
            order: 12,
          },
        ],
      },
    },
  });

  const gettingStartedPage = await prisma.page.create({
    data: {
      title: "Getting Started",
      userId: user.id,
      order: 1,
      parentId: welcomePage.id,
      blocks: {
        create: [
          {
            type: "heading1",
            content: JSON.stringify([{ text: "Getting Started Guide" }]),
            order: 0,
          },
          {
            type: "paragraph",
            content: JSON.stringify([
              { text: "This guide will help you get started with using this Notion replica." },
            ]),
            order: 1,
          },
          {
            type: "heading2",
            content: JSON.stringify([{ text: "Creating Pages" }]),
            order: 2,
          },
          {
            type: "paragraph",
            content: JSON.stringify([
              { text: "Click the 'New Page' button in the sidebar to create a new page." },
            ]),
            order: 3,
          },
          {
            type: "heading2",
            content: JSON.stringify([{ text: "Editing Blocks" }]),
            order: 4,
          },
          {
            type: "paragraph",
            content: JSON.stringify([
              { text: "Click on any block to start editing. Press Enter to create a new block." },
            ]),
            order: 5,
          },
          {
            type: "code",
            content: JSON.stringify([
              { text: "// This is a code block\nconst example = 'Hello, World!';" },
            ]),
            metadata: JSON.stringify({ language: "javascript" }),
            order: 6,
          },
        ],
      },
    },
  });

  const tipsPage = await prisma.page.create({
    data: {
      title: "Tips & Tricks",
      userId: user.id,
      order: 2,
      blocks: {
        create: [
          {
            type: "heading1",
            content: JSON.stringify([{ text: "Tips & Tricks" }]),
            order: 0,
          },
          {
            type: "toggle",
            content: JSON.stringify([{ text: "Keyboard Shortcuts" }]),
            metadata: JSON.stringify({ collapsed: false }),
            order: 1,
          },
          {
            type: "bullet",
            content: JSON.stringify([{ text: "Ctrl+K: Open search" }]),
            order: 2,
          },
          {
            type: "bullet",
            content: JSON.stringify([{ text: "Enter: Create new block" }]),
            order: 3,
          },
          {
            type: "bullet",
            content: JSON.stringify([{ text: "Backspace (empty block): Delete block" }]),
            order: 4,
          },
        ],
      },
    },
  });

  // Create a nested page structure
  const projectPage = await prisma.page.create({
    data: {
      title: "My Project",
      userId: user.id,
      order: 3,
      blocks: {
        create: [
          {
            type: "heading1",
            content: JSON.stringify([{ text: "My Project" }]),
            order: 0,
          },
          {
            type: "paragraph",
            content: JSON.stringify([
              { text: "This is a project page with nested sub-pages." },
            ]),
            order: 1,
          },
        ],
      },
    },
  });

  const task1Page = await prisma.page.create({
    data: {
      title: "Task 1",
      userId: user.id,
      order: 0,
      parentId: projectPage.id,
      blocks: {
        create: [
          {
            type: "heading1",
            content: JSON.stringify([{ text: "Task 1" }]),
            order: 0,
          },
          {
            type: "bullet",
            content: JSON.stringify([{ text: "Complete task 1" }]),
            order: 1,
          },
        ],
      },
    },
  });

  const task2Page = await prisma.page.create({
    data: {
      title: "Task 2",
      userId: user.id,
      order: 1,
      parentId: projectPage.id,
      blocks: {
        create: [
          {
            type: "heading1",
            content: JSON.stringify([{ text: "Task 2" }]),
            order: 0,
          },
          {
            type: "bullet",
            content: JSON.stringify([{ text: "Complete task 2" }]),
            order: 1,
          },
        ],
      },
    },
  });

  console.log("Created pages:");
  console.log("- Welcome to Notion");
  console.log("- Getting Started");
  console.log("- Tips & Tricks");
  console.log("- My Project (with nested tasks)");

  console.log("\n✅ Seeding completed!");
  console.log("\nDefault credentials:");
  console.log("Email: demo@notion.com");
  console.log("Password: password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
