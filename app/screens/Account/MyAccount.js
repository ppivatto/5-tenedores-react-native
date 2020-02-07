import React, {useState, useEffect} from 'react';
import firebase from 'firebase';
import Loading from '../../components/Loading';
import UserGuest from './UserGuest';
import UserLogged from './UserLogged';

export default function MyAccount() {
    const [login, setLogin] = useState(null);
    
    useEffect(() => {
        const abortController = new AbortController();
        firebase.auth().onAuthStateChanged(user => {
            !user ? setLogin(false) : setLogin(true);
        });
    
        return () => {
            abortController.abort();
        };
    }, []);
    
    if (login === null) {
        return <Loading isVisible={true} text={'Cargando...'} />
    }
    
    return login ? <UserLogged /> : <UserGuest />;
}