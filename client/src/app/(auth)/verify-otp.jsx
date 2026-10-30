import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
  Easing,
  ScrollView,
} from "react-native";
import axiosClient from "../../api/axios.client.js";
import * as SecureStore from 'expo-secure-store';
import { useDispatch } from 'react-redux';
import { setUser } from "../../store/slices/userslice.js";

const COLORS = {
  primary: "#4CAF50",
  textPrimary: "#2e5a2e",
  textSecondary: "#688f68",
  textDark: "#1b361b",
  placeholderText: "#767676",
  background: "#e8f5e9",
  cardBackground: "#f1f8f2",
  inputBackground: "#f4faf5",
  border: "#c8e6c9",
  white: "#ffffff",
  black: "#000000",
  success: "#2e7d32",
  successBg: "#e6f4ea",
  error: "#d32f2f",
  errorBg: "#fdecea",
};

const OTP_LENGTH = 6;


export default function OtpVerificationScreen({
  email: initialEmail = "user@example.com",
  onVerify, // optional callback (code, response) => {}  fired after successful verify
  onResend, // async () => {}
}) {
  const Dispatch=useDispatch()
  const [email, setEmail] = useState(initialEmail);
  const [emailError, setEmailError] = useState("");
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(30);

  // Alert state
  const [alert, setAlert] = useState(null); // { type: 'success' | 'error', message }

  const inputs = useRef([]);
  const emailInputRef = useRef(null);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const alertAnim = useRef(new Animated.Value(0)).current; // 0 = hidden, 1 = visible
  const alertTimer = useRef(null);
  const scaleAnims = useRef(
    Array.from({ length: OTP_LENGTH }, () => new Animated.Value(1))
  ).current;

  // Entrance animation
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  // Resend countdown
  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  // Cleanup alert timer on unmount
  useEffect(() => {
    return () => {
      if (alertTimer.current) clearTimeout(alertTimer.current);
    };
  }, []);

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const bounce = (index) => {
    Animated.sequence([
      Animated.timing(scaleAnims[index], {
        toValue: 1.15,
        duration: 90,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnims[index], {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Beautiful animated alert
  const showAlert = (type, message) => {
    if (alertTimer.current) clearTimeout(alertTimer.current);
    setAlert({ type, message });
    alertAnim.setValue(0);
    Animated.spring(alertAnim, {
      toValue: 1,
      friction: 7,
      tension: 80,
      useNativeDriver: true,
    }).start();

    alertTimer.current = setTimeout(() => {
      hideAlert();
    }, 3500);
  };

  const hideAlert = () => {
    Animated.timing(alertAnim, {
      toValue: 0,
      duration: 220,
      easing: Easing.in(Easing.quad),
      useNativeDriver: true,
    }).start(() => setAlert(null));
  };

  const validateEmail = (value) => {
    const trimmed = value.trim();
    if (!trimmed) return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) return "Please enter a valid email address";
    return "";
  };

  const handleEmailChange = (text) => {
    setEmail(text);
    if (emailError) setEmailError("");
    if (error) setError("");
  };

  const handleChange = (text, index) => {
    setError("");
    // Support pasting the full code into the first box
    if (text.length > 1) {
      const digits = text.replace(/\D/g, "").slice(0, OTP_LENGTH).split("");
      const next = [...otp];
      digits.forEach((d, i) => {
        if (index + i < OTP_LENGTH) next[index + i] = d;
      });
      setOtp(next);
      const lastFilled = Math.min(index + digits.length, OTP_LENGTH - 1);
      inputs.current[lastFilled]?.focus();
      return;
    }

    const digit = text.replace(/\D/g, "");
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    bounce(index);

    if (digit && index < OTP_LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  // Actual API call
  const verifyOtpWithApi = async (code, emailValue) => {
    
    const response = await axiosClient.post("/auth/verify-otp", {
      email: emailValue,
      otp: code,
    });

    // axiosClient usually returns the parsed data directly.
    // Handle both axios-style (data.data) and direct data shapes.
    const data = response?.data ?? response ?? {};

    const isSuccess = data?.success ?? true;
    if (!isSuccess) {
      const msg =
        data?.message || data?.error || "Invalid OTP. Please try again.";
      throw new Error(msg);
    }

    return data;
  };

  const handleVerify = async () => {
    // Validate email first
    const emailValidationError = validateEmail(email);
    if (emailValidationError) {
      setEmailError(emailValidationError);
      setError(emailValidationError);
      showAlert("error", emailValidationError);
      shake();
      emailInputRef.current?.focus();
      return;
    }

    const code = otp.join("");
    if (code.length !== OTP_LENGTH) {
      const msg = "Please enter all 6 digits";
      setError(msg);
      showAlert("error", msg);
      shake();
      return;
    }

    setLoading(true);
    setError("");

    try {
      // call API
      const data = await verifyOtpWithApi(code, email.trim());


      // Persist / pass along token + user
      // (hook this into AsyncStorage / your auth context as needed)
      const { token, user, message } = data;
      await SecureStore.setItemAsync("token",token);
      Dispatch(setUser(user));



      showAlert(
        "success",
        message || "OTP verified successfully! Welcome back."
      );

      // bubble up to parent
      onVerify?.(code, { token, user, message, email: email.trim(), raw: data });
    } catch (err) {
      const msg = err?.message || "Something went wrong. Please try again.";
      setError(msg);
      showAlert("error", msg);
      shake();
      setOtp(Array(OTP_LENGTH).fill(""));
      inputs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;

    const emailValidationError = validateEmail(email);
    if (emailValidationError) {
      setEmailError(emailValidationError);
      showAlert("error", emailValidationError);
      shake();
      emailInputRef.current?.focus();
      return;
    }

    try {
      await onResend?.(email.trim());
      setResendTimer(30);
      setOtp(Array(OTP_LENGTH).fill(""));
      setError("");
      inputs.current[0]?.focus();
      showAlert("success", "A new OTP has been sent to your email.");
    } catch (err) {
      showAlert("error", "Failed to resend OTP");
    }
  };

  const isFilled = otp.every((d) => d !== "");

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      {/* Animated Alert Banner */}
      {alert ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.alertWrap,
            {
              opacity: alertAnim,
              transform: [
                {
                  translateY: alertAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-80, 0],
                  }),
                },
                {
                  scale: alertAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.9, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <View
            style={[
              styles.alertBox,
              {
                backgroundColor:
                  alert.type === "success"
                    ? COLORS.successBg
                    : COLORS.errorBg,
                borderColor:
                  alert.type === "success" ? COLORS.success : COLORS.error,
              },
            ]}
          >
            <View
              style={[
                styles.alertIconCircle,
                {
                  backgroundColor:
                    alert.type === "success" ? COLORS.success : COLORS.error,
                },
              ]}
            >
              <Text style={styles.alertIcon}>
                {alert.type === "success" ? "✓" : "!"}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.alertTitle,
                  {
                    color:
                      alert.type === "success" ? COLORS.success : COLORS.error,
                  },
                ]}
              >
                {alert.type === "success" ? "Success" : "Error"}
              </Text>
              <Text style={styles.alertMessage}>{alert.message}</Text>
            </View>
          </View>
        </Animated.View>
      ) : null}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
          {/* Icon */}
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>🔐</Text>
          </View>

          <Text style={styles.title}>Verify Your Email</Text>
          <Text style={styles.subtitle}>
            Enter your email and the 6-digit code{"\n"}we sent to your inbox
          </Text>

          {/* Email Input */}
          <View style={styles.emailFieldWrapper}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <View
              style={[
                styles.emailInputBox,
                {
                  borderColor: emailError
                    ? COLORS.error
                    : COLORS.border,
                  backgroundColor: COLORS.white,
                },
              ]}
            >
              <Text style={styles.emailIcon}>✉️</Text>
              <TextInput
                ref={emailInputRef}
                value={email}
                onChangeText={handleEmailChange}
                onBlur={() => {
                  if (email.trim()) {
                    const err = validateEmail(email);
                    setEmailError(err);
                  }
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
                placeholder="you@example.com"
                placeholderTextColor={COLORS.placeholderText}
                selectionColor={COLORS.primary}
                style={styles.emailInput}
              />
            </View>
            {emailError ? (
              <Text style={styles.fieldErrorText}>{emailError}</Text>
            ) : null}
          </View>

          {/* OTP Label */}
          <Text style={[styles.inputLabel, styles.otpLabel]}>
            Verification Code
          </Text>

          {/* OTP Inputs */}
          <Animated.View
            style={[styles.otpRow, { transform: [{ translateX: shakeAnim }] }]}
          >
            {otp.map((digit, index) => {
              const isFocused = focusedIndex === index;
              return (
                <Animated.View
                  key={index}
                  style={[
                    styles.otpBox,
                    {
                      borderColor: isFocused
                        ? COLORS.primary
                        : digit
                        ? COLORS.primary
                        : COLORS.border,
                      backgroundColor: isFocused
                        ? COLORS.inputBackground
                        : COLORS.white,
                      transform: [{ scale: scaleAnims[index] }],
                      shadowColor: isFocused ? COLORS.primary : "transparent",
                      shadowOpacity: isFocused ? 0.35 : 0,
                      shadowRadius: isFocused ? 8 : 0,
                      shadowOffset: { width: 0, height: 2 },
                      elevation: isFocused ? 4 : 0,
                    },
                  ]}
                >
                  <TextInput
                    ref={(ref) => (inputs.current[index] = ref)}
                    value={digit}
                    onChangeText={(t) => handleChange(t, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    onFocus={() => setFocusedIndex(index)}
                    keyboardType="number-pad"
                    maxLength={1}
                    autoFocus={index === 0}
                    style={styles.otpInput}
                    selectionColor={COLORS.primary}
                    placeholder="•"
                    placeholderTextColor={COLORS.placeholderText}
                    editable={!loading}
                  />
                </Animated.View>
              );
            })}
          </Animated.View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {/* Verify Button */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={handleVerify}
            disabled={loading}
            style={styles.verifyWrapper}
          >
            <View
              style={[
                styles.verifyButton,
                { backgroundColor: isFilled ? COLORS.primary : COLORS.border },
              ]}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.verifyText}>Verify OTP</Text>
              )}
            </View>
          </TouchableOpacity>

          {/* Resend */}
          <View style={styles.resendRow}>
            <Text style={styles.resendLabel}>Didn't receive the code? </Text>
            <TouchableOpacity
              onPress={handleResend}
              disabled={resendTimer > 0}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.resendAction,
                  {
                    color:
                      resendTimer > 0 ? COLORS.textSecondary : COLORS.primary,
                  },
                ]}
              >
                {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend"}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 24,
    paddingVertical: 32,
    paddingHorizontal: 22,
    alignItems: "center",
    shadowColor: COLORS.textDark,
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.inputBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  iconText: { fontSize: 32 },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.textDark,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },

  // ---- Email field ----
  emailFieldWrapper: {
    width: "100%",
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 8,
    letterSpacing: 0.3,
    alignSelf: "flex-start",
  },
  emailInputBox: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 14,
  },
  emailIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  emailInput: {
    flex: 1,
    height: "100%",
    fontSize: 15,
    color: COLORS.textDark,
    paddingVertical: 0,
  },
  fieldErrorText: {
    color: COLORS.error,
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
  },

  // ---- OTP ----
  otpLabel: {
    marginBottom: 10,
  },
  otpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 18,
  },
  otpBox: {
    flex: 1,
    aspectRatio: 1,
    marginHorizontal: 4,
    maxWidth: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  otpInput: {
    width: "100%",
    height: "100%",
    textAlign: "center",
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.textDark,
    paddingVertical: 0,
  },
  errorText: {
    color: "#d32f2f",
    fontSize: 13,
    marginBottom: 10,
    textAlign: "center",
  },
  verifyWrapper: {
    width: "100%",
    marginTop: 6,
  },
  verifyButton: {
    width: "100%",
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.primary,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  verifyText: {
    color: COLORS.white,
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.4,
  },
  resendRow: {
    flexDirection: "row",
    marginTop: 20,
    alignItems: "center",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  resendLabel: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  resendAction: {
    fontSize: 13,
    fontWeight: "700",
  },

  // ---- Alert styles ----
  alertWrap: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 30,
    left: 16,
    right: 16,
    zIndex: 999,
    maxWidth: 420,
    alignSelf: "center",
  },
  alertBox: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  alertIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  alertIcon: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "900",
    lineHeight: 20,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 2,
    letterSpacing: 0.3,
  },
  alertMessage: {
    fontSize: 13,
    color: COLORS.textDark,
    lineHeight: 17,
  },
});