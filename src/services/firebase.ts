import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCCDq-rvjw_o3APjQRT4EfWRWDFdUgu26Y",
  authDomain: "sanctabiblia.firebaseapp.com",
  projectId: "sanctabiblia",
  storageBucket: "sanctabiblia.appspot.com",
  messagingSenderId: "695688083334",
  appId: "1:695688083334:web:3a030b5ade0c8af0061e07"
};

let app: any = null;
let auth: any = null;
let db: any = null;

try {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (e) {
  console.warn('Firebase init warning:', e);
}

export {
  auth,
  db,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  doc,
  setDoc,
  getDoc
};
export type { User };
