// utils/LocationTask/LocationTask.ts
import * as TaskManager from "expo-task-manager";
import * as SecureStore from "expo-secure-store";
import io from "socket.io-client";

const SOCKET_URL = "http://192.168.1.37:7987";

export const LOCATION_TASK_NAME = "vendor-background-location-task";

TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error("Background location error:", error);
    return;
  }
  if (data) {
    const { locations } = data;
    if (locations && locations.length > 0) {
      const { latitude, longitude } = locations[0].coords;
      const updatedAt = new Date().toISOString();

      // Retrieve vendorId from SecureStore
      const vendorId = await SecureStore.getItemAsync("vendorId");
      if (!vendorId) {
        console.warn("No vendorId found in SecureStore");
        return;
      }

      const payload = {
        vendorId,
        lat: latitude,
        lng: longitude,
        updatedAt,
      };
      console.log("📍 Background location:", payload);

      // Create temporary socket for emission
      const tempSocket = io(SOCKET_URL, {
        transports: ["websocket"],
      });

      try {
        // Wait for connection with timeout
        await new Promise<void>((resolve, reject) => {
          tempSocket.on("connect", () => {
            // Identify the vendor
            tempSocket.emit("vendor:identify", { vendorId });
            resolve();
          });
          tempSocket.on("connect_error", (err) => {
            console.error("Socket connect error:", err);
            reject(err);
          });
          // 5s timeout
          setTimeout(() => reject(new Error("Connection timeout")), 5000);
        });

        // Emit location update
        tempSocket.emit("vendor:location:update", payload);
      } catch (err) {
        console.error("Failed to emit location:", err);
      } finally {
        tempSocket.disconnect();
      }
    }
  }
});