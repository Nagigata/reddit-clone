import {
  Button,
  Flex,
  Icon,
  Stack,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { FaReddit } from "react-icons/fa";
import { useSetRecoilState } from "recoil";

import { authModelState } from "../../atoms/authModalAtom";
import { useAuth } from "../../contexts/AuthContext";
import useDirectory from "../../hooks/useDirectory";
import CreateCommunityModel from "../Modal/CreateCommunity/CreateCommunityModel";

const PersonalHome: React.FC = () => {
  const { user: authUser } = useAuth();
  const router = useRouter();
  const { toggleMenuOpen } = useDirectory();
  const setAuthModalState = useSetRecoilState(authModelState);
  const [open, setOpen] = useState(false);
  const bg = useColorModeValue("white", "#1A202C");
  const borderColor = useColorModeValue("gray.300", "#2D3748");

  const handleCreatePost = () => {
    if (!authUser) {
      setAuthModalState({ open: true, view: "login" });
      return;
    }

    // If not on home page, navigate to home first
    if (router.asPath !== "/") {
      router.push("/");
      // Wait a bit for navigation, then open directory menu
      setTimeout(() => {
        toggleMenuOpen();
      }, 100);
    } else {
      // Already on home page, just open directory menu
      toggleMenuOpen();
    }
  };

  return (
    <Flex
      direction="column"
      bg={bg}
      borderRadius={4}
      cursor="pointer"
      border="1px solid"
      borderColor={borderColor}
      position="sticky"
    >
      <CreateCommunityModel open={open} handleClose={() => setOpen(false)} />
      <Flex
        align="flex-end"
        color="white"
        p="6px 10px"
        bg="blue.500"
        height="34px"
        borderRadius="4px 4px 0px 0px"
        fontWeight={600}
        bgImage="url(/images/sgf6r5easbh31.jpg)"
        backgroundSize="cover"
      ></Flex>
      <Flex direction="column" p="12px">
        <Flex align="center" mb={2}>
          <Icon as={FaReddit} fontSize={50} color="brand.100" mr={2} />
          <Text fontWeight={600}>Home</Text>
        </Flex>
        <Stack spacing={3}>
          <Text fontSize="9pt">
            Your personal Reddit frontpage, built for you.
          </Text>
          <Button height="30px" onClick={handleCreatePost}>
            Create Post
          </Button>
          <Button
            disabled={!authUser}
            variant="outline"
            height="30px"
            onClick={() => {
              setOpen(true);
            }}
          >
            Create Community
          </Button>
        </Stack>
      </Flex>
    </Flex>
  );
};
export default PersonalHome;
