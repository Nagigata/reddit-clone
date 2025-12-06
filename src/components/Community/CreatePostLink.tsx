import { Flex, Icon, Input, Text, Tooltip, useColorModeValue } from "@chakra-ui/react";
import { useRouter } from "next/router";
import React from "react";
import { BsLink45Deg } from "react-icons/bs";
import { FaReddit } from "react-icons/fa";
import { IoImageOutline } from "react-icons/io5";
import { useSetRecoilState } from "recoil";

import { authModelState } from "../../atoms/authModalAtom";
import { useAuth } from "../../contexts/AuthContext";
import useDirectory from "../../hooks/useDirectory";
import useCommunityData from "../../hooks/useCommunityData";

const CreatePostLink: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { toggleMenuOpen } = useDirectory();
  const { communityStateValue } = useCommunityData();
  const setAuthModelState = useSetRecoilState(authModelState);
  const bg = useColorModeValue("white", "#1A202C");
  const borderColor = useColorModeValue("gray.300", "#2D3748");
  const searchBg = useColorModeValue("gray.50", "#2D3748");
  const searchBorder = useColorModeValue("gray.200", "#4A5568");
  const hoverBorderColor = useColorModeValue("blue.300", "blue.600");
  const iconColor = useColorModeValue("gray.400", "gray.500");

  const currentCommunity = communityStateValue.currentCommunity;
  
  // Check if user is a member (status APPROVED)
  const isMember = !!communityStateValue.mySnippets.find(
    (snippet) => snippet.communityId === currentCommunity?.id
  );
  const isCreator = user && currentCommunity && String(user.id) === currentCommunity.creatorId;
  const hasAccess = isMember || isCreator;

  // Private or Restricted: only members can create posts
  const isPrivate = currentCommunity?.typeId === 1;
  const isRestricted = currentCommunity?.typeId === 3;
  const requiresMembership = isPrivate || isRestricted;
  const canCreatePost = !requiresMembership || hasAccess;

  const onClick = () => {
    if (!user) {
      setAuthModelState({ open: true, view: "login" });
      return;
    }

    // Check access for private/restricted communities
    if (requiresMembership && !hasAccess) {
      // Navigate to community page to show join button
      if (currentCommunity) {
        router.push(`/r/${currentCommunity.id}`);
      }
      return;
    }

    const { communityId } = router.query;

    if (communityId) {
      router.push(`/r/${communityId}/submit`);
      return;
    }

    toggleMenuOpen();
  };

  const isDisabled = requiresMembership && !hasAccess;
  const tooltipText = isDisabled
    ? isPrivate
      ? "You must be a member to create posts"
      : "You must join this community to create posts"
    : "";

  return (
    <Tooltip label={tooltipText} isDisabled={!isDisabled}>
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
          boxShadow: isDisabled ? undefined : "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          borderColor: isDisabled ? undefined : hoverBorderColor
      }}
      transition="all 0.2s ease-in-out"
        cursor={isDisabled ? "not-allowed" : "pointer"}
        opacity={isDisabled ? 0.6 : 1}
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
        placeholder={isDisabled ? "Join to create posts" : "Create Post"}
        fontSize="10pt"
        _placeholder={{ color: "gray.500" }}
        _hover={{
          bg: isDisabled ? undefined : bg,
          border: isDisabled ? undefined : "1px solid",
          borderColor: isDisabled ? undefined : "blue.500",
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
        isReadOnly={isDisabled}
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
    </Tooltip>
  );
};
export default CreatePostLink;
