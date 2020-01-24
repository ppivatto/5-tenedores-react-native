import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Button, Input } from 'react-native-elements';
import firebase from 'firebase';
import { reauthenticate } from '../../utils/Api';

export default function ChangePasswordForm(props) {
    const { setIsVisibleModal, toastRef } = props;
    const [password, setPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [repeatNewPassword, setRepeatNewPassword] = useState('');
    const [error, setError] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [hidePassword, setHidePassword] = useState(true);
    const [hideNewPassword, setHideNewPassword] = useState(true);
    const [hideRepeatNewPassword, setHideRepeatNewPassword] = useState(true);
    
    const updatePassword = () => {
        setError({});
        
        if (!password || !newPassword || !repeatNewPassword) {
            let objError = {};
            
            !password && (objError.password = 'No puede estar vacío.');
            !newPassword && (objError.newPassword = 'No puede estar vacío.');
            !repeatNewPassword && (objError.repeatNewPassword = 'No puede estar vacío.');
            
            setError(objError);
        } else {
            if (newPassword !== repeatNewPassword) {
                setError({
                    newPassword: 'Las nuevas contraseñas deben ser iguales.', 
                    repeatNewPassword: 'Las nuevas contraseñas deben ser iguales.'
                })
            } else {
                setIsLoading(true);
                reauthenticate(password)
                    .then(()  => {
                        firebase.auth().currentUser.updatePassword(newPassword)
                            .then(() => {
                                setIsLoading(false);
                                toastRef.current.show('Contraseña actualizada correctamente');
                                setIsVisibleModal(false);
                                //Quitar sesión de Firebase luego del cambio de contraseña
                               // firebase.auth().signOut();
                            })
                            .catch(() => {
                                setError({general: 'Error al actualizar la contraseña'});
                                setIsLoading(false);
                            })
                    })
                    .catch(() => {
                        setError({password: 'La contraseña no es correcta.'});
                        setIsLoading(false);
                    })
            }
        }
    };
    
    return(
        <View style={styles.view}>
            <Input
                placeholder={'Contraseña Actual'}
                containerStyle={styles.input}
                password={true}
                secureTextEntry={hidePassword}
                onChange={e => setPassword(e.nativeEvent.text)}
                rightIcon={{
                    type: 'material-community',
                    name: hidePassword ? 'eye-outline' : 'eye-off-outline',
                    color: '#C2C2C2',
                    onPress: () => setHidePassword(!hidePassword)
                }}
                errorMessage={error.password}
            />
            <Input
                placeholder={'Nueva Contraseña'}
                containerStyle={styles.input}
                password={true}
                secureTextEntry={hideNewPassword}
                onChange={e => setNewPassword(e.nativeEvent.text)}
                rightIcon={{
                    type: 'material-community',
                    name: hideNewPassword ? 'eye-outline' : 'eye-off-outline',
                    color: '#C2C2C2',
                    onPress: () => setHideNewPassword(!hideNewPassword)
                }}
                errorMessage={error.newPassword}
            />
            <Input
                placeholder={'Repita Nueva Contraseña'}
                containerStyle={styles.input}
                password={true}
                secureTextEntry={hideRepeatNewPassword}
                onChange={e => setRepeatNewPassword(e.nativeEvent.text)}
                rightIcon={{
                    type: 'material-community',
                    name: hideRepeatNewPassword ? 'eye-outline' : 'eye-off-outline',
                    color: '#C2C2C2',
                    onPress: () => setHideRepeatNewPassword(!hideRepeatNewPassword)
                }}
                errorMessage={error.repeatNewPassword}
            />
            <Button
                title={'Cambiar Contraseña'}
                containerStyle={styles.btnContainer}
                buttonStyle={styles.btn}
                onPress={updatePassword}
                loading={isLoading}
            />
            <Text>{error.general}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    view: {
        alignItems: 'center',
        paddingTop: 10,
        paddingBottom: 10,
    },
    input: {
        marginBottom: 10
    },
    btnContainer: {
        marginTop: 20,
        width: '95%',
    },
    btn: {
        backgroundColor: '#00a680',
    },
});