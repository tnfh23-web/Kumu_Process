import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const html=await readFile(path.join(root,'index.html'),'utf8');
const references=new Set();
for(const match of html.matchAll(/(?:src|href)=["'](\.\/[^"']+)["']/g)) references.add(match[1]);
for(const match of html.matchAll(/url\((?:&quot;|["'])(\.\/[^"']+?)(?:&quot;|["'])\)/g)) references.add(match[1]);
const failures=[];
for(const ref of references){
  try{const s=await stat(path.join(root,ref.split(/[?#]/)[0]));if(!s.size)failures.push('empty '+ref);}
  catch{failures.push('missing '+ref);}
}
if(/https:\/\/www\.figma\.com\/api\/mcp\/asset/.test(html))failures.push('temporary Figma asset URL in runtime');
if(/className=|src=\{|maskImage:/.test(html))failures.push('unconverted JSX');
if((html.match(/<section /g)||[]).length!==12)failures.push('expected 12 process sections');
const height=[...html.matchAll(/data-height="(\d+)"/g)].reduce((sum,m)=>sum+Number(m[1]),0);
if(height!==23132)failures.push('incorrect reference height '+height);
for(const file of ['css/fonts.css','css/reset.css','css/common.css','css/layout.css','css/responsive.css','css/style.css','js/common.js','js/script.js','js/vendor/gsap.min.js','js/vendor/ScrollTrigger.min.js','js/vendor/ScrollSmoother.min.js','assets/fonts/PretendardVariable.woff2']){
  if(!(await stat(path.join(root,file))).size)failures.push('empty '+file);
}
if(failures.length){console.error(failures.join('\n'));process.exit(1);}
console.log(`PASS: 12 sections, 1920 x ${height} canvas, ${references.size} non-empty local references, no temporary asset URLs.`);
