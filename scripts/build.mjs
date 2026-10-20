import fs from 'node:fs/promises';
await fs.rm('dist',{recursive:true,force:true});await fs.mkdir('dist',{recursive:true});await fs.cp('src','dist/public',{recursive:true});await fs.cp('worker','dist/worker',{recursive:true});console.log('Built dist/public and dist/worker. GitHub Pages supports the static preview only; Google Sheets requires the Worker.');
