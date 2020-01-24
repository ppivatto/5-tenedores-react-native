import firebase from 'firebase/app';

const firebaseConfig = {
    apiKey: "AIzaSyAfg_MDkvKVrXiwZX7xvjzkMCNMVlH8fPw",
    authDomain: "tenedores-9ef0a.firebaseapp.com",
    databaseURL: "https://tenedores-9ef0a.firebaseio.com",
    projectId: "tenedores-9ef0a",
    storageBucket: "tenedores-9ef0a.appspot.com",
    messagingSenderId: "386528653432",
    appId: "1:386528653432:web:01aeda09966d735e43bd8d"
};

export const firebaseApp = firebase.initializeApp(firebaseConfig);