// ========================================
// Nook - Main Application Script
// ========================================

// Wait for Firebase to be available
document.addEventListener('DOMContentLoaded', () => {
    // Check if Firebase is initialized
    if (!window.firebaseAuth || !window.firebaseDb) {
        console.error('Firebase not initialized. Please check firebase-config.js');
        showError('Firebase configuration error. Please check the console for details.');
        return;
    }

    // Initialize the app
    initializeApp();
});

// Global state
let currentUser = null;
let userData = null;

// ========================================
// App Initialization
// ========================================
function initializeApp() {
    const auth = window.firebaseAuth;
    
    // Listen for authentication state changes
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            // User is signed in
            currentUser = user;
            
            // Get or create user document in Firestore
            userData = await getUserData(user.uid);
            
            if (!userData) {
                // Create new user document
                userData = await createUserData(user);
            } else {
                // Update last login
                await updateLastLogin(user.uid);
            }
            
            // Show main app
            showApp();
        } else {
            // User is signed out
            currentUser = null;
            userData = null;
            
            // Show login screen
            showLogin();
        }
        
        // Hide loading screen
        hideLoading();
    });
    
    // Setup event listeners
    setupEventListeners();
}

// ========================================
// User Data Functions
// ========================================
async function getUserData(uid) {
    try {
        const db = window.firebaseDb;
        const userDoc = await window.firebaseApp.getDoc(window.firebaseApp.doc(db, 'users', uid));
        
        if (userDoc.exists()) {
            return userDoc.data();
        }
        return null;
    } catch (error) {
        console.error('Error getting user data:', error);
        return null;
    }
}

async function createUserData(user) {
    try {
        const db = window.firebaseDb;
        const loginMethod = user.isAnonymous ? 'guest' : 'google';
        const role = user.isAnonymous ? 'guest' : 'user';
        
        const userData = {
            uid: user.uid,
            displayName: user.displayName || (user.isAnonymous ? 'Guest' : 'User'),
            email: user.email || null,
            photoURL: user.photoURL || null,
            loginMethod: loginMethod,
            role: role,
            bio: '',
            location: '',
            website: '',
            createdAt: window.firebaseApp.serverTimestamp(),
            lastLogin: window.firebaseApp.serverTimestamp()
        };
        
        await window.firebaseApp.setDoc(window.firebaseApp.doc(db, 'users', user.uid), userData);
        return userData;
    } catch (error) {
        console.error('Error creating user data:', error);
        return null;
    }
}

async function updateLastLogin(uid) {
    try {
        const db = window.firebaseDb;
        await window.firebaseApp.setDoc(
            window.firebaseApp.doc(db, 'users', uid),
            { lastLogin: window.firebaseApp.serverTimestamp() },
            { merge: true }
        );
    } catch (error) {
        console.error('Error updating last login:', error);
    }
}

// ========================================
// UI Functions
// ========================================
function showLoading() {
    document.getElementById('loading-screen').classList.remove('hidden');
}

function hideLoading() {
    document.getElementById('loading-screen').classList.add('hidden');
}

function showLogin() {
    document.getElementById('login-screen').classList.remove('hidden');
    document.getElementById('app-container').classList.add('hidden');
}

function showApp() {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('app-container').classList.remove('hidden');
    
    // Update user info in sidebar
    updateUserInfo();
    
    // Load forum page by default
    navigateTo('forum');
}

function updateUserInfo() {
    if (!userData) return;
    
    const userAvatar = document.getElementById('user-avatar');
    const userName = document.getElementById('user-name');
    const userRole = document.getElementById('user-role');
    
    // Set avatar
    if (userData.photoURL) {
        userAvatar.innerHTML = `<img src="${userData.photoURL}" alt="${userData.displayName}">`;
    } else {
        userAvatar.textContent = userData.displayName.charAt(0).toUpperCase();
    }
    
    // Set name
    userName.textContent = userData.displayName;
    
    // Set role
    userRole.textContent = userData.role;
}

function showError(message, elementId = 'login-error') {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.remove('hidden');
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            errorElement.classList.add('hidden');
        }, 5000);
    }
}

