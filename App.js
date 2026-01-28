import React, { useState } from 'react';
import { Text, View, Button, Switch, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import CheckBox from '@react-native-community/checkbox';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

function HomeScreen({ navigation }) {
  return (
    <View style={styles.center}>
      <Text style={styles.title}>Home</Text>
      <Button
        title="Go to Grocery List"
        onPress={() => navigation.navigate('Grocery')}
      />
    </View>
  );
}

function GroceryScreen() {
  const [count, setCount] = useState(0);
  const [item1, setItem1] = useState(false);

  return (
    <View style={styles.center}>
      <Text style={styles.title}>Grocery List</Text>
      <Text>Count: {count}</Text>
      <Button title="Increase" onPress={() => setCount(count + 1)} />
      <CheckBox value={item1} onValueChange={setItem1} />
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Grocery" component={GroceryScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
});
