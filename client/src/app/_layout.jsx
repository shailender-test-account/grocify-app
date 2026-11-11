import { Stack, useRouter, useSegments } from "expo-router";
import "../../global.css";
import { SafeAreaProvider } from "react-native-safe-area-context";
import SafeScreen from "../components/Safescreen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import axiosClient from "../api/axios.client.js";
import { Provider, useDispatch, useSelector } from "react-redux";
import { store } from "../store/store.js"; // <-- your redux store path
import { setCredentials, clearCredentials } from "../store/slices/userslice.js";
import { View, ActivityIndicator } from "react-native";
import { Platform } from 'react-native';



function RootLayoutNav() {
  const dispatch = useDispatch();
  const router = useRouter();
  const segments = useSegments();

  const { token, isLoading } = useSelector((state) => state.auth);
  const [bootstrapped, setBootstrapped] = useState(false);

  // 1️⃣ On app start: read token from SecureStore, validate with /auth/me
  useEffect(() => {
    const bootstrap = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync("accesstoken");

        if (!storedToken) {
          dispatch(clearCredentials());
          return;
        }

        const response = await axiosClient.get("/auth/me", {
          headers: { Authorization: `Bearer ${storedToken}` },
        });

        if (response.data.success) {
          dispatch(
            setCredentials({
              user: response.data.user,
              token: storedToken,
            })
          );
        } else {
          await SecureStore.deleteItemAsync("accesstoken");
          dispatch(clearCredentials());
        }
      } catch (error) {
        console.log("Bootstrap error:", error?.response?.data || error.message);
        // await SecureStore.deleteItemAsync("accesstoken");
        if (Platform.OS !== 'web') {
          try {
            await SecureStore.deleteItemAsync("accesstoken");
          } catch (secureStoreError) {
            console.log("Failed to delete secure token:", secureStoreError);
          }
        }
        dispatch(clearCredentials());
      } finally {
        setBootstrapped(true);
      }
    };

    bootstrap();
  }, []);

  // 2️⃣ Redirect logic: only after bootstrap finishes
  useEffect(() => {
    if (!bootstrapped || isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (token && inAuthGroup) {
      router.replace("/(tabs)");
    } else if (!token && !inAuthGroup) {
      router.replace("/(auth)");
    }
  }, [token, segments, bootstrapped, isLoading]);

  // 3️⃣ Loading screen while we check SecureStore + /auth/me
  if (isLoading || !bootstrapped) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeScreen>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(auth)" />
        </Stack>
      </SafeScreen>
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}

// ✅ Provider wraps everything — that's where the store is set
export default function RootLayout() {

  return (
    <Provider store={store}>
      <RootLayoutNav />
    </Provider>
  );
}