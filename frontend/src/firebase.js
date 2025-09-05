// Import only the functions you need from the SDKs
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAXMN8IJPW5PXPPEeaD5RghA5GHgyPp70Y", // It's best practice to use environment variables for this
  authDomain: "todolist-ea0ba.firebaseapp.com",
  projectId: "todolist-ea0ba",
  storageBucket: "todolist-ea0ba.appspot.com", // Corrected storage bucket domain
  messagingSenderId: "1019470398952",
  appId: "1:101947-web:94b9a6d5e3754408bb905d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export only the Firebase Authentication service
export const auth = getAuth(app);