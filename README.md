# Nook - Community Forum Platform

A modern, minimalist community forum built with HTML, CSS, JavaScript, and Firebase. Nook provides a clean interface for users to submit suggestions and engage with community content.

## Features

- **Authentication**: Google Sign-In and Guest (Anonymous) authentication
- **Forum**: Users can create and view suggestions
- **Archive**: Admin-managed archive for important content
- **Role-Based Access Control**: Guest, User, Moderator, and Admin roles
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Real-time**: Powered by Firebase Firestore
- **Secure**: Server-side security rules enforce permissions

## Project Structure

```
nook/
│
├── index.html          # Main HTML file
├── style.css           # All styles and responsive design
├── app.js              # Main application logic
├── firebase-config.js  # Firebase configuration (needs your credentials)
├── firestore.rules     # Firestore security rules
└── README.md           # This file
```

## Setup Instructions

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard:
   - Enter project name (e.g., "nook-community")
   - Enable Google Analytics (optional)
   - Select or create a Google Analytics account
4. Wait for project creation to complete
5. Click "Continue" to access your project dashboard

### 2. Enable Authentication

1. In your Firebase project, go to **Build** → **Authentication**
2. Click **Get Started**
3. On the **Sign-in method** tab, enable:
   - **Google**: Click Google, enable it, add a project support email if needed
   - **Anonymous**: Click Anonymous (Guest), enable it
4. Save your changes

### 3. Create Firestore Database

