import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export const tokenCache = Platform.OS !== 'web' ? {
  async getToken(key) {
    try {
      const item = await SecureStore.getItemAsync(key);
      if (item) {
        console.log(`${key} was retrieved 🔐`);
      } else {
        console.log(`No values stored under key: ${key}`);
      }
      return item;
    } catch (error) {
      console.error("SecureStore get item error: ", error);
      await SecureStore.deleteItemAsync(key);
      return null;
    }
  },
  async saveToken(key, value) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch (err) {
      console.error("SecureStore save item error: ", err);
      return;
    }
  },
} : undefined;

