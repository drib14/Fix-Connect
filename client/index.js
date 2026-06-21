import { registerRootComponent } from 'expo';
import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';

// Inject clerk-captcha element for Clerk's Turnstile bot protection on Web
if (Platform.OS === 'web') {
  if (!document.getElementById('clerk-captcha')) {
    const captchaDiv = document.createElement('div');
    captchaDiv.id = 'clerk-captcha';
    // Style it off-screen but layout-visible so Turnstile script can initialize it
    captchaDiv.style.position = 'absolute';
    captchaDiv.style.width = '300px';
    captchaDiv.style.height = '65px';
    captchaDiv.style.top = '-9999px';
    captchaDiv.style.left = '-9999px';
    captchaDiv.style.zIndex = '-9999';
    document.body.appendChild(captchaDiv);
  }
}

import App from './App';

// Complete the OAuth redirect flow for web/native popups
WebBrowser.maybeCompleteAuthSession();

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
