import { Ionicons } from "@expo/vector-icons";
import Checkbox from "expo-checkbox";
import { useState } from "react";
import {
  Pressable,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import Ingredient from "../classes/ingredient";
import ToTag from "../classes/totag";
import { useList } from "../context/ListsContext";
import { Add, Multiplier } from "./components/MyText";
class ListItem {
  constructor(ingredient, tags) {
    this.tags = tags;
    this.ingredient = ingredient;
    this.isChecked = false;
  }
}

export default function GroceryList() {
  //#region Use States
  //const [list, setList] = useState([])
  const [isAddingList, setIsAddingList] = useState(false);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const { lists, addList, addItem, removeItem, removeList, toggleItem } =
    useList();
  //#endregion

  const sections = lists.map((list) => ({
    title: list.name,
    data: list.items || [],
  }));

  const totalEstimatedPrice = () => {
    let grandTotal = 0;

    lists.forEach((list) => {
      if (list.items) {
        list.items.forEach((item) => {
          const itemPrice = parseFloat(item.ingredient.price) || 0;
          const itemQty = parseFloat(item.ingredient.quantity) || 1;
          const itemTotal = Multiplier(itemQty, itemPrice);
          grandTotal = Add(grandTotal, itemTotal);
        });
      }
    });

    return grandTotal.toFixed(2);
  };

  function AddList({ onClose }) {
    const [name, setName] = useState("");
    const [open, setOpen] = useState(false);

    const handleAdd = () => {
      if (!name) return;

      addList({
        name: name,
        items: [],
      });

      setName("");
      onClose();
    };

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
    const [open, setOpen] = useState(false);
    const [selectedList, setSelectedList] = useState(null);
    const [price, setPrice] = useState("");
    const locationItems = lists.map((list) => ({
      label: list.name,
      value: list.name,
    }));

    const handleAdd = () => {
      if (!name || !qty || !selectedList) return;

      const tag = new ToTag(tagName);
      const newItem = new ListItem(
        new Ingredient(name, qty, price || "0"),
        tagName,
      );

      addItem(selectedList, newItem);

      //setList([...list, newItem]);
      setName("");
      setQty("");
      setPrice("");
      onClose();
    };

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
        <TextInput
          style={styles.input}
          placeholder="Estimated Price (e.g. 4.99)"
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
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
        style={{ flex: 1 }}
        sections={sections}
        keyExtractor={(item, index) => item.ingredient.name + index}
        renderSectionHeader={({ section }) => (
          <View style={{ flexDirection: "row" }}>
            <Text style={styles.title}>{section.title}</Text>
            <Pressable onPress={() => removeList(section.title)}>
              <Ionicons
                name="close-outline"
                size={22}
                style={{ paddingEnd: 5 }}
              />
            </Pressable>
          </View>
        )}
        renderItem={({ item, index, section }) => (
          <View style={styles.listItem}>
            <Checkbox
              style={styles.checkbox}
              value={item.isChecked}
              onValueChange={() => toggleItem(section.title, index)}
            />
            <Text>
              {item.ingredient.name} - {item.ingredient.quantity} ($
              {item.ingredient.price})
            </Text>
            <Pressable onPress={() => removeItem(section.title, item)}>
              <Ionicons
                name="close-outline"
                size={22}
                style={{ paddingEnd: 5 }}
              />
            </Pressable>
          </View>
        )}
      />
      <View style={styles.totalContainer}>
        <Text style={styles.totalText}>
          Total Estimate: ${totalEstimatedPrice()}
        </Text>
      </View>
      <View>
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
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  section: {
    flexDirection: "row",
    alignItems: "center",
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
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    width: "100%",
  },
  totalContainer: {
    paddingVertical: 15,
    borderTopWidth: 2,
    borderColor: "#ddd",
    marginTop: 10,
    marginBottom: 10,
    alignItems: "center",
  },
  totalText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "green",
  },
});
