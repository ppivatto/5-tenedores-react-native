import React, {useState, useEffect} from 'react';
import { StyleSheet, View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Image } from 'react-native-elements';
import * as firebase from 'firebase';


export default function ListRestaurants(props) {
    const { restaurants, isLoading, handleLoadMore, navigation } = props;
    
    return(
        <View>
            {restaurants ? (
                <FlatList 
                    data={restaurants}
                    renderItem={restaurant => <Restaurant restaurant={restaurant} navigation={navigation} /> }
                    keyExtractor={(item, index) => index.toString()}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={ <FooterList isLoading={isLoading} /> }
                />
            ) : (
                <View style={styles.loaderRestaurants}>
                    <ActivityIndicator size={'large'}/>
                    <Text>Cargando Restaurantes</Text>
                </View>
            ) 
            }
        </View>
    )
}

function Restaurant(props){
    const { restaurant, navigation } = props;
    const { name, address, description, images } = restaurant.item.restaurant;
    const [imageRestaurant, setImageRestaurant] = useState(null);
    
    const imageUri = imageRestaurant != null ? imageRestaurant : "";
    
    
    useEffect(() => {
        const abortController = new AbortController();
        const image = images[0];
        firebase.storage().ref(`restaurant-images/${image}`).getDownloadURL()
            .then(result => setImageRestaurant(result))
    
        return () => {
            abortController.abort();
        };
    }, []);
    
    
    return (
        <TouchableOpacity onPress={() => navigation.navigate('Restaurant', { restaurant: restaurant.item.restaurant })} >
            <View style={styles.viewRestaurant}>
                <View style={styles.viewRestaurantImage}>
                    <Image 
                        resizeMode={'cover'}
                     //   source={{ uri: imageRestaurant }}
                        source={imageUri.length !== 0 ? { uri: imageUri } : null}
                        style={styles.imageRestaurant}
                        PlaceholderContent={ <ActivityIndicator color={'#fff'} /> }
                    />
                </View>
                <View>
                    <Text style={styles.restaurantName}>{name}</Text>
                    <Text style={styles.restaurantAddress}>{address}</Text>
                    <Text style={styles.restaurantDescription}>{description.substr(0, 60)}...</Text>
                </View>
            </View>
        </TouchableOpacity>
    )
}

function FooterList(props) {
    const { isLoading } =  props;
    
    if (isLoading) {
        return(
            <View style={styles.loadingRestaurants}>
                <ActivityIndicator size={'large'} />
            </View>
        )
    } else {
        return(
            <View style={styles.notFoundRestaurants}>
                <Text>No quedan Restaurantes por cargar</Text>
            </View>
        )
    }
    
}

const styles = StyleSheet.create({
    loadingRestaurants: {
        marginTop: 20,
        alignItems: 'center',
    },
    viewRestaurant: {
        flexDirection: 'row',
        margin: 10,
    },
    viewRestaurantImage: {
        marginRight: 15,
    },
    imageRestaurant: {
        width: 80,
        height: 80,
    },
    restaurantName: {
        fontWeight: 'bold',
    },
    restaurantAddress: {
        paddingTop: 2,
        color: 'grey'
    },
    restaurantDescription: {
        paddingTop: 2,
        color: 'grey',
        width: 300
    },
    loaderRestaurants: {
        marginTop: 10,
        marginBottom: 10,
    },
    notFoundRestaurants:{
      marginTop: 10,  
      marginBottom: 20,
      alignItems: 'center'  
    },
});