import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCsae-OZZR8ADha7pcDj7dc_nECPRT-sY7k",
  authDomain: "melavemalkaweb.firebaseapp.com",
  projectId: "melavemalkaweb",
  storageBucket: "melavemalkaweb.appspot.com",
  messagingSenderId: "886800178570",
  appId: "1:886800178570:web:64710c593409f701cfbc73",
  measurementId: "G-KFTMQWB9RE"
};

// אתחול Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider(); // הוספת Google Sign-In
const storage = getStorage(app); // הוספת Firebase Storage

export { app, db, auth, provider, storage };
