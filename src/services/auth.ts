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
  UserCredential
} from 'firebase/auth';
import { 
  doc, 
  setDoc 
} from 'firebase/firestore';

// Email signup
export const emailSignUp = async (
  email: string, 
  password: string, 
  name: string, 
  role: 'attendee' | 'hoster'
) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  await setDoc(doc(db, 'signupfromusers', userCredential.user.uid), {
    name,
    email,
    role,
    createdAt: new Date()
  });
  return userCredential;
};

// Email login
export const emailLogin = async (
  email: string, 
  password: string, 
  role: 'attendee' | 'hoster'
) => {
  return await signInWithEmailAndPassword(auth, email, password);
};

// Provider sign-in
export const providerSignIn = async (
  provider: 'google' | 'twitter',
  role: 'attendee' | 'hoster'
) => {
  const selectedProvider = provider === 'google' ? googleProvider : twitterProvider;
  const userCredential = await signInWithPopup(auth, selectedProvider);
  
  const collectionName = provider === 'google' 
    ? 'googleauthusers' 
    : 'twitterauthusers';
  
  await setDoc(doc(db, collectionName, userCredential.user.uid), {
    name: userCredential.user.displayName || '',
    email: userCredential.user.email || '',
    role,
    createdAt: new Date()
  });
  
  return userCredential;
};