import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, SectionList, StyleSheet, Text, TextInput, View } from 'react-native';
import DropDownPicker from "react-native-dropdown-picker";
import Ingredient from "../classes/ingredient";
import ToTag from "../classes/totag";
import { useList } from "../context/ListsContext";

class ListItem {
  constructor(ingredient, tags) {
    this.tags = tags
    this.ingredient = ingredient;
    this.isChecked = false;
  }
}

export default function GroceryList() {
  
  //#region Use States
  //const [list, setList] = useState([])
  const [isAddingList, setIsAddingList] = useState(false);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const { lists, addList, addItem, removeItem, toggleItem } = useList();  
  //#endregion

  const sections = lists.map(list => ({
    title: list.name,
    data: list.items || [],
  }))

  function AddList({ onClose }) {
    const [name, setName] = useState("");
    const [open, setOpen] = useState(false)
  
    const handleAdd = () => {
      if (!name) return
      
      addList({
        name: name,
        items: []
      })

      setName("")
      onClose()
    }
  
    return (
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="List Name"
          value={name}
          onChangeText={setName}
        />
        <Pressable style={styles.addButton} onPress={handleAdd}>
          <Text style={{ color: "white" }}>Add</Text>
        </Pressable>
      </View>
    );
  }

  function AddItem({ onClose }) {
    const [name, setName] = useState("");
    const [qty, setQty] = useState("");
    const [tagName, setTag] = useState("");
    const [open, setOpen] = useState(false)
    const [selectedList, setSelectedList] = useState(null)
    const locationItems = lists.map(list => ({
      label: list.name,
      value: list.name,
    }))
  
    const handleAdd = () => {
      if (!name || !qty || !selectedList) return

      const tag = new ToTag(tagName)
      const newItem = new ListItem(new Ingredient(name, qty, "0"), tagName)
      
      addItem(selectedList, newItem)

      //setList([...list, newItem]);
      setName("")
      setQty("")
      onClose()
    }
  
    return (
      <View style={styles.inputContainer}>
        <DropDownPicker
          open={open}
          value={selectedList}
          items={locationItems}
          setOpen={setOpen}
          setValue={setSelectedList}
        />
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


  // Page
  return (
    <View style={styles.container}>
      <SectionList
        contentContainerStyle={styles.container}
        sections={sections}
        keyExtractor={(item, index) => item.ingredient.name + index}
        
        renderSectionHeader={({ section }) => (
          <Text style={styles.title}>{section.title}</Text>
        )}

        renderItem={({ item, section }) => (
          <View style={styles.listItem}>
            <Text>
              {item.ingredient.name} - {item.ingredient.quantity}
            </Text>
            <Pressable
              onPress={() => removeItem(section.title, item)}            
            >
              <Ionicons name="close-outline" size={22} style={{ paddingEnd: 5 }} />
            </Pressable>
          </View>
        )}
      />
      
      {isAddingList && <AddList onClose={() => setIsAddingList(false)} />}
      {isAddingItem && <AddItem onClose={() => setIsAddingItem(false)} />}

      <Pressable
        onPress={() => setIsAddingList(!isAddingList)}
        style={styles.toggleButton}
      >
        <Text>{isAddingList ? "Cancel" : "+ Add Location"}</Text>
      </Pressable>
      <Pressable
        onPress={() => setIsAddingItem(!isAddingItem)}
        style={styles.toggleButton}
      >
        <Text>{isAddingItem ? "Cancel" : "+ Add Item"}</Text>
      </Pressable>
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
    paddingVertical: 6,
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