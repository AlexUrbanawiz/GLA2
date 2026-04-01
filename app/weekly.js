import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import Ingredient from "../classes/ingredient";
import ToTag from "../classes/totag";
import { useList } from "../context/ListsContext";
import { useSubscriptions } from "../context/SubscriptionContext";
import { useTags } from "../context/TagsContext";


class ListItem {
  constructor(ingredient, tags) {
    this.tags = tags;
    this.ingredient = ingredient;
    this.isChecked = false;
  }
}

export default function Weekly() {
  const { lists, addItem, addList } = useList();
  // Kryton start =============================================
  const { weeklyItems, addSubItem, removeSubItem } = useSubscriptions();
  const { tags, addTag } = useTags();
  // const [weeklyItems, setWeeklyItems] = useState([]);
  // Kryton end ===============================================
  const [name, setName] = useState("");
  const [qty, setQty] = useState("");
  const [tagName, setTag] = useState("");

  const [open, setOpen] = useState(false);
  const [tagOpen, setTagOpen] = useState(false);

  const [selectedList, setSelectedList] = useState(null);

  const locationItems = lists.map((list) => ({
    label: list.name,
    value: list.name,
  }));

  //Kryton Start =============================================
  function getOrCreateTag(name) {
    if (!name) return null;

    const existing = (tags || []).find((t) => t.name === name);
    if (existing) return existing;

    const newTag = new ToTag(name, [], 0);
    addTag(newTag);

    return newTag;
  }
  //Kryton end ===============================================

  const addWeeklyItem = () => {
    if (!name || !qty) return;
    const tag = getOrCreateTag(tagName);
    const newItem = new ListItem(new Ingredient(name, qty, "0"), tag);

    //Kryton Start =============================================
    addSubItem(newItem);
    // setWeeklyItems((prev) => [...prev, newItem]);
    //Kryton End ===============================================

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
          setValue={(callback) => setSelectedList(callback(selectedList))}
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
        {/* Kryton deleted */}
    {/* ============================ Kryton Start ========================== */}
        <DropDownPicker
          open={tagOpen}
          value={tagName}
          items={(tags || []).map((tag) => ({ // Kryton Change
            label: tag.name,
            value: tag.name,
          }))}
          setOpen={setTagOpen}
          setValue={(callback) => setTag(callback())} // Kryton Change
          placeholder="Select a tag"
        />
        <TextInput
          style={styles.input}
          placeholder="Tag"
          value={tagName}
          onChangeText={setTag}
        />
    {/* ============================ Kryton End ============================ */}


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
            <Pressable onPress={() => removeSubItem(item)}>
              <Ionicons
                name="close-outline"
                size={22}
                style={{ paddingEnd: 5 }}
              />
            </Pressable>
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
