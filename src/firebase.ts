import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyCFPfg1_skvhleq9m6csun2ZVQAmZvnv9Q",
    authDomain: "college-inventory-d54a2.firebaseapp.com",
    projectId: "college-inventory-d54a2",
    storageBucket: "college-inventory-d54a2.firebasestorage.app",
    messagingSenderId: "28118401786",
    appId: "1:28118401786:web:8bfb9a7dd0953756d4ff43",
    measurementId: "G-EMR8KJ9F9W"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export default app;
