import {mkdir,cp,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const root=new URL('../',import.meta.url);
await mkdir(new URL('docs/',root),{recursive:true});
await cp(new URL('dist/',root),new URL('docs/',root),{recursive:true});
await writeFile(new URL('docs/.nojekyll',root),'');
console.log(`GitHub Pages files ready: ${fileURLToPath(new URL('docs/',root))}`);
