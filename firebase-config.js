// ========================================
// Firebase Configuration
// ========================================
// 
// IMPORTANT: Replace the placeholder values below with your actual Firebase project credentials.
// 
// To get your Firebase configuration:
// 1. Go to https://console.firebase.google.com/
// 2. Create a new project or select an existing one
// 3. Go to Project Settings (gear icon)
// 4. Scroll down to "Your apps" section
// 5. Click on the web icon (</>)
// 6. Copy the configuration object
// 7. Paste it below, replacing the placeholder values
//
// ========================================

const firebaseConfig = {
    apiKey: "AIzaSyBH35eAN5vEtCAVf6PgBdf_4FyZqfEBwYQ",
    authDomain: "nook-ec4c9.firebaseapp.com",
    projectId: "nook-ec4c9",
    storageBucket: "nook-ec4c9.firebasestorage.app",
    messagingSenderId: "532107553382",
    appId: "1:532107553382:web:ee57cdc5e4a1fea3689ba7",
    measurementId: "G-KGSK8DD8X8"
};

// Initialize Firebase
let app, auth, db;

try {
    app = window.firebaseApp.initializeApp(firebaseConfig);
    auth = window.firebaseApp.getAuth(app);
    db = window.firebaseApp.getFirestore(app);
    
    // Make Firebase instances available globally
    window.firebaseAuth = auth;
    window.firebaseDb = db;
    
    console.log('Firebase initialized successfully');
} catch (error) {
    console.error('Error initializing Firebase:', error);
    alert('Error initializing Firebase. Please check your configuration in firebase-config.js');
}
