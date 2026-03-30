import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState } from "react";

const RecipesContext = createContext();
const STORAGE_KEY = "RECIPES";

export function RecipesProvider({ children }) {
  const [recipes, setRecipes] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) setRecipes(JSON.parse(saved));
      } catch (e) {
        console.log("Failed to load recipes", e);
      } finally {
        setLoaded(true);
      }
    };

    load();
  }, []);

  useEffect(() => {
    if (!loaded) return;

    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
  }, [recipes, loaded]);

  return (
    <RecipesContext.Provider value={{ recipes, setRecipes }}>
      {children}
    </RecipesContext.Provider>
  );
}

export const useRecipes = () => useContext(RecipesContext);
