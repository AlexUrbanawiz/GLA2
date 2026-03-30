import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState } from "react";

const ListContext = createContext();
const STORAGE_KEY = "GROCERYLIST";

function normalizeLoadedLists(parsed) {
  if (!Array.isArray(parsed)) return [];
  return parsed
    .map((entry) => {
      // Old format: ["Walmart", "Costco"]
      if (typeof entry === "string") {
        return { name: entry, items: [] };
      }

      // Expected format: [{ name, items }]
      if (entry && typeof entry === "object") {
        const name = typeof entry.name === "string" ? entry.name : "";
        const items = Array.isArray(entry.items) ? entry.items : [];
        if (!name) return null;
        return { ...entry, name, items };
      }

      return null;
    })
    .filter(Boolean);
}

export function ListProvider({ children }) {
  const [lists, setLists] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          const normalized = normalizeLoadedLists(parsed);
          setLists(normalized);
        }
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
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
  }, [lists, loaded]);

  const addList = (listObj) => {
    // Expecting { name, items: [] }
    if (!listObj || typeof listObj !== "object") return;
    if (!listObj.name) return;

    const safe = {
      ...listObj,
      items: Array.isArray(listObj.items) ? listObj.items : [],
    };

    setLists((prev) => [...prev, safe]);
  };

  const addItem = (list_name, newItem) => {
    if (!list_name) return;

    setLists((prev) =>
      prev.map((list) => {
        if (!list || typeof list !== "object") return list;

        if (list.name !== list_name) return list;

        const existingItems = Array.isArray(list.items) ? list.items : [];
        return { ...list, items: [...existingItems, newItem] };
      }),
    );
  };

  const removeList = (list_name) => {
    setLists((prev) => prev.filter((l) => l?.name !== list_name));
  };

  const removeItem = (list_name, item) => {
    setLists((prev) =>
      prev.map((list) => {
        if (list?.name !== list_name) return list;
        const existingItems = Array.isArray(list.items) ? list.items : [];
        return {
          ...list,
          items: existingItems.filter(
            (x) => x?.ingredient?.name !== item?.ingredient?.name,
          ),
        };
      }),
    );
  };

  const toggleItem = (listName, index) => {
    setLists((prev) =>
      prev.map((list) => {
        if (list?.name !== listName) return list;

        const existingItems = Array.isArray(list.items) ? list.items : [];
        return {
          ...list,
          items: existingItems.map((item, i) =>
            i === index ? { ...item, isChecked: !item.isChecked } : item,
          ),
        };
      }),
    );
  };

  return (
    <ListContext.Provider
      value={{ lists, addList, addItem, removeItem, removeList, toggleItem }}
    >
      {children}
    </ListContext.Provider>
  );
}

export const useList = () => useContext(ListContext);
