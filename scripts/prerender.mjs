import fs from 'node:fs/promises';
import vm from 'node:vm';
const root="https://nt-payments.menefon.workers.dev";
const pages=[
  {
    "slug": "",
    "key": "home",
    "title": "Self-Service Payment Kiosks in UAE | NT.Payments Concept",
    "description": "Independent NT.Payments website concept showcasing UAE self-service kiosks, bill payments, mobile recharge and everyday payment journeys.",
    "topic": "Self-service payment kiosks in the UAE"
  },
  {
    "slug": "host-a-kiosk",
    "key": "host",
    "title": "Host a Payment Kiosk | NT.Payments Website Concept",
    "description": "An independent NT.Payments concept for shops, hotels, supermarkets and property owners considering a self-service payment kiosk.",
    "topic": "Hosting payment kiosks at commercial locations"
  },
  {
    "slug": "providers",
    "key": "providers",
    "title": "Payment Channels for Service Providers | NT.Payments Concept",
    "description": "Explore an independent design concept for integrating services with the NT.Payments self-service payment kiosk network.",
    "topic": "Payment services and provider partnerships"
  },
  {
    "slug": "wallet",
    "key": "wallet",
    "title": "NT.Wallet Mobile Payments | Independent Design Concept",
    "description": "Explore the NT.Wallet mobile wallet design concept, including everyday bill payments and top-ups. Confirm current functionality on official NT.Payments channels.",
    "topic": "Mobile payments and NT.Wallet concept"
  },
  {
    "slug": "contact",
    "key": "contacts",
    "title": "Contact and Business Enquiries | NT.Payments Concept",
    "description": "Find example customer support and partnership contact journeys in an independent redesign of the NT.Payments website.",
    "topic": "Contact information and business enquiries"
  },
  {
    "slug": "support",
    "key": "supportPage",
    "title": "Payment and Kiosk Support | NT.Payments Concept",
    "description": "Independent NT.Payments customer support page concept with payment guidance, transaction references and contact options.",
    "topic": "Self-service payment support"
  },
  {
    "slug": "find-a-kiosk",
    "key": "finderPage",
    "title": "Find a Payment Kiosk | NT.Payments Website Concept",
    "description": "Browse a concept kiosk-finder experience for Dubai, Jeddah and Doha. Verify current terminal locations with official NT.Payments sources.",
    "topic": "Kiosk finder and payment locations"
  }
];
const paths={"home":"/","host":"/host-a-kiosk/","providers":"/providers/","wallet":"/wallet/","contacts":"/contact/","support":"/support/","find":"/find-a-kiosk/"};
const source=await fs.readFile('src/app.js','utf8');
const init=source.indexOf("document.querySelector('.menu').onclick=");
if(init<0)throw new Error('Prerender source boundary changed');
const context={};
vm.runInNewContext(source.slice(0,init)+'\nglobalThis.seoPages={home,host,providers,wallet,contacts,supportPage,finderPage};',context,{timeout:5000});
const content=context.seoPages;
const base=(await fs.readFile('src/index.html','utf8')).replace(/<!-- SEO START -->[\s\S]*?<!-- SEO END -->\s*/g,'');
const escapeHTML=s=>String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
const rewrite=html=>html.replace(/href="#([^"]+)"/g,(whole,anchor)=>{const [key,sub]=anchor.split('/');return key==='admin'?'href="/#admin"':paths[key]?'href="'+paths[key]+(sub?'#'+key+'/'+sub:'')+'"':whole;});
for(const page of pages){
 const url=root+'/'+(page.slug?page.slug+'/':'');
 const schema={'@context':'https://schema.org','@type':'WebPage','@id':url+'#webpage',url,name:page.title,description:page.description,inLanguage:'en',about:{'@type':'Thing',name:page.topic},isPartOf:{'@type':'WebSite',name:'NT.Payments — Independent Website Concept',url:root+'/'}};
 const seo=['<!-- SEO START -->','<base href="/">','<link rel="canonical" href="'+url+'">','<meta name="robots" content="index,follow,max-image-preview:large">','<meta property="og:type" content="website">','<meta property="og:site_name" content="NT.Payments — Independent Website Concept">','<meta property="og:title" content="'+escapeHTML(page.title)+'">','<meta property="og:description" content="'+escapeHTML(page.description)+'">','<meta property="og:url" content="'+url+'">','<meta property="og:image" content="'+root+'/assets/kiosk-hero-enhanced.png">','<meta name="twitter:card" content="summary_large_image">','<script type="application/ld+json">'+JSON.stringify(schema).replace(/</g,'\\u003c')+'</script>','<!-- SEO END -->'].join('\n');
 const html=rewrite(base.replace(/<title>[\s\S]*?<\/title>/,'<title>'+escapeHTML(page.title)+'</title>')
 .replace(/<meta name="description"[^>]*>/,'<meta name="description" content="'+escapeHTML(page.description)+'">')
 .replace('</head>',seo+'</head>')
 .replace(/<main id="main" tabindex="-1">[\s\S]*?<\/main>/,'<main id="main" tabindex="-1">'+content[page.key]()+'</main>'));
 const dest='src/'+(page.slug?page.slug+'/':'')+'index.html';
 await fs.mkdir(dest.slice(0,dest.lastIndexOf('/')),{recursive:true});
 await fs.writeFile(dest,html,'utf8');
 console.log('Prerendered '+dest);
}
