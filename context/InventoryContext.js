import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState } from "react";

const InventoryContext = createContext();
const STORAGE_KEY = "INVENTORY";

export function InventoryProvider({ children }) {
  const [inventory, setInventory] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) setInventory(JSON.parse(saved));
      } catch (e) {
        console.log("Failed to load inventory", e);
      } finally {
        setLoaded(true);
      }
    };

    load();
  }, []);

  useEffect(() => {
    if (!loaded) return;

    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(inventory));
  }, [inventory, loaded]);

  const addItem = (item) => {
    setInventory((prev) =>
      prev.includes(item) ? prev.filter((m) => m !== item) : [...prev, item],
    );
  };

  const isAdded = (item) => inventory.includes(item);

  return (
    <InventoryContext.Provider value={{ inventory, addItem, isAdded }}>
      {children}
    </InventoryContext.Provider>
  );
}

export const useInventory = () => useContext(InventoryContext);
