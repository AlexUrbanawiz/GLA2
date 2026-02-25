<<<<<<< HEAD
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import Ingredient from "../classes/ingredient";
import Location from "../classes/location";
import { useInventory } from "../context/InventoryContext";

export default function Inventory() {
  const [isAdding, setIsAdding] = useState(false);
=======
import { Text, View } from "react-native";
import Ingredient from "../classes/ingredient";
import { useInventory } from "../context/InventoryContext";

export default function Inventory() {
>>>>>>> e60301bf16ed33dbfaf536714d8261377c19dc04
  const { addItem, isAdded } = useInventory();
  const ingredient = new Ingredient("Milk", 2, 4.99);

  function AddIngredient({ onAddIngredient }) {
    const [name, setName] = useState("");
    const [qty, setQty] = useState("");
  
    const handleAdd = () => {
      if (name && qty) {
        // Create the new object and send it to the parent
        const newIng = new Ingredient(name, qty, "0");
        onAddIngredient(newIng);
  
        // Clear the inputs
        setName("");
        setQty("");
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
          placeholder="Quantity (e.g. 1 cup)"
          value={qty}
          onChangeText={setQty}
        />
        <Pressable style={styles.addButton} onPress={handleAdd}>
          <Text style={{ color: "white" }}>Confirm Add</Text>
        </Pressable>
      </View>
    );
  }
  const [pantryList, setPantryList] = useState([
    new Ingredient("Onion", "1/2", "3.00"),
    new Ingredient("Green Bell Pepper", "1", "1.00"),
    new Ingredient("Chicken broth", "1", "3.00"),
    new Ingredient("Garlic", "2", "3.00"),
  ]);
  const [fridgeList, setFridgeList] = useState([
    new Ingredient("Heavy cream", "1/2", "6.00"),
    new Ingredient("Cream cheese", "1", "3.00"),
    new Ingredient("Parmesan cheese", "1/2", "3.00"),
  ]);

  const [locationsList, setLocationsList] = useState([
    new Location("Pantry", pantryList),
    new Location("Fridge", fridgeList),
  ])
  const addIngredientToList = (newIng) => {
    setPantryList([...pantryList, newIng]);
    setIsAdding(false); // Close the input area after adding
  };

  return (
<<<<<<< HEAD
    <ScrollView contentContainerStyle={styles.container}>
      {locationsList.map((loc, index) => (
        <View key={index} style={styles.container}>
          <Text style={styles.title}>{loc.name}</Text>
    
          {loc.ingredientsList.map((ing, index) => (
            <View key={index} style={styles.listItem}>
              <Text>
                {ing.get_name()} - {ing.get_quantity()}
              </Text>
            </View>
          ))}
        </View>
      ))}

      {isAdding && <AddIngredient onAddIngredient={addIngredientToList} />}
      <View>
        <Pressable
          onPress={() => setIsAdding(!isAdding)}
          style={styles.toggleButton}
        >
          <Text>{isAdding ? "Cancel" : "+ Add Ingredient"}</Text>
        </Pressable>
        <Pressable
          onPress={() => setIsAdding(!isAdding)}
          style={styles.toggleButton}
        >
          <Text>{isAdding ? "Cancel" : "+ Add Ingredient"}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 40, alignItems: "center" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  inputContainer: {
    width: "100%",
    backgroundColor: "#f9f9f9",
    padding: 15,
    borderRadius: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  addButton: {
    backgroundColor: "green",
    padding: 10,
    alignItems: "center",
    borderRadius: 5,
  },
  toggleButton: { marginTop: 20, padding: 10 },
  listItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    width: "100%",
  },
});
=======
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text>Inventory</Text>
    </View>
  );
}
>>>>>>> e60301bf16ed33dbfaf536714d8261377c19dc04
