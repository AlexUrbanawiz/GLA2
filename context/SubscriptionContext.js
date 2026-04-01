import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState } from "react";

const SubscriptionContext = createContext()
const STORAGE_KEY = 'SUBSCRIPTION'

export function SubscriptionProvider({ children }) {
  const [weeklyItems, setWeeklyItems] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) setWeeklyItems(JSON.parse(saved));
      } catch (e) {
        console.log("Failed to load lists", e);
      } finally {
        setLoaded(true);
      }
    };

    load();
  }, []);

  useEffect(() => {
    if (!loaded) return;

    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(weeklyItems));
  }, [weeklyItems, loaded]);

    const addSubItem = (item) => {
        setWeeklyItems((prev) => [...prev, item]);
    };
    const removeSubItem = (item) => {
        console.log("Clicked item:", item);

        setWeeklyItems((prev) =>
            prev.filter((i) => i.ingredient.name !== item.ingredient.name)
        );
    };

  return (
    <SubscriptionContext.Provider value={{ weeklyItems, addSubItem, removeSubItem}}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export const useSubscriptions = () => useContext(SubscriptionContext);
