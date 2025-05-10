// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { addDoc, collection } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};  

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const db = getFirestore(app);
// Firestore에 새 게시글 추가
export const addPost = async (title,
    mygender,
    targetGender,
    place,
    content,
    contact,
    password) => {
    try {
      const docRef = await addDoc(collection(db, "writing"), {
        title,
        mygender,
        targetGender,
        place,
        content,
        contact,
        password,
        createdAt: new Date(),
      });
      return docRef.id;
    } catch (error) {
      console.error("Firestore에 게시글 추가 중 오류 발생:", error);
    }
  };

  export const addPostToMessage = async (text,userId) => {
    let storedUserId = localStorage.getItem('chatUserId');
if (!storedUserId) {
  storedUserId = Date.now().toString();      // 또는 UUID 라이브러리 사용
  localStorage.setItem('chatUserId', storedUserId);
}
    try {
      const docRef = await addDoc(collection(db, "message"), {
        text,
        userId: userId || storedUserId, // Use storedUserId if userId is undefined
        createdAt: new Date(),
        
      });
      return docRef.id;
    } catch (error) {
      console.error("Firestore에 게시글 추가 중 오류 발생:", error);
    }
  };