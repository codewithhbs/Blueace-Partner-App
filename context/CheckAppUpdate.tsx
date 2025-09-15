import React, { useEffect, useState, ReactNode } from 'react';
import {
  View,
  Text,
  Alert,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import * as Updates from 'expo-updates';

const { width } = Dimensions.get('window');

interface Props {
  children: ReactNode;
}

const BlueacePartnerAppUpdate: React.FC<Props> = ({ children }) => {
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!__DEV__) {
      checkForOTAUpdates();
    } else {
      console.log("Skipping OTA update check in development mode.");
    }
  }, []);

  const checkForOTAUpdates = async () => {
    try {
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        setShowUpdateModal(true);
      }
    } catch (error) {
      console.error('Failed to check for updates:', error);
    }
  };

  const handleUpdateNow = async () => {
    setIsUpdating(true);
    try {
      await Updates.fetchUpdateAsync();
      Alert.alert(
        'Update Complete',
        'Blueace Partner will now restart to apply the update.',
        [
          {
            text: 'Restart Now',
            onPress: async () => {
              await Updates.reloadAsync();
            }
          }
        ]
      );
    } catch (error) {
      console.error('Update failed:', error);
      setIsUpdating(false);
      Alert.alert('Update Failed', 'Something went wrong. Please try again.');
    }
  };

  const handleUpdateLater = () => {
    setShowUpdateModal(false);
  };

  return (
    <View style={{ flex: 1 }}>
      {children}

      <Modal
        visible={showUpdateModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowUpdateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.iconContainer}>
              <View style={styles.updateIcon}>
                <Text style={styles.iconText}>↗</Text>
              </View>
            </View>

            <Text style={styles.title}>Update Available</Text>
            <Text style={styles.subtitle}>New features are ready for Blueace Partner</Text>

            <View style={styles.featuresContainer}>
              <Text style={styles.featureText}>• Enhanced performance</Text>
              <Text style={styles.featureText}>• Bug fixes & stability</Text>
            </View>

            <Text style={styles.description}>
              Update now to enjoy the latest improvements and features.
            </Text>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.updateButton}
                onPress={handleUpdateNow}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator color="#fff" size="small" />
                    <Text style={styles.updateButtonText}> Updating...</Text>
                  </View>
                ) : (
                  <Text style={styles.updateButtonText}>Update Now</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.laterButton}
                onPress={handleUpdateLater}
                disabled={isUpdating}
              >
                <Text style={styles.laterButtonText}>Later</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContent: {
    width: width * 0.85,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center'
  },
  iconContainer: {
    marginBottom: 10
  },
  updateIcon: {
    backgroundColor: '#0d6efd',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center'
  },
  iconText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold'
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 10,
    marginBottom: 5
  },
  subtitle: {
    fontSize: 14,
    color: '#555',
    marginBottom: 10,
    textAlign: 'center'
  },
  featuresContainer: {
    alignItems: 'flex-start',
    width: '100%',
    marginVertical: 10
  },
  featureText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 3
  },
  description: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%'
  },
  updateButton: {
    flex: 1,
    backgroundColor: '#0d6efd',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginRight: 10
  },
  updateButtonText: {
    color: '#fff',
    fontWeight: '600'
  },
  laterButton: {
    flex: 1,
    backgroundColor: '#ccc',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center'
  },
  laterButtonText: {
    color: '#333',
    fontWeight: '600'
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  }
});

export default BlueacePartnerAppUpdate;
