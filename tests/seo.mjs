import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const root="https://nt-payments.menefon.workers.dev";
const slugs=["","host-a-kiosk","providers","wallet","contact","support","find-a-kiosk"];
const sitemap=await fs.readFile('src/sitemap.xml','utf8');
const robots=await fs.readFile('src/robots.txt','utf8');
for(const slug of slugs){const path='src/'+(slug?slug+'/':'')+'index.html';const html=await fs.readFile(path,'utf8');const url=root+'/'+(slug?slug+'/':'');assert(html.includes('<link rel="canonical" href="'+url+'">'),path);assert(html.includes('<h1>'),path);assert(html.includes('application/ld+json'),path);assert(html.includes('Independent redesign concept'),path);assert(sitemap.includes('<loc>'+url+'</loc>'),path);assert(html.includes('<base href="/">'),path);}
assert(robots.includes('Sitemap: '+root+'/sitemap.xml'));
console.log('SEO: all 7 prerendered pages passed.');
