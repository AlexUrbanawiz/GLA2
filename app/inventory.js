import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, SectionList, StyleSheet, Text, TextInput, View } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import Ingredient from "../classes/ingredient";
import Location from "../classes/location";
import { useInventory } from "../context/InventoryContext";

export default function Inventory() {
  const [isAddingLoc, setIsAddingLoc] = useState(false);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const { inventory, addIngredient, addLocation, removeIngredient, removeLoc } = useInventory();

  const sections = inventory.map(loc => ({
    title: loc.name,
    data: loc.ingredients,
  }))

  function AddIngredient({ onClose }) {
    const [name, setName] = useState("");
    const [qty, setQty] = useState("");
    const [open, setOpen] = useState(false)
    const [selectedLocation, setSelectedLocation] = useState(null)
    const locationItems = inventory.map(loc => ({
      label: loc.name,
      value: loc.name,
    }))
  
    const handleAdd = () => {
      if (!name || !qty || !selectedLocation) return

      const newIngredient = new Ingredient(name, qty, "0")

      addIngredient(selectedLocation, newIngredient)

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

      addLocation(
        {
          name: newName,
          ingredients: []
        }
      )

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
  

  // function AddIngredient({ onAddIngredient }) {
  //   const [name, setName] = useState("");
  //   const [qty, setQty] = useState("");
  
  //   const handleAdd = () => {
  //     if (name && qty) {
  //       // Create the new object and send it to the parent
  //       const newIng = new Ingredient(name, qty, "0");
  //       onAddIngredient(newIng);
  
  //       // Clear the inputs
  //       setName("");
  //       setQty("");
  //     }
  //   };
  
  //   return (
  //     <View style={styles.inputContainer}>
  //       <TextInput
  //         style={styles.input}
  //         placeholder="Ingredient Name"
  //         value={name}
  //         onChangeText={setName}
  //       />
  //       <TextInput
  //         style={styles.input}
  //         placeholder="Quantity (e.g. 1 cup)"
  //         value={qty}
  //         onChangeText={setQty}
  //       />
  //       <Pressable style={styles.addButton} onPress={handleAdd}>
  //         <Text style={{ color: "white" }}>Confirm Add</Text>
  //       </Pressable>
  //     </View>
  //   );
  // }
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
    <View style={{ flex: 1 }}>
      <SectionList
        contentContainerStyle={styles.container}
        sections={sections}
        keyExtractor={(item, index) => item.name + index}
        
        
        renderSectionHeader={({ section }) => (
          <View style={styles.titlescreen}>
            <Text style={styles.title}>{section.title}</Text>
            <Pressable
              onPress={() => removeLoc(section.title)}            
            >
              <Ionicons name="close-outline" size={22} style={{ paddingEnd: 5 }} />
            </Pressable>
          </View>
        )}

        renderItem={({ item, section }) => (
          <View style={styles.listItem}>
            <Text>
              {item.name} - {item.quantity}
            </Text>
            <Pressable
              onPress={() => removeIngredient(section.title, item)}
            >
              <Ionicons name="close-outline" size={22} style={{ paddingEnd: 5 }} />
            </Pressable>
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
  title: { 
    fontSize: 22, 
    fontWeight: "bold", 
    margin: 15,
  },
  titlescreen: {
    flexDirection: 'row',
    alignItems: 'center',
  },
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    width: "100%",
  },
});
