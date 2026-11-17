import { mkdir, copyFile } from 'node:fs/promises';
await mkdir('public/draco', { recursive: true });
for (const name of ['draco_wasm_wrapper.js','draco_decoder.wasm','draco_decoder.js']) await copyFile(`node_modules/three/examples/jsm/libs/draco/gltf/${name}`,`public/draco/${name}`);
console.log('Copied self-hosted Draco decoders from the installed Three.js package.');
