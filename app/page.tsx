"use client";

import { supabase } from "@/lib/supabaseClient";
import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  useToast
} from "@chakra-ui/react";

const PROD_REDIRECT = "https://jobtrckr.vercel.app/auth/callback";
const DEV_REDIRECT = "http://localhost:3000/auth/callback";

export default function LoginPage() {
  const toast = useToast();

  const handleLogin = async () => {
    const redirectTo =
      typeof window !== "undefined" && window.location.hostname === "localhost"
        ? DEV_REDIRECT
        : PROD_REDIRECT;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo
      }
    });

    if (error) {
      toast({
        title: "Login failed",
        description: error.message,
        status: "error"
      });
    }
  };

  return (
    <Flex minH="100vh" bg="gray.900" align="center" justify="center" px={4}>
      <Box bg="gray.800" p={8} rounded="lg" shadow="xl" w="full" maxW="md">
        <Heading size="lg" color="white" mb={2}>
          JobTrackr
        </Heading>
        <Text color="gray.300" mb={6}>
          Sign in with Google to view your job applications.
        </Text>
        <Button onClick={handleLogin} colorScheme="blue" w="full" size="md">
          Continue with Google
        </Button>
      </Box>
    </Flex>
  );
}
