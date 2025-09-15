import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Linking,
  StatusBar,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { MaterialIcons, MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { get_single_tickets } from '~/utils/api/Ticket.Api';

const StatusBadge = ({ status }) => {
  let color, bgColor, icon;
  
  switch(status.toLowerCase()) {
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
      <MaterialCommunityIcons name={icon} size={16} color={color} />
      <Text style={[styles.statusText, { color }]}>{status.toUpperCase()}</Text>
    </View>
  );
};

const PriorityBadge = ({ priority }) => {
  let color, bgColor, icon;
  
  switch(priority.toLowerCase()) {
    case 'high':
      color = '#DE350B';
      bgColor = '#FFEBE6';
      icon = 'arrow-up';
      break;
    case 'medium':
      color = '#FF8B00';
      bgColor = '#FFFAE6';
      icon = 'minus';
      break;
    case 'low':
      color = '#0052CC';
      bgColor = '#DEEBFF';
      icon = 'arrow-down';
      break;
    default:
      color = '#505F79';
      bgColor = '#F4F5F7';
      icon = 'minus';
  }
  
  return (
    <View style={[styles.priorityBadge, { backgroundColor: bgColor }]}>
      <MaterialIcons name={icon} size={16} color={color} />
      <Text style={[styles.priorityText, { color }]}>{priority}</Text>
    </View>
  );
};

export default function SingleTicket() {
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route.params || {};
  console.log("id",id)

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        setLoading(true);
        const response = await get_single_tickets(id);
        setTicket(response.data);
      } catch (err) {
        console.error('Error fetching ticket:', err);
        setError('Failed to load ticket details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTicket();
    }
  }, [id]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const openAttachment = (url) => {
    Linking.openURL(url).catch(err => {
      console.error('Error opening attachment:', err);
      alert('Could not open the attachment');
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0052CC" />
        <Text style={styles.loadingText}>Loading ticket details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="error-outline" size={60} color="#DE350B" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.errorButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.errorButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!ticket) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="search-off" size={60} color="#6B778C" />
        <Text style={styles.errorText}>Ticket not found</Text>
        <TouchableOpacity 
          style={styles.errorButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.errorButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#172B4D" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ticket Details</Text>
        <View style={styles.headerRight} />
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Ticket Header */}
        <View style={styles.ticketHeader}>
          <Text style={styles.ticketSubject}>{ticket.subject}</Text>
          <View style={styles.ticketMeta}>
            <View style={styles.ticketId}>
              <MaterialIcons name="confirmation-number" size={16} color="#6B778C" />
              <Text style={styles.ticketIdText}>{ticket.ticket}</Text>
            </View>
            <StatusBadge status={ticket.status} />
          </View>
        </View>
        
        {/* Ticket Info */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Priority:</Text>
            <PriorityBadge priority={ticket.priority} />
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Created:</Text>
            <Text style={styles.infoValue}>{formatDate(ticket.createdAt)}</Text>
          </View>
          
          {ticket.order_id && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Related Order:</Text>
              <Text style={styles.infoValue}>#{ticket.order_id._id.substring(0, 8)}</Text>
            </View>
          )}
        </View>
        
        {/* Ticket Message */}
        <View style={styles.messageCard}>
          <Text style={styles.sectionTitle}>Your Message</Text>
          <Text style={styles.messageText}>{ticket.message}</Text>
          
          {/* Attachments */}
          {ticket.attachments && ticket.attachments.length > 0 && (
            <View style={styles.attachmentsContainer}>
              <Text style={styles.attachmentsTitle}>Attachments</Text>
              <View style={styles.attachmentsList}>
                {ticket.attachments.map((attachment, index) => (
                  <TouchableOpacity 
                    key={index}
                    style={styles.attachmentItem}
                    onPress={() => openAttachment(attachment.url)}
                  >
                    <View style={styles.attachmentPreview}>
                      {attachment.url.match(/\.(jpeg|jpg|png|gif)$/i) ? (
                        <Image 
                          source={{ uri: attachment.url }}
                          style={styles.attachmentImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <MaterialIcons name="insert-drive-file" size={24} color="#0052CC" />
                      )}
                    </View>
                    <Text style={styles.attachmentName} numberOfLines={1}>
                      {attachment.public_id.split('_').pop()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>
        
        {/* Admin Responses */}
        {ticket.adminResponse && ticket.adminResponse.length > 0 && (
          <View style={styles.responsesCard}>
            <Text style={styles.sectionTitle}>Support Responses</Text>
            {ticket.adminResponse.map((response, index) => (
              <View key={index} style={styles.responseItem}>
                <View style={styles.responseHeader}>
                  <View style={styles.adminBadge}>
                    <MaterialIcons name="support-agent" size={14} color="#FFFFFF" />
                    <Text style={styles.adminText}>Support Team</Text>
                  </View>
                  <Text style={styles.responseDate}>{formatDate(response.respondedAt)}</Text>
                </View>
                <Text style={styles.responseMessage}>{response.message}</Text>
              </View>
            ))}
          </View>
        )}
        
        {/* Order Details */}
        {ticket.order_id && (
          <View style={styles.orderCard}>
            <Text style={styles.sectionTitle}>Related Order Details</Text>
            
            <View style={styles.orderInfo}>
              <View style={styles.orderRow}>
                <Text style={styles.orderLabel}>Service:</Text>
                <Text style={styles.orderValue}>{ticket.order_id.serviceType}</Text>
              </View>
              
              <View style={styles.orderRow}>
                <Text style={styles.orderLabel}>Status:</Text>
                <View style={[styles.orderStatusBadge, { 
                  backgroundColor: ticket.order_id.OrderStatus === 'Vendor Assigned' ? '#E3FCEF' : '#DEEBFF'
                }]}>
                  <Text style={[styles.orderStatusText, { 
                    color: ticket.order_id.OrderStatus === 'Vendor Assigned' ? '#00875A' : '#0052CC'
                  }]}>{ticket.order_id.OrderStatus}</Text>
                </View>
              </View>
              
              <View style={styles.orderRow}>
                <Text style={styles.orderLabel}>Payment:</Text>
                <View style={[styles.paymentStatusBadge, { 
                  backgroundColor: ticket.order_id.PaymentStatus === 'completed' ? '#E3FCEF' : '#FFFAE6'
                }]}>
                  <Text style={[styles.paymentStatusText, { 
                    color: ticket.order_id.PaymentStatus === 'completed' ? '#00875A' : '#FF8B00'
                  }]}>{ticket.order_id.PaymentStatus}</Text>
                </View>
              </View>
              
              {ticket.order_id.workingDate && (
                <View style={styles.orderRow}>
                  <Text style={styles.orderLabel}>Scheduled:</Text>
                  <Text style={styles.orderValue}>
                    {new Date(ticket.order_id.workingDate).toLocaleDateString('en-US', { 
                      day: 'numeric', 
                      month: 'short', 
                      year: 'numeric'
                    })} ({ticket.order_id.workingTime})
                  </Text>
                </View>
              )}
              
              <View style={styles.orderRow}>
                <Text style={styles.orderLabel}>Address:</Text>
                <Text style={styles.orderValue} numberOfLines={2}>
                  {ticket.order_id.houseNo}, {ticket.order_id.address}
                </Text>
              </View>
            </View>
            
            {/* Order Videos */}
            <View style={styles.orderVideos}>
              {ticket.order_id.beforeWorkVideo && (
                <TouchableOpacity 
                  style={styles.videoItem}
                  onPress={() => openAttachment(ticket.order_id.beforeWorkVideo.url)}
                >
                  <View style={styles.videoIcon}>
                    <MaterialIcons name="videocam" size={14} color="#FFFFFF" />
                  </View>
                  <Text style={styles.videoText}>Before Work Video</Text>
                </TouchableOpacity>
              )}
              
              {ticket.order_id.afterWorkVideo && (
                <TouchableOpacity 
                  style={styles.videoItem}
                  onPress={() => openAttachment(ticket.order_id.afterWorkVideo.url)}
                >
                  <View style={styles.videoIcon}>
                    <MaterialIcons name="videocam" size={14} color="#FFFFFF" />
                  </View>
                  <Text style={styles.videoText}>After Work Video</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Need more help? Contact our support team
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F5F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E9E9E9',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#172B4D',
  },
  headerRight: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  ticketHeader: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E9E9E9',
  },
  ticketSubject: {
    fontSize: 20,
    fontWeight: '600',
    color: '#172B4D',
    marginBottom: 12,
  },
  ticketMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ticketId: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ticketIdText: {
    fontSize: 14,
    color: '#6B778C',
    marginLeft: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginTop: 12,
    marginHorizontal: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B778C',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#172B4D',
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  messageCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginTop: 12,
    marginHorizontal: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#172B4D',
    marginBottom: 12,
  },
  messageText: {
    fontSize: 14,
    color: '#172B4D',
    lineHeight: 20,
  },
  attachmentsContainer: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E9E9E9',
    paddingTop: 16,
  },
  attachmentsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#172B4D',
    marginBottom: 12,
  },
  attachmentsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  attachmentItem: {
    width: '30%',
    marginRight: '3%',
    marginBottom: 12,
  },
  attachmentPreview: {
    width: '100%',
    height: 80,
    backgroundColor: '#F4F5F7',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    overflow: 'hidden',
  },
  attachmentImage: {
    width: '100%',
    height: '100%',
  },
  attachmentName: {
    fontSize: 12,
    color: '#172B4D',
    textAlign: 'center',
  },
  responsesCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginTop: 12,
    marginHorizontal: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  responseItem: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#F4F5F7',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#0052CC',
  },
  responseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0052CC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  adminText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 4,
  },
  responseDate: {
    fontSize: 12,
    color: '#6B778C',
  },
  responseMessage: {
    fontSize: 14,
    color: '#172B4D',
    lineHeight: 20,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginTop: 12,
    marginHorizontal: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 16,
  },
  orderInfo: {
    marginBottom: 16,
  },
  orderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderLabel: {
    width: 80,
    fontSize: 14,
    color: '#6B778C',
    fontWeight: '500',
  },
  orderValue: {
    flex: 1,
    fontSize: 14,
    color: '#172B4D',
  },
  orderStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  orderStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  paymentStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  paymentStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderVideos: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#E9E9E9',
    paddingTop: 16,
  },
  videoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F5F7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  videoIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0052CC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  videoText: {
    fontSize: 10,
    color: '#172B4D',
    fontWeight: '500',
  },
  footer: {
    padding: 16,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#6B778C',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4F5F7',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B778C',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4F5F7',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#172B4D',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  errorButton: {
    backgroundColor: '#0052CC',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 4,
  },
  errorButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});