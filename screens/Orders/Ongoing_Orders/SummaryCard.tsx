import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '~/colors/Colors';

interface SummaryCardProps {
  subtotal: number;
  gst: number;
  total: number;
}

const SummaryCard = ({ subtotal, gst, total }: SummaryCardProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.label}>Subtotal</Text>
        <Text style={styles.value}>₹{subtotal.toFixed(2)}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>GST (18%)</Text>
        <Text style={styles.value}>₹{gst.toFixed(2)}</Text>
      </View>
      <View style={[styles.row, styles.totalRow]}>
        <Text style={styles.totalLabel}>Total Amount</Text>
        <Text style={styles.totalAmount}>₹{total.toFixed(2)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  label: {
    fontSize: 16,
    color: colors.text,
  },
  value: {
    fontSize: 16,
    color: colors.text,
    fontWeight: 'bold',
  },
  totalLabel: {
    fontSize: 18,
    color: colors.primary,
    fontWeight: 'bold',
  },
  totalAmount: {
    fontSize: 24,
    color: colors.primary,
    fontWeight: 'bold',
  },
});

export default SummaryCard;