// app/_layout.js
import { Ionicons } from "@expo/vector-icons";
import { Tabs, router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { InventoryProvider } from "../context/InventoryContext";
import { ListProvider } from "../context/ListsContext";
import { RecipesProvider } from "../context/RecipeContext";
import { SubscriptionProvider } from "../context/SubscriptionContext";
import { TagProvider } from "../context/TagsContext";

export default function Layout() {
  return (
    <ListProvider>
      <InventoryProvider>
        <TagProvider>
          <RecipesProvider>
            <SubscriptionProvider>
              <Tabs
                screenOptions={{
                  // Global Header Styling
                  headerStyle: {
                    backgroundColor: "#FAFAFA",
                    elevation: 0, // Remove shadow on Android
                    shadowOpacity: 0, // Remove shadow on iOS
                  },
                  headerTitleAlign: "center",
                  headerTintColor: "#333",
                  headerLeft: () => (
                    <View
                      style={{
                        paddingLeft: 15,
                        flexDirection: "row",
                        alignItems: "center",
                      }}
                    >
                      <Ionicons name="cart" size={24} color="#87DB84" />
                      <Text style={styles.logoText}>GLA</Text>
                    </View>
                  ),
                  headerRight: () => (
                    <Pressable
                      onPress={() => router.push("/settings")}
                      style={({ pressed }) => ({
                        paddingRight: 15,
                        opacity: pressed ? 0.5 : 1,
                      })}
                    >
                      <Ionicons
                        name="settings-outline"
                        size={24}
                        color="#333"
                      />
                    </Pressable>
                  ),
                  // Global Tab Bar Styling
                  tabBarActiveTintColor: "#87DB84",
                  tabBarInactiveTintColor: "#888",
                  tabBarStyle: {
                    backgroundColor: "#FFFFFF",
                    borderTopWidth: 1,
                    borderTopColor: "#E0E0E0",
                    height: 60,
                    paddingBottom: 8,
                  },
                  // Background color for all screens
                  contentStyle: { backgroundColor: "#FAFAFA" },
                }}
              >
                <Tabs.Screen
                  name="index"
                  options={{
                    title: "Home",
                    tabBarIcon: ({ color }) => (
                      <Ionicons name="home-outline" size={24} color={color} />
                    ),
                  }}
                />
                <Tabs.Screen
                  name="grocery_list"
                  options={{
                    title: "Lists",
                    tabBarIcon: ({ color }) => (
                      <Ionicons name="list-outline" size={24} color={color} />
                    ),
                  }}
                />
                <Tabs.Screen
                  name="recipes"
                  options={{
                    title: "Recipes",
                    tabBarIcon: ({ color }) => (
                      <Ionicons
                        name="restaurant-outline"
                        size={24}
                        color={color}
                      />
                    ),
                  }}
                />
                {/* New Weekly Tab */}
                <Tabs.Screen
                  name="weekly"
                  options={{
                    title: "Weekly",
                    tabBarIcon: ({ color }) => (
                      <Ionicons
                        name="calendar-outline"
                        size={24}
                        color={color}
                      />
                    ),
                  }}
                />
                <Tabs.Screen
                  name="inventory"
                  options={{
                    title: "Pantry",
                    tabBarIcon: ({ color }) => (
                      <Ionicons
                        name="archive-outline"
                        size={24}
                        color={color}
                      />
                    ),
                  }}
                />
                <Tabs.Screen
                  name="budget"
                  options={{
                    title: "Budget",
                    tabBarIcon: ({ color }) => (
                      <Ionicons
                        name="pie-chart-outline"
                        size={24}
                        color={color}
                      />
                    ),
                  }}
                />
                {/* Keep Settings hidden from the bottom bar */}
                <Tabs.Screen
                  name="settings"
                  options={{
                    href: null,
                    title: "Settings",
                  }}
                />
                <Tabs.Screen
                  name="components/MyText"
                  options={{
                    href: null, // This hides it from the bottom bar
                  }}
                />
              </Tabs>
            </SubscriptionProvider>
          </RecipesProvider>
        </TagProvider>
      </InventoryProvider>
    </ListProvider>
  );
}

// styling or css stuff
const styles = StyleSheet.create({
  logoText: {
    fontSize: 20,
    fontWeight: "800",
    color: "#333",
    marginLeft: 5,
    letterSpacing: 1,
  },
});
// styling or css stuff