1. In your Firebase project, go to **Build** → **Firestore Database**
2. Click **Create database**
3. Choose a location (select one closest to your users)
4. Select **Start in Test Mode** (we'll update this with security rules later)
5. Click **Enable**

### 4. Get Firebase Configuration

1. In your Firebase project, click the **gear icon** (Project Settings)
2. Scroll down to the **Your apps** section
3. Click the **web icon** (`</>`)
4. Enter an app name (e.g., "Nook")
5. **Do NOT** check "Also set up Firebase Hosting for this app" (we'll do this separately if needed)
6. Click **Register app**
7. Copy the `firebaseConfig` object that appears
8. Open `firebase-config.js` in your project
9. Replace the placeholder values with your actual configuration:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_ACTUAL_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

### 5. Deploy Firestore Security Rules

1. In your Firebase project, go to **Build** → **Firestore Database**
2. Click the **Rules** tab
3. Delete the existing rules
4. Copy the contents of `firestore.rules` from your project
5. Paste the rules into the Firebase Console
6. Click **Publish**

**Important**: The security rules enforce role-based permissions server-side. Do not modify them unless you understand the implications.

### 6. Test Locally

1. Open `index.html` in your web browser
2. You should see the loading screen, then the login screen
3. Test Google Sign-In
4. Test Guest Sign-In
5. Verify that users can create suggestions
6. Check the Firestore Console to see user documents and suggestions

### 7. Deploy to Firebase Hosting (Optional)

If you want to deploy your website:

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase in your project directory:
   ```bash
   firebase init
   ```
   - Select **Hosting**
   - Select your existing Firebase project
   - Use `index.html` as your public directory
   - Configure as a single-page app? **No**
   - Overwrite `index.html`? **No**

4. Deploy:
   ```bash
   firebase deploy
   ```

5. Your website will be available at `https://YOUR_PROJECT_ID.web.app`

## Role System

### Roles

- **Guest**: Anonymous users with limited permissions
  - Can view public content
  - Cannot create suggestions
  - Cannot modify archive

- **User**: Standard authenticated users
  - Can create suggestions
  - Can edit their own suggestions
  - Can view suggestions and archive
  - Cannot modify archive

- **Moderator**: Community moderators
  - All user permissions
  - Can change suggestion status
  - Can delete suggestions
  - Cannot modify archive

- **Admin**: Full administrative access
  - All permissions
  - Can create, edit, and delete archive entries
  - Can manage users (via Firebase Console initially)

### How Roles Work

1. **Automatic Assignment**:
   - Google Sign-In users automatically get `role: "user"`
   - Guest users automatically get `role: "guest"`

2. **Manual Role Assignment** (Initial Setup):
   - The first user who signs up will get `role: "user"`
   - To make someone an admin:
     1. Go to Firebase Console → Firestore Database
     2. Navigate to `users` collection
     3. Find the user's document (by their UID)
     4. Click the document to edit it
     5. Change the `role` field from `"user"` to `"admin"`
     6. Click **Save**

3. **Security Enforcement**:
   - Roles are enforced by Firestore Security Rules (server-side)
   - Frontend JavaScript checks are for UX only
   - Users cannot bypass security by modifying the frontend

## Database Structure

### Users Collection (`users/{uid}`)

```javascript
{
    uid: "user_auth_uid",
    displayName: "John Doe",
    email: "john@example.com",
    photoURL: "https://...",
    loginMethod: "google", // or "guest"
    role: "user", // or "guest", "moderator", "admin"
    createdAt: Timestamp,
    lastLogin: Timestamp
}
```

### Suggestions Collection (`suggestions/{suggestionId}`)

```javascript
{
    title: "Add dark mode",
    description: "It would be great to have a dark mode option...",
    authorId: "user_auth_uid",
    authorName: "John Doe",
    category: "feature", // or "general", "bug", "improvement"
    status: "pending", // or "accepted", "rejected", "implemented"
    createdAt: Timestamp
}
```

### Archive Collection (`archive/{archiveId}`)

```javascript
{
    title: "Archive Entry Title",
    description: "Brief description...",
    content: "Full content of the archive entry...",
    authorId: "admin_uid",
    authorName: "Admin Name",
    category: "announcements",
    createdAt: Timestamp,
    updatedAt: Timestamp
}
```

## Future Admin Dashboard

The project is structured to support a future admin dashboard. When you're ready to add it:

1. **Admin Panel Features**:
   - View all registered users
   - See user details (last login, login method, role)
   - Assign and change user roles
   - Create, edit, and delete archive entries
   - Moderate suggestions (change status, delete)

2. **Implementation Options**:
   - **Option A**: Use Firebase Console (current method)
   - **Option B**: Build admin UI with Cloud Functions for role changes
   - **Option C**: Use Firebase Admin SDK on a backend server

3. **Security Considerations**:
   - Role changes should be done via Cloud Functions or Admin SDK
   - Never allow client-side role assignment
   - The Firestore rules already enforce these restrictions

## Troubleshooting

### Firebase Initialization Error

**Problem**: "Firebase configuration error" appears on screen

**Solution**:
- Ensure you've replaced the placeholder values in `firebase-config.js`
- Check that your Firebase project has Authentication and Firestore enabled
- Verify your API key and project ID are correct

### Authentication Not Working

**Problem**: Google Sign-In or Guest Sign-In fails

**Solution**:
- Check that both Google and Anonymous authentication are enabled in Firebase Console
- Ensure your domain is authorized (for Google Sign-In)
- Check browser console for specific error messages

### Permission Denied Errors

**Problem**: "Missing or insufficient permissions" in Firestore

**Solution**:
- Ensure Firestore Security Rules are published
- Check that the rules match the contents of `firestore.rules`
- Verify the user is authenticated and has the correct role

### Suggestions Not Appearing

**Problem**: Created suggestions don't show up

**Solution**:
- Check Firestore Console to verify the document was created
- Ensure the user has the correct role (not guest)
- Check browser console for JavaScript errors

## Development Notes

### Adding New Features

The code is organized to be easily extensible:

1. **New Pages**: Add HTML to `index.html`, CSS to `style.css`, and logic to `app.js`
2. **New Collections**: Add Firestore rules to `firestore.rules`
3. **New Roles**: Update role checks in both `app.js` and `firestore.rules`

### Customization

- **Colors**: Modify CSS variables in `style.css` (lines 4-14)
- **Logo**: Replace the "Nook" text in `index.html` and `style.css`
- **Categories**: Add options to the category select in `index.html`

## Security Best Practices

1. **Never expose Firebase Admin SDK credentials** in client-side code
2. **Always enforce permissions server-side** via Firestore rules
3. **Keep Firebase SDKs updated** to the latest version
4. **Use environment variables** for sensitive data in production
5. **Regularly review security rules** and update as needed

## License

This project is provided as-is for educational and personal use.

## Support

For issues related to:
- **Firebase Setup**: Consult [Firebase Documentation](https://firebase.google.com/docs)
- **Firestore Rules**: See [Firestore Security Rules Guide](https://firebase.google.com/docs/firestore/security/rules)
- **Authentication**: Check [Firebase Auth Documentation](https://firebase.google.com/docs/auth)

## Credits

- **Technologies**: HTML5, CSS3, JavaScript, Firebase Authentication, Firebase Firestore
- **Design**: Minimal, modern, responsive interface
- **Security**: Server-side role-based access control
