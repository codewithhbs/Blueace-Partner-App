export const calculateItemTotal = (price: number, quantity: number, discount: number): number => {
    const itemTotal = price * quantity;
    const discountAmount = (itemTotal * (discount / 100)) || 0;
    return itemTotal - discountAmount;
  };
  
  export const calculateTotals = (items: Array<{ price: number; quantity: number; Discount: number }>) => {
    const subtotal = items.reduce((acc, item) => 
      acc + calculateItemTotal(item.price, item.quantity, item.Discount), 0
    );
    
    const gst = subtotal * 0.18;
    const total = subtotal + gst;
    
    return {
      subtotal,
      gst,
      total: parseFloat(total.toFixed(2))
    };
  };