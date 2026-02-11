import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
//This is assuming the ingredients provided is a dictionary, with the key being the ingredient name, and the value being the quantity
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
  let testIngredients = {};
  testIngredients["Onion"] = "1/2 whole";
  testIngredients["Green bell pepper"] = "1 whole";
  testIngredients["Heavy cream"] = "1/2 cup";
  testIngredients["Cream cheese"] = "1 block";
  testIngredients["Chicken broth"] = "1 cup";
  testIngredients["Parmesan cheese"] = "1/2 cup";
  testIngredients["Garlic"] = "2 cloves";
  const TestRecipe = new Recipe("TestRecipe", testIngredients);
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ fontSize: 20, fontWeight: "bold" }}>
        {TestRecipe.get_name()}
      </Text>

      {Object.entries(TestRecipe.get_ingredients()).map(
        ([ingredient, quantity]) => (
          <Text key={ingredient}>
            {ingredient}: {quantity}
          </Text>
        ),
      )}

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