// ========================================
// Navigation Functions
// ========================================
function navigateTo(page) {
    console.log('Navigating to:', page);
    
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show selected page
    const targetPage = document.getElementById(`${page}-page`);
    if (targetPage) {
        targetPage.classList.add('active');
        console.log('Page activated:', page);
    } else {
        console.error('Page not found:', page);
    }
    
    // Update nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.page === page) {
            item.classList.add('active');
        }
    });
    
    // Update URL (optional)
    if (window.history && window.history.pushState) {
        window.history.pushState({ page }, '', `/${page}`);
    }
    
    // Load page-specific content
    if (page === 'forum') {
        loadSuggestions();
    } else if (page === 'archive') {
        loadArchive();
    } else if (page === 'profile') {
        console.log('Calling loadProfile');
        loadProfile();
    }
    
    // Close mobile menu if open
    document.getElementById('sidebar').classList.remove('active');
}

// ========================================
// Event Listeners
// ========================================
function setupEventListeners() {
    // Google login button
    document.getElementById('google-login-btn').addEventListener('click', handleGoogleLogin);
    
    // Guest login button
    document.getElementById('guest-login-btn').addEventListener('click', handleGuestLogin);
    
    // Logout button
    document.getElementById('logout-btn').addEventListener('click', handleLogout);
    
    // Navigation items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            const page = item.dataset.page;
            navigateTo(page);
        });
    });
    
    // Mobile menu button
    document.getElementById('mobile-menu-btn').addEventListener('click', toggleMobileMenu);
    
    // Create suggestion button
    document.getElementById('create-suggestion-btn').addEventListener('click', showSuggestionForm);
    
    // Cancel suggestion button
    document.getElementById('cancel-suggestion-btn').addEventListener('click', hideSuggestionForm);
    
    // Submit suggestion button
    document.getElementById('submit-suggestion-btn').addEventListener('click', handleSubmitSuggestion);
    
    // Profile page event listeners
    document.getElementById('edit-profile-btn').addEventListener('click', showProfileEdit);
    document.getElementById('save-profile-btn').addEventListener('click', handleSaveProfile);
    document.getElementById('cancel-edit-btn').addEventListener('click', hideProfileEdit);
    document.getElementById('sidebar-user-info').addEventListener('click', () => navigateTo('profile'));
    document.getElementById('back-to-forum-btn').addEventListener('click', () => navigateTo('forum'));
    
    // Comment event listeners (delegated)
    document.addEventListener('click', (e) => {
        if (e.target.closest('.comment-toggle-btn')) {
            const btn = e.target.closest('.comment-toggle-btn');
            const suggestionId = btn.dataset.suggestionId;
            toggleComments(suggestionId, btn);
        }
        
        if (e.target.closest('.submit-comment-btn')) {
            const btn = e.target.closest('.submit-comment-btn');
            const suggestionId = btn.dataset.suggestionId;
            handleSubmitComment(suggestionId);
        }
        
        if (e.target.closest('.suggestion-author')) {
            const authorEl = e.target.closest('.suggestion-author');
            const userId = authorEl.dataset.userId;
            if (userId) {
                viewUserProfile(userId);
            }
        }
        
        if (e.target.closest('.comment-author')) {
            const authorEl = e.target.closest('.comment-author');
            const userId = authorEl.dataset.userId;
            if (userId) {
                viewUserProfile(userId);
            }
        }
    });
    
    // Handle browser back/forward
    window.addEventListener('popstate', (event) => {
        if (event.state && event.state.page) {
            navigateTo(event.state.page);
        }
    });
}

function toggleMobileMenu() {
    document.getElementById('sidebar').classList.toggle('active');
}

// ========================================
// Authentication Functions
// ========================================
async function handleGoogleLogin() {
    try {
        const auth = window.firebaseAuth;
        const provider = new window.firebaseApp.GoogleAuthProvider();
        
        const result = await window.firebaseApp.signInWithPopup(auth, provider);
        console.log('Google login successful:', result.user);
    } catch (error) {
        console.error('Google login error:', error);
        let errorMessage = 'Failed to sign in with Google. Please try again.';
        
        if (error.code === 'auth/popup-closed-by-user') {
            errorMessage = 'Sign-in was cancelled. Please try again.';
        } else if (error.code === 'auth/popup-blocked') {
            errorMessage = 'Sign-in popup was blocked. Please allow popups and try again.';
        }
        
        showError(errorMessage);
    }
}

