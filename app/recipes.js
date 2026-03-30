import { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Ingredient from "../classes/ingredient";
import { useInventory } from "../context/InventoryContext";
import { useList } from "../context/ListsContext";
import { useRecipes } from "../context/RecipeContext";

class Recipe {
  constructor(name, ingredients, id = null) {
    this.id = id != null ? id : Date.now();
    this.name = name;
    this.ingredients = ingredients;
  }
}

class ListItem {
  constructor(ingredient, tags) {
    this.tags = tags;
    this.ingredient = ingredient;
    this.isChecked = false;
  }
}

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
  if (qtyString == null) {
    return { value: null, unitNorm: "", rawRest: "" };
  }
  const s = String(qtyString).trim();
  if (!s) return { value: null, unitNorm: "", rawRest: "" };

  let value = null;
  let consumed = 0;

  let m = s.match(/^(\d+)\s+(\d+)\s*\/\s*(\d+)/);
  if (m) {
    value = parseInt(m[1], 10) + parseInt(m[2], 10) / parseInt(m[3], 10);
    consumed = m[0].length;
  } else {
    m = s.match(/^(\d+)\s*\/\s*(\d+)/);
    if (m) {
      const den = parseInt(m[2], 10);
      value = den !== 0 ? parseInt(m[1], 10) / den : null;
      consumed = m[0].length;
    } else {
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

function buildInventoryTotalsByBucket(inventory) {
  const totals = new Map();
  for (const loc of inventory || []) {
    for (const ing of loc.ingredients || []) {
      const nameNorm = normalizeIngredientName(ing.name);
      if (!nameNorm) continue;
      const { value, unitNorm } = parseQuantityString(ing.quantity);
      if (value == null || !Number.isFinite(value)) continue;
      const key = makeBucketKey(nameNorm, unitNorm);
      totals.set(key, (totals.get(key) || 0) + value);
    }
  }
  return totals;
}

function hasInventoryOtherUnitBucket(inventoryTotals, nameNorm, unitNorm) {
  const mine = normalizeUnitKey(unitNorm);
  for (const key of inventoryTotals.keys()) {
    const sep = key.indexOf("\0");
    if (sep === -1) continue;
    const n = key.slice(0, sep);
    const u = key.slice(sep + 1);
    if (n === nameNorm && u !== mine) return true;
  }
  return false;
}

function formatAmountForDisplay(n) {
  const r = Math.round(n * 10000) / 10000;
  if (Math.abs(r - Math.round(r)) < 1e-6) return String(Math.round(r));
  return String(parseFloat(r.toFixed(4)));
}

function buildGroceryQuantityString(remaining, unitNorm, originalRecipeRest) {
  const amt = formatAmountForDisplay(remaining);
  if (unitNorm) {
    const pretty =
      originalRecipeRest && originalRecipeRest.trim()
        ? originalRecipeRest.trim()
        : unitNorm;
    return (amt + " " + pretty).trim();
  }
  return amt;
}

const EPS = 1e-6;

function recipeIngredientIsInInventoryByName(inventory, nameNorm) {
  return (inventory || []).some((loc) =>
    (loc.ingredients || []).some(
      (x) => normalizeIngredientName(x.name) === nameNorm,
    ),
  );
}

function addRecipeToGroceryWithQuantities(
  recipe,
  inventory,
  listName,
  addItem,
) {
  const inventoryTotals = buildInventoryTotalsByBucket(inventory);
  const added = [];
  const fullyCovered = [];

  for (const ing of recipe.ingredients || []) {
    const nameNorm = normalizeIngredientName(ing.name);
    if (!nameNorm) continue;

    const price = ing.price != null ? String(ing.price) : "0";
    const parsed = parseQuantityString(ing.quantity);

    if (parsed.value == null || !Number.isFinite(parsed.value)) {
      const hasName = recipeIngredientIsInInventoryByName(inventory, nameNorm);
      if (hasName) {
        fullyCovered.push(
          ing.name +
            " (recipe quantity not numeric — skipped; check pantry vs recipe)",
        );
      } else {
        addItem(
          listName,
          new ListItem(
            new Ingredient(
              ing.name,
              ing.quantity != null ? String(ing.quantity) : "",
              price,
            ),
            "",
          ),
        );
        added.push(
          ing.name +
            " (" +
            ing.quantity +
            ") [full amount; not comparable to inventory]",
        );
      }
      continue;
    }

    const need = parsed.value;
    const bucketKey = makeBucketKey(nameNorm, parsed.unitNorm);
    const have = inventoryTotals.get(bucketKey) || 0;

    if (
      have <= EPS &&
      need > EPS &&
      hasInventoryOtherUnitBucket(inventoryTotals, nameNorm, parsed.unitNorm)
    ) {
      addItem(
        listName,
        new ListItem(
          new Ingredient(
            ing.name,
            ing.quantity != null ? String(ing.quantity) : "",
            price,
          ),
          "",
        ),
      );
      added.push(
        ing.name +
          " (" +
          ing.quantity +
          ") [inventory uses another unit — full recipe amount; adjust manually]",
      );
      continue;
    }

    const remaining = Math.max(0, need - have);

    if (remaining <= EPS) {
      const u = parsed.unitNorm || "unit";
      fullyCovered.push(
        ing.name +
          " (need " +
          formatAmountForDisplay(need) +
          " " +
          u +
          ", have " +
          formatAmountForDisplay(have) +
          ")",
      );
      continue;
    }

    const qtyLabel = buildGroceryQuantityString(
      remaining,
      parsed.unitNorm,
      parsed.rawRest,
    );

    addItem(
      listName,
      new ListItem(new Ingredient(ing.name, qtyLabel, price), ""),
    );
    added.push(
      ing.name +
        ": +" +
        qtyLabel +
        " (recipe " +
        formatAmountForDisplay(need) +
        ", inventory " +
        formatAmountForDisplay(have) +
        ")",
    );
  }

  return { added, fullyCovered };
}

function MakeRecipe({ onAddIngredient }) {
  const [name, setName] = useState("");
  const [qty, setQty] = useState("");
  const [price, setPrice] = useState("");

  const handleAdd = () => {
    if (name && qty) {
      const newIng = new Ingredient(name, qty, price || "0");
      onAddIngredient(newIng);
      setName("");
      setQty("");
      setPrice("");
    }
  };

  return (
    <View style={styles.inputContainer}>
      <TextInput
        style={styles.input}
        placeholder="Ingredient Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Qty"
        value={qty}
        onChangeText={setQty}
      />
      <TextInput
        style={styles.input}
        placeholder="Price"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
      />
      <Pressable style={styles.addButton} onPress={handleAdd}>
        <Text style={{ color: "white" }}>Confirm Add</Text>
      </Pressable>
    </View>
  );
}

export default function Recipes() {
  const [isAdding, setIsAdding] = useState(false);
  const [showIngForm, setShowIngForm] = useState(false);
  const { recipes, setRecipes } = useRecipes();
  const [recipeName, setRecipeName] = useState("");
  const [ingredientsList, setIngredientsList] = useState([]);
  const [editingRecipeId, setEditingRecipeId] = useState(null);

  const { inventory, consumeCoveredForRecipe } = useInventory();
  const { lists, addItem } = useList();

  const addIngredientToList = (newIng) => {
    setIngredientsList([...ingredientsList, newIng]);
    setShowIngForm(false);
  };

  const startEditing = (recipe) => {
    setRecipeName(recipe.name);
    setIngredientsList(recipe.ingredients);
    setEditingRecipeId(recipe.id);
    setIsAdding(true);
  };

  const deleteIngredient = (indexToDelete) => {
    const filteredList = ingredientsList.filter(
      (_, index) => index !== indexToDelete,
    );
    setIngredientsList(filteredList);
  };

  const deleteRecipe = (idToDelete) => {
    const filteredRecipes = recipes.filter(
      (recipe) => recipe.id !== idToDelete,
    );
    setRecipes(filteredRecipes);
  };

  const handleSaveRecipe = () => {
    if (recipeName !== "" && ingredientsList.length > 0) {
      if (editingRecipeId) {
        const updatedList = recipes.map((r) =>
          r.id === editingRecipeId
            ? new Recipe(recipeName, ingredientsList, editingRecipeId)
            : r,
        );
        setRecipes(updatedList);
      } else {
        const newRecipe = new Recipe(recipeName, ingredientsList);
        setRecipes([...recipes, newRecipe]);
      }

      setIngredientsList([]);
      setRecipeName("");
      setEditingRecipeId(null);
      setIsAdding(false);
    }
  };

  const addRecipeToGroceryList = (recipe) => {
    if (!lists || lists.length === 0) {
      Alert.alert(
        "No grocery list",
        "Create at least one list on the Grocery List screen first.",
      );
      return;
    }

    const finish = (listName) => {
      const { added, fullyCovered } = addRecipeToGroceryWithQuantities(
        recipe,
        inventory,
        listName,
        addItem,
      );

      // consume only what inventory covered.
      consumeCoveredForRecipe(recipe);

      const parts = [];
      if (added.length) {
        parts.push('Added to "' + listName + '":\n' + added.join("\n"));
      }
      if (fullyCovered.length) {
        parts.push(
          "Covered by inventory or skipped:\n" + fullyCovered.join("\n"),
        );
      }
      if (!parts.length) {
        parts.push("Nothing to do for this recipe.");
      }

      Alert.alert("Recipe → grocery", parts.join("\n\n"));
    };

    if (lists.length === 1) {
      finish(lists[0].name);
      return;
    }

    Alert.alert(
      "Which list?",
      'Add adjusted ingredients for "' + recipe.name + '".',
      [
        ...lists.map((l) => ({
          text: l.name,
          onPress: () => finish(l.name),
        })),
        { text: "Cancel", style: "cancel" },
      ],
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {!isAdding && (
        <View style={{ width: "100%" }}>
          <Text style={styles.title}>My Recipe Book</Text>
          {recipes.map((recipe, index) => (
            <View
              key={recipe.id != null ? recipe.id : index}
              style={styles.recipeCard}
            >
              <Pressable onPress={() => startEditing(recipe)}>
                <Text style={styles.recipeTitle}>{recipe.name}</Text>
                <Text>{recipe.ingredients.length} Ingredients</Text>
              </Pressable>
              <Pressable
                style={styles.groceryButton}
                onPress={() => addRecipeToGroceryList(recipe)}
              >
                <Text style={styles.groceryButtonText}>
                  Add missing to grocery list
                </Text>
              </Pressable>
              <Pressable onPress={() => deleteRecipe(recipe.id)}>
                <Text style={{ color: "red" }}>Remove recipe</Text>
              </Pressable>
            </View>
          ))}
          <Pressable
            style={styles.mainButton}
            onPress={() => setIsAdding(true)}
          >
            <Text style={{ color: "white" }}>+ Create New Recipe</Text>
          </Pressable>
        </View>
      )}

      {isAdding && (
        <View style={{ width: "100%" }}>
          <TextInput
            style={styles.input}
            placeholder="Recipe Name (e.g. Pasta)"
            value={recipeName}
            onChangeText={setRecipeName}
          />

          <Text style={styles.subtitle}>Ingredients</Text>
          {ingredientsList.map((ing, index) => (
            <View key={index} style={styles.listItemRow}>
              <Text>
                {ing.name} ({ing.quantity})
              </Text>
              <Pressable onPress={() => deleteIngredient(index)}>
                <Text style={{ color: "red" }}>Remove</Text>
              </Pressable>
            </View>
          ))}

          {showIngForm ? (
            <MakeRecipe onAddIngredient={addIngredientToList} />
          ) : (
            <Pressable
              style={styles.toggleButton}
              onPress={() => setShowIngForm(true)}
            >
              <Text>+ Add Ingredient</Text>
            </Pressable>
          )}

          <View style={{ marginTop: 20 }}>
            <Pressable
              style={[styles.mainButton, { backgroundColor: "blue" }]}
              onPress={handleSaveRecipe}
            >
              <Text style={{ color: "white" }}>Save Entire Recipe</Text>
            </Pressable>
            <Pressable
              style={styles.toggleButton}
              onPress={() => {
                setIsAdding(false);
                setEditingRecipeId(null);
              }}
            >
              <Text style={{ color: "red" }}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 40, alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  subtitle: { fontSize: 18, fontWeight: "600", marginVertical: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
    width: "100%",
  },
  inputContainer: {
    backgroundColor: "#f0f0f0",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: "green",
    padding: 10,
    alignItems: "center",
    borderRadius: 5,
  },
  mainButton: {
    backgroundColor: "black",
    padding: 15,
    alignItems: "center",
    borderRadius: 5,
    marginTop: 10,
  },
  toggleButton: { padding: 10, alignItems: "center" },
  listItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  recipeCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  groceryButton: {
    marginTop: 10,
    backgroundColor: "#2e7d32",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  groceryButtonText: { color: "white", fontWeight: "600" },
  listItemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    width: "100%",
  },
  recipeTitle: { fontWeight: "bold", fontSize: 16 },
});
