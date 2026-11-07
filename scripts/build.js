import { cpSync, rmSync, writeFileSync, readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';

const VARS = [
  'FIREBASE_API_KEY', 'FIREBASE_AUTH_DOMAIN', 'FIREBASE_PROJECT_ID',
  'FIREBASE_STORAGE_BUCKET', 'FIREBASE_MESSAGING_SENDER_ID', 'FIREBASE_APP_ID'
];

// 1. Variáveis obrigatórias
const faltando = VARS.filter((v) => !process.env[v]);
if (faltando.length) {
  console.error('❌ Variáveis ausentes no .env/Secrets:', faltando.join(', '));
  process.exit(1);
}

// 2. Versão do Firebase instalada
const pkgFirebase = 'node_modules/firebase/package.json';
if (!existsSync(pkgFirebase)) {
  console.error('❌ Firebase não instalado. Rode: npm install');
  process.exit(1);
}
const { version } = JSON.parse(readFileSync(pkgFirebase, 'utf8'));

// 3. Copia src -> dist
rmSync('dist', { recursive: true, force: true });
cpSync('src', 'dist', { recursive: true });

// 4. Gera o firebase-config.js
const config = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};
writeFileSync('dist/firebase-config.js',
  `export const firebaseConfig = ${JSON.stringify(config, null, 2)};\n`);

// 5. Troca a versão e valida os imports locais (evita 404)
const distAbs = resolve('dist');
const erros = [];
for (const arq of readdirSync('dist', { recursive: true })) {
  if (!arq.endsWith('.js')) continue;
  const caminho = join('dist', arq);
  const codigo = readFileSync(caminho, 'utf8').replaceAll('__FIREBASE_VERSION__', version);
  writeFileSync(caminho, codigo);

  for (const [, imp] of codigo.matchAll(/from\s+['"]([^'"]+)['"]/g)) {
    if (imp.startsWith('http')) continue;
    if (!imp.startsWith('./') && !imp.startsWith('../')) {
      erros.push(`${arq}: "${imp}" → use caminho relativo, ex: "./utils.js"`);
      continue;
    }
    const alvo = resolve(dirname(caminho), imp);
    if (!alvo.startsWith(distAbs) || !existsSync(alvo)) {
      erros.push(`${arq}: "${imp}" não existe em dist/`);
    }
  }
}
if (erros.length) {
  console.error('❌ Imports quebrados (dariam 404):\n - ' + erros.join('\n - '));
  process.exit(1);
}

console.log(`✅ Build concluído na pasta dist/ (Firebase ${version})`);
console.log('   Arquivos:', readdirSync('dist').join(', '));