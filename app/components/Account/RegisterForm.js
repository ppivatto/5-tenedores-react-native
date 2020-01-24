import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Input, Icon, Button } from 'react-native-elements';
import { validateEmail } from '../../utils/Validation';
import firebase from 'firebase';
import { withNavigation } from 'react-navigation';

import Loading from '../Loading';

function RegisterForm(props) {
    const { toastRef, navigation } = props;
    const [hidePassword, setHidePassword] = useState(true);
    const [hideRepeatPassword, setHideRepeatPassword] = useState(true);
    const [isVisibleLoading, setIsVisibleLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [repeatPassword, setRepeatPassword] = useState('');
    
    const register = async () => {
        setIsVisibleLoading(true);
        
        if (!email || !password || !repeatPassword) {
            toastRef.current.show('Todos los campos son obligatorios')
        } else {
            if (!validateEmail(email)) {
                toastRef.current.show('Email incorrecto')
            } else {
                if (password !== repeatPassword) {
                    toastRef.current.show('Las contraseñas no son iguales')
                } else {
                    await firebase
                        .auth()
                        .createUserWithEmailAndPassword(email, password)
                        .then(() => {
                            toastRef.current.show('Usuario creado correctamente');
                            navigation.navigate('MyAccount');
                        })
                        .catch(() => {
                            toastRef.current.show('Error al crear la cuenta, intentelo más tarde.')
                        })
                }
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
                onChange={e => setRepeatPassword(e.nativeEvent.text)}
                rightIcon={
                    <Icon
                        type={'material-community'}
                        name={hidePassword ? 'eye-outline' : 'eye-off-outline'}
                        iconStyle={styles.iconRight}
                        onPress={() => setHidePassword(!hidePassword)}
                    />
                }
            />
            <Input
                placeholder={'Repetir Contraseña'}
                password={true}
                secureTextEntry={hideRepeatPassword}
                containerStyle={styles.inputForm}
                onChange={e => setPassword(e.nativeEvent.text)}
                rightIcon={
                    <Icon
                        type={'material-community'}
                        name={hideRepeatPassword ? 'eye-outline' : 'eye-off-outline'}
                        iconStyle={styles.iconRight}
                        onPress={() => setHideRepeatPassword(!hideRepeatPassword)}
                    />
                }
            />
            <Button
                title={'Unirse'}
                containerStyle={styles.btnContainerRegister}
                buttonStyle={styles.btnRegister}
                onPress={register}
            />
            <Loading text={'Creando Cuenta'} isVisible={isVisibleLoading} />
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
    btnContainerRegister: {
        width: '95%',
        marginTop: 20,
    },
    btnRegister: {
        backgroundColor: '#00a680',
    },
});

export default withNavigation(RegisterForm);