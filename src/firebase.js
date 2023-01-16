// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
import { getAuth } from "firebase/auth";
import { getFirestore } from "@firebase/firestore";
// Your web app's Firebase configuration
const firebaseConfig = {
apiKey: "AIzaSyB5InEm5zVZh2MreH7jaXwY1IQrX3kHTLY",
  authDomain: "workshop-platform-demo.firebaseapp.com",
  projectId: "workshop-platform-demo",
  storageBucket: "workshop-platform-demo.appspot.com",
  messagingSenderId: "183619818258",
  appId: "1:183619818258:web:a7fdb084821812f81619cb",
  measurementId: "G-LZD37GE0P4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
