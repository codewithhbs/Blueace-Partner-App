import { View, Text, Image, StyleSheet, Animated } from 'react-native';
import React, { useEffect } from 'react';
import { Package, Calendar, Clock } from 'lucide-react-native';
import { colors } from '~/colors/Colors';

interface OrderServiceCardProps {
  service: {
    serviceImage: { url: string };
    name: string;
  };
  workingDay: string;
  workingTime: string;
  index: number;
}

const OrderServiceCard = ({ service, workingDay, workingTime, index=1 }: OrderServiceCardProps) => {
  const scaleAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      delay: 1 * 100,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
      <Image source={{ uri: service.serviceImage.url }} style={styles.image} />
      <View style={styles.content}>
        <View style={styles.serviceInfo}>
          <Package size={20} color={colors.primary} />
          <Text style={styles.serviceName}>{service.name}</Text>
        </View>
        <View style={styles.timeInfo}>
          <View style={styles.infoRow}>
            <Calendar size={16} color={colors.text} />
            <Text style={styles.infoText}>{workingDay}</Text>
          </View>
          <View style={styles.infoRow}>
            <Clock size={16} color={colors.text} />
            <Text style={styles.infoText}>{workingTime}</Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

export default OrderServiceCard;

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 5,
    marginBottom: 16,
    // shadowColor: colors.shadow,
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.1,
    // shadowRadius: 4,
    // elevation: 1,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  content: {
    padding: 16,
  },
  serviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginLeft: 8,
  },
  timeInfo: {
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoText: {
    marginLeft: 8,
    color: colors.text,
    fontSize: 14,
  },
});