import fs from 'node:fs/promises';
await import('./prerender.mjs');
await fs.rm('dist',{recursive:true,force:true});
await fs.mkdir('dist',{recursive:true});
await fs.cp('src','dist/public',{recursive:true});
await fs.cp('worker','dist/worker',{recursive:true});
console.log('Built prerendered HTML in dist/public and Worker in dist/worker.');
