import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

// Universal secure storage helper handling web and mobile platforms
export const setSecureItem = async (key, value) => {
  try {
    if (Platform.OS === "web") {
      localStorage.setItem(key, value);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  } catch (error) {
    console.error(`Error saving ${key} to secure storage:`, error);
  }
};

export const getSecureItem = async (key) => {
  try {
    if (Platform.OS === "web") {
      return localStorage.getItem(key);
    } else {
      return await SecureStore.getItemAsync(key);
    }
  } catch (error) {
    console.error(`Error reading ${key} from secure storage:`, error);
    return null;
  }
};

export const deleteSecureItem = async (key) => {
  try {
    if (Platform.OS === "web") {
      localStorage.removeItem(key);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  } catch (error) {
    console.error(`Error deleting ${key} from secure storage:`, error);
  }
};
