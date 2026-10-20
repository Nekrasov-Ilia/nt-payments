/** NT.Payments interview demo. Append-only webhook; never returns lead records. */
const SPREADSHEET_ID = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
const TARGETS = {host:'Hosts',provider:'Providers',contact:'General enquiries'};
function json_(data) {return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);}
function doGet() {return json_({ok:true,service:'NT.Payments demo lead receiver',readAccess:false});}
function setup() {const book=SpreadsheetApp.openById(SPREADSHEET_ID);Object.values(TARGETS).forEach(name=>{if(!book.getSheetByName(name))throw new Error('Missing sheet: '+name);}); console.log('Ready. Deploy as Web app, execute as yourself, access Anyone. The sheet remains private.');}
function text_(v,max) {if(typeof v!=='string'||v.length>max)throw new Error('Invalid field');return v.trim();}
function safe_(s) {return /^[=+\-@\t\r]/.test(s)?"'"+s:s;}
function doPost(e) {
 const lock=LockService.getScriptLock();
 try {
  if(!e||!e.postData||e.postData.contents.length>16000)return json_({ok:false,error:'Invalid request'});
  const payload=JSON.parse(e.postData.contents);
  if(payload.website)return json_({ok:false,error:'Invalid request'});
  const kind=payload.kind,id=text_(payload.requestId,80),d=payload.data;
  if(!TARGETS[kind]||!/^web-[a-z0-9-]{12,70}$/i.test(id)||!d||typeof d!=='object')return json_({ok:false,error:'Invalid request'});
  const fields=['name','company','email','phone','contact','country','emirate','city','venue','category','question'];
  const clean={};fields.forEach(k=>clean[k]=text_(d[k]||'',k==='question'?2000:150));
  if(!clean.name||(kind!=='contact'&&!clean.company))return json_({ok:false,error:'Required fields missing'});
  if(kind==='host'&&(!clean.contact||!['UAE','KSA','Qatar'].includes(clean.country)||!clean.venue||!clean.emirate))return json_({ok:false,error:'Hosting details missing'});
  if(kind!=='host'&&(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean.email)||!clean.question))return json_({ok:false,error:'Email and message required'});
  if(kind==='provider'&&(!clean.country||!clean.category))return json_({ok:false,error:'Service details missing'});
  if(!lock.tryLock(10000))return json_({ok:false,error:'Busy. Please retry with the same request ID.'});
  const sh=SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(TARGETS[kind]);
  if(!sh)throw new Error('Target missing');
  const last=sh.getLastRow();
  if(last>=5&&sh.getRange(5,1,last-4,1).createTextFinder(id).matchEntireCell(true).findNext())return json_({ok:true,id,duplicate:true});
  const props=PropertiesService.getScriptProperties(),day=Utilities.formatDate(new Date(),'Asia/Dubai','yyyy-MM-dd'),quota=JSON.parse(props.getProperty('dailyQuota')||'{}');
  const count=quota.day===day?Number(quota.count)||0:0;
  if(count>=100)return json_({ok:false,error:'Daily demo limit reached'});
  const note='Interview demo website submission. '+clean.question+(clean.phone?' | Phone: '+clean.phone:'');
  const row=[id,new Date(),clean.company,clean.name,clean.email||clean.contact,clean.country,clean.emirate||clean.city,clean.venue||clean.category||(kind==='contact'?'General enquiry':''),'New','', 'Review new enquiry','',note];
  sh.getRange(last+1,1,1,13).setValues([row.map(v=>typeof v==='string'?safe_(v):v)]);
  sh.getRange(last+1,2).setNumberFormat('dd mmm yyyy');SpreadsheetApp.flush();
  props.setProperty('dailyQuota',JSON.stringify({day,count:count+1}));
  return json_({ok:true,id});
 }catch(error){return json_({ok:false,error:'Could not save this enquiry. Check the receiver configuration.'});}
 finally {if(lock.hasLock())lock.releaseLock();}
}
