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

const FALLBACK_SITE = "https://jobtrckr.vercel.app";
const LOCAL_REDIRECT = "http://localhost:3000/auth/callback";

function resolveSiteUrl() {
  const envSite = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  return envSite && envSite.length > 0 ? envSite : FALLBACK_SITE;
}

function resolveRedirectUrl() {
  const siteUrl = resolveSiteUrl();
  const runtimeOrigin =
    typeof window !== "undefined" && window.location.origin
      ? window.location.origin
      : siteUrl;

  if (runtimeOrigin.startsWith("http://localhost")) {
    return LOCAL_REDIRECT;
  }

  return `${siteUrl.replace(/\/$/, "")}/auth/callback`;
}

export default function LoginPage() {
  const toast = useToast();

  const handleLogin = async () => {
    const redirectTo = resolveRedirectUrl();

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
          Sign in with Google to manage your job applications.
        </Text>
        <Button colorScheme="blue" w="full" size="md" onClick={handleLogin}>
          Continue with Google
        </Button>
      </Box>
    </Flex>
  );
}