async function handleGuestLogin() {
    try {
        const auth = window.firebaseAuth;
        const result = await window.firebaseApp.signInAnonymously(auth);
        console.log('Guest login successful:', result.user);
    } catch (error) {
        console.error('Guest login error:', error);
        let errorMessage = 'Failed to sign in as guest. Please try again.';
        
        if (error.code === 'auth/operation-not-allowed') {
            errorMessage = 'Guest accounts are not enabled. Please contact the administrator.';
        }
        
        showError(errorMessage);
    }
}

async function handleLogout() {
    try {
        const auth = window.firebaseAuth;
        await window.firebaseApp.signOut(auth);
        console.log('Logout successful');
        
        // Clear UI state
        document.getElementById('suggestion-form').classList.add('hidden');
        document.getElementById('suggestions-list').innerHTML = '<div class="loading-state">Loading suggestions...</div>';
    } catch (error) {
        console.error('Logout error:', error);
        showError('Failed to sign out. Please try again.');
    }
}

// ========================================
// Forum Functions
// ========================================
function showSuggestionForm() {
    // Check if user has permission to create suggestions
    if (!canCreateSuggestions()) {
        showError('You do not have permission to create suggestions.');
        return;
    }
    
    document.getElementById('suggestion-form').classList.remove('hidden');
    document.getElementById('create-suggestion-btn').classList.add('hidden');
}

function hideSuggestionForm() {
    document.getElementById('suggestion-form').classList.add('hidden');
    document.getElementById('create-suggestion-btn').classList.remove('hidden');
    
    // Clear form
    document.getElementById('suggestion-title').value = '';
    document.getElementById('suggestion-description').value = '';
    document.getElementById('suggestion-category').value = '';
    document.getElementById('suggestion-error').classList.add('hidden');
}

function canCreateSuggestions() {
    if (!userData) return false;
    
    // All authenticated users (including guests) can create suggestions
    return true;
}

async function handleSubmitSuggestion() {
    const title = document.getElementById('suggestion-title').value.trim();
    const description = document.getElementById('suggestion-description').value.trim();
    const category = document.getElementById('suggestion-category').value;
    
    // Validation
    if (!title || !description) {
        showError('Please fill in all required fields.', 'suggestion-error');
        return;
    }
    
    try {
        const db = window.firebaseDb;
        
        const suggestionData = {
            title: title,
            description: description,
            authorId: currentUser.uid,
            authorName: userData.displayName,
            category: category || null,
            status: 'pending',
            createdAt: window.firebaseApp.serverTimestamp()
        };
        
        await window.firebaseApp.addDoc(window.firebaseApp.collection(db, 'suggestions'), suggestionData);
        
        console.log('Suggestion created successfully');
        
        // Hide form and reload suggestions
        hideSuggestionForm();
        loadSuggestions();
    } catch (error) {
        console.error('Error creating suggestion:', error);
        showError('Failed to create suggestion. Please try again.', 'suggestion-error');
    }
}

