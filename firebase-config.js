// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDd8xHtkFy7-6CY8B78KayvN-xJMnYrwjc",
  authDomain: "handybot-f52d9.firebaseapp.com",
  projectId: "handybot-f52d9",
  storageBucket: "handybot-f52d9.firebasestorage.app",
  messagingSenderId: "905286109828",
  appId: "1:905286109828:web:ad6a0fe8a111234e1fd0d1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Function to submit form data
async function submitFormData(formData) {
  try {
    console.log('Submitting form data to Firebase:', formData);
    const docRef = await addDoc(collection(db, "form-submissions"), {
      ...formData,
      timestamp: new Date(),
    });
    console.log("Document written with ID: ", docRef.id);
    return true;
  } catch (e) {
    console.error("Error adding document: ", e);
    return false;
  }
}

// Function to get all submissions
async function getSubmissions() {
  try {
    const submissionsRef = collection(db, "form-submissions");
    const q = query(submissionsRef, orderBy("timestamp", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (e) {
    console.error("Error getting documents: ", e);
    return [];
  }
}

// Export functions
export { submitFormData, getSubmissions };

// Also export to window for global access
window.submitFormData = submitFormData;
window.getSubmissions = getSubmissions; 