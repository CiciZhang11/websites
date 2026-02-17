const { spawnSync } = require('child_process');

function run(cmd, args) {
  const res = spawnSync(cmd, args, { stdio: 'inherit', shell: true });
  if (res.status !== 0) process.exit(res.status);
}

console.log('Running: prisma generate');
run('npx', ['prisma', 'generate']);

// Skip migrations during build (will be done manually or separately)
console.log('Skipping migrations during build.');

console.log('Running: next build');
run('npx', ['next', 'build']);
