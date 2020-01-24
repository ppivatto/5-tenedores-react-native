import { createStackNavigator } from 'react-navigation-stack';
import SearchScreen from '../screens/Search';

const SearchScreenStacks = createStackNavigator({
    Search: {
        screen: SearchScreen,
        navigationOptions: () => ({
            title: 'Buscar Restaurantes'
        })
    }
});

export default SearchScreenStacks;