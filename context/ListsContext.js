import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState } from "react";

const ListContext = createContext()
const STORAGE_KEY = 'GROCERYLIST'

export function ListProvider({ children }) {
  const [lists, setLists] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [tags, setTags] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) setLists(JSON.parse(saved));
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

  const addList = (list_name) => {
    setLists((prev) => [...prev, list_name]);
  };
  const addItem = (list_name, newItem) => {
    setLists((prev) =>
      prev.map((list) =>
        list.name === list_name
        ? { ...list, items: [...list.items, newItem] }
        : list
      )
    );
  };
  const removeList = (list_name) => {
    setLists((prev) =>
      prev.filter((l) => l.name !== list_name)
    );
  };
  const removeItem = (list_name, item) => {
    console.log("Clicked item:", item);
    
    setLists((prev) =>
      prev.map((list) => {
        if (list.name === list_name) {
          console.log("Items in this list:", list.items);
        }
        
        return list.name === list_name
        ? {
          ...list,
          items: list.items.filter((ing) => {
            console.log("Comparing:", ing, "to", item);
            return ing.ingredient.name !== item.ingredient.name;
          }),
        }
        : list;
      })
    );
  };

  const toggleItem = (listName, index) => {
    setLists((prev) =>
      prev.map((list) =>
        list.name === listName
          ? {
              ...list,
              items: list.items.map((item, i) =>
                i === index
                  ? { ...item, isChecked: !item.isChecked }
                  : item
              ),
            }
        : list
      )
    );
  };

  return (
    <ListContext.Provider value={{ lists, addList, addItem, removeItem, removeList, toggleItem}}>
      {children}
    </ListContext.Provider>
  );
}

export const useList = () => useContext(ListContext);