async function loadSuggestions() {
    const suggestionsList = document.getElementById('suggestions-list');
    suggestionsList.innerHTML = '<div class="loading-state">Loading suggestions...</div>';
    
    try {
        const db = window.firebaseDb;
        const suggestionsQuery = window.firebaseApp.query(
            window.firebaseApp.collection(db, 'suggestions'),
            window.firebaseApp.orderBy('createdAt', 'desc')
        );
        
        const querySnapshot = await window.firebaseApp.getDocs(suggestionsQuery);
        
        if (querySnapshot.empty) {
            suggestionsList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">💬</div>
                    <h3>No suggestions yet</h3>
                    <p>Be the first to share your ideas!</p>
                </div>
            `;
            return;
        }
        
        suggestionsList.innerHTML = '';
        
        querySnapshot.forEach((doc) => {
            const suggestion = doc.data();
            const suggestionCard = createSuggestionCard(suggestion, doc.id);
            suggestionsList.appendChild(suggestionCard);
        });
    } catch (error) {
        console.error('Error loading suggestions:', error);
        suggestionsList.innerHTML = `
            <div class="error-message">
                Failed to load suggestions. Please refresh the page.
            </div>
        `;
    }
}

function createSuggestionCard(suggestion, id) {
    const card = document.createElement('div');
    card.className = 'suggestion-card';
    
    const date = suggestion.createdAt ? 
        new Date(suggestion.createdAt.toDate()).toLocaleDateString() : 
        'Unknown date';
    
    const categoryHtml = suggestion.category ? 
        `<span class="suggestion-category">${suggestion.category}</span>` : '';
    
    card.innerHTML = `
        <div class="suggestion-header">
            <h3 class="suggestion-title">${escapeHtml(suggestion.title)}</h3>
            <span class="suggestion-status status-${suggestion.status}">${suggestion.status}</span>
        </div>
        <p class="suggestion-description">${escapeHtml(suggestion.description)}</p>
        <div class="suggestion-meta">
            <div class="suggestion-author" data-user-id="${suggestion.authorId}">
                <span>👤</span>
                <span>${escapeHtml(suggestion.authorName)}</span>
                ${categoryHtml}
            </div>
            <span class="suggestion-date">${date}</span>
        </div>
        <div class="suggestion-comments">
            <button class="comment-toggle-btn" data-suggestion-id="${id}">
                <span>💬</span> Show Comments
            </button>
            <div class="comments-section hidden" data-suggestion-id="${id}">
                <div class="comments-list" data-suggestion-id="${id}"></div>
                <div class="comment-form" data-suggestion-id="${id}">
                    <textarea class="comment-input" placeholder="Write a comment..." data-suggestion-id="${id}"></textarea>
                    <button class="submit-comment-btn primary-btn" data-suggestion-id="${id}">Post Comment</button>
                </div>
            </div>
        </div>
    `;
    
    return card;
}

// ========================================
// Archive Functions
// ========================================
async function loadArchive() {
    const archiveContent = document.getElementById('archive-content');
    
    try {
        const db = window.firebaseDb;
        const archiveQuery = window.firebaseApp.query(
            window.firebaseApp.collection(db, 'archive'),
            window.firebaseApp.orderBy('createdAt', 'desc')
        );
        
        const querySnapshot = await window.firebaseApp.getDocs(archiveQuery);
        
        if (querySnapshot.empty) {
            archiveContent.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📦</div>
                    <h3>The archive is currently empty.</h3>
                    <p>Archive entries will appear here when added by administrators.</p>
                </div>
            `;
            return;
        }
        
        archiveContent.innerHTML = '';
        
        querySnapshot.forEach((doc) => {
            const archiveEntry = doc.data();
            const entryCard = createArchiveCard(archiveEntry);
            archiveContent.appendChild(entryCard);
        });
    } catch (error) {
        console.error('Error loading archive:', error);
        archiveContent.innerHTML = `
            <div class="error-message">
                Failed to load archive. Please refresh the page.
            </div>
        `;
    }
}

function createArchiveCard(entry) {
    const card = document.createElement('div');
    card.className = 'suggestion-card';
    
    const date = entry.createdAt ? 
        new Date(entry.createdAt.toDate()).toLocaleDateString() : 
        'Unknown date';
    
    card.innerHTML = `
        <div class="suggestion-header">
            <h3 class="suggestion-title">${escapeHtml(entry.title)}</h3>
        </div>
        <p class="suggestion-description">${escapeHtml(entry.description)}</p>
        ${entry.content ? `<p class="suggestion-description">${escapeHtml(entry.content)}</p>` : ''}
        <div class="suggestion-meta">
            <div class="suggestion-author">
                <span>👤</span>
                <span>${escapeHtml(entry.authorName || 'Admin')}</span>
            </div>
            <span class="suggestion-date">${date}</span>
        </div>
    `;
    
    return card;
}

