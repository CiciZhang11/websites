# Setup Guide

This guide will help you set up and run the Notion Replica project.

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set Up Environment Variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and update `NEXTAUTH_SECRET` with a random string.

3. **Initialize Database**
   ```bash
   # Generate Prisma client
   npm run db:generate

   # Create database and run migrations
   npm run db:migrate

   # Seed with sample data
   npm run db:seed
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Open Browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

6. **Login**
   - Email: `demo@notion.com`
   - Password: `password123`

## Troubleshooting

### Database Issues

If you encounter database errors:

1. Delete `dev.db` and `dev.db-journal` files
2. Run `npm run db:migrate` again
3. Run `npm run db:seed` to populate data

### Port Already in Use

If port 3000 is already in use:

1. Kill the process using port 3000:
   ```bash
   # Windows
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F
   
   # Mac/Linux
   lsof -ti:3000 | xargs kill
   ```

2. Or change the port in `package.json`:
   ```json
   "dev": "next dev -p 3001"
   ```

### Prisma Client Not Generated

If you see "PrismaClient is not defined":

```bash
npm run db:generate
```

### TypeScript Errors

If you see TypeScript errors:

```bash
# Restart TypeScript server in your IDE
# Or run:
npm run build
```

## Development Tips

1. **Database Studio**: Run `npm run db:studio` to open Prisma Studio and inspect your database
2. **Hot Reload**: The dev server supports hot reload - changes will reflect immediately
3. **API Testing**: Use the browser's Network tab or tools like Postman to test API endpoints
4. **Logs**: Check the terminal for server logs and browser console for client logs

## Production Build

To build for production:

```bash
npm run build
npm start
```

Make sure to:
- Set `NODE_ENV=production` in your `.env`
- Use a production database (PostgreSQL recommended)
- Set a strong `NEXTAUTH_SECRET`
- Configure proper CORS and security headers

## Next Steps

- Read the [README.md](./README.md) for detailed documentation
- Check the API endpoints in `src/app/api/`
- Explore the components in `src/components/`
- Review the database schema in `prisma/schema.prisma`
