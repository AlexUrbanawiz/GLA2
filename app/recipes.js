import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Ingredient } from "../classes/ingredient";
//This is assuming the ingredients provided is a list of ingredient objects
class Recipe {
  constructor(name, ingredients) {
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

function MakeRecipe() {
  const [text, setText] = useState("");
  return (
    <View style={styles.inputContainer}>
      <Text>Enter Ingredient Name:</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Red Onion"
        onChangeText={setText}
        value={text}
      />
      <Text style={{ marginTop: 5 }}>You are typing: {text}</Text>
    </View>
  );
}

export default function Recipes() {
  const [isAdding, setIsAdding] = useState(false);
  let testIngredients = [];
  testIngredients.push(new Ingredient("Onion", "1/2", "3.00"));
  testIngredients.push(new Ingredient("Green Bell Pepper", "1", "1.00"));
  testIngredients.push(new Ingredient("Heavy cream", "1/2", "6.00"));
  testIngredients.push(new Ingredient("Cream cheese", "1", "3.00"));
  testIngredients.push(new Ingredient("Chicken broth", "1", "3.00"));
  testIngredients.push(new Ingredient("Parmesan cheese", "1/2", "3.00"));
  testIngredients.push(new Ingredient("Garlic", "2", "3.00"));
  const TestRecipe = new Recipe("TestRecipe", testIngredients);
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ fontSize: 20, fontWeight: "bold" }}>
        {TestRecipe.get_name()}
      </Text>

      {TestRecipe.get_ingredients().map((ing, index) => (
        <Text key={index}>
          {ing.get_name()}: {ing.get_quantity()} — ${ing.get_price()}
        </Text>
      ))}

      {/* 3. CONDITIONAL RENDERING: Only show input if isAdding is true */}
      {isAdding && <MakeRecipe />}

      <Pressable onPress={() => setIsAdding(!isAdding)} style={{ padding: 10 }}>
        <View style={styles.button}>
          <Ionicons name="albums-outline" size={22} style={{ paddingEnd: 5 }} />
          <Text>{isAdding ? "Close" : "Add Ingredient"}</Text>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    padding: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eee",
    padding: 10,
    borderRadius: 8,
  },
});
