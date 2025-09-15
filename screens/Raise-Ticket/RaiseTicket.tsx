import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  Image,
  StatusBar,
  Animated,
  ScrollView
} from 'react-native';
import React, { useCallback, useEffect, useState, useRef } from 'react';
import { FetchUserDetails } from '../../utils/api/Api';
import { get_my_tickets } from '../../utils/api/Ticket.Api';
import { Ionicons, MaterialIcons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

const StatusBadge = ({ status }) => {
  let color, bgColor, icon;

  switch (status.toLowerCase()) {
    case 'open':
      color = '#00875A';
      bgColor = '#E3FCEF';
      icon = 'clock-outline';
      break;
    case 'in progress':
      color = '#0052CC';
      bgColor = '#DEEBFF';
      icon = 'progress-clock';
      break;
    case 'resolved':
      color = '#006644';
      bgColor = '#E3FCEF';
      icon = 'check-circle-outline';
      break;
    case 'closed':
      color = '#505F79';
      bgColor = '#F4F5F7';
      icon = 'close-circle-outline';
      break;
    default:
      color = '#FF8B00';
      bgColor = '#FFFAE6';
      icon = 'alert-circle-outline';
  }

  return (
    <View style={[styles.statusBadge, { backgroundColor: bgColor }]}>
      <MaterialCommunityIcons name={icon} size={14} color={color} />
      <Text style={[styles.statusText, { color }]}>{status.toUpperCase()}</Text>
    </View>
  );
};

const PriorityIndicator = ({ priority }) => {
  let color, icon;

  switch (priority.toLowerCase()) {
    case 'high':
      color = '#DE350B';
      icon = 'arrow-up';
      break;
    case 'medium':
      color = '#FF8B00';
      icon = 'density-medium';
      break;
    case 'low':
      color = '#0052CC';
      icon = 'arrow-down';
      break;
    default:
      color = '#505F79';
      icon = 'minus';
  }

  return (
    <View style={styles.priorityContainer}>
      <MaterialIcons name={icon} size={14} color={color} />
      <Text style={[styles.priorityText, { color }]}>{priority}</Text>
    </View>
  );
};

export default function RaiseTicket() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();
  const scrollY = useRef(new Animated.Value(0)).current;

  const fetch_my_tickets = useCallback(async () => {
    try {
      setLoading(true);
      const user = await FetchUserDetails();
      if (!user?._id) throw new Error('Please Login Now');
      const res = await get_my_tickets(user?._id);
      setTickets(res.data || []);
    } catch (err) {
      console.error('Error:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetch_my_tickets();
    setRefreshing(false);
  };

  // Refresh tickets when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetch_my_tickets();
    }, [fetch_my_tickets])
  );

  useEffect(() => {
    fetch_my_tickets();
  }, [fetch_my_tickets]);

  const handleRaiseTicket = () => {
    navigation.navigate("Ticket");
  };

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 60],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 60],
    outputRange: [120, 0],
    extrapolate: 'clamp',
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const renderTicketItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('SingleTicket', { id: item._id })}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.subjectContainer}>
          <Text style={styles.subject} numberOfLines={1}>{item.subject}</Text>
          <Text style={styles.ticketId}>#{item.ticket}</Text>
        </View>
        <StatusBadge status={item.status} />
      </View>

      <View style={styles.messageContainer}>
        <Text style={styles.message} numberOfLines={2}>{item.message}</Text>
      </View>

      <View style={styles.cardFooter}>
        <PriorityIndicator priority={item.priority} />

        <View style={styles.dateContainer}>
          <MaterialCommunityIcons name="calendar-clock" size={14} color="#6B778C" />
          <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
        </View>

        {item.adminResponse && item.adminResponse.length > 0 && (
          <View style={styles.responseIndicator}>
            <MaterialIcons name="comment" size={14} color="#0052CC" />
            <Text style={styles.responseText}>{item.adminResponse.length}</Text>
          </View>
        )}
      </View>

      {item.attachments && item.attachments.length > 0 && (
        <View style={styles.attachmentIndicator}>
          <MaterialIcons name="attach-file" size={14} color="#6B778C" />
          <Text style={styles.attachmentText}>{item.attachments.length}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Image
        source={{ uri: 'https://cdn-icons-png.flaticon.com/512/6598/6598519.png' }}
        style={styles.emptyImage}
      />
      <Text style={styles.emptyTitle}>No Tickets Found</Text>
      <Text style={styles.emptyText}>
        You haven't raised any support tickets yet. Tap the button below to create your first ticket.
      </Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={handleRaiseTicket}
      >
        <Text style={styles.emptyButtonText}>Raise New Ticket</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Animated Header */}
      <Animated.View style={[styles.header]}>
        <Text style={styles.headerTitle}>Support Tickets</Text>
        <Text style={styles.headerSubtitle}>
          View and manage your support requests
        </Text>
      </Animated.View>

      {loading && !refreshing ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#0052CC" />
          <Text style={styles.loaderText}>Loading your tickets...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#0052CC']}
              tintColor="#0052CC"
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {tickets && tickets.length > 0 ? (
            tickets.map((item) => (
              <View key={item._id} style={styles.ticketItem}>
                {renderTicketItem({ item })}
              </View>
            ))
          ) : (
            renderEmptyList()
          )}
        </ScrollView>

      )}

      <TouchableOpacity
        style={styles.floatingButton}
        onPress={handleRaiseTicket}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#0065FF', '#0052CC']}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Ionicons name="add" size={24} color="#fff" />
          <Text style={styles.buttonText}>New Ticket</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F5F7',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    justifyContent: 'flex-end',
    borderBottomWidth: 1,
    borderBottomColor: '#E9E9E9',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#172B4D',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B778C',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E9E9E9',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  subjectContainer: {
    flex: 1,
    marginRight: 10,
  },
  subject: {
    fontSize: 16,
    fontWeight: '600',
    color: '#172B4D',
    marginBottom: 2,
  },
  ticketId: {
    fontSize: 12,
    color: '#6B778C',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
  },
  messageContainer: {
    marginBottom: 12,
  },
  message: {
    fontSize: 14,
    color: '#505F79',
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  date: {
    fontSize: 12,
    color: '#6B778C',
    marginLeft: 4,
  },
  responseIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DEEBFF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  responseText: {
    fontSize: 12,
    color: '#0052CC',
    fontWeight: '500',
    marginLeft: 2,
  },
  attachmentIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  attachmentText: {
    fontSize: 12,
    color: '#6B778C',
    marginLeft: 2,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    borderRadius: 28,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 28,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B778C',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    marginTop: 40,
  },
  emptyImage: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#172B4D',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B778C',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  emptyButton: {
    backgroundColor: '#0052CC',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 4,
  },
  emptyButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});