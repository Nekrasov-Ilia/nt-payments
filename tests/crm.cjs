const fs=require('fs'),vm=require('vm'),assert=require('assert');const saved={};const noop=()=>{};function boot(){const c={window:{},localStorage:{getItem:k=>saved[k],setItem:(k,v)=>saved[k]=v},document:{addEventListener:noop,getElementById:()=>null},console,Intl,Date,Math,JSON};vm.createContext(c);vm.runInContext(fs.readFileSync('src/crm.js','utf8'),c);return c.window.NTCRM}let crm=boot();crm.lead('host',{name:'Demo <script>',company:'Example Market',country:'UAE',email:'demo@example.test'});crm.lead('provider',{name:'Demo',company:'Example Provider'});crm.event('page_view','home');crm.event('form_submit','host','host');let state=JSON.parse(saved['nt-demo-crm-v1']);assert.equal(state.leads.length,2);assert.equal(state.leads[0].kind,'provider');assert.equal(state.leads[1].stage,'New');assert.equal(state.events.length,2);assert(!JSON.stringify(state.events).includes('example.test'));crm=boot();assert.equal(JSON.parse(saved['nt-demo-crm-v1']).leads.length,2);assert(crm.page().includes('crm-content'));console.log('PASS: host/provider categorisation, New stage, browser-storage reload, analytics without form payload, admin markup.');


const markup=crm.page();
assert.equal((markup.match(/data-section="analytics"/g)||[]).length,1,'Single dedicated Analytics control');
assert(markup.includes('class="crm-analytics-shortcut"'),'Dedicated analytics shortcut');
assert(markup.includes('Reports & insights'),'Analytics purpose visible');
assert(markup.includes('aria-label="Open analytics dashboard"'),'Accessible Analytics label');
const leadTabs=markup.match(/<div class="crm-tabs"[^>]*>([\s\S]*?)<\/div>/)?.[1]||'';
assert.equal((leadTabs.match(/data-section=/g)||[]).length,4,'Only audience filters appear as lead tabs');
assert(!leadTabs.includes('data-section="analytics"'),'Analytics separated from lead filters');
for(const id of ['crm-samples','crm-export','crm-content','crm-clear'])assert(markup.includes('id="'+id+'"'),'Existing CRM control missing: '+id);
console.log('PASS: first-class Analytics navigation and CRM actions retained.');
