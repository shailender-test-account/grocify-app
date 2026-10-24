// import {
//   View,
//   Text,
//   Platform,
//   KeyboardAvoidingView,
//   TextInput,
//   TouchableOpacity,
//   ActivityIndicator,
//   Alert,
// } from "react-native";
// import styles from "../../../styles/signup.styles.js";
// import { Ionicons } from "@expo/vector-icons";
// import COLORS from "../../constants/colors.js";
// import { useState } from "react";
// import { useRouter } from "expo-router";
// import axiosClient from "../../api/axios.client.js";
// // import { useAuthStore } from "../../store/authStore";

// export default function signup() {
  
//   const [showPassword, setShowPassword] = useState(false);
//   const [loadind,setLoading]=useState(false)

//   const [formdata,setFormdata]=useState(
//     {
//         email:"",
//         password:"",
//         username:"",
//     }
//   )


//   const handelChange=(name,text)=>{
    
//     setFormdata(
//         {
//             ...formdata,
//             [name]:text
//         }
//     )

//   }


//   const handelSignup=async()=>{
//     try {

//         const signupresponse=await axiosClient.post("/auth/register",
//             {
//                 ...formdata,
//                 role:"customer"
//             }
//         );
//         if(signupresponse.data.success){
//             console.log("User register successfully")
//         }
//         else{
//             console.log("Not register")
//         }
       

        
//     } catch (error) {
//         console.log("error in register",error)
        
//     }

//   }

  



//   const router = useRouter();



//   return (
//     <KeyboardAvoidingView
//       style={{ flex: 1 }}
//       behavior={Platform.OS === "ios" ? "padding" : "height"}
//     >
//       <View style={styles.container}>
//         <View style={styles.card}>
//           {/* HEADER */}
//           <View style={styles.header}>
//             <Text style={styles.title}>Grocify🐛</Text>
//             <Text style={styles.subtitle}>Share your favorite reads</Text>
//           </View>

//           <View style={styles.formContainer}>
//             {/* USERNAME INPUT */}
//             <View style={styles.inputGroup}>
//               <Text style={styles.label}>Username</Text>
//               <View style={styles.inputContainer}>
//                 <Ionicons
//                   name="person-outline"
//                   size={20}
//                   color={COLORS.primary}
//                   style={styles.inputIcon}
//                 />
//                 <TextInput
//                   style={styles.input}
//                   placeholder="johndoe"
//                   placeholderTextColor={COLORS.placeholderText}
//                   value={formdata.username}
//                   onChangeText={(text)=>handelChange("username",text)}
//                   autoCapitalize="none"
//                 />
//               </View>
//             </View>

//             {/* EMAIL INPUT */}
//             <View style={styles.inputGroup}>
//               <Text style={styles.label}>Email</Text>
//               <View style={styles.inputContainer}>
//                 <Ionicons
//                   name="mail-outline"
//                   size={20}
//                   color={COLORS.primary}
//                   style={styles.inputIcon}
//                 />
//                 <TextInput
//                   style={styles.input}
//                   placeholder="johndoe@gmail.com"
//                   value={formdata.email}
//                   placeholderTextColor={COLORS.placeholderText}
//                   onChangeText={(text)=>handelChange("email",text)}
//                   keyboardType="email-address"
//                   autoCapitalize="none"
//                 />
//               </View>
//             </View>

//             {/* PASSWORD INPUT */}
//             <View style={styles.inputGroup}>
//               <Text style={styles.label}>Password</Text>
//               <View style={styles.inputContainer}>
//                 <Ionicons
//                   name="lock-closed-outline"
//                   size={20}
//                   color={COLORS.primary}
//                   style={styles.inputIcon}
//                 />
//                 <TextInput
//                   style={styles.input}
//                   placeholder="******"
//                   placeholderTextColor={COLORS.placeholderText}
//                   value={formdata.password}
//                   onChangeText={(text)=>handelChange("password",text)}
//                   secureTextEntry={!showPassword}
//                 />
//                 <TouchableOpacity
//                   onPress={() => setShowPassword(!showPassword)}
//                   style={styles.eyeIcon}
//                 >
//                   <Ionicons
//                     name={showPassword ? "eye-outline" : "eye-off-outline"}
//                     size={20}
//                     color={COLORS.primary}
//                   />
//                 </TouchableOpacity>
//               </View>
//             </View>

//             {/* SIGNUP BUTTON */}
//             <TouchableOpacity style={styles.button} 
//             onPress={handelSignup} 
//             // disabled={isLoading}>
//             >
              
//                 <Text style={styles.buttonText}>Sign Up</Text>
              
//             </TouchableOpacity>

