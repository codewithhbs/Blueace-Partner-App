import { View, Text, AppState, AppStateStatus, Alert } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Location from "expo-location";
import * as SecureStore from "expo-secure-store";
import { FetchNewOrder, FetchUserDetails } from "~/utils/api/Api";
import PartnerHead from "~/components/PartnerHead/PartnerHead";
import { connectSocket, disconnectSocket, socket } from "~/utils/Socket/SocketInit";
import { LOCATION_TASK_NAME } from "~/utils/LocationTask/LocationTask";

export default function Home({ handleLogout }: { handleLogout: () => void }) {
  const [order, setOrder] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [vendor, setVendor] = useState<any>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const lastLocationRef = useRef<any>(null);

  // Helper to get and update last known location
  const updateLastLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      lastLocationRef.current = {
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      };
    } catch (err) {
      console.error("Failed to update last location:", err);
    }
  };

  // Start live location (foreground + background)
  const startLiveLocation = async (vendorId: string) => {
    if (!vendorId) return;

    // Request permissions
    const { status: fgStatus } = await Location.requestForegroundPermissionsAsync();
    if (fgStatus !== "granted") {
      Alert.alert("Foreground location permission is required.");
      return;
    }

    const { status: bgStatus } = await Location.requestBackgroundPermissionsAsync();
    if (bgStatus !== "granted") {
      console.warn("⚠️ Background location not granted.");
    }

    // Store vendorId for background task
    await SecureStore.setItemAsync("vendorId", vendorId);

    // Update last location
    await updateLastLocation();

    // Connect socket
    connectSocket(vendorId);

    // Start background tracking
    const hasStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
    if (!hasStarted) {
      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.Highest,
        timeInterval: 5000, // every 5 seconds
        distanceInterval: 10, // or every 10 meters
        foregroundService: {
          notificationTitle: "BlueAcea Partner",
          notificationBody: "We are tracking your location.",
        },
        pausesUpdatesAutomatically: false, // iOS only
        showsBackgroundLocationIndicator: true, // iOS
      });
    }
  };

  useEffect(() => {
    const loadVendor = async () => {
      try {
        const userDetails = await FetchUserDetails();
        setVendor(userDetails);
        await startLiveLocation(userDetails._id || "vendor123");
      } catch (err) {
        console.error("Error loading vendor:", err);
      }
    };
    loadVendor();
  }, []);

  // AppState: handle going background/foreground
  useEffect(() => {
    const handleAppState = async (next: AppStateStatus) => {
      if (
        appStateRef.current.match(/active/) &&
        next.match(/inactive|background/)
      ) {
        // Background → mark offline with last location
        if (vendor) {
          await updateLastLocation();
          if (lastLocationRef.current) {
            socket.emit("vendor:go:offline", {
              vendorId: vendor._id,
              lastLocation: lastLocationRef.current,
            });
          }
        }
        socket.disconnect();
      } else if (next === "active" && vendor) {
        // Foreground → reconnect
        connectSocket(vendor._id);
        await updateLastLocation();
      }
      appStateRef.current = next;
    };

    const sub = AppState.addEventListener("change", handleAppState);
    return () => sub.remove();
  }, [vendor]);

  // Cleanup
  useEffect(() => {
    return async () => {
      if (vendor) {
        await updateLastLocation();
        if (lastLocationRef.current) {
          socket.emit("vendor:go:offline", {
            vendorId: vendor._id,
            lastLocation: lastLocationRef.current,
          });
        }
        disconnectSocket();
        await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
      }
    };
  }, [vendor]);

  // Fetch orders
  useEffect(() => {
    const fnc = async () => {
      setLoading(true);
      try {
        const order = await FetchNewOrder();
        if (order && order.length > 0) {
          setOrder(order);
        } else {
          setOrder([]);
        }
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch orders");
        setLoading(false);
      }
    };
    fnc();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <PartnerHead />
    </SafeAreaView>
  );
}