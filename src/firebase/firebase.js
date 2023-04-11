// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAsHuB7tHiIvDTpIIZwQBJ9Q_-Eh9oRezU",
  authDomain: "mern-stack-crud.firebaseapp.com",
  projectId: "mern-stack-crud",
  storageBucket: "mern-stack-crud.appspot.com",
  messagingSenderId: "178669683940",
  appId: "1:178669683940:web:9bdf34c722642946ed98f1"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);