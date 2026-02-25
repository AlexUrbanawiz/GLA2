import { useState } from "react";
import { Pressable, SectionList, StyleSheet, Text, TextInput, View } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import Ingredient from "../classes/ingredient";
import { useInventory } from "../context/InventoryContext";

export default function Inventory() {
  const [isAddingLoc, setIsAddingLoc] = useState(false);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const { addItem, isAdded } = useInventory();
  const ingredient = new Ingredient("Milk", 2, 4.99);

  const [locations, setLocations] = useState([
    {
      name: "Pantry",
      ingredients: [
         new Ingredient("Onion", "1/2", "3.00"),
          new Ingredient("Green Bell Pepper", "1", "1.00"),
          new Ingredient("Chicken broth", "1", "3.00"),
          new Ingredient("Garlic", "2", "3.00"),
      ],
    },
    {
      name: "Fridge",
      ingredients: [
        new Ingredient("Heavy cream", "1/2", "6.00"),
        new Ingredient("Cream cheese", "1", "3.00"),
        new Ingredient("Parmesan cheese", "1/2", "3.00"),
      ],
    },
  ])
  const sections = locations.map(loc => ({
    title: loc.name,
    data: loc.ingredients,
  }))

  function AddIngredient({ onClose }) {
    const [name, setName] = useState("");
    const [qty, setQty] = useState("");
    const [open, setOpen] = useState(false)
    const [selectedLocation, setSelectedLocation] = useState(null)
    const locationItems = locations.map(loc => ({
      label: loc.name,
      value: loc.name,
    }))
  
    const handleAdd = () => {
      if (!name || !qty || !selectedLocation) return

      const newIngredient = new Ingredient(name, qty, "0")

      setLocations(prev =>
        prev.map(loc =>
          loc.name === selectedLocation
            ? {
                ...loc,
                ingredients: [...loc.ingredients, newIngredient],
              }
            : loc
        )
      )

      setName("")
      setQty("")
      onClose()
    }
  
    return (
      <View style={styles.inputContainer}>
        <DropDownPicker
          open={open}
          value={selectedLocation}
          items={locationItems}
          setOpen={setOpen}
          setValue={setSelectedLocation}
        />
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

  function AddLocation({ onClose }) {
    const [newName, setName] = useState("");
  
    const handleAdd = () => {
      if (!newName) return

      setLocations(prev => [
        ...prev,
        {
          name: newName,
          ingredients: []
        }
      ])

      setName("")
      onClose()
    }
  
    return (
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Location Name"
          value={newName}
          onChangeText={setName}
        />
        <Pressable style={styles.addButton} onPress={handleAdd}>
          <Text style={{ color: "white" }}>Confirm Add</Text>
        </Pressable>
      </View>
    );
  }
  

  return (
    <View style={{ flex: 1 }}>
      <SectionList
        contentContainerStyle={styles.container}
        sections={sections}
        keyExtractor={(item, index) => item.get_name() + index}
        
        renderSectionHeader={({ section }) => (
          <Text style={styles.title}>{section.title}</Text>
        )}

        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <Text>
              {item.get_name()} - {item.get_quantity()}
            </Text>
          </View>
        )}
      />

      {isAddingLoc && <AddLocation onClose={() => setIsAddingLoc(false)} />}
      {isAddingItem && <AddIngredient onClose={() => setIsAddingItem(false)} />}

      <Pressable
        onPress={() => setIsAddingLoc(!isAddingLoc)}
        style={styles.toggleButton}
      >
        <Text>{isAddingLoc ? "Cancel" : "+ Add Location"}</Text>
      </Pressable>
      <Pressable
        onPress={() => setIsAddingItem(!isAddingItem)}
        style={styles.toggleButton}
      >
        <Text>{isAddingItem ? "Cancel" : "+ Add Ingredient"}</Text>
      </Pressable>
    </View>
  )
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
