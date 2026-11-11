import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function Index() {
  return (
    <View style={styles.container}>
      <Text className="text-red-500">
        Edit src/app/index.tsx to edit this screen.
      
      </Text>
      <Text><Link href="/(auth)/login">Login</Link></Text>
      <Text><Link href="/(auth)/signup">Signup</Link></Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
