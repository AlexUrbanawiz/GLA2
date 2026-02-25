import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Ingredient from "../classes/ingredient";

class Recipe {
  constructor(name, ingredients) {
    this.id = Date.now(); // Unique ID for tracking
    this.name = name;
    this.ingredients = ingredients;
  }
  get_name() {
    return this.name;
  }
  get_ingredients() {
    return this.ingredients;
  }
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
  const [isAdding, setIsAdding] = useState(false); // Controls Editor view
  const [showIngForm, setShowIngForm] = useState(false); // Controls the small ingredient input
  const [recipeList, setRecipeList] = useState([]);
  const [recipeName, setRecipeName] = useState("");
  const [ingredientsList, setIngredientsList] = useState([]);
  const [editingRecipeId, setEditingRecipeId] = useState(null);

  const addIngredientToList = (newIng) => {
    setIngredientsList([...ingredientsList, newIng]);
    setShowIngForm(false);
  };

  const startEditing = (recipe) => {
    setRecipeName(recipe.get_name());
    setIngredientsList(recipe.get_ingredients());
    setEditingRecipeId(recipe.id); // Mark which one we are editing
    setIsAdding(true);
  };

  const deleteIngredient = (indexToDelete) => {
    const filteredList = ingredientsList.filter(
      (_, index) => index !== indexToDelete,
    );
    setIngredientsList(filteredList);
  };

  const deleteRecipe = (idToDelete) => {
    const filteredRecipes = recipeList.filter(
      (recipe) => recipe.id !== idToDelete,
    );
    setRecipeList(filteredRecipes);
  };

  const handleSaveRecipe = () => {
    if (recipeName !== "" && ingredientsList.length > 0) {
      if (editingRecipeId) {
        // UPDATE existing recipe
        const updatedList = recipeList.map((r) =>
          r.id === editingRecipeId
            ? new Recipe(recipeName, ingredientsList)
            : r,
        );
        setRecipeList(updatedList);
      } else {
        // CREATE new recipe
        const newRecipe = new Recipe(recipeName, ingredientsList);
        setRecipeList([...recipeList, newRecipe]);
      }

      // Reset everything
      setIngredientsList([]);
      setRecipeName("");
      setEditingRecipeId(null);
      setIsAdding(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* VIEW 1: THE LIBRARY */}
      {!isAdding && (
        <View style={{ width: "100%" }}>
          <Text style={styles.title}>My Recipe Book</Text>
          {recipeList.map((recipe, index) => (
            <Pressable
              key={index}
              style={styles.recipeCard}
              onPress={() => startEditing(recipe)}
            >
              <Text style={styles.recipeTitle}>{recipe.get_name()}</Text>
              <Text>{recipe.get_ingredients().length} Ingredients</Text>
              <Pressable onPress={() => deleteRecipe(recipe.id)}>
                <Text style={{ color: "red" }}>Remove</Text>
              </Pressable>
            </Pressable>
          ))}
          <Pressable
            style={styles.mainButton}
            onPress={() => setIsAdding(true)}
          >
            <Text style={{ color: "white" }}>+ Create New Recipe</Text>
          </Pressable>
        </View>
      )}

      {/* VIEW 2: THE EDITOR */}
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
                {ing.get_name()} ({ing.get_quantity()})
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
