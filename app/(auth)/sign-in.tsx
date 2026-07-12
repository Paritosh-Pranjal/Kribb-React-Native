import { useSignIn } from "@clerk/expo";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function SignIn() {
  const { signIn, errors, fetchStatus } = useSignIn();

  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState("");

  const isLoading = fetchStatus === "fetching";

  async function onSignInPress() {
    console.log("Sign In Pressed");
    const { error } = await signIn.password({
      emailAddress: email,
      password: password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    if (signIn.status === "complete") {
      await signIn.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) {
            console.log("Current Task: ", session.currentTask);
            return;
          }
          const url = decorateUrl("/");
          router.replace(url as any);
        },
      });
    } else if (signIn.status === "needs_second_factor") {
      await signIn.mfa.sendPhoneCode();
    } else if (signIn.status === "needs_client_trust") {
      const emailCodeFactor = signIn.supportedSecondFactors.find(
        (factor) => factor.strategy === "email_code",
      );
      if (emailCodeFactor) {
        await signIn.mfa.sendEmailCode();
      } else {
        console.error("Sign-in attempt not complete", signIn);
      }
    }
  }

  async function onVerifyPress() {
    await signIn.mfa.verifyEmailCode({
      code,
    });

    if (signIn.status === "complete") {
      await signIn.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) {
            console.log("Current Task: ", session.currentTask);
            return;
          }
          const url = decorateUrl("/");
          router.replace(url as any);
        },
      });
    }
  }

  if (signIn.status === "needs_client_trust") {
    return (
      <KeyboardAvoidingView
        className="flex-1 bg-white"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 justify-center px-6 py-12">
            <Image
              source={require("../../assets/images/kribb.png")}
              className="w-16 h-16 mb-6 self-center"
              resizeMode="contain"
            />
            <Text className="text-2xl font-bold text-gray-900 mb-2 text-center">
              Verify Account
            </Text>
            <Text className="text-gray-500 mb-10 text-center leading-5">
              We have sent a code to{"\n"}
              <Text className="text-primary font-medium">{email}</Text>
            </Text>
            <TextInput
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 mb-3 text-gray-900 text-center tracking-widest"
              placeholder="Enter verification code"
              placeholderTextColor="#9CA3AF"
              keyboardType="number-pad"
              value={code}
              onChangeText={setCode}
            />
            {errors.fields.code && (
              <Text className="text-red-500 text-sm mb-3">
                {errors.fields.code.message}
              </Text>
            )}

            <TouchableOpacity
              onPress={onVerifyPress}
              disabled={isLoading}
              className="w-full bg-primary py-4 rounded-2xl items-center mb-4 mt-2 shadow-sm active:opacity-90"
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold text-base">
                  Verify Otp
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => signIn.mfa.sendEmailCode()}
              disabled={isLoading}
              className="py-2 self-center"
            >
              <Text className="text-primary font-medium">
                I need a new code
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 24}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 justify-center px-6 py-12">
          <Image
            source={require("../../assets/images/kribb.png")}
            className="w-16 h-16 mb-6 self-center"
            resizeMode="contain"
          />
          <Text className="text-3xl font-bold text-gray-900 mb-2 text-center">
            Welcome Back
          </Text>
          <Text className="text-gray-500 mb-10 text-center">
            Find your dream home today.
          </Text>
          <TextInput
            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 mb-3 text-gray-900"
            placeholder="Email Address"
            placeholderTextColor="#9CA3AF"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          {errors.fields.identifier && (
            <Text className="text-red-500 text-sm mb-3">
              {errors.fields.identifier.message}
            </Text>
          )}
          <View className="w-full flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 mb-3">
            <TextInput
              className="flex-1 py-3.5 text-gray-900"
              placeholder="Password"
              placeholderTextColor="#9CA3AF"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />

            <Pressable onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={20}
                color="#9CA3AF"
              />
            </Pressable>
          </View>
          {errors.fields.password && (
            <Text className="text-red-500 text-sm mb-3">
              {errors.fields.password.message}
            </Text>
          )}

          <TouchableOpacity
            onPress={onSignInPress}
            disabled={isLoading}
            className="w-full bg-primary py-4 rounded-2xl items-center mb-6 mt-3 shadow-sm active:opacity-90"
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-base">Sign In</Text>
            )}
          </TouchableOpacity>

          <View className="flex-row justify-center">
            <Text className="text-gray-500">Don&apos;t have an account?</Text>
            <Link href="/sign-up">
              <Text className="text-primary font-bold"> Sign up</Text>
            </Link>
          </View>

          <View nativeID="clerk-captcha" />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
