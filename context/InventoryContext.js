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

  const addLocation = (location) => {
    setInventory((prev) => [...prev, location]);
  };
  const addIngredient = (locationName, ingredient) => {
    setInventory((prev) =>
      prev.map((loc) =>
        loc.name === locationName
          ? { ...loc, ingredients: [...loc.ingredients, ingredient] }
          : loc
      )
    );
  };
  const removeIngredient = (locationName, item) => {
    setInventory((prev) =>
      prev.map((loc) =>
        loc.name === locationName
          ? {
              ...loc,
              ingredients: loc.ingredients.filter(
                (ing) => ing.name !== item.name
              ),
            }
          : loc
      )
    );
  }

  return (
    <InventoryContext.Provider value={{ inventory, addLocation, addIngredient, removeIngredient }}>
      {children}
    </InventoryContext.Provider>
  );
}

export const useInventory = () => useContext(InventoryContext);
