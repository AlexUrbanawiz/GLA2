import { Text, View } from "react-native";
import { useInventory } from "../context/InventoryContext";

export default function Inventory() {
  const { addItem, isAdded } = useInventory();

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text>Inventory</Text>
    </View>
  );
}
