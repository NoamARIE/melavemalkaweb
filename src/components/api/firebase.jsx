import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { getFirestore, collection, addDoc, updateDoc, deleteDoc, doc, getDoc, getDocs, query, where, orderBy } from 'firebase/firestore';

// Replace with your Firebase config
const firebaseConfig = {
  // TODO: Add your Firebase configuration here
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

export const api = {
  // Auth methods
  async login() {
    return signInWithPopup(auth, provider);
  },

  async logout() {
    return signOut(auth);
  },

  async getCurrentUser() {
    return new Promise((resolve, reject) => {
      const unsubscribe = auth.onAuthStateChanged(user => {
        unsubscribe();
        resolve(user);
      }, reject);
    });
  },

  // Generic CRUD operations
  async createDocument(collectionName, data) {
    const user = auth.currentUser;
    if (!user) throw new Error('Must be logged in');

    const finalData = {
      ...data,
      created_by: user.email,
      created_date: new Date().toISOString(),
      updated_date: new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, collectionName), finalData);
    return { id: docRef.id, ...finalData };
  },

  async updateDocument(collectionName, id, data) {
    const docRef = doc(db, collectionName, id);
    const finalData = {
      ...data,
      updated_date: new Date().toISOString()
    };
    await updateDoc(docRef, finalData);
    return { id, ...finalData };
  },

  async deleteDocument(collectionName, id) {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
  },

  async getDocument(collectionName, id) {
    const docRef = doc(db, collectionName, id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) throw new Error('Document not found');
    return { id: docSnap.id, ...docSnap.data() };
  },

  async listDocuments(collectionName, orderByField = '-created_date', limit = 100) {
    const orderDirection = orderByField.startsWith('-') ? 'desc' : 'asc';
    const field = orderByField.replace('-', '');
    
    const q = query(
      collection(db, collectionName),
      orderBy(field, orderDirection)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async filterDocuments(collectionName, filters, orderByField = '-created_date', limit = 100) {
    const orderDirection = orderByField.startsWith('-') ? 'desc' : 'asc';
    const field = orderByField.replace('-', '');
    
    const conditions = Object.entries(filters).map(([field, value]) => where(field, '==', value));
    
    const q = query(
      collection(db, collectionName),
      ...conditions,
      orderBy(field, orderDirection)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
};