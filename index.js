// MUST BE FIRST - Polyfills for React Native
import 'react-native-get-random-values'; // Crypto polyfill
import 'react-native-url-polyfill/auto'; // URL polyfill (required for NDK WebSocket URLs)

import { registerRootComponent } from 'expo';
import App from './src/App';

// Register background location task BEFORE app initialization
// This ensures TaskManager knows about the background task on both iOS and Android
import './src/services/activity/BackgroundLocationTask';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);