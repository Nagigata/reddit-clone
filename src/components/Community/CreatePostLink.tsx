import { Flex, Icon, Input, useColorModeValue } from "@chakra-ui/react";
import { useRouter } from "next/router";
import React from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { BsLink45Deg } from "react-icons/bs";
import { FaReddit } from "react-icons/fa";
import { IoImageOutline } from "react-icons/io5";
import { useSetRecoilState } from "recoil";

import { authModelState } from "../../atoms/authModalAtom";
import { auth } from "../../firebase/clientApp";
import useDirectory from "../../hooks/useDirectory";

const CreatePostLink: React.FC = () => {
  const router = useRouter();
  const [user] = useAuthState(auth);
  const { toggleMenuOpen } = useDirectory();
  const setAuthModelState = useSetRecoilState(authModelState);
  const bg = useColorModeValue("white", "#1A202C");
  const borderColor = useColorModeValue("gray.300", "#2D3748");
  const searchBg = useColorModeValue("gray.50", "#2D3748");
  const searchBorder = useColorModeValue("gray.200", "#4A5568");
  const hoverBorderColor = useColorModeValue("blue.300", "blue.600");
  const iconColor = useColorModeValue("gray.400", "gray.500");

  const onClick = () => {
    if (!user) {
      setAuthModelState({ open: true, view: "login" });
      return;
    }

    const { communityId } = router.query;

    if (communityId) {
      router.push(`/r/${communityId}/submit`);
      return;
    }

    toggleMenuOpen();

    /*
    if (community) {
      router.push(`/r/${router.query.community}/submit`);
      return;
    }
    */
  };

  return (
    <Flex
      justify="space-evenly"
      align="center"
      bg={bg}
      height="56px"
      borderRadius={8}
      border="1px solid"
      borderColor={borderColor}
      p={2}
      mb={4}
      boxShadow="0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)"
      _hover={{ 
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        borderColor: hoverBorderColor
      }}
      transition="all 0.2s ease-in-out"
      cursor="pointer"
      onClick={onClick}
    >
      <Icon 
        as={FaReddit} 
        fontSize={36} 
        color={iconColor} 
        mr={4}
        _hover={{ color: "brand.100", transform: "scale(1.1)" }}
        transition="all 0.2s ease-in-out"
      />
      <Input
        placeholder="Create Post"
        fontSize="10pt"
        _placeholder={{ color: "gray.500" }}
        _hover={{
          bg: bg,
          border: "1px solid",
          borderColor: "blue.500",
        }}
        _focus={{
          outline: "none",
          bg: bg,
          border: "1px solid",
          borderColor: "blue.500",
          boxShadow: "0 0 0 3px rgba(66, 153, 225, 0.1)",
        }}
        bg={searchBg}
        borderColor={searchBorder}
        height="36px"
        borderRadius={6}
        mr={4}
        onClick={onClick}
        transition="all 0.2s ease-in-out"
      />
      <Icon
        as={IoImageOutline}
        fontSize={24}
        mr={4}
        color={iconColor}
        cursor="pointer"
        _hover={{ color: "blue.500", transform: "scale(1.1)" }}
        transition="all 0.2s ease-in-out"
      />
      <Icon 
        as={BsLink45Deg} 
        fontSize={24} 
        color={iconColor} 
        cursor="pointer"
        _hover={{ color: "blue.500", transform: "scale(1.1)" }}
        transition="all 0.2s ease-in-out"
      />
    </Flex>
  );
};
export default CreatePostLink;
