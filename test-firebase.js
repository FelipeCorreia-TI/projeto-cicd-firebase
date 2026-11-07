import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

try {
  const cred = await signInWithEmailAndPassword(
    auth, process.env.TEST_USER_EMAIL, process.env.TEST_USER_PASSWORD);
  console.log('✅ Usuário autenticado:', cred.user.uid);

  const ref = doc(db, 'users', cred.user.uid);
  await setDoc(ref, { name: 'Test User', email: cred.user.email, testadoEm: new Date().toISOString() });
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error('Documento não encontrado');
  console.log('✅ Dados gravados e lidos no Firestore');
  process.exit(0);
} catch (error) {
  console.error('❌ Erro:', error.code || error.message);
  process.exit(1); // faz o pipeline FALHAR
}