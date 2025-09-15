
import { firebaseApp } from "~/App";


const SERVER_URL = "https://api.blueaceindia.com/api/v1/expo";


const auth = initializeAuth(firebaseApp, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const registerForPushNotificationsAsync = async () => {
  try {
    // Request notification permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.warn("Permission for push notifications was denied");
      return;
    }

    // Get Expo Push Token
    const expoPushToken = (await Notifications.getExpoPushTokenAsync()).data;
    console.log("Expo Push Token:", expoPushToken);

    // Initialize Firebase Messaging
    const messaging = getMessaging(firebaseApp);
    
    // Get Firebase Push Token
    const firebasePushToken = await getToken(messaging, { vapidKey: "YOUR_VAPID_KEY" });
    console.log("Firebase Push Token:", firebasePushToken);

    // Send both tokens to backend
    await fetch(`${SERVER_URL}/register-notification-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ expoPushToken, firebasePushToken }),
    });

    return expoPushToken;
  } catch (error) {
    console.error("Error registering for push notifications:", error);
    return "error";
  }
};
