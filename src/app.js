import { initializeApp } from 'https://www.gstatic.com/firebasejs/__FIREBASE_VERSION__/firebase-app.js';
import { getAuth, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/__FIREBASE_VERSION__/firebase-auth.js';
import { getFirestore, doc, setDoc } from 'https://www.gstatic.com/firebasejs/__FIREBASE_VERSION__/firebase-firestore.js';
import { firebaseConfig } from './firebase-config.js';
import { validarEmail, validarSenha } from './utils.js';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const msg = document.getElementById('mensagem');

// Função de login
async function login(email, senha) {
  if (!validarEmail(email) || !validarSenha(senha)) {
    msg.textContent = 'E-mail ou senha inválidos.';
    return;
  }
  try {
    const cred = await signInWithEmailAndPassword(auth, email, senha);
    await addUserData(cred.user.uid, { email, ultimoLogin: new Date().toISOString() });
    msg.textContent = 'Usuário autenticado e dados salvos no Firestore!';
  } catch (error) {
    msg.textContent = 'Erro: ' + (error.code || error.message);
  }
}

// Função para adicionar dados no Firestore
async function addUserData(userId, userData) {
  await setDoc(doc(db, 'users', userId), userData);
}

document.getElementById('btnLogin').addEventListener('click', () => {
  login(document.getElementById('email').value.trim(), document.getElementById('senha').value);
});