// ========================================
// Utility Functions
// ========================================
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ========================================
// Profile Functions
// ========================================
function loadProfile() {
    if (!userData) return;
    
    console.log('Loading profile for user:', userData);
    
    // Update profile view
    const profileAvatar = document.getElementById('profile-avatar');
    const profileName = document.getElementById('profile-name');
    const profileRole = document.getElementById('profile-role');
    const profileEmail = document.getElementById('profile-email');
    const profileBio = document.getElementById('profile-bio');
    const profileLocation = document.getElementById('profile-location');
    const profileWebsite = document.getElementById('profile-website');
    const profileJoined = document.getElementById('profile-joined');
    
    if (!profileAvatar || !profileName) {
        console.error('Profile elements not found');
        return;
    }
    
    // Set avatar
    if (userData.photoURL) {
        profileAvatar.innerHTML = `<img src="${userData.photoURL}" alt="${userData.displayName}">`;
    } else {
        profileAvatar.textContent = userData.displayName ? userData.displayName.charAt(0).toUpperCase() : '?';
    }
    
    // Set info
    profileName.textContent = userData.displayName || 'Unknown';
    profileRole.textContent = userData.role || 'user';
    profileEmail.textContent = userData.email || 'No email';
    profileBio.textContent = userData.bio || 'No bio yet';
    profileLocation.textContent = userData.location || 'No location set';
    profileWebsite.textContent = userData.website || 'No website';
    
    // Set joined date
    if (userData.createdAt) {
        profileJoined.textContent = new Date(userData.createdAt.toDate()).toLocaleDateString();
    } else {
        profileJoined.textContent = 'Unknown';
    }
    
    console.log('Profile loaded successfully');
}

function showProfileEdit() {
    document.getElementById('profile-view').classList.add('hidden');
    document.getElementById('profile-edit').classList.remove('hidden');
    
    // Pre-fill form with current data
    document.getElementById('edit-display-name').value = userData.displayName || '';
    document.getElementById('edit-bio').value = userData.bio || '';
    document.getElementById('edit-location').value = userData.location || '';
    document.getElementById('edit-website').value = userData.website || '';
}

function hideProfileEdit() {
    document.getElementById('profile-edit').classList.add('hidden');
    document.getElementById('profile-view').classList.remove('hidden');
    document.getElementById('profile-error').classList.add('hidden');
}

async function handleSaveProfile() {
    const displayName = document.getElementById('edit-display-name').value.trim();
    const bio = document.getElementById('edit-bio').value.trim();
    const location = document.getElementById('edit-location').value.trim();
    const website = document.getElementById('edit-website').value.trim();
    
    if (!displayName) {
        showError('Display name is required', 'profile-error');
        return;
    }
    
    try {
        const db = window.firebaseDb;
        
        await window.firebaseApp.setDoc(
            window.firebaseApp.doc(db, 'users', currentUser.uid),
            {
                displayName: displayName,
                bio: bio,
                location: location,
                website: website
            },
            { merge: true }
        );
        
        // Update local user data
        userData.displayName = displayName;
        userData.bio = bio;
        userData.location = location;
        userData.website = website;
        
        // Update UI
        updateUserInfo();
        loadProfile();
        hideProfileEdit();
        
        console.log('Profile updated successfully');
    } catch (error) {
        console.error('Error updating profile:', error);
        showError('Failed to update profile. Please try again.', 'profile-error');
    }
}

