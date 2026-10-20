import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const root="https://nt-payments.menefon.workers.dev";
const slugs=["","host-a-kiosk","providers","wallet","contact","support","find-a-kiosk","payments/list-of-services"];
const sitemap=await fs.readFile('src/sitemap.xml','utf8');
const robots=await fs.readFile('src/robots.txt','utf8');
for(const slug of slugs){const path='src/'+(slug?slug+'/':'')+'index.html';const html=await fs.readFile(path,'utf8');const url=root+'/'+(slug?slug+'/':'');assert(html.includes('<link rel="canonical" href="'+url+'">'),path);assert(html.includes('<h1>'),path);assert(html.includes('application/ld+json'),path);assert(html.includes('Independent redesign concept'),path);assert(sitemap.includes('<loc>'+url+'</loc>'),path);assert(html.includes('href="/style.css'),path);assert(!html.includes('<base href="/">'),path);}
assert(robots.includes('Sitemap: '+root+'/sitemap.xml'));
console.log('SEO: all 8 prerendered pages passed.');

const contact=await fs.readFile('src/contact/index.html','utf8');
assert(contact.includes('class="contact-hero-copy"'), 'Contacts split hero');
assert(contact.includes('class="contact-route-panel"'), 'Contacts routing panel');
assert((contact.match(/class="contact-route-link"/g)||[]).length===3, 'Three contact pathways');
for(const href of ['/support/','/host-a-kiosk/','/providers/','/contact/#contacts/message']) assert(contact.includes('href="'+href+'"'),'Missing link '+href);
for(const id of ['contact-form','contact-success','contact-again','message']) assert(contact.includes('id="'+id+'"'),'Missing form element '+id);
console.log('Contacts UX routes and form preserved.');
