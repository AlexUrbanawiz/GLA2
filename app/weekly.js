import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import Ingredient from "../classes/ingredient";
import { useList } from "../context/ListsContext";

class ListItem {
  constructor(ingredient, tags) {
    this.tags = tags;
    this.ingredient = ingredient;
    this.isChecked = false;
  }
}

export default function Weekly() {
  const { lists, addItem, addList } = useList();

  const [weeklyItems, setWeeklyItems] = useState([]);
  const [name, setName] = useState("");
  const [qty, setQty] = useState("");
  const [tag, setTag] = useState("");

  const [open, setOpen] = useState(false);
  const [selectedList, setSelectedList] = useState(null);

  const locationItems = lists.map((list) => ({
    label: list.name,
    value: list.name,
  }));

  const addWeeklyItem = () => {
    if (!name || !qty) return;

    const newItem = new ListItem(new Ingredient(name, qty, "0"), tag);

    setWeeklyItems((prev) => [...prev, newItem]);

    setName("");
    setQty("");
    setTag("");
  };

  const pushToGroceryList = () => {
    if (!selectedList || weeklyItems.length === 0) return;

    if (!lists.find((l) => l.name === selectedList)) {
      addList({ name: selectedList, items: [] });
    }

    weeklyItems.forEach((item) => {
      addItem(selectedList, item);
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Weekly Items</Text>

      <View style={styles.inputContainer}>
        <DropDownPicker
          open={open}
          value={selectedList}
          items={locationItems}
          setOpen={setOpen}
          setValue={setSelectedList}
          style={{ marginBottom: 10 }}
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
          value={tag}
          onChangeText={setTag}
        />

        <Pressable style={styles.addButton} onPress={addWeeklyItem}>
          <Text style={{ color: "white" }}>+ Add to Weekly List</Text>
        </Pressable>
      </View>

      {/* Weekly Items List */}
      <View style={{ marginTop: 20 }}>
        {weeklyItems.map((item, index) => (
          <View key={index} style={styles.listItem}>
            <Text>
              {item.ingredient.name} - {item.ingredient.quantity}
            </Text>
          </View>
        ))}
      </View>

      {/* Push Button */}
      <Pressable onPress={pushToGroceryList} style={styles.toggleButton}>
        <Text>+ Add All to Grocery List</Text>
      </Pressable>
    </View>
  );
}

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
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  addButton: {
    backgroundColor: "black",
    padding: 10,
    alignItems: "center",
    borderRadius: 5,
  },
  toggleButton: {
    marginTop: 20,
    padding: 10,
    alignItems: "center",
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    width: "100%",
  },
});
