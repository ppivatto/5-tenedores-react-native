import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Dimensions } from 'react-native';
import { Icon, Avatar, Image, Input, Button } from 'react-native-elements';
import * as Permissions from 'expo-permissions';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import MapView from 'react-native-maps';
import Modal from '../Modal';
import uuid from 'uuid/v4';
import { firebaseApp } from '../../utils/FireBase';
import firebase from 'firebase/app';
import 'firebase/firestore';

const db = firebase.firestore(firebaseApp);

const WidthScreen = Dimensions.get('window').width;

export default function AddRestaurantForm(props) {
    const { toastRef, setIsLoading, navigation, setIsReloadRestaurants } = props;
    const [imagesSelected, setImagesSelected] = useState([]);
    const [restaurantName, setRestaurantName] = useState('');
    const [restaurantAddress, setRestaurantAddress] = useState('');
    const [restaurantDescription, setRestaurantDescription] = useState('');
    const [isVisibleMap, setIsVisibleMap] = useState(false);
    const [locationRestaurant, setLocationRestaurant] = useState(null);
    
    const addRestaurante = () => {
        if (!restaurantName || !restaurantAddress || !restaurantDescription) {
            toastRef.current.show('Todos los campos del formulario son obligatorios.')
        } else if (imagesSelected.length === 0) {
            toastRef.current.show('El restaurante debe tener al menos una imagen.')
        } else if (!locationRestaurant) {
            toastRef.current.show('Tienes que localizar el restaurante en el mapa.')
        } else {
            setIsLoading(true);
            uploadImagesStorage(imagesSelected)
                .then(arrayImages => {
                    db.collection('restaurants').add({
                        name: restaurantName,
                        address: restaurantAddress,
                        description: restaurantDescription,
                        location: locationRestaurant,
                        images: arrayImages,
                        rating: 0,
                        ratingTotal: 0,
                        quantityVoting: 0,
                        createdAt: new Date(),
                        createdBy: firebaseApp.auth().currentUser.uid
                    })
                        .then(() => {
                            setIsLoading(false);
                            setIsReloadRestaurants(true);
                            navigation.navigate('Restaurants')
                        })
                        .catch(() => {
                            setIsLoading(false);
                            toastRef.current.show('Error al subir el Restaurante. Intentelo más tarde.');
                        })
                })
        }
    };
    
    const uploadImagesStorage = async imageArray => {
        const imagesBlob = [];
        await Promise.all(
            imageArray.map(async image => {
                
                const response = await fetch(image);
                const blob = await response.blob();
                const ref = firebase
                    .storage()
                    .ref('restaurant-images')
                    .child(uuid());
                
                await ref.put(blob)
                    .then(result => {
                        imagesBlob.push(result.metadata.name);
                    })
                
            })
        );
        
        return imagesBlob;
        
    };
    
    return(
        <ScrollView>
            <ImageRestaurant
                imageRestaurant={imagesSelected[0]}
            />
            <FormAdd
                setRestaurantName={setRestaurantName}
                setRestaurantAddress={setRestaurantAddress}
                setRestaurantDescription={setRestaurantDescription}
                setIsVisibleMap={setIsVisibleMap}
                locationRestaurant={locationRestaurant}
            />
            <UploadImage 
                imagesSelected={imagesSelected} 
                setImagesSelected={setImagesSelected}
                toastRef={toastRef}
            />
            <Button
                title={'Crear Restaurante'}
                onPress={addRestaurante}
                buttonStyle={styles.btnAddRestaurante}
            />
            
            <Map 
                isVisibleMap={isVisibleMap}
                setIsVisibleMap={setIsVisibleMap}
                setLocationRestaurant={setLocationRestaurant}
                toastRef={toastRef}
            />
        </ScrollView>
    )
}

function ImageRestaurant(props) {
    const { imageRestaurant } = props;
    
    return(
        <View styles={styles.viewPhoto}>
            {imageRestaurant ?
                <Image 
                    source={{uri: imageRestaurant }}
                    style={{ width: WidthScreen, height: 200 }}
                /> :
                <Image
                    source={require('../../../assets/img/no-image.png')}
                    style={{ width: WidthScreen, height: 200 }}
                />
            }
        </View>
    )
}

function UploadImage(props) {
    const { imagesSelected, setImagesSelected, toastRef } = props;
    
    const imageSelected = async () => {
        const resultPermission = await Permissions.askAsync(Permissions.CAMERA_ROLL);
        
        const resultPermissionCamera = resultPermission.permissions.cameraRoll.status;
        
        if (resultPermissionCamera === 'denied') {
            toastRef.current.show('Es necesario aceptar los permisos de la Galería. ' +
                'Si los rechazaste, debes ir a Ajustes y activarlos manualmente.', 3500)
        } else {
            const result = await ImagePicker.launchImageLibraryAsync({
                allowsEditing: true,
                aspect: [4,3]
            });
            
            if (result.cancelled) {
                toastRef.current.show('Has cerrado la galería sin seleccionar ninguna imagen.', 1500)
            } else {
                setImagesSelected([...imagesSelected, result.uri])
            }
        }
    };
    
    const removeImage = image => {
        const arrayImages = imagesSelected;
        
        Alert.alert(
            'Eliminar Imagen',
            '¿Estás seguro de que quieres eliminar esta imagen?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel'
                },
                {
                    text: 'Eliminar',
                    onPress: () => setImagesSelected(arrayImages.filter( imageUrl => imageUrl !== image))
                }
            ],
            { cancelable: false }
        )
    };
    
    return(
        <View style={styles.viewImages}>
            {
                imagesSelected.length < 5 && 
                (<Icon
                    type={'material-community'}
                    name={'camera'}
                    color={'#7A7A7A'} 
                    containerStyle={styles.containerIcon}
                    onPress={imageSelected}
                />)
            }
            
            
            {imagesSelected.map( imageRestaurant => {
                return(
                    <Avatar 
                        key={imageRestaurant}
                        onPress={() => removeImage(imageRestaurant)}
                        style={styles.miniatureStyle}
                        source={{ uri: imageRestaurant }}
                    />
                )
            })}
            
        </View>
    )
}

