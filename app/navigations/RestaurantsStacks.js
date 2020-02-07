import { createStackNavigator } from 'react-navigation-stack';
import RestaurantsScreen from '../screens/Restaurants';
import AddRestaurant from '../screens/Restaurants/AddRestaurant';
import RestaurantScreen from '../screens/Restaurants/Restaurant';
import AddReviewRestaurantScreen from '../screens/Restaurants/AddReviewRestaurant';

const RestaurantsScreenStacks = createStackNavigator({
    Restaurants: {
        screen: RestaurantsScreen,
        navigationOptions: () => ({
            title: 'Restaurantes'
        })
    },
    AddRestaurant: {
        screen: AddRestaurant,
        navigationOptions: () => ({
            title: 'Nuevo Restaurante'
        })
    },
    Restaurant: {
        screen: RestaurantScreen,
        navigationOptions: (props) => ({
            title: props.navigation.state.params.restaurant.name || 'Restaurante'
        })
    },
    AddReviewRestaurant: {
        screen: AddReviewRestaurantScreen,
        navigationOptions: () => ({
            title: 'Nuevo Comentario'
        })
    },
});

export default RestaurantsScreenStacks;