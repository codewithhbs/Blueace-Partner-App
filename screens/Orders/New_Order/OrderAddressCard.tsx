import { View, Text, StyleSheet, Animated } from 'react-native';
import React, { useEffect } from 'react';
import { MapPin, Landmark } from 'lucide-react-native';
import { colors } from '~/colors/Colors';

interface OrderAddressCardProps {
  houseNo: string;
  address: string;
  nearByLandMark: string;
  index: number;
}

const OrderAddressCard = ({ houseNo, address, nearByLandMark, index }: OrderAddressCardProps) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      delay: index * 150,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.header}>
        <MapPin size={20} color={colors.primary} />
        <Text style={styles.title}>Delivery Address</Text>
      </View>
      <View style={styles.addressContent}>
        <Text style={styles.addressText}>
          {houseNo}, {address}
        </Text>
        <View style={styles.landmarkContainer}>
          <Landmark size={16} color={colors.text} />
          <Text style={styles.landmarkText}>{nearByLandMark || "Landmark"}</Text>
        </View>
      </View>
    </Animated.View>
  );
};

export default OrderAddressCard;
const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    // borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    // shadowColor: colors.shadow,
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.1,
    // shadowRadius: 4,
    // elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginLeft: 8,
  },
  addressContent: {
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
  },
  addressText: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 8,
  },
  landmarkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  landmarkText: {
    marginLeft: 8,
    color: colors.placeholder,
    fontSize: 14,
  },
});