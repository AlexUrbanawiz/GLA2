import { Ionicons } from '@expo/vector-icons';
import { useState } from "react";
import {
  Alert,
  FlatList, // styling
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
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

  // styling - Adding these for the styled input form
  const [ingName, setIngName] = useState("");
  const [ingQty, setIngQty] = useState("");
  const [ingPrice, setIngPrice] = useState("");
  // styling

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

  // styling
  const handleAddIngredient = () => {
    if (ingName && ingQty) {
      const newIng = new Ingredient(ingName, ingQty, ingPrice || "0");
      setIngredientsList([...ingredientsList, newIng]);
      setIngName(""); setIngQty(""); setIngPrice("");
    }
  };
  // styling

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

      // Fix 2 (B): consume only what inventory covered (not the missing part).
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

  // styling
  const renderRecipeCard = ({ item }) => (
    <View style={styles.recipeCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.recipeTitle}>{item.name}</Text>
        <Pressable onPress={() => deleteRecipe(item.id)}>
          <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
        </Pressable>
      </View>

      <ScrollView style={styles.ingredientList}>
        {item.ingredients.map((ing, index) => (
          <Text key={index} style={styles.ingredientText}>
            • {ing.quantity} {ing.name}
          </Text>
        ))}
      </ScrollView>

      <Pressable
        style={styles.cardButton}
        onPress={() => addRecipeToGroceryList(item)}
      >
        <Ionicons name="cart-outline" size={18} color="white" />
        <Text style={styles.cardButtonText}>Add Ingredients to List</Text>
      </Pressable>
    </View>
  );

  return (
    <View style={styles.mainContainer}>
      <FlatList
        data={recipes}
        renderItem={renderRecipeCard}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listPadding}
        snapToAlignment="center"
        snapToInterval={320}
        decelerationRate="fast"
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="restaurant-outline" size={64} color="#CCC" />
            <Text style={styles.emptyText}>No recipes yet.</Text>
            <Text style={styles.emptySubtext}>Your recipe pile is empty!</Text>
          </View>
        }
      />

      <Pressable style={styles.fab} onPress={() => setIsAdding(true)}>
        <Ionicons name="add" size={32} color="white" />
      </Pressable>

      <Modal visible={isAdding} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create Recipe</Text>
            <TextInput
              style={styles.input}
              placeholder="Recipe Name"
              value={recipeName}
              onChangeText={setRecipeName}
            />

            <View style={styles.ingForm}>
              <Text style={styles.sectionLabel}>Add Ingredient</Text>
              <TextInput style={styles.input} placeholder="Name" value={ingName} onChangeText={setIngName} />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <TextInput style={[styles.input, { width: '48%' }]} placeholder="Qty" value={ingQty} onChangeText={setIngQty} />
                <TextInput style={[styles.input, { width: '48%' }]} placeholder="Price" value={ingPrice} onChangeText={setIngPrice} keyboardType="numeric" />
              </View>
              <Pressable style={styles.smallAddButton} onPress={handleAddIngredient}>
                <Text style={styles.smallAddButtonText}>+ Confirm Ingredient</Text>
              </Pressable>
            </View>

            <ScrollView style={styles.tempList}>
              {ingredientsList.map((ing, i) => (
                <Text key={i} style={styles.tempIngText}>• {ing.qty} {ing.name}</Text>
              ))}
            </ScrollView>

            <View style={styles.modalActions}>
              <Pressable style={styles.saveButton} onPress={handleSaveRecipe}>
                <Text style={styles.buttonText}>Save Recipe</Text>
              </Pressable>
              <Pressable style={styles.cancelButton} onPress={() => setIsAdding(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  listPadding: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  recipeCard: {
    backgroundColor: '#FFF',
    width: 300,
    height: 450,
    borderRadius: 25,
    marginRight: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingBottom: 15,
  },
  recipeTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
  },
  ingredientList: {
    flex: 1,
    marginTop: 15,
  },
  ingredientText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  cardButton: {
    backgroundColor: '#87DB84',
    flexDirection: 'row',
    padding: 15,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  cardButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#87DB84',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 300,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#999',
    marginTop: 10,
  },
  emptySubtext: {
    color: '#BBB',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 25,
    height: '85%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  sectionLabel: {
    fontWeight: '600',
    marginBottom: 10,
    color: '#444',
  },
  input: {
    backgroundColor: '#F5F5F5',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
  },
  smallAddButton: {
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
  },
  smallAddButtonText: {
    color: '#87DB84',
    fontWeight: '700',
  },
  tempList: {
    maxHeight: 150,
    marginBottom: 15,
  },
  tempIngText: {
    color: '#666',
    paddingVertical: 2,
  },
  saveButton: {
    backgroundColor: '#87DB84',
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelButton: {
    padding: 15,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#999',
    fontWeight: '600',
  },
});
// styling
