import { Injectable } from '@nestjs/common';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithCredential,
  GoogleAuthProvider,
} from 'firebase/auth';

@Injectable()
export class FirebaseService {
  private readonly firebaseConfig = {
    apiKey: 'AIzaSyB2aJ23rvELySS5qRDosN_zL3jMUJjLBqk',
    authDomain: 'glimmer-4d92c.firebaseapp.com',
    projectId: 'glimmer-4d92c',
    storageBucket: 'glimmer-4d92c.firebasestorage.app',
    messagingSenderId: '787072395333',
    appId: '1:787072395333:web:20a593c90a9c86c7cf1b2c',
    measurementId: 'G-YEZ8HVHRTE',
  };

  private readonly app = initializeApp(this.firebaseConfig);
  private readonly auth = getAuth(this.app);

  async login_with_google(id_token: string) {
    const credential = GoogleAuthProvider.credential(id_token);
    const res = signInWithCredential(this.auth, credential);

    return res;
  }
}
