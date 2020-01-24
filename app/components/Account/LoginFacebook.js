import React, { useState } from 'react';
import { SocialIcon } from 'react-native-elements';
import * as firebase from 'firebase';
import * as Facebook from 'expo-facebook';
import { FacebookApi } from '../../utils/Social';
import Loading from '../Loading';


export default function LoginFacebook(props) {
    const { toastRef, navigation } = props;
    const [isVisibleLoading, setIsVisibleLoading] = useState(false);
    const login = async () => {
        await Facebook.initializeAsync(FacebookApi.application_id, '5 Tenedores');
        
        const {
            type,
            token,
            expires,
            permissions,
            declinedPermissions,
        } = await Facebook.logInWithReadPermissionsAsync({
            permissions: FacebookApi.permissions,
        });
        
        if (type === 'success') {
            setIsVisibleLoading(true);
            const credentials = firebase.auth.FacebookAuthProvider.credential(token);
            
            await firebase
                .auth()
                .signInWithCredential(credentials)
                .then(() => {
                    toastRef.current.show('Login Correcto');
                    navigation.navigate('MyAccount');
                })
                .catch(() => {
                    toastRef.current.show('Error accediendo con Facebook. Intentelo más tarde. ');
                })
        } else if (type === 'cancel') {
            toastRef.current.show('Inicio de sesión cancelado');
        } else {
            toastRef.current.show('Error desconocido. Intentelo más tarde. ');
        }
        
        setIsVisibleLoading(false);
    };
    
    return (
        <>
            <SocialIcon 
                type={'facebook'}
                button
                title={'Iniciar Sesión con Facebook'}
                onPress={login}
            />
            <Loading text={'Iniciando Sesión'} isVisible={isVisibleLoading} />
        </>
    )
}
