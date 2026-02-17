const { spawnSync } = require('child_process');

function run(cmd, args) {
  const res = spawnSync(cmd, args, { stdio: 'inherit', shell: true });
  if (res.status !== 0) process.exit(res.status);
}

console.log('Running: prisma generate');
run('npx', ['prisma', 'generate']);

// Only skip migrations if no DATABASE_URL (dev SQLite case)
if (!process.env.DATABASE_URL) {
  console.log('DATABASE_URL not set — skipping migrations.');
} else {
  console.log('DATABASE_URL found — running prisma migrate deploy');
  run('npx', ['prisma', 'migrate', 'deploy']);
}

console.log('Running: next build');
run('npx', ['next', 'build']);
