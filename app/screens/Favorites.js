import React, {useState, useEffect, useRef} from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { Image, Icon, Button } from 'react-native-elements';
import Toast from 'react-native-easy-toast';
import Loading from '../components/Loading';
import { NavigationEvents } from 'react-navigation';
import { firebaseApp } from '../utils/FireBase';
import firebase from 'firebase/app';
import 'firebase/firestore';

const db = firebase.firestore(firebaseApp);

export default function Favorites(props) {
    const { navigation } = props;
    const [restaurants, setRestaurants] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [reloadRestaurants, setReloadRestaurants] = useState(false);
    const [userLogged, setUserLogged] = useState(false);
    const toastRef = useRef();
    
    firebase.auth().onAuthStateChanged(user => {
        user ? setUserLogged(true) : setUserLogged(false)
    });
    
    useEffect(() => {
        if (userLogged) {
            const idUser = firebase.auth().currentUser.uid;
            db.collection('favorites')
                .where('idUser', '==', idUser)
                .get()
                .then(response => {
                    const idRestaurantsArray = [];
                    response.forEach(doc => {
                        idRestaurantsArray.push(doc.data().idRestaurant);
                    });
                    
                    getDataRestaurants(idRestaurantsArray)
                        .then(response => {
                            const restaurants = [];
                            response.forEach(doc => {
                                let restaurant = doc.data();
                                restaurant.id = doc.id;
                                restaurants.push(restaurant);
                            });
                            setRestaurants(restaurants);
                        });
                });
        }
        setReloadRestaurants(false);
        
    }, [reloadRestaurants]);
    
    const getDataRestaurants = idRestaurantsArray => {
        const arrayRestaurants = [];
        idRestaurantsArray.forEach(idRestaurant => {
            const result = db
                .collection('restaurants')
                .doc(idRestaurant)
                .get();
            arrayRestaurants.push(result);
        });
        return Promise.all(arrayRestaurants);
    };
    
    if (!userLogged) {
        return (
            <UserNoLogged
                setReloadRestaurants={setReloadRestaurants}
                navigation={navigation}
            />
        );
    }
    
    if (restaurants.length === 0) {
        return <NotFoundRestaurants setReloadRestaurants={setReloadRestaurants} />;
    }
    
    return(
        <View style={styles.viewBody}>
            <NavigationEvents onWillFocus={() => setReloadRestaurants(true)} />
            {restaurants ? (
                <FlatList
                    data={restaurants}
                    renderItem={restaurant =>
                        <Restaurant
                            restaurant={restaurant}
                            navigation={navigation}
                            setIsLoading={setIsLoading}
                            setReloadRestaurants={setReloadRestaurants}
                            toastRef={toastRef}
                        />}
                    keyExtractor={ (item, index) => index.toString() }
                />
            ) : (
                <View style={styles.loaderRestaurants}>
                    <ActivityIndicator size={'large'} />
                    <Text>Cargando restaurantes...</Text>
                </View>
            )}
            
            <Toast
                ref={toastRef}
                position={'center'}
                opacity={1}
            />
            <Loading
                isVisible={isLoading}
                text={'Eliminando Restaurante'}
            />
        
        </View>
    )
}

function Restaurant(props) {
    const { restaurant, navigation, setIsLoading, setReloadRestaurants, toastRef } = props;
    const { id, name, images } = restaurant.item;
    const [imageRestaurante, setImageRestaurante] = useState(null);
    
    useEffect(() => {
        const abortController = new AbortController();
        const image = images[0];
        firebase.storage().ref(`restaurant-images/${image}`).getDownloadURL()
            .then(response => {
                setImageRestaurante(response);
            });
        
        return () => {
            abortController.abort();
        };
    }, []);
    
    const confirmRemoveFavorite = () => {
        Alert.alert(
            'Eliminar Restaurante de Favoritos',
            '¿Estás seguro de que quieres eliminar el restaurante de Favoritos?',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel'
                },
                {
                    text: 'Eliminar',
                    onPress: removeFavorite
                }
            ],
            {
                cancelable: false
            }
        )
    };
    
    const removeFavorite = () => {
        setIsLoading(true);
        
        db.collection('favorites').where('idRestaurant', '==', id)
            .where('idUser', '==', firebase.auth().currentUser.uid)
            .get()
            .then(response => {
                response.forEach(doc => {
                    const idFavorite = doc.id;
                    
                    db.collection('favorites').doc(idFavorite).delete()
                        .then(() => {
                            setIsLoading(false);
                            setReloadRestaurants(true);
                            toastRef.current.show('Restaurante eliminado de Favoritos');
                        })
                        .catch(() => {
                            toastRef.current.show('Error al eliminar el Restaurante de Favoritos');
                        })
                });
            });
    };
    
    return (
        <View style={styles.restaurant}>
            <TouchableOpacity
                onPress={() => navigation.navigate('Restaurant', { restaurant: restaurant.item })}
            >
                {imageRestaurante ?
                    <Image
                        resizeMode={'cover'}
                        source={{ uri: imageRestaurante}}
                        style={styles.image}
                        PlaceholderContent={<ActivityIndicator color={'#FFF'} />}
                    /> : (
                        <View style={styles.loaderRestaurants}>
                            <ActivityIndicator size={'large'} />
                            <Text>Cargando restaurantes...</Text>
                        </View>
                    )}
            </TouchableOpacity>
            <View style={styles.info}>
                <Text style={styles.name}>{name}</Text>
                <Icon
                    type={'material-community'}
                    name={'heart'}
                    color={'#00a680'}
                    containerStyle={styles.favorite}
                    onPress={confirmRemoveFavorite}
                    size={40}
                    underlayColor={'transparent'}
                />
            </View>
        </View>
    )
}

function NotFoundRestaurants(props) {
    const { setReloadRestaurants } = props;
    
    return (
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
            <NavigationEvents onWillFocus={() => setReloadRestaurants(true)} />
            <Icon
                type={'material-community'}
                name={'alert-outline'}
                size={50}
            />
            <Text style={{fontSize: 20, fontWeight: 'bold', textAlign: 'center'}}>
                No tienes restaurantes en tu lista de Favoritos
            </Text>
        </View>
    )
}

function UserNoLogged(props) {
    const { setReloadRestaurants, navigation } = props;
    
    return (
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
            <NavigationEvents onWillFocus={() => setReloadRestaurants(true)} />
            <Icon
                type={'material-community'}
                name={'alert-outline'}
                size={50}
            />
            <Text style={{fontSize: 20, fontWeight: 'bold', textAlign: 'center'}}>
                Debes iniciar sesión para ver el contenido de la sección
            </Text>
            <Button
                title={'Ir al Login'}
                onPress={() => navigation.navigate('Login')}
                containerStyle={{ marginTop: 20, width: '80%' }}
                buttonStyle={{ backgroundColor: '#00a680' }}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    viewBody: {
        flex: 1,
        backgroundColor: '#f2f2f2'
    },
    loaderRestaurants: {
        marginTop: 10,
        marginBottom: 10
    },
    restaurant: {
        margin: 10,
    },
    image: {
        width: '100%',
        height: 180,
    },
    info: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
        flexDirection: 'row',
        paddingLeft: 20,
        paddingRight: 20,
        paddingTop: 10,
        paddingBottom: 10,
        marginTop: -30,
        backgroundColor: '#FFF'
    },
    name: {
        fontWeight: 'bold',
        fontSize: 20
    },
    favorite: {
        marginTop: -35,
        backgroundColor: 'rgba(255,255,255,.6)',
        padding: 15,
        borderRadius: 100
    },
});