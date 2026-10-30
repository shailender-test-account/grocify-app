import { Color, Tabs } from "expo-router";

import { Ionicons } from "@expo/vector-icons";
import COLORS from "../../constants/colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Tablayout() {
    const insets = useSafeAreaInsets();

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: COLORS.primary,
                headerTitleStyle: {
                    color: COLORS.textPrimary,
                    fontWeight: "600",
                },
                headerShadowVisible: false,
                tabBarStyle: {
                    backgroundColor: COLORS.cardBackground,
                    borderTopWidth: 1,
                    borderTopColor: COLORS.border,
                    paddingTop: 5,
                    paddingBottom: insets.bottom,
                    height: 60 + insets.bottom,
                },
            }}
        >

            <Tabs.Screen
                name="home"
                options={{
                    title: "Home",
                    tabBarIcon: ({ color, size }) => {
                        <Ionicons name="home-outline" size={size} color={color} />
                    }
                }}
            />

            <Tabs.Screen
                name="categories"
                options={{
                    title: "Categories",
                    tabBarIcon: ({ color, size }) => {
                        <Ionicons name="apps" size={size} color={color} />
                    }
                }}
            />

            <Tabs.Screen
                name="play"
                options={{
                    title: "Play",
                    tabBarIcon: ({ color, size }) => {
                        <Ionicons name="play" size={size} color={color} />
                    }
                }}
            />

            <Tabs.Screen
                name="account"
                options={{
                    title: "Account",
                    tabBarIcon: ({ color, size }) => {
                        <Ionicons name="person" size={size} color={color} />
                    }
                }}
            />

            <Tabs.Screen
                name="cart"
                options={{
                    title: "Cart",
                    tabBarIcon: ({ color, size }) => {
                        <Ionicons name="cart" size={size} color={color} />
                    }
                }}
            />




        </Tabs>
    )
}