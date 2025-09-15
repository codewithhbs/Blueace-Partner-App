import * as SecureStore from "expo-secure-store";

async function save(key: string, value: any) {
  try {
    const data = JSON.stringify(value);
    await SecureStore.setItemAsync(key, data);
    console.log("Data saved successfully");
  } catch (error) {
    console.error("Error saving data:", error);
  }
}

async function getValueFor(key: string) {
  try {
    const result = await SecureStore.getItemAsync(key);
    return result != null ? JSON.parse(result) : null;
  } catch (error) {
    console.error("Error retrieving data:", error);
    return null;
  }
}

async function clearStorage(key: string) {
  try {
    await SecureStore.deleteItemAsync(key);
    console.log("Storage cleared successfully");
  } catch (error) {
    console.error("Error clearing storage:", error);
  }
}

export { save, getValueFor, clearStorage };
