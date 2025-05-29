// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA_F9V6R9Uas-R-QYcZF-JInP5ZC7pWwsg",
  authDomain: "traffic-a2a81.firebaseapp.com",
  projectId: "traffic-a2a81",
  storageBucket: "traffic-a2a81.firebasestorage.app",
  messagingSenderId: "215775587789",
  appId: "1:215775587789:web:58d8b50a48036cb352e884",
  measurementId: "G-YEB54PV3Y4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

export { app, analytics, db };