function FormAdd(props){
    const { setRestaurantName, setRestaurantAddress, setRestaurantDescription, setIsVisibleMap, locationRestaurant } = props;
    
    return(
        <View style={styles.viewForm}>
            <Input
                placeholder={'Nombre del Restaurante'}
                containerStyle={styles.input}
                onChange={e => setRestaurantName(e.nativeEvent.text)}
            />
            <Input
                placeholder={'Dirección'}
                containerStyle={styles.input}
                rightIcon={{
                    type: 'material-community',
                    name: 'google-maps',
                    color: locationRestaurant ? '#00a680' : '#C2C2C2',
                    onPress: () => setIsVisibleMap(true)
                }}
                onChange={e => setRestaurantAddress(e.nativeEvent.text)}
            />
            <Input
                placeholder={'Descripción del Restaurante'}
                multiline={true}
                inputContainerStyle={styles.textArea}
                onChange={e => setRestaurantDescription(e.nativeEvent.text)}
            />
        </View>
    )
}

function Map(props) {
    const { isVisibleMap, setIsVisibleMap, setLocationRestaurant, toastRef } = props;
    const [location, setLocation] = useState(null);
    
    useEffect(() => {
        const abortController = new AbortController();
        (async () => {
            const resultPermissions = await Permissions.askAsync(Permissions.LOCATION);
            const statusPermissions = resultPermissions.permissions.location.status;
            
            if (statusPermissions !== 'granted') {
                toastRef.current.show('Debes aceptar los permisos de Ubicación.', 2000);
            } else {
                const loc = await Location.getCurrentPositionAsync({});
                
                setLocation({
                    latitude: loc.coords.latitude,
                    longitude: loc.coords.longitude,
                    latitudeDelta: 0.001,
                    longitudeDelta: 0.001
                });
            }
        })();
    
        return () => {
            abortController.abort();
        };
    }, []);
    
    const confirmLocation = () => {
        setLocationRestaurant(location);
        toastRef.current.show('Localización guardada correctamente.');
        setIsVisibleMap(false);
    };
    
    return (
        <Modal isVisible={isVisibleMap} setIsVisible={setIsVisibleMap}>
            <View>
                {location && (
                    <MapView
                        style={styles.mapStyle}
                        initialRegion={location}
                        showsUserLocation={true}
                        onRegionChange={region => setLocation(region)}
                    >
                        <MapView.Marker
                            coordinate={{
                                latitude: location.latitude,
                                longitude: location.longitude,
                            }}
                            draggable
                        />
                        
                    </MapView>
                )}
                <View style={styles.viewMapBtn}>
                    <Button
                        title={'Guardar Ubicación'}
                        onPress={confirmLocation}
                        containerStyle={styles.viewMapBtnContainerSave}
                        buttonStyle={styles.viewMapBtnSave}
                    />
                    <Button
                        title={'Cancelar Ubicación'}
                        onPress={() => setIsVisibleMap(false)}
                        containerStyle={styles.viewMapBtnContainerCancel}
                        buttonStyle={styles.viewMapBtnCancel}
                    />
                </View>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    viewImages: {
      flexDirection: 'row',
      marginLeft: 20,  
      marginRight: 20,  
      marginTop: 30,
    },
    containerIcon: {
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
        height: 70,
        width: 70,
        backgroundColor: '#E3E3E3',
    },
    miniatureStyle: {
        width: 70,
        height: 70,
        marginRight: 10,
    },
    viewPhoto: {
        alignItems: 'center',
        height: 200,
        marginBottom: 20,
    },
    viewForm: {
        marginLeft: 10,
        marginRight: 10,
    },
    input: {
        marginBottom: 10
    },
    textArea: {
        height: 100,
        width: '100%',
        padding: 0,
        margin: 0,
    },
    mapStyle: {
        width: '100%',
        height: 550,
    },
    viewMapBtn: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 10,
    },
    viewMapBtnContainerSave: {
        paddingRight: 5,
    },
    viewMapBtnSave: {
        backgroundColor: '#00a680',
    },
    viewMapBtnContainerCancel: {
        paddingLeft: 5,
    },
    viewMapBtnCancel: {
        backgroundColor: '#a60d0d',
    },
    btnAddRestaurante: {
        backgroundColor: '#00a680',
        margin: 20,
    },
    
});