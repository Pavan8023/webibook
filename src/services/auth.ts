import { 
  auth, 
  db, 
  googleProvider, 
  twitterProvider 
} from '@/lib/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signInWithPopup,
  UserCredential,
  updateProfile
} from 'firebase/auth';
import { 
  doc, 
  setDoc,
  getDoc
} from 'firebase/firestore';
import { serverTimestamp } from 'firebase/firestore';

// Unified function to create/update user in Firestore
const createOrUpdateUser = async (
  uid: string,
  data: {
    name: string;
    email: string;
    role: 'attendee' | 'hoster';
    type: 'email' | 'google' | 'twitter';
    photoURL?: string | null;
  }
) => {
  const userRef = doc(db, 'users', uid);
  const userDoc = await getDoc(userRef);
  
  const userData = {
    ...data,
    updatedAt: serverTimestamp(),
    lastLogin: serverTimestamp(),
  };

  if (userDoc.exists()) {
    // Update existing user
    await setDoc(userRef, userData, { merge: true });
  } else {
    // Create new user
    await setDoc(userRef, {
      ...userData,
      createdAt: serverTimestamp(),
    });
  }
};

// Email signup
export const emailSignUp = async (
  email: string, 
  password: string, 
  name: string, 
  role: 'attendee' | 'hoster'
) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  
  // Update auth profile
  await updateProfile(userCredential.user, { displayName: name });
  
  // Create user in Firestore
  await createOrUpdateUser(userCredential.user.uid, {
    name,
    email,
    role,
    type: 'email',
  });
  
  return userCredential;
};

// Email login
export const emailLogin = async (
  email: string, 
  password: string, 
  role: 'attendee' | 'hoster'
) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  
  // Update user role in Firestore
  await createOrUpdateUser(userCredential.user.uid, {
    name: userCredential.user.displayName || '',
    email: userCredential.user.email || '',
    role,
    type: 'email',
  });
  
  return userCredential;
};

// Provider sign-in
export const providerSignIn = async (
  provider: 'google' | 'twitter',
  role: 'attendee' | 'hoster'
) => {
  const selectedProvider = provider === 'google' ? googleProvider : twitterProvider;
  const userCredential = await signInWithPopup(auth, selectedProvider);
  
  // Create/update user in Firestore
  await createOrUpdateUser(userCredential.user.uid, {
    name: userCredential.user.displayName || '',
    email: userCredential.user.email || '',
    role,
    type: provider,
    photoURL: userCredential.user.photoURL || null,
  });
  
  return userCredential;
};

import { sendPasswordResetEmail } from 'firebase/auth';

export const resetPassword = async (email: string, newPassword: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true, message: 'Password reset email sent successfully' };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};
