const { spawnSync } = require('child_process');

function run(cmd, args) {
  const res = spawnSync(cmd, args, { stdio: 'inherit', shell: true });
  if (res.status !== 0) process.exit(res.status);
}

console.log('Running: prisma generate');
run('npx', ['prisma', 'generate']);

if (process.env.VERCEL) {
  console.log('VERCEL detected — skipping `prisma migrate deploy` during build.');
} else {
  console.log('Running: prisma migrate deploy');
  run('npx', ['prisma', 'migrate', 'deploy']);
}

console.log('Running: next build');
run('npx', ['next', 'build']);