async function viewUserProfile(userId) {
    try {
        const db = window.firebaseDb;
        const userDoc = await window.firebaseApp.getDoc(window.firebaseApp.doc(db, 'users', userId));
        
        if (!userDoc.exists()) {
            showError('User not found');
            return;
        }
        
        const userProfile = userDoc.data();
        
        // Update user profile view
        const profileAvatar = document.getElementById('user-profile-avatar');
        const profileName = document.getElementById('user-profile-name');
        const profileRole = document.getElementById('user-profile-role');
        const profileBio = document.getElementById('user-profile-bio');
        const profileLocation = document.getElementById('user-profile-location');
        const profileWebsite = document.getElementById('user-profile-website');
        const profileJoined = document.getElementById('user-profile-joined');
        
        // Set avatar
        if (userProfile.photoURL) {
            profileAvatar.innerHTML = `<img src="${userProfile.photoURL}" alt="${userProfile.displayName}">`;
        } else {
            profileAvatar.textContent = userProfile.displayName.charAt(0).toUpperCase();
        }
        
        // Set info
        profileName.textContent = userProfile.displayName;
        profileRole.textContent = userProfile.role;
        profileBio.textContent = userProfile.bio || 'No bio';
        profileLocation.textContent = userProfile.location || 'No location';
        profileWebsite.textContent = userProfile.website || 'No website';
        
        // Set joined date
        if (userProfile.createdAt) {
            profileJoined.textContent = new Date(userProfile.createdAt.toDate()).toLocaleDateString();
        } else {
            profileJoined.textContent = 'Unknown';
        }
        
        // Navigate to user profile page
        navigateTo('user-profile');
    } catch (error) {
        console.error('Error loading user profile:', error);
        showError('Failed to load user profile');
    }
}

// ========================================
// Comment Functions
// ========================================
async function toggleComments(suggestionId, btn) {
    const commentsSection = document.querySelector(`.comments-section[data-suggestion-id="${suggestionId}"]`);
    
    if (commentsSection.classList.contains('hidden')) {
        commentsSection.classList.remove('hidden');
        btn.innerHTML = '<span>💬</span> Hide Comments';
        await loadComments(suggestionId);
    } else {
        commentsSection.classList.add('hidden');
        btn.innerHTML = '<span>💬</span> Show Comments';
    }
}

async function loadComments(suggestionId) {
    const commentsList = document.querySelector(`.comments-list[data-suggestion-id="${suggestionId}"]`);
    commentsList.innerHTML = '<div class="loading-state">Loading comments...</div>';
    
    try {
        const db = window.firebaseDb;
        const commentsQuery = window.firebaseApp.query(
            window.firebaseApp.collection(db, 'comments'),
            window.firebaseApp.where('suggestionId', '==', suggestionId),
            window.firebaseApp.orderBy('createdAt', 'asc')
        );
        
        const querySnapshot = await window.firebaseApp.getDocs(commentsQuery);
        
        if (querySnapshot.empty) {
            commentsList.innerHTML = '<p style="color: var(--text-secondary); font-size: 0.9rem;">No comments yet. Be the first to comment!</p>';
            return;
        }
        
        commentsList.innerHTML = '';
        
        querySnapshot.forEach((doc) => {
            const comment = doc.data();
            const commentItem = createCommentItem(comment, doc.id);
            commentsList.appendChild(commentItem);
        });
    } catch (error) {
        console.error('Error loading comments:', error);
        commentsList.innerHTML = '<p style="color: var(--error-color);">Failed to load comments.</p>';
    }
}

function createCommentItem(comment, commentId) {
    const item = document.createElement('div');
    item.className = 'comment-item';
    
    const date = comment.createdAt ? 
        new Date(comment.createdAt.toDate()).toLocaleString() : 
        'Unknown';
    
    item.innerHTML = `
        <div class="comment-header">
            <span class="comment-author" data-user-id="${comment.authorId}">${escapeHtml(comment.authorName)}</span>
            <span class="comment-date">${date}</span>
        </div>
        <p class="comment-text">${escapeHtml(comment.text)}</p>
    `;
    
    return item;
}

async function handleSubmitComment(suggestionId) {
    const commentInput = document.querySelector(`.comment-input[data-suggestion-id="${suggestionId}"]`);
    const text = commentInput.value.trim();
    
    if (!text) {
        alert('Please enter a comment');
        return;
    }
    
    try {
        const db = window.firebaseDb;
        
        const commentData = {
            suggestionId: suggestionId,
            text: text,
            authorId: currentUser.uid,
            authorName: userData.displayName,
            createdAt: window.firebaseApp.serverTimestamp()
        };
        
        await window.firebaseApp.addDoc(window.firebaseApp.collection(db, 'comments'), commentData);
        
        console.log('Comment added successfully');
        
        // Clear input and reload comments
        commentInput.value = '';
        await loadComments(suggestionId);
    } catch (error) {
        console.error('Error adding comment:', error);
        alert('Failed to add comment. Please try again.');
    }
}
