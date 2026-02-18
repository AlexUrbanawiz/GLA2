import Checkbox from 'expo-checkbox';
// import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
// import { Button } from 'react-native-web';

export default function Inventory() {
  // const [isChecked, setChecked] = useState([
  // ]);

  return (
    <View style={styles.container}>
      {/* <View style={styles.section}>
        <Button>
          onPress={addItem()};
        </Button>
      </View> */}
      <View style={styles.section}>
        <Checkbox style={styles.checkbox} value={isChecked} onValueChange={setChecked} />
        <Text style={styles.paragraph}>
          test
        </Text>
      </View>
    </View>
  );
}

// const addItem = (item, quantity, price) => {
//   item = new Ingredient(item, quantity, price);
//   setChecked(item);
// }

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 16,
    marginVertical: 32,
  },
  section: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paragraph: {
    fontSize: 15,
  },
  checkbox: {
    margin: 8,
  },
});