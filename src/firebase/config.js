import firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/auth'

const firebaseConfig = {
  apiKey: 'AIzaSyBdZ_g6p-xUPFPJH1WtLcbwgfOQ2T0Io6U',
  authDomain: 'sound-flow-e1a34.firebaseapp.com',
  projectId: 'sound-flow-e1a34',
  storageBucket: 'sound-flow-e1a34.firebasestorage.app',
  messagingSenderId: '404694472681',
  appId: '1:404694472681:web:b260d7b17c64ee4c115d78',
}

// init firebase
firebase.initializeApp(firebaseConfig)

// init services
const projectFirestore = firebase.firestore()
const projectAuth = firebase.auth()

// timestamp
const timestamp = firebase.firestore.FieldValue.serverTimestamp

export {  projectFirestore, projectAuth, timestamp }
