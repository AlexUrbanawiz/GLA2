import Checkbox from 'expo-checkbox';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Ingredient from "../classes/ingredient";
import ToTag from "../classes/totag";

class ListItem {
  constructor(ingredient, tags) {
    this.tags = tags
    this.ingredient = ingredient;
    this.isChecked = false;
  }
}

export default function Inventory() {
  
  //#region Use States
  const [isChecked, setChecked] = useState(false);
  const [list, setList] = useState([])
  const [isAddingItem, setIsAddingItem] = useState(false);
  //#endregion

  function AddItem({ onClose }) {
    const [name, setName] = useState("");
    const [qty, setQty] = useState("");
    const [tagName, setTag] = useState("");
    const [open, setOpen] = useState(false)
  
    const handleAdd = () => {
      if (!name || !qty) return

      const tag = new ToTag(tagName)
      const newItem = new ListItem(new Ingredient(name, qty, "0"), tagName)
      
      setList([...list, newItem]);
      setName("")
      setQty("")
      onClose()
    }
  
    return (
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Item Name"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Quantity (e.g. 1 gallon)"
          value={qty}
          onChangeText={setQty}
        />
        <TextInput
          style={styles.input}
          placeholder="Tag"
          value={tagName}
          onChangeText={setTag}
        />
        <Pressable style={styles.addButton} onPress={handleAdd}>
          <Text style={{ color: "white" }}>Add</Text>
        </Pressable>
      </View>
    );
  }

  // Toggle checkbox logic
  const toggleItem = (index) => {
    const updated = [...list];
    updated[index].isChecked = !updated[index].isChecked;
    setList(updated);
  };

  // Page
  return (
    <View style={styles.container}>

      {isAddingItem && <AddItem onClose={() => setIsAddingItem(false)} />}

      <Pressable
        onPress={() => setIsAddingItem(!isAddingItem)}
        style={styles.toggleButton}
      >
        <Text>{isAddingItem ? "Cancel" : "+ Add Item"}</Text>
      </Pressable>

      {list.map((item, index) => (
        <View style={styles.section}>
          <Checkbox
            style={styles.checkbox}
            value={item.isChecked}
            onValueChange={() => toggleItem(index)}            
          />
          <Text style={styles.paragraph}>
            {item.ingredient.name}
          </Text>
          <Text style={styles.paragraph}>
            {" - "} 
          </Text>
          <Text style={styles.paragraph}>
            {item.tags}
          </Text>
        </View>
      ))}
    </View>
  );
}


// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 16,
    marginVertical: 32,
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
  section: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paragraph: {
    fontSize: 15,
  },
  addButton: {
    backgroundColor: "green",
    padding: 10,
    alignItems: "center",
    borderRadius: 5,
  },
  toggleButton: { marginTop: 20, padding: 10 },
  checkbox: {
    margin: 8,
  },
});