import 'react-native-reanimated';
import 'react-native-gesture-handler';
console.log('[DEBUG] index.js: starting...');
import { Buffer } from 'buffer';
global.Buffer = global.Buffer || Buffer;
console.log('[DEBUG] index.js: Buffer polyfilled');

import { registerRootComponent } from 'expo';

import App from './App';

console.log('[DEBUG] index.js: registering root component');
registerRootComponent(App);
