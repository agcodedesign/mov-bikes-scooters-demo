import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { readdir } from 'node:fs/promises';
import { promisify } from 'node:util';
import { execFile } from 'node:child_process';
const run=promisify(execFile);
const source='D:/AG-DESIGN/AG_OPERACOES/01_CLIENTES/BIKECELL/ASSETS';
const target='public/images/products/n7';
await mkdir(target,{recursive:true});
const names=await readdir(source);
const files=[['SY_N7_electric_scooter_displayed','geral'],['SY_N7_Electric_scooter_handlebar','painel'],['SY_N7_Electric_scooter_headlight','farol'],['SY_N7_electric_scooter_rear','traseira']];
for(const [prefix,name] of files){const file=names.find(value=>value.startsWith(prefix)&&value.endsWith('2K.jpg'));if(!file)throw new Error(`Asset not found: ${prefix}`);const input=`${source}/${file}`;await sharp(input).rotate().resize({width:2000,height:2000,fit:'inside',withoutEnlargement:true}).webp({quality:88,effort:6}).toFile(`${target}/${name}.webp`);for(const width of [640,960,1280,1920])await sharp(input).rotate().resize({width,withoutEnlargement:true}).webp({quality:84,effort:6}).toFile(`${target}/${name}-${width}.webp`);}
await run('ffmpeg',['-y','-i','public/movies/n7scrollcamera.mp4','-an','-vf',"fps=24,scale='min(1280,iw)':-2:flags=lanczos",'-c:v','libx264','-preset','fast','-crf','23','-g','1','-keyint_min','1','-sc_threshold','0','-bf','0','-pix_fmt','yuv420p','-movflags','+faststart','public/movies/n7-scrub.mp4']);
console.log('Prepared four N7 WebP images with responsive sizes and a frame-seekable 24 fps film.');
