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
import { useTags } from "../context/TagsContext";

// ===================== [START SAM TAG SYSTEM] =====================
// Array that stores all unique tags
const globalTags = [];

// ===================== [END SAM TAG SYSTEM] =====================

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
  const { tags, addTag } = useTags(); // Kryton Add

  //#endregion
  // ============ Kryton Change ==================
  function getOrCreateTag(name) {
    if (!name) return null;

    const existing = (tags || []).find((t) => t.name === name);
    if (existing) return existing;

    const newTag = new ToTag(name, [], 0);
    addTag(newTag);

    return newTag;
  }
  // =============== End Kryton Change ==============
  // ==== [START SAM TAG FILTER] ====
  // Current tag filter
  const [filterTag, setFilterTag] = useState(null);

  // Controls whether the filter dropdown is open
  const [filterOpen, setFilterOpen] = useState(false);
  // ==== [END SAM TAG FILTER] ====

  // ===================== [START SAM TAG ATTACHMENT (Kryton Commented)] =====================
  // lists.forEach((list) => {
  //   (list.items || []).forEach((item) => {
  //     // If tags is still a string, upgrade it
  //     if (typeof item.tags === "string") {
  //       item.tags = getOrCreateTag(item.tags, list.name);
  //     }
  //   });
  // });
  // ===================== [END SAM TAG ATTACHMENT (Kryton Commented)] =====================

  const sections = lists.map((list) => ({
    title: list.name,
    data: list.items || [],
  }));

  // ===================== [START SAM TAG GROUPING] =====================
  // Items are grouped by their tags
  const taggedSections = [];

  // lists.forEach((list) => {
  //   const grouped = {};

  //   (list.items || []).forEach((item) => {
  //     // Get the tag name, default to "Other" if none exists
  //     const tagName = item.tags?.name || "Other";

  //     // Initialize the group if it doesn't exist yet
  //     if (!grouped[tagName]) {
  //       grouped[tagName] = [];
  //     }

  //     // Add the item to the correct tag group
  //     grouped[tagName].push(item);
  //   });
  //   // ============== Kryton Change ==============
  //   Object.keys(grouped).forEach((tag) => {
  //     taggedSections.push({
  //       title: list.name,
  //       tag: tag,
  //       data: grouped[tag],
  //     });
  //   });
  //   // ============== End KC  ================
  // });
  // ===================== [END SAM TAG GROUPING] =====================

  // ===================== [START SAM TAG FILTER] =====================
  // Apply filtering
  const filteredSections = (taggedSections.length ? taggedSections : sections)
    .map((section) => {
      // If no filter is selected, return the section as-is
      if (!filterTag) return section;

      // Otherwise, filter items to only those matching the selected tag
      return {
        ...section,
        data: section.data.filter((item) => item.tags?.name === filterTag),
      };
    })
    // Remove any sections that end up empty after filtering
    .filter((section) => section.data.length > 0);
  // ===================== [END SAM TAG FILTER] =====================

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
    const [price, setPrice] = useState(0.0);
    const [tagName, setTag] = useState("");
    const [open, setOpen] = useState(false);
    // ==== [START FOR SAM TAG DROPDOWN] ====
    // Controls whether the tag selection dropdown is open
    const [tagOpen, setTagOpen] = useState(false);
    // ==== [END FOR SAM TAG DROPDOWN] ====
    const [selectedList, setSelectedList] = useState(null);
    const locationItems = lists.map((list) => ({
      label: list.name,
      value: list.name,
    }));

    const handleAdd = () => {
      if (!name || !qty || !price || !selectedList) return;
      // ============= Kryton Change ===========
      const tag = getOrCreateTag(tagName);

      const newItem = new ListItem(
        new Ingredient(name, qty, parseFloat(price)),
        tag, // ✅ object
      );
      // ============== End KC =============

      addItem(selectedList, newItem);

      //setList([...list, newItem]);
      setName("");
      setQty("");
      setPrice("");
      setTag(""); //Kryton Add
      onClose();
    };

    return (
      <View style={styles.inputContainer}>
        <DropDownPicker
          open={open}
          value={selectedList}
          items={locationItems}
          setOpen={setOpen}
          setValue={(callback) => setSelectedList(callback())} // Kryton Change
          zIndex={1}
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
        {/* ===================== [START SAM TAG DROPDOWN] ===================== */}
        {/* Dropdown that lets the user select from existing tags */}
        <DropDownPicker
          open={tagOpen}
          value={tagName}
          items={(tags || []).map((tag) => ({
            // Kryton Change
            label: tag.name,
            value: tag.name,
          }))}
          zIndex={0}
          setOpen={setTagOpen}
          setValue={(callback) => setTag(callback())} // Kryton Change
          placeholder="Select a tag"
        />
        {/* ===================== [END SAM TAG DROPDOWN] ===================== */}
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
      {/* ===================== [START SAM TAG FILTER VIEW] ===================== */}
      {/* Displays a preview of items that match the selected filter tag */}
      {/* {filterTag && (
        <View style={{ backgroundColor: "#fff", padding: 10 }}>
          <Text style={{ fontWeight: "bold" }}>Filtered by: {filterTag}</Text>

          {lists.map((list) =>
            (list.items || [])
              .filter((item) => {
                const tag = item.tags;

                // Handle both string and object tag formats
                return typeof tag === "string"
                  ? tag === filterTag
                  : tag?.name === filterTag;
              })
              .map((item, index) => (
                <Text key={index}>
                  {item.ingredient.name} - {item.ingredient.quantity}
                </Text>
              )),
          )}
        </View>
      )} */}
      {/* ===================== [END SAM TAG FILTER VIEW] ===================== */}
      {/* ===================== [START SAM TAG FILTER UI] ===================== */}
      {/* Dropdown that allows the user to select a tag to filter by */}
      <DropDownPicker
        open={filterOpen}
        value={filterTag}
        items={[
          { label: "All Tags", value: null },
          ...(tags || []).map((tag) => ({
            // Kryton Change
            label: tag.name,
            value: tag.name,
          })),
        ]}
        setOpen={setFilterOpen}
        setValue={setFilterTag}
        placeholder="Filter by tag"
      />
      {/* ===================== [END SAM TAG FILTER UI] ===================== */}

      <SectionList
        style={{ flex: 1 }}
        // asked to change
        // sections={sections}
        sections={filteredSections}
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
});
