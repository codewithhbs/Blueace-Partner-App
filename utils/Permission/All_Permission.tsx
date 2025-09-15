import { useEffect, useState } from 'react';
import * as Location from 'expo-location';


type PermissionsStatus = {
    location: boolean;
    latitude: number | null;
    longitude: number | null;
    reCall: () => void;
};

export const usePermissions = () => {
    const [permissions, setPermissions] = useState<PermissionsStatus>({
        location: false,
        longitude: null,
        latitude: null,
        reCall: () => {},
    });

    const requestPermission = async (requestFunc: () => Promise<boolean>) => {
        try {
            return await requestFunc();
        } catch (error) {
            console.error('Permission request failed:', error);
            return false;
        }
    };

    const requestLocationPermission = () => Location.requestForegroundPermissionsAsync().then(res => res.status === 'granted');
   

    const requestAllPermissions = async () => {
        const locationStatus = await requestPermission(requestLocationPermission);
    

        let location = locationStatus ? await Location.getCurrentPositionAsync() : null;

        setPermissions(prev => ({
            ...prev,
            location: locationStatus,
            latitude: location ? location.coords.latitude : null,
            longitude: location ? location.coords.longitude : null,
       
            reCall: requestAllPermissions,
        }));
    };

    useEffect(() => {
        requestAllPermissions();
    }, []);

    return permissions;
};

export default usePermissions;
