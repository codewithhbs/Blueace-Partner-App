import React, { useState, useEffect } from 'react';
import { View, Text, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Location from 'expo-location';

import usePermissions from './utils/Permission/All_Permission';
import CheckAuthentication from './utils/Service/CheckAuthUser';
import LoadingSpinner from './components/common/LoadingSpinner';
import PermissionsScreen from './utils/Permission/Permission_screen';

// Screens
import Onboarding from './screens/Onboarding/Onboarding';
import Login from './screens/auth/Login';
import Home from './screens/Home/Home';
import New_Order from './screens/Orders/New_Order/New_Order';
import DeatilsOrder from './screens/Orders/New_Order/DeatilsOrder';
import Memeber from './screens/Orders/New_Order/Memeber/AllMember';
import OngoingOrder from './screens/Orders/Ongoing_Orders/OngoingOrder';
import EstimatedBudget from './screens/Orders/Ongoing_Orders/EstimatedBudget';
import EstimatedSee from './screens/Orders/Ongoing_Orders/Estimated.See';
import Add_Member from './screens/Orders/New_Order/Memeber/Add_Member';
import Profile from './components/Profile/Profile';
import Edit_Profile from './components/Profile/Edit/Edit_Profile';
import EditTimingSlot from './components/Profile/Time_Slots/ETime_Slots';
import PrivacyPolicy from './screens/Policy/PrivacyPolicy';
import Support_tx from './components/Support_Ticket/Support_tx';
import ErrorCode from './screens/Orders/Ongoing_Orders/ErrorCode';
import Watch_Codes from './screens/Orders/Ongoing_Orders/Watch_Codes';
import AllOrder from './screens/Orders/Compelte_Order/AllOrder';
import CameraFunction from './screens/Orders/Ongoing_Orders/CameraFunction';
import RaiseTicket from './screens/Raise-Ticket/RaiseTicket';
import CreateIssue from './screens/Raise-Ticket/CreateIssue';
import SingleTicket from './screens/Raise-Ticket/SingleTicket';
import BlueacePartnerAppUpdate from './context/CheckAppUpdate';

import { socket, connectSocket, disconnectSocket } from './utils/Socket/SocketInit';
import { clearStorage } from './utils/Service/SecureStore';
import { FetchUserDetails } from './utils/api/Api';

const Stack = createNativeStackNavigator();

// ErrorBoundary for catching unexpected errors
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Something went wrong</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

const App = () => {
  const permissions = usePermissions();
  const [vendor, setVendor] = useState(null)
  const [appState, setAppState] = useState({
    loading: true,
    initialRouteName: null,
    permissionNeeded: false,
    vendorId: null,
  });

  useEffect(() => {
    const handleFetchVendor = async () => {
      try {
        const userDetails = await FetchUserDetails();
        // console.log(userDetails)
        setVendor(userDetails);
      } catch (error) {
        console.error('Error fetching status:', error);
      }
    }
    handleFetchVendor();
  }, [])

  useEffect(() => {
    let isMounted = true;
    let locationSub: any = null;

    // Start live location tracking
    const startLiveLocation = async (vendorId: string) => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Location permission is required for live tracking!");
        return;
      }

      locationSub = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,   // every 5 seconds
          distanceInterval: 5,  // every 5 meters
        },
        (loc) => {
          const payload = {
            vendorId,
            lat: loc.coords.latitude,
            lng: loc.coords.longitude,
            updatedAt: new Date().toISOString(),
          };
          socket.emit("vendor:location:update", payload);
        }
      );
    };

    // Initialize app
    const initApp = async () => {
      if (!permissions.location) {
        if (isMounted) setAppState({ loading: false, initialRouteName: null, permissionNeeded: true, vendorId: null });
        return;
      }

      try {
        const authChecker = new CheckAuthentication();
        await authChecker.authenticate();

        if (!isMounted) return;

        const isLoggedIn = authChecker.isAuthenticated;
        const vendorId = vendor?._id || "vendor123";

        setAppState({
          loading: false,
          initialRouteName: isLoggedIn ? 'home' : 'Onboard',
          permissionNeeded: false,
          vendorId,
        });

        if (isLoggedIn) {
          connectSocket();        // connect socket on login
          startLiveLocation(vendorId);
        }
      } catch (error) {
        console.error('Authentication error:', error);
        if (isMounted) setAppState({ loading: false, initialRouteName: 'Onboard', permissionNeeded: false, vendorId: null });
      }
    };

    initApp();

    return () => {
      isMounted = false;
      if (locationSub) locationSub.remove();
      // ⚠️ Do not disconnect socket here; disconnect only on logout
    };
  }, [permissions.location]);

  // Handle logout
  const handleLogout = async (navigation) => {
    await clearStorage("token")
    await clearStorage("user")
    disconnectSocket(); // disconnect socket safely
    navigation.reset({ index: 0, routes: [{ name: 'login' }] });
  };

  if (appState.loading) return <LoadingSpinner />;
  if (appState.permissionNeeded) return <PermissionsScreen onPermission={permissions} />;

  return (
    <ErrorBoundary>
      <NavigationContainer>
        <BlueacePartnerAppUpdate>
          <Stack.Navigator initialRouteName={appState.initialRouteName || 'Onboard'}>
            <Stack.Screen name="Onboard" options={{ headerShown: false }} component={Onboarding} />
            <Stack.Screen name="login" options={{ headerShown: false }} component={Login} />
            <Stack.Screen name="home" options={{ headerShown: false }}>
              {props => <Home {...props} handleLogout={() => handleLogout(props.navigation)} />}
            </Stack.Screen>
            <Stack.Screen name="New_order" options={{ headerShown: false }} component={New_Order} />
            <Stack.Screen name="details_order" options={{ headerShown: false }} component={DeatilsOrder} />
            <Stack.Screen name="all_member" options={{ headerShown: false }} component={Memeber} />
            <Stack.Screen name="add_member" options={{ headerShown: false }} component={Add_Member} />
            {/* <Stack.Screen name="Profile" options={{ headerShown: false }} component={Profile} /> */}
            <Stack.Screen name="Profile" options={{ headerShown: false }} >
              {props => <Profile {...props} handleLogout={() => handleLogout(props.navigation)} />}
            </Stack.Screen>
            <Stack.Screen name="Edit_Profile" options={{ headerShown: true, title: 'Update Your Profile' }} component={Edit_Profile} />
            <Stack.Screen name="Edit_Time_Slots" options={{ headerShown: true, title: 'Time Slots' }} component={EditTimingSlot} />
            <Stack.Screen name="ongoing_order" options={{ headerShown: false }} component={OngoingOrder} />
            <Stack.Screen name="make-estimated" options={{ headerShown: false }} component={EstimatedBudget} />
            <Stack.Screen name="error-codes" options={{ headerShown: false }} component={ErrorCode} />
            <Stack.Screen name="record-video" options={{ headerShown: false }} component={CameraFunction} />
            <Stack.Screen name="watch_Codes" options={{ headerShown: false }} component={Watch_Codes} />
            <Stack.Screen name="Contact_us" options={{ headerShown: false }} component={Support_tx} />
            <Stack.Screen name="all_completed" options={{ headerShown: false }} component={AllOrder} />
            <Stack.Screen name="see-estimated" options={{ headerShown: false }} component={EstimatedSee} />
            <Stack.Screen name="Legal" options={{ headerShown: true }} component={PrivacyPolicy} />
            <Stack.Screen name="Raise-Ticket" options={{ headerShown: false }} component={RaiseTicket} />
            <Stack.Screen name="Ticket" options={{ headerShown: true }} component={CreateIssue} />
            <Stack.Screen name="SingleTicket" options={{ headerShown: false }} component={SingleTicket} />
          </Stack.Navigator>
        </BlueacePartnerAppUpdate>
      </NavigationContainer>
    </ErrorBoundary>
  );
};

export default App;
