import React from 'react';
import Navigation from './app/navigations/Navigation';
import { firebaseApp } from './app/utils/FireBase';
import { YellowBox } from 'react-native';


YellowBox.ignoreWarnings(['Setting a timer']);
console.ignoredYellowBox = ['Setting a timer'];
YellowBox.ignoreWarnings([
    'VirtualizedLists should never be nested', // TODO: Remove when fixed
]);
YellowBox.ignoreWarnings([
    'Setting a timer', // TODO: Remove when fixed
]);
YellowBox.ignoreWarnings([
    'componentWillReceiveProps has been renamed', // TODO: Remove when fixed
]);
YellowBox.ignoreWarnings([
    'componentWillMount has been renamed', // TODO: Remove when fixed
]);
YellowBox.ignoreWarnings([
    'Setting a timer for a long period of time', // TODO: Remove when fixed
]);

export default function App() {
    
    return (
        <Navigation />
    );
}