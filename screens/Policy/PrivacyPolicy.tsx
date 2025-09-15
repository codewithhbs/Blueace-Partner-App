import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Shield, User, CreditCard, Lock, Share2, Cookie, RefreshCw, Mail, Phone } from 'lucide-react-native';

const PrivacyPolicy = () => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Privacy Policy</Text>
      <Text style={styles.intro}>
        At <Text style={styles.bold}>Blueace india Limited</Text>, we value your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, store, and share your information when you interact with our services, including payment gateway transactions.
      </Text>

      {/* Section 1: Information We Collect */}
      <View style={styles.section}>
        <User color="#003873" size={30} />
        <Text style={styles.sectionTitle}>1. Information We Collect</Text>
        <Text style={styles.sectionText}>
          We collect information that you provide to us when you contact us or use our services. This may include personal details such as your name, email address, phone number, and payment information. Additionally, we may collect technical data like your IP address, device information, and browsing history when you visit our website.
        </Text>
      </View>

      {/* Section 2: Use of Information */}
      <View style={styles.section}>
        <RefreshCw color="#003873" size={30} />
        <Text style={styles.sectionTitle}>2. Use of Information</Text>
        <Text style={styles.sectionText}>
          We use the information we collect to provide and improve our services, process payments, communicate with you, and ensure the security of our website. We may use your data to respond to inquiries, offer support, and send marketing communications related to our services.
        </Text>
      </View>

      {/* Section 3: Payment Gateway */}
      <View style={styles.section}>
        <CreditCard color="#003873" size={30} />
        <Text style={styles.sectionTitle}>3. Payment Gateway</Text>
        <Text style={styles.sectionText}>
          For transactions, we use a third-party payment gateway to process payments securely. We do not store your payment information. Instead, your payment details are handled by a trusted payment processor, and we adhere to industry-standard security practices to protect your data.
        </Text>
      </View>

      {/* Section 4: Data Security */}
      <View style={styles.section}>
        <Lock color="#003873" size={30} />
        <Text style={styles.sectionTitle}>4. Data Security</Text>
        <Text style={styles.sectionText}>
          We implement reasonable technical and organizational measures to protect your personal data from unauthorized access, disclosure, or destruction. However, please note that no method of transmission over the internet or electronic storage is entirely secure, and we cannot guarantee its absolute security.
        </Text>
      </View>

      {/* Section 5: Sharing of Information */}
      <View style={styles.section}>
        <Share2 color="#003873" size={30} />
        <Text style={styles.sectionTitle}>5. Sharing of Information</Text>
        <Text style={styles.sectionText}>
          We do not sell or rent your personal data to third parties. However, we may share your information with third-party service providers, including payment processors, who assist us in providing services to you. These parties are obligated to keep your data confidential and use it only for the purpose of providing their services to us.
        </Text>
      </View>

      {/* Section 6: Cookies */}
      <View style={styles.section}>
        <Cookie color="#003873" size={30} />
        <Text style={styles.sectionTitle}>6. Cookies</Text>
        <Text style={styles.sectionText}>
          Our website may use cookies to enhance your experience, analyze website traffic, and provide personalized content. You can control cookie settings through your browser, but please note that some features of the site may not function correctly if cookies are disabled.
        </Text>
      </View>

      {/* Section 7: Your Rights */}
      <View style={styles.section}>
        <Shield color="#003873" size={30} />
        <Text style={styles.sectionTitle}>7. Your Rights</Text>
        <Text style={styles.sectionText}>
          You have the right to access, update, or delete your personal information that we hold. If you wish to exercise any of these rights, please contact us using the details provided on our website. You can also opt out of marketing communications by following the unsubscribe link in our emails.
        </Text>
      </View>

      {/* Section 8: Changes to This Privacy Policy */}
      <View style={styles.section}>
        <RefreshCw color="#003873" size={30} />
        <Text style={styles.sectionTitle}>8. Changes to This Privacy Policy</Text>
        <Text style={styles.sectionText}>
          We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. Any changes will be posted on this page, and the updated policy will take effect immediately upon posting.
        </Text>
      </View>

      {/* Section 9: Contact Us */}
      <View style={styles.section}>
        <Mail color="#003873" size={30} />
        <Text style={styles.sectionTitle}>9. Contact Us</Text>
        <Text style={styles.sectionText}>
          If you have any questions or concerns about this Privacy Policy, or if you would like to exercise your rights regarding your personal data, please contact us at:
        </Text>
        <Text style={styles.contact}>Email: blueaceindia@gmail.com</Text>
        <Text style={styles.contact}>Phone: +91 93115 39090</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#003873',
    marginBottom: 12,
  },
  intro: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
  },
  bold: {
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 20,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#003873',
    marginVertical: 8,
  },
  sectionText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  contact: {
    fontSize: 14,
    color: '#003873',
    marginTop: 4,
  },
});

export default PrivacyPolicy;
