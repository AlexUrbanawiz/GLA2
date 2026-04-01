import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from 'react-native';
import DropDownPicker from "react-native-dropdown-picker";
import { useTags } from "../context/TagsContext";


export default function Settings() {
  const { tags, addTag, removeTag } = useTags();
  const [tagOpen, setTagOpen] = useState(false);
  const [tagName, setTag] = useState("");
  
  function deleteTag() {
    removeTag(tagName)
  }
  return (
    <View style={styles.container}>
      <Text style={{ marginBottom: 10 }}>Settings</Text>

      <DropDownPicker
        open={tagOpen}
        value={tagName}
        items={(tags || []).map((tag) => ({
          label: tag.name,
          value: tag.name,
        }))}
        setOpen={setTagOpen}
        setValue={(callback) => setTag(callback())}
        placeholder="Select a tag"
        style={{ marginBottom: 10 }}
        zIndex={1}
      />
      <Pressable style={styles.addButton} onPress={deleteTag}>
        <Text style={{ color: "white" }}>Delete Tag</Text>
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