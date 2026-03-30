import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState } from "react";

const InventoryContext = createContext();
const STORAGE_KEY = "INVENTORY";

function normalizeIngredientName(name) {
  return (name || "").trim().toLowerCase();
}

const UNIT_ALIASES = {
  cup: "cup",
  cups: "cup",
  c: "cup",
  tablespoon: "tbsp",
  tablespoons: "tbsp",
  tbsp: "tbsp",
  tbsps: "tbsp",
  tbl: "tbsp",
  tbls: "tbsp",
  teaspoon: "tsp",
  teaspoons: "tsp",
  tsp: "tsp",
  tsps: "tsp",
  ounce: "oz",
  ounces: "oz",
  oz: "oz",
  pound: "lb",
  pounds: "lb",
  lb: "lb",
  lbs: "lb",
  gram: "g",
  grams: "g",
  g: "g",
  kg: "kg",
  kilogram: "kg",
  kilograms: "kg",
  ml: "ml",
  milliliter: "ml",
  milliliters: "ml",
  l: "l",
  liter: "l",
  liters: "l",
};

function normalizeUnit(unitRaw) {
  const t = (unitRaw || "").trim().toLowerCase().replace(/\./g, "");
  if (!t) return "";
  return UNIT_ALIASES[t] || t;
}

function parseQuantityString(qtyString) {
  if (qtyString == null) return { value: null, unitNorm: "", rawRest: "" };

  const s = String(qtyString).trim();
  if (!s) return { value: null, unitNorm: "", rawRest: "" };

  let value = null;
  let consumed = 0;

  // 1 1/2
  let m = s.match(/^(\d+)\s+(\d+)\s*\/\s*(\d+)/);
  if (m) {
    value = parseInt(m[1], 10) + parseInt(m[2], 10) / parseInt(m[3], 10);
    consumed = m[0].length;
  } else {
    // 1/2
    m = s.match(/^(\d+)\s*\/\s*(\d+)/);
    if (m) {
      const den = parseInt(m[2], 10);
      value = den !== 0 ? parseInt(m[1], 10) / den : null;
      consumed = m[0].length;
    } else {
      // 1 or 1.25
      m = s.match(/^(\d+\.\d+|\d+)/);
      if (m) {
        value = parseFloat(m[1]);
        consumed = m[0].length;
      }
    }
  }

  if (value == null || !Number.isFinite(value)) {
    return { value: null, unitNorm: "", rawRest: s };
  }

  const rawRest = s.slice(consumed).trim();
  const unitNorm = normalizeUnit(rawRest);

  return { value, unitNorm, rawRest };
}

function normalizeUnitKey(unitNorm) {
  return unitNorm && unitNorm.length > 0 ? unitNorm : "__none__";
}

function makeBucketKey(nameNorm, unitNorm) {
  return nameNorm + "\0" + normalizeUnitKey(unitNorm);
}

function formatAmountForDisplay(n) {
  const r = Math.round(n * 10000) / 10000;
  if (Math.abs(r - Math.round(r)) < 1e-6) return String(Math.round(r));
  return String(parseFloat(r.toFixed(4)));
}

const EPS = 1e-6;

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
          : loc,
      ),
    );
  };

  const removeLoc = (location_name) => {
    setInventory((prev) => prev.filter((l) => l.name !== location_name));
  };

  const removeIngredient = (locationName, item) => {
    setInventory((prev) =>
      prev.map((loc) =>
        loc.name === locationName
          ? {
              ...loc,
              ingredients: loc.ingredients.filter(
                (ing) => ing.name !== item.name,
              ),
            }
          : loc,
      ),
    );
  };

  // consume only what inventory covered for the recipe.
  // - Only consumes when BOTH recipe + inventory quantities are numeric and units match.
  // - Distributes consumption across locations/entries in order.
  // - Removes ingredient entries that hit ~0.
  const consumeCoveredForRecipe = (recipe) => {
    if (!recipe || !Array.isArray(recipe.ingredients)) return;

    setInventory((prevInv) => {
      // Build totals by (name, unit) from current inventory snapshot
      const totals = new Map();
      for (const loc of prevInv || []) {
        for (const ing of loc.ingredients || []) {
          const nameNorm = normalizeIngredientName(ing?.name);
          if (!nameNorm) continue;

          const parsed = parseQuantityString(ing?.quantity);
          if (parsed.value == null || !Number.isFinite(parsed.value)) continue;

          const key = makeBucketKey(nameNorm, parsed.unitNorm);
          totals.set(key, (totals.get(key) || 0) + parsed.value);
        }
      }

      // apply consumption iteratively per ingredient,
      // carrying forward updated inventory each time.
      let nextInv = prevInv.map((loc) => ({
        ...loc,
        ingredients: Array.isArray(loc.ingredients) ? [...loc.ingredients] : [],
      }));

      for (const rIng of recipe.ingredients) {
        const nameNorm = normalizeIngredientName(rIng?.name);
        if (!nameNorm) continue;

        const rParsed = parseQuantityString(rIng?.quantity);
        if (rParsed.value == null || !Number.isFinite(rParsed.value)) continue;

        const need = rParsed.value;
        if (need <= EPS) continue;

        const key = makeBucketKey(nameNorm, rParsed.unitNorm);
        const have = totals.get(key) || 0;
        const toConsume = Math.min(need, have);

        if (toConsume <= EPS) continue;

        // Consume across locations
        let remaining = toConsume;

        nextInv = nextInv.map((loc) => {
          if (remaining <= EPS) return loc;

          const updated = [];
          for (const invIng of loc.ingredients || []) {
            if (remaining <= EPS) {
              updated.push(invIng);
              continue;
            }

            const invNameNorm = normalizeIngredientName(invIng?.name);
            if (invNameNorm !== nameNorm) {
              updated.push(invIng);
              continue;
            }

            const invParsed = parseQuantityString(invIng?.quantity);
            if (invParsed.value == null || !Number.isFinite(invParsed.value)) {
              // Can't consume from non-numeric inventory entry
              updated.push(invIng);
              continue;
            }

            // Units must match to consume
            if (
              normalizeUnitKey(invParsed.unitNorm) !==
              normalizeUnitKey(rParsed.unitNorm)
            ) {
              updated.push(invIng);
              continue;
            }

            const take = Math.min(invParsed.value, remaining);
            const newVal = invParsed.value - take;
            remaining -= take;

            if (newVal <= EPS) {
              // drop ingredient (consumed fully)
              continue;
            }

            const qtyString = invParsed.unitNorm
              ? `${formatAmountForDisplay(newVal)} ${invParsed.unitNorm}`
              : `${formatAmountForDisplay(newVal)}`;

            updated.push({ ...invIng, quantity: qtyString });
          }

          return { ...loc, ingredients: updated };
        });

        // Update totals so later recipe ingredients consume correctly
        totals.set(key, Math.max(0, have - toConsume));
      }

      return nextInv;
    });
  };

  return (
    <InventoryContext.Provider
      value={{
        inventory,
        addLocation,
        addIngredient,
        removeLoc,
        removeIngredient,
        consumeCoveredForRecipe,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
}

export const useInventory = () => useContext(InventoryContext);
