import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button } from 'react-native-elements';
import firebase from 'firebase';
import InfoUser from '../../components/Account/InfoUser';
import Toast from 'react-native-easy-toast';
import Loading from '../../components/Loading';
import AccountOptions from '../../components/Account/AccountOptions';

export default function UserLogged() {
    const [userInfo, setUserInfo] = useState({});
    const [reloadData, setReloadData] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [textLoading, setTextLoading] = useState('');
    const toastRef = useRef();
    
    useEffect(() => {
        const abortController = new AbortController();
        (async () => {
            const user = await firebase.auth().currentUser;
            setUserInfo(user.providerData[0])
        })();
        setReloadData(false);
    
        return () => {
            abortController.abort();
        };
    }, [reloadData]);
    
    return (
        <View style={styles.viewUserInfo}>
            <InfoUser 
                userInfo={userInfo} 
                setReloadData={setReloadData}
                toastRef={toastRef}
                setIsLoading={setIsLoading}
                setTextLoading={setTextLoading}
            />
    
            <AccountOptions userInfo={userInfo} setReloadData={setReloadData} toastRef={toastRef} />
            
            <Button
                title={'Cerrar Sesión'}
                titleStyle={styles.btnCloseSessionText}
                buttonStyle={styles.btnCloseSession}
                onPress={() => firebase.auth().signOut()}
            />
            <Toast ref={toastRef} position={'center'} opacity={0.5} />
            <Loading text={textLoading} isVisible={isLoading} />
        </View>
    )
}

const styles = StyleSheet.create({
    viewUserInfo: {
        minHeight: '100%',
        backgroundColor: '#F2F2F2',
    },
    btnContainerCloseSession: {
        width: '95%',
        marginTop: 20,
    },
    btnCloseSession: {
        marginTop: 30,
        backgroundColor: '#FFF',
        borderRadius: 0,
        borderTopWidth: 1,
        borderTopColor: '#E3E3E3',
        borderBottomWidth: 1,
        borderBottomColor: '#E3E3E3',
        paddingTop: 10,
        paddingBottom: 10,
    },
    btnCloseSessionText: {
        color: '#00a680'
    }
});