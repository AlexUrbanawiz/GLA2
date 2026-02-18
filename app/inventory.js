import { Text, View } from 'react-native';
import Ingredient from '../classes/ingredient';
import { useInventory } from '../context/InventoryContext';

export default function Inventory() {
  const {addItem, isAdded} = useInventory();
  const ingredient = new Ingredient("Milk", 2, 4.99);

  return (
    <View style={{ flex:1, alignItems:'center', justifyContent:'center' }}>
      <Text>Inventory</Text>
    </View>
  );
}