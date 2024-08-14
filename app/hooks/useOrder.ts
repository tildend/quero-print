import { useState, useEffect } from "react";

export const useOrderID = () => {
  const [orderID, setOrderID] = useState<string>('');

  const setNewOrderID = () => {
    const newOrderId = Date.now().toString() + Math.random().toString(36).substring(2, 34);
    window.localStorage.setItem('orderID', newOrderId);
    setOrderID(newOrderId);
  }

  const clearOrderID = () => {
    window.localStorage.removeItem('orderID');
    setOrderID('');
  }

  useEffect(() => {
    const existingOrderID = window.localStorage.getItem('orderID');
    if (existingOrderID) {
      setOrderID(existingOrderID);
    } else {
      setNewOrderID();
    }
  }, []);

  return {orderID, setNewOrderID, clearOrderID};
}