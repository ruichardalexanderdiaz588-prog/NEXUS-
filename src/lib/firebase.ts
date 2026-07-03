
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCwjeLijCB4-HfFbJjHrpfocJ5mn39pat0",
  authDomain: "nexusapp-c0a21.firebaseapp.com",
  databaseURL: "https://nexusapp-c0a21-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "nexusapp-c0a21",
  storageBucket: "nexusapp-c0a21.firebasestorage.app",
  messagingSenderId: "487113661451",
  appId: "1:487113661451:web:1774402530bfd189c6fb0e",
  measurementId: "G-TQ7GDCG5QX"
};

const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, db, googleProvider };
