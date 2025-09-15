import React from 'react';
import { View, StyleSheet } from 'react-native';
import Input from '~/components/form/Input';


interface ItemRowProps {
  index: number;
  item: {
    name: string;
    quantity: number;
    price: number;
    Discount: number;
  };
  onChange: (index: number, field: string, value: string) => void;
}

const ItemRow = ({ index, item, onChange }: ItemRowProps) => {
  console.log(item)
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.inputHalf}>
          <Input
            icon="package-variant"
            placeholder="Item Name"
            value={item.name}
            onChangeText={(text) => onChange(index, 'name', text)}
          />
        </View>
        <View style={styles.inputHalf}>
          <Input
            icon="numeric"
            placeholder="Quantity"
            value={item.quantity.toString()}
            keyboardType="numeric"
            onChangeText={(text) => onChange(index, 'quantity', text)}
          />
        </View>
      </View>
      <View style={styles.row}>
        <View style={styles.inputHalf}>
          <Input
            icon="currency-inr"
            placeholder="Price"
            value={item.price.toString()}
            keyboardType="numeric"
            onChangeText={(text) => onChange(index, 'price', text)}
          />
        </View>
        <View style={styles.inputHalf}>
          <Input
            icon="percent"
            placeholder="Discount (%)"
            value={item.Discount.toString()}
            keyboardType="numeric"
            onChangeText={(text) => onChange(index, 'Discount', text)}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  inputHalf: {
    flex: 0.49,
  },
});

export default ItemRow;