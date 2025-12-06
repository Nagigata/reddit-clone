import { Button, Flex, Image, Text, useColorModeValue } from "@chakra-ui/react";
import React, { useState } from "react";

const OAuthButtons: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hoverBg = useColorModeValue("gray.50", "#2A4365");

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      // await userService.signInWithGoogle();
      setError("OAuth sign in is not yet implemented");
    } catch (err: any) {
      setError(err.message || "Failed to sign in with Google");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex direction="column" width="100%" mb={2}>
      <Button
        variant="oauth"
        _hover={{ bg: hoverBg }}
        mb={2}
        isLoading={loading}
        onClick={handleGoogleSignIn}
        isDisabled={true}
      >
        <Image src="/images/googlelogo.png" height="20px" mr={4} alt="Google logo" />
        Continue with Google
      </Button>
    </Flex>
  );
};
export default OAuthButtons;
