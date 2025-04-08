// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore} from 'firebase/firestore'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "quick-collab-be412.firebaseapp.com",
  projectId: "quick-collab-be412",
  storageBucket: "quick-collab-be412.firebasestorage.app",
  messagingSenderId: "718886619053",
  appId: "1:718886619053:web:f6d6203e3f08958f91c324",
  measurementId: "G-0L9FGQ4RZT"
  };
  

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db=getFirestore(app)


// import { initializeApp } from "firebase/app";
// import { getFirestore} from 'firebase/firestore'
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// // For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
//   authDomain: "tubeguruji-startups.firebaseapp.com",
//   projectId: "tubeguruji-startups",
//   storageBucket: "tubeguruji-startups.appspot.com",
//   messagingSenderId: "706430327770",
//   appId: "1:706430327770:web:83ddab49ff4f90a8ad3ee3",
//   measurementId: "G-GWL86FD0LD"
// };

// // Initialize Firebase
// export const app = initializeApp(firebaseConfig);
// export const db=getFirestore(app)