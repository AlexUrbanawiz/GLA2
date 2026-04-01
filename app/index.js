import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import MyText from "./components/MyText";

export default function Home() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.welcomeSection}>
        <MyText size={32} color="#333" bold>
          Welcome!
        </MyText>
      </View>

      <View style={styles.grid}>
        {/* Navigation Cards */}
        <Pressable
          onPress={() => router.push("/grocery_list")}
          style={styles.card}
        >
          <View style={styles.iconCircle}>
            <Ionicons name="list" size={28} color="#87DB84" />
          </View>
          <Text style={styles.cardText}>Grocery Lists</Text>
        </Pressable>

        <Pressable
          onPress={() => router.push("/recipes")}
          style={styles.card}
        >
          <View style={styles.iconCircle}>
            <Ionicons name="restaurant" size={28} color="#87DB84" />
          </View>
          <Text style={styles.cardText}>My Recipes</Text>
        </Pressable>

        <Pressable
          onPress={() => router.push("/inventory")}
          style={styles.card}
        >
          <View style={styles.iconCircle}>
            <Ionicons name="archive" size={28} color="#87DB84" />
          </View>
          <Text style={styles.cardText}>Pantry</Text>
        </Pressable>

        <Pressable
          onPress={() => router.push("/weekly")}
          style={styles.card}
        >
          <View style={styles.iconCircle}>
            <Ionicons name="calendar" size={28} color="#87DB84" />
          </View>
          <Text style={styles.cardText}>Weekly Items</Text>
        </Pressable>

        <Pressable
          onPress={() => router.push("/budget")}
          style={styles.cardFull}
        >
          <View style={styles.row}>
            <Ionicons name="pie-chart" size={24} color="#87DB84" style={{ marginRight: 10 }} />
            <Text style={styles.cardText}>Budget Overview</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#CCC" />
        </Pressable>
      </View>
    </ScrollView>
  );
}

// styling or css stuff
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  welcomeSection: {
    paddingHorizontal: 25,
    paddingVertical: 30,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 15,
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: '#FFF',
    width: '46%', // Fits two cards per row with margin
    aspectRatio: 1,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    // Shadow/Elevation
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardFull: {
    backgroundColor: '#FFF',
    width: '96%',
    marginHorizontal: '2%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F0FFF0', // Very light green tint
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  cardText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  }
});
// styling or css stuff