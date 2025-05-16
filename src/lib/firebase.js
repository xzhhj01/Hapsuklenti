// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { addDoc, collection, query, orderBy, limit, getDocs, where, deleteDoc, doc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, signInAnonymously, onAuthStateChanged } from "firebase/auth";

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

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Analytics may not work in development environment
let analytics;
try {
  analytics = getAnalytics(app);
} catch (error) {
  console.log("Analytics failed to initialize:", error);
}

// Initialize Firestore and Storage
export const db = getFirestore(app);
export const storage = getStorage(app);

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

// 사진 업로드 및 photo 컬렉션에 문서 추가
export const addPhoto = async (file, tags) => {
  try {
    // 파일을 Base64로 변환하는 함수
    const toBase64 = file => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });

    // 파일을 Base64로 변환
    console.log("파일을 Base64로 변환 중...");
    const base64Image = await toBase64(file);
    console.log("Base64 변환 완료");
    
    // 현재 시간으로부터 10분 후의 만료 시간 계산
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10분
    
    // Firestore에 직접 Base64 이미지 저장
    console.log("Firestore에 저장 중...");
    const docRef = await addDoc(collection(db, "photo"), {
      imageData: base64Image,  // 이미지를 Base64로 저장
      uploadedAt: new Date(),
      expiresAt: expiresAt,    // 만료 시간 추가
      tag1: tags.tag1 || "",
      tag2: tags.tag2 || "",
      tag3: tags.tag3 || ""
    });
    console.log("Firestore에 저장 완료:", docRef.id);
    
    return {
      id: docRef.id,
      imageUrl: base64Image  // Base64 문자열 반환
    };
  } catch (error) {
    console.error("사진 업로드 중 상세 오류:", error);
    throw error;
  }
};

// 만료된 사진 삭제 함수
export const deleteExpiredPhotos = async () => {
  try {
    const now = new Date();
    const photosRef = collection(db, "photo");
    const q = query(
      photosRef,
      where("expiresAt", "<=", now)
    );
    const querySnapshot = await getDocs(q);
    
    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    
    console.log(`${deletePromises.length}개의 만료된 사진이 삭제되었습니다.`);
  } catch (error) {
    console.error("만료된 사진 삭제 중 오류 발생:", error);
  }
};

// 모든 사진 가져오기 (최신순, 만료되지 않은 것만)
export const getAllPhotos = async (limitCount = 20) => {
  try {
    // 먼저 만료된 사진 삭제
    await deleteExpiredPhotos();
    
    const photosRef = collection(db, "photo");
    const now = new Date();
    const q = query(
      photosRef,
      where("expiresAt", ">", now),  // 만료되지 않은 사진만
      orderBy("expiresAt", "desc"),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        imageUrl: data.imageData,
        tag1: data.tag1,
        tag2: data.tag2,
        tag3: data.tag3,
        uploadedAt: data.uploadedAt,
        expiresAt: data.expiresAt
      };
    });
  } catch (error) {
    console.error("사진 목록 가져오기 중 오류 발생:", error);
    throw error;
  }
};

// Authentication functions
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Google 로그인 중 오류 발생:", error);
    throw error;
  }
};

export const signInWithEmail = async (email, password) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    console.error("이메일 로그인 중 오류 발생:", error);
    throw error;
  }
};

export const signUpWithEmail = async (email, password) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    console.error("회원가입 중 오류 발생:", error);
    throw error;
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("로그아웃 중 오류 발생:", error);
    throw error;
  }
};

// Authentication functions
export const signInAnonymouslyUser = async () => {
  try {
    const result = await signInAnonymously(auth);
    return result.user;
  } catch (error) {
    console.error("익명 로그인 중 오류 발생:", error);
    throw error;
  }
};

// Auth state observer
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};