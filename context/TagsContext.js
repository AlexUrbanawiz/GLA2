import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState } from "react";

const TagContext = createContext()
const STORAGE_KEY = 'TAGS'

export function TagProvider({ children }) {
    const [tags, setTags] = useState([]);
    const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) setTags(JSON.parse(saved));
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

    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tags));
  }, [tags, loaded]);

  const addTag = (tag_name) => {
    setTags((prev) => [...prev, tag_name]);
  };
  const removeTag = (tag_name) => {
    setTags((prev) =>
      prev.filter((t) => t.name !== tag_name)
    );
  };

  return (
    <TagContext.Provider value={{tags, addTag, removeTag }}>
      {children}
    </TagContext.Provider>
  );
}

export const useTags = () => useContext(TagContext);
