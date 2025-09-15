import React, { useEffect, useState } from 'react';
import { View, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { FetchUserDetails, handleChangeReadyToWork } from '~/utils/api/Api';
import { colors } from '~/colors/Colors';
import PartnerDetail from './PartnerDetail';
import Headers from '../Header/Header';

export default function PartnerHead() {
    const [status, setStatus] = useState<boolean>(false);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [toggling, setToggling] = useState<boolean>(false);
    const [refreshing, setRefreshing] = useState(false);

    const fetchStatus = async () => {
        try {
            setLoading(true);
            const userDetails = await FetchUserDetails();
            if (userDetails) {
                setStatus(userDetails.readyToWork || false);
                setUserData(userDetails);
            }
        } catch (error) {
            console.error('Error fetching status:', error);
        } finally {
            setLoading(false);
        }
    };

    const statusToggle = async () => {
        try {
            setToggling(true);
            const data = await handleChangeReadyToWork(!status);
            setStatus(data.data?.readyToWork);
        } catch (error) {
            console.error('Error toggling status:', error);
        } finally {
            setToggling(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchStatus();
        setRefreshing(false);
    };

    useEffect(() => {
        fetchStatus();
    }, []);

    return (
        <>
            <Headers />
            <ScrollView
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {loading ? (
                    <ActivityIndicator size="large" color={colors.primary} />
                ) : (
                    userData && <PartnerDetail  user={userData} />
                )}
            </ScrollView>
        </>
    );
}