//             {/* FOOTER */}
//             <View style={styles.footer}>
//               <Text style={styles.footerText}>Already have an account?</Text>
//               <TouchableOpacity onPress={() => router.back()}>
//                 <Text style={styles.link}>Login</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </View>
//     </KeyboardAvoidingView>
//   );
// }



import {
  View,
  Text,
  Platform,
  KeyboardAvoidingView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  StyleSheet,
  Dimensions,
} from "react-native";
import styles from "../../../styles/signup.styles.js";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../../constants/colors.js";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "expo-router";
import axiosClient from "../../api/axios.client.js";
// import { useAuthStore } from "../../store/authStore";

const { width } = Dimensions.get("window");

export default function signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formdata, setFormdata] = useState({
    email: "",
    password: "",
    username: "",
  });

  const [errors, setErrors] = useState({
    username: "",
    email: "",
    password: "",
  });

  const errorAnim = {
    username: useRef(new Animated.Value(0)).current,
    email: useRef(new Animated.Value(0)).current,
    password: useRef(new Animated.Value(0)).current,
  };

  // ---------- Toast state ----------
  const [toast, setToast] = useState({
    visible: false,
    type: "success", // "success" | "error"
    title: "",
    message: "",
  });
  const toastY = useRef(new Animated.Value(-150)).current;
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastTimer = useRef(null);

  const router = useRouter();

  // ---------- Toast helpers ----------
  const showToast = (type, title, message, duration = 3000) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);

    setToast({ visible: true, type, title, message });

    // Reset position, then spring down
    toastY.setValue(-150);
    toastOpacity.setValue(0);

    Animated.parallel([
      Animated.spring(toastY, {
        toValue: 0,
        useNativeDriver: true,
        friction: 7,
        tension: 80,
      }),
      Animated.timing(toastOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    toastTimer.current = setTimeout(() => {
      hideToast();
    }, duration);
  };

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(toastY, {
        toValue: -150,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(toastOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    });
  };

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  // ---------- Validation ----------
  const animateError = (field, show) => {
    Animated.timing(errorAnim[field], {
      toValue: show ? 1 : 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  const validateField = (name, value) => {
    let message = "";

    if (!value.trim()) {
      message = `${
        name.charAt(0).toUpperCase() + name.slice(1)
      } is required`;
    } else if (name === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value.trim())) {
        message = "Please enter a valid email address";
      }
    } else if (name === "password") {
      if (value.length < 6) {
        message = "Password must be at least 6 characters";
      }
    } else if (name === "username") {
      if (value.trim().length < 3) {
        message = "Username must be at least 3 characters";
      }
    }

    setErrors((prev) => ({ ...prev, [name]: message }));
    animateError(name, !!message);
    return message === "";
  };

  const handelChange = (name, text) => {
    setFormdata({
      ...formdata,
      [name]: text,
    });

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
      animateError(name, false);
    }
  };

  // ---------- Signup ----------
  const handelSignup = async () => {
    const isUsernameValid = validateField("username", formdata.username);
    const isEmailValid = validateField("email", formdata.email);
    const isPasswordValid = validateField("password", formdata.password);

    if (!isUsernameValid || !isEmailValid || !isPasswordValid) {
      showToast(
        "error",
        "Missing details",
        "Please fix the highlighted fields before continuing."
      );
      return;
    }

    try {
      setLoading(true);

      const signupResponse = await axiosClient.post("/auth/register", {
        ...formdata,
        role: "customer",
      });

      if (signupResponse?.data?.success) {
        showToast(
          "success",
          "Account created 🎉",
          "Welcome to Grocify! You can now log in."
        );
        // router.replace("/login"); // uncomment if you want auto redirect
      } else {
        const msg =
          signupResponse?.data?.message ||
          "Something went wrong. Try again.";
        showToast("error", "Signup failed", msg);
      }
    } catch (error) {
      console.log("error in register", error);

      // Common backend responses when user already exists
      const status = error?.response?.status;
      const backendMsg = error?.response?.data?.message;

      if (status === 409 || /already|exist/i.test(backendMsg || "")) {
        showToast(
          "error",
          "User already exists",
          backendMsg || "An account with this email already exists. Try logging in."
        );
      } else if (status === 400) {
        showToast(
          "error",
          "Invalid details",
          backendMsg || "Please check your information and try again."
        );
      } else {
        showToast(
          "error",
          "Network error",
          backendMsg || "Unable to reach the server. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // ---------- Error text component ----------
  const ErrorMessage = ({ field }) => {
    if (!errors[field]) return null;
    return (
      <Animated.View
        style={[localStyles.errorContainer, { opacity: errorAnim[field] }]}
      >
        <Ionicons name="alert-circle-outline" size={14} color="#ff4d4f" />
        <Text style={localStyles.errorText}>{errors[field]}</Text>
      </Animated.View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* ---------- Animated Toast ---------- */}
      {toast.visible && (
        <Animated.View
          pointerEvents="none"
          style={[
            localStyles.toastWrapper,
            {
              transform: [{ translateY: toastY }],
              opacity: toastOpacity,
            },
          ]}
        >
          <View
            style={[
              localStyles.toastCard,
              toast.type === "success"
                ? localStyles.toastSuccess
                : localStyles.toastError,
            ]}
          >
            <View
              style={[
                localStyles.toastIconWrap,
                toast.type === "success"
                  ? localStyles.toastIconSuccess
                  : localStyles.toastIconError,
              ]}
            >
              <Ionicons
                name={
                  toast.type === "success"
                    ? "checkmark-circle"
                    : "close-circle"
                }
                size={22}
                color="#fff"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={localStyles.toastTitle}>{toast.title}</Text>
              <Text style={localStyles.toastMessage}>{toast.message}</Text>
            </View>
            <TouchableOpacity onPress={hideToast} hitSlop={10}>
              <Ionicons name="close" size={18} color="#9ca3af" />
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      <View style={styles.container}>
        <View style={styles.card}>
          {/* HEADER */}
          <View style={styles.header}>
            <Text style={styles.title}>Grocify🐛</Text>
            <Text style={styles.subtitle}>Share your favorite reads</Text>
          </View>

          <View style={styles.formContainer}>
            {/* USERNAME */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Username</Text>
              <View
                style={[
                  styles.inputContainer,
                  errors.username && localStyles.inputError,
                ]}
              >
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={COLORS.primary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="johndoe"
                  placeholderTextColor={COLORS.placeholderText}
                  value={formdata.username}
                  onChangeText={(text) => handelChange("username", text)}
                  onBlur={() => validateField("username", formdata.username)}
                  autoCapitalize="none"
                  editable={!loading}
                />
              </View>
              <ErrorMessage field="username" />
            </View>

            {/* EMAIL */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View
                style={[
                  styles.inputContainer,
                  errors.email && localStyles.inputError,
                ]}
              >
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={COLORS.primary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="johndoe@gmail.com"
                  value={formdata.email}
                  placeholderTextColor={COLORS.placeholderText}
                  onChangeText={(text) => handelChange("email", text)}
                  onBlur={() => validateField("email", formdata.email)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!loading}
                />
              </View>
              <ErrorMessage field="email" />
            </View>

            {/* PASSWORD */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View
                style={[
                  styles.inputContainer,
                  errors.password && localStyles.inputError,
                ]}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={COLORS.primary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="******"
                  placeholderTextColor={COLORS.placeholderText}
                  value={formdata.password}
                  onChangeText={(text) => handelChange("password", text)}
                  onBlur={() => validateField("password", formdata.password)}
                  secureTextEntry={!showPassword}
                  editable={!loading}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color={COLORS.primary}
                  />
                </TouchableOpacity>
              </View>
              <ErrorMessage field="password" />
            </View>

            {/* BUTTON */}
            <TouchableOpacity
              style={[styles.button, loading && localStyles.buttonDisabled]}
              onPress={handelSignup}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <View style={localStyles.loaderRow}>
                  <ActivityIndicator size="small" color="#fff" />
                  <Text style={localStyles.loaderText}>
                    Creating account...
                  </Text>
                </View>
              ) : (
                <Text style={styles.buttonText}>Sign Up</Text>
              )}
            </TouchableOpacity>

            {/* FOOTER */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account?</Text>
              <TouchableOpacity onPress={() => router.back()}>
                <Text style={styles.link}>Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

// ---------- Styles ----------
const localStyles = StyleSheet.create({
  inputError: {
    borderWidth: 1.5,
    borderColor: "#ff4d4f",
    borderRadius: 10,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    marginLeft: 4,
  },
  errorText: {
    color: "#ff4d4f",
    fontSize: 12,
    marginLeft: 4,
    fontWeight: "500",
  },
  buttonDisabled: {
    opacity: 0.75,
  },
  loaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  loaderText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    marginLeft: 10,
  },

  // ---------- Toast styles ----------
  toastWrapper: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 40,
    left: 16,
    right: 16,
    zIndex: 999,
    elevation: 10,
  },
  toastCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: "#fff",
    borderLeftWidth: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    width: width - 32,
  },
  toastSuccess: {
    borderLeftColor: "#22c55e",
  },
  toastError: {
    borderLeftColor: "#ef4444",
  },
  toastIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  toastIconSuccess: {
    backgroundColor: "#22c55e",
  },
  toastIconError: {
    backgroundColor: "#ef4444",
  },
  toastTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  toastMessage: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
    flexShrink: 1,
  },
});