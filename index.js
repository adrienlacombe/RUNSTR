// MUST BE FIRST - Apply all global polyfills for React Native
import './src/utils/applyGlobalPolyfills';

// Additional polyfill for WebView crypto (needed for NWC)
import 'react-native-webview-crypto';

import { registerRootComponent } from 'expo';
import App from './src/App';

// Register background location task BEFORE app initialization
// This ensures TaskManager knows about the background task on both iOS and Android
import './src/services/activity/SimpleRunTrackerTask'; // Unified tracker for all activities

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);