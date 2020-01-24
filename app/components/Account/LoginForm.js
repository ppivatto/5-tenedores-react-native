import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Input, Icon, Button } from 'react-native-elements';
import { validateEmail } from '../../utils/Validation';
import firebase from 'firebase';
import { withNavigation } from 'react-navigation';

import Loading from '../Loading';

function LoginForm(props) {
    const { toastRef, navigation } = props;
    const [hidePassword, setHidePassword] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isVisibleLoading, setIsVisibleLoading] = useState(false);
    
    const login = async () => {
        setIsVisibleLoading(true);
        
        if (!email || !password) {
            toastRef.current.show('Todos los campos son obligatorios')
        } else {
            if (!validateEmail(email)) {
                toastRef.current.show('El email no es correcto')
            } else {
                await firebase
                    .auth()
                    .signInWithEmailAndPassword(email, password)
                    .then(() => {
                        toastRef.current.show('Usuario creado correctamente');
                        navigation.navigate('MyAccount');
                    })
                    .catch(() => {
                        toastRef.current.show('Email o contraseña incorrectos.')
                    })
            }
        }
    
        setIsVisibleLoading(false);
    };
    
    return (
        <View style={styles.formContainer} >
            <Input
                placeholder={'Correo Electrónico'}
                containerStyle={styles.inputForm}
                onChange={ e => setEmail(e.nativeEvent.text)}
                rightIcon={
                    <Icon
                        type={'material-community'}
                        name={'at'}
                        iconStyle={styles.iconRight}
                    />
                }
            />
            <Input
                placeholder={'Contraseña'}
                password={true}
                secureTextEntry={hidePassword}
                containerStyle={styles.inputForm}
                onChange={e => setPassword(e.nativeEvent.text)}
                rightIcon={
                    <Icon
                        type={'material-community'}
                        name={hidePassword ? 'eye-outline' : 'eye-off-outline'}
                        iconStyle={styles.iconRight}
                        onPress={() => setHidePassword(!hidePassword)}
                    />
                }
            />
            <Button
                title={'Iniciar Sesión'}
                containerStyle={styles.btnContainerLogin}
                buttonStyle={styles.btnLogin}
                onPress={login}
            />
            <Loading text={'Iniciando Sesión'} isVisible={isVisibleLoading} />
        </View>
    )
};

const styles = StyleSheet.create({
    formContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 30
    },
    inputForm: {
        width: '100%',
        marginTop: 20,
    },
    iconRight: {
        color: '#C1C1C1',
    },
    btnContainerLogin: {
        width: '95%',
        marginTop: 20,
    },
    btnLogin: {
        backgroundColor: '#00a680',
    },
});

export default withNavigation(LoginForm);