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
    // POST call
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
              className="mb-6 h-16 w-16 self-center"
              resizeMode="contain"
            />
            <Text className="mb-2 text-center font-bold text-2xl text-gray-900">
              Verify Account
            </Text>
            <Text className="mb-10 text-center leading-5 text-gray-500">
              We have sent a code to{"\n"}
              <Text className="font-medium text-primary">{email}</Text>
            </Text>
            <TextInput
              className="mb-3 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-center tracking-widest text-gray-900"
              placeholder="Enter verification code"
              placeholderTextColor="#9CA3AF"
              keyboardType="number-pad"
              value={code}
              onChangeText={setCode}
            />
            {errors.fields.code && (
              <Text className="mb-3 text-sm text-red-500">
                {errors.fields.code.message}
              </Text>
            )}

            <TouchableOpacity
              onPress={onVerifyPress}
              disabled={isLoading}
              className="mb-4 mt-2 w-full items-center rounded-2xl bg-primary py-4 shadow-sm active:opacity-90"
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="font-bold text-base text-white">
                  Verify Otp
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => signIn.mfa.sendEmailCode()}
              disabled={isLoading}
              className="self-center py-2"
            >
              <Text className="font-medium text-primary">
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
            className="mb-6 h-16 w-16 self-center"
            resizeMode="contain"
          />
          <Text className="mb-2 text-center font-bold text-3xl text-gray-900">
            Welcome Back
          </Text>
          <Text className="mb-10 text-center text-gray-500">
            Find your dream home today.
          </Text>
          <TextInput
            className="mb-3 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-gray-900"
            placeholder="Email Address"
            placeholderTextColor="#9CA3AF"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          {errors.fields.identifier && (
            <Text className="mb-3 text-sm text-red-500">
              {errors.fields.identifier.message}
            </Text>
          )}
          <View className="mb-3 w-full flex-row items-center rounded-2xl border border-gray-200 bg-gray-50 px-4">
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
            <Text className="mb-3 text-sm text-red-500">
              {errors.fields.password.message}
            </Text>
          )}

          <TouchableOpacity
            onPress={onSignInPress}
            disabled={isLoading}
            className="mb-6 mt-3 w-full items-center rounded-2xl bg-primary py-4 shadow-sm active:opacity-90"
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="font-bold text-base text-white">Sign In</Text>
            )}
          </TouchableOpacity>

          <View className="flex-row justify-center">
            <Text className="text-gray-500">Don&apos;t have an account?</Text>
            <Link href="/sign-up">
              <Text className="font-bold text-primary"> Sign up</Text>
            </Link>
          </View>

          <View nativeID="clerk-captcha" />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
