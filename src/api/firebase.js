import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCsae-OZZR8ADha7pcDj7dc_nECPRT-sY7k",
  authDomain: "melavemalkaweb.firebaseapp.com",
  projectId: "melavemalkaweb",
  storageBucket: "melavemalkaweb.appspot.com",
  messagingSenderId: "886800178570",
  appId: "1:886800178570:web:64710c593409f701cfbc73",
  measurementId: "G-KFTMQWB9RE"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
