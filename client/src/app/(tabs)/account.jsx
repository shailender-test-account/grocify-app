import { View, Text, Button, StyleSheet } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import * as SecureStore from "expo-secure-store";
import { clearCredentials } from "../../store/slices/userslice.js";

export default function Account() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync("accesstoken");
    dispatch(clearCredentials());
  };

  return (
    <View style={styles.container}>
      <Text>Account</Text>
      <Text>{user?.username || "No user"}</Text>
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
});