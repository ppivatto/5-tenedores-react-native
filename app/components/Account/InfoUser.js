import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Avatar } from 'react-native-elements';
import firebase from 'firebase';
import * as Permissions from 'expo-permissions';
import * as ImagePicker from 'expo-image-picker';

export default function InfoUser(props) {
    const { userInfo: { uid, displayName, email, photoURL, 
        providerId 
    },
        setReloadData, toastRef, setTextLoading, setIsLoading
    } = props;
    
    const changeAvatar = async () => {
        const resultPermission = await Permissions.askAsync(Permissions.CAMERA_ROLL);
        const resultPermissionCamera = resultPermission.permissions.cameraRoll.status;
        
        if (resultPermissionCamera === 'denied') {
            toastRef.current.show('Es necesario aceptar los permisos de la galería');
        } else {
            const result = await ImagePicker.launchImageLibraryAsync({
                allowsEditing: true,
                aspect: [4, 3]
            });
            
            if (result.cancelled) {
                toastRef.current.show('Has cerrado la galería de imágenes');
            } else {
                uploadImage(result.uri, uid)
                    .then(() => {
                        toastRef.current.show('Imagen subida correctamente');
                        updatePhotoURL(uid);
                    })
            }
        }
        
    };
    
    const uploadImage = async (uri, nameImage) => {
        setTextLoading('Actualizando Avatar');
        setIsLoading(true);
        const response = await fetch(uri);
        const blob = await response.blob();
        
        const ref = firebase.storage().ref().child(`avatar/${nameImage}`);
        
        return ref.put(blob);
    };
    
    const updatePhotoURL = uid => {
        firebase
            .storage()
            .ref(`avatar/${uid}`)
            .getDownloadURL()
            .then(async result => {
                const update = {
                    photoURL: result
                };
                await firebase.auth().currentUser.updateProfile(update);
                setReloadData(true);
                setIsLoading(false);
            })
            .catch(() => toastRef.current.show('Error al recuperar el avatar del Servidor'))
    };
    
    return(
        <View style={styles.viewUserInfo}>
            <Avatar
                rounded
                size={'large'} 
                showEditButton={providerId !== 'facebook.com'}
              //  showEditButton
                onEditPress={changeAvatar}
                containerStyle={styles.userInfoAvatar}
                source={{
                    uri: photoURL ? photoURL : 'https://api.adorable.io/avatars/285/abott@adorable.png'
                }}
            />
            <View>
                <Text style={styles.displayName}>
                    {displayName ? displayName : 'Anónimo'}
                </Text>
                <Text>{email ? email : 'Social Login'}</Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
   viewUserInfo: {
       alignItems: 'center',
       justifyContent: 'center',
       flexDirection: 'row',
       backgroundColor: '#F2F2F2',
       paddingTop: 30,
       paddingBottom: 30,
   },
    userInfoAvatar: {
       marginRight: 20 
    },
    displayName: {
       fontWeight: 'bold',
        
    },
});