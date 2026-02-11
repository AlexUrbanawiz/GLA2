import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import MyText from "./components/MyText";

export default function Home() {
  const [item1, setItem1] = useState(false);

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "lightgrey",
      }}
    >
      <MyText size={50} color="purple" bold style={{ padding: 20 }}>
        GLA{" "}
      </MyText>
      {/* <Checkbox value={item1} onValueChange={setItem1} /> */}
      <Pressable
        onPress={() => router.push("/inventory")}
        style={{ padding: 10 }}
      >
        <View
          style={{
            borderWidth: 2,
            borderColor: "black",
            width: 150,
            height: 40,
            justifyContent: "center",
            padding: 5,
            flexDirection: "row",
            backgroundColor: "white",
          }}
        >
          <Ionicons name="albums-outline" size={22} style={{ paddingEnd: 5 }} />
          <Text>My Inventory</Text>
        </View>
      </Pressable>
      <Pressable
        onPress={() => router.push("/grocery_list")}
        style={{ padding: 10 }}
      >
        <View
          style={{
            borderWidth: 2,
            borderColor: "black",
            width: 150,
            height: 40,
            justifyContent: "center",
            padding: 5,
            flexDirection: "row",
            backgroundColor: "white",
          }}
        >
          <Ionicons
            name="receipt-outline"
            size={22}
            style={{ paddingEnd: 5 }}
          />
          <Text>My Grocery Lists</Text>
        </View>
      </Pressable>
      <Pressable onPress={() => router.push("/weekly")} style={{ padding: 10 }}>
        <View
          style={{
            borderWidth: 2,
            borderColor: "black",
            width: 150,
            height: 40,
            justifyContent: "center",
            padding: 5,
            flexDirection: "row",
            backgroundColor: "white",
          }}
        >
          <Ionicons
            name="receipt-outline"
            size={22}
            style={{ paddingEnd: 5 }}
          />
          <Text>My Grocery Lists</Text>
        </View>
      </Pressable>
      <Pressable onPress={() => router.push("/budget")} style={{ padding: 10 }}>
        <View
          style={{
            borderWidth: 2,
            borderColor: "black",
            width: 150,
            height: 40,
            justifyContent: "center",
            padding: 5,
            flexDirection: "row",
            backgroundColor: "white",
          }}
        >
          <Ionicons
            name="pricetags-outline"
            size={22}
            style={{ paddingEnd: 10 }}
          />
          <Text>My Budget</Text>
        </View>
      </Pressable>
      <Pressable
        onPress={() => router.push("/recipes")}
        style={{ padding: 10 }}
      >
        <View
          style={{
            borderWidth: 2,
            borderColor: "black",
            width: 150,
            height: 40,
            justifyContent: "center",
            padding: 5,
            flexDirection: "row",
            backgroundColor: "white",
          }}
        >
          <Ionicons
            name="restaurant-outline"
            size={22}
            style={{ paddingEnd: 5 }}
          />
          <Text>My Recipes</Text>
        </View>
      </Pressable>
    </View>
  );
}
