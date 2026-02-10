# Notion Replica

A full-stack Notion replica built with Next.js, React, TypeScript, Prisma, and SQLite. This project replicates core Notion functionality including block-based editing, page hierarchy, search, and more.

## Features

- ✅ **Block-based Editor**: Rich text editing with multiple block types (paragraphs, headings, lists, code, quotes, tables, etc.)
- ✅ **Page Hierarchy**: Create nested pages up to 10 levels deep
- ✅ **Full-text Search**: Search across pages and blocks
- ✅ **Recently Viewed**: Track and display recently accessed pages
- ✅ **Authentication**: User signup and login
- ✅ **Drag & Drop**: Reorder pages (via API)
- ✅ **Responsive Design**: Notion-like UI with sidebar navigation
- ✅ **Production Ready**: Type-safe, error handling, optimized queries

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: SQLite with Prisma ORM
- **Authentication**: Custom JWT-like session tokens
- **UI Components**: Radix UI, Lucide Icons

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Git

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd notion
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Update `.env` with your configuration:
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-change-in-production"
NODE_ENV="development"
```

4. Set up the database:
```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed the database with sample data
npm run db:seed
```

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Default Credentials

After seeding, you can log in with:
- **Email**: `demo@notion.com`
- **Password**: `password123`

## Project Structure

```
notion/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Mock data seeder
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── (auth)/        # Authentication pages
│   │   ├── api/           # API routes
│   │   ├── [pageId]/      # Dynamic page routes
│   │   ├── layout.tsx     # Root layout
│   │   └── page.tsx        # Workspace/home
│   ├── components/
│   │   ├── editor/        # Block editor components
│   │   ├── sidebar/       # Navigation sidebar
│   │   ├── search/        # Search modal
│   │   └── ui/            # Reusable UI components
│   ├── lib/               # Utilities and helpers
│   ├── types/             # TypeScript types
│   └── hooks/             # Custom React hooks
├── public/                # Static assets
└── package.json
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with sample data
- `npm run db:studio` - Open Prisma Studio
- `npm test` - Run unit tests
- `npm run test:e2e` - Run E2E tests

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Pages
- `GET /api/pages` - List all pages
- `GET /api/pages/[id]` - Get single page
- `POST /api/pages` - Create page
- `PUT /api/pages/[id]` - Update page
- `DELETE /api/pages/[id]` - Delete page
- `POST /api/pages/reorder` - Reorder pages

### Blocks
- `GET /api/blocks?pageId=...` - List blocks for a page
- `POST /api/blocks` - Create block
- `PUT /api/blocks/[id]` - Update block
- `DELETE /api/blocks/[id]` - Delete block
- `POST /api/blocks/reorder` - Reorder blocks

### Search
- `GET /api/search?q=...` - Search pages and blocks

### Recently Viewed
- `GET /api/recently-viewed` - Get recently viewed pages
- `POST /api/recently-viewed` - Add to recently viewed

## Block Types

Supported block types:
- `paragraph` - Regular text paragraph
- `heading1`, `heading2`, `heading3` - Headings
- `bullet` - Bullet list
- `numbered` - Numbered list
- `code` - Code block
- `quote` - Quote block
- `toggle` - Toggle/collapsible block
- `table` - Table block
- `divider` - Horizontal divider
- `image` - Image block
- `embed` - Embed block
- `callout` - Callout block

## Database Schema

The database uses SQLite with the following main models:
- `User` - User accounts
- `Page` - Pages with hierarchy support
- `Block` - Content blocks
- `RecentlyViewed` - Recently viewed pages tracking
- `Session` - User sessions
- `Account` - OAuth accounts (for future use)

## Development

### Adding New Block Types

1. Add the type to `BlockType` in `src/types/notion.ts`
2. Update the `Block` component to render the new type
3. Update the block menu to include the new type

### Customizing Styles

Styles are defined in:
- `src/app/globals.css` - Global styles and Notion-like classes
- `tailwind.config.ts` - Tailwind configuration

## Testing

Unit tests are written with Jest. E2E tests use Playwright.

```bash
# Run unit tests
npm test

# Run E2E tests
npm run test:e2e
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Set environment variables
4. Deploy

### Other Platforms

1. Build the project: `npm run build`
2. Set up environment variables
3. Run migrations: `npm run db:migrate`
4. Start the server: `npm start`

**Note**: For production, consider switching to PostgreSQL instead of SQLite for better performance and scalability.

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.
