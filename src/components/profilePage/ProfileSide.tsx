import {
  Avatar,
  Button,
  Flex,
  Icon,
  Image,
  Stack,
  Text,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import { useAuth } from "../../contexts/AuthContext";
import { FaRedditAlien } from "react-icons/fa";
import { GiCheckedShield } from "react-icons/gi";
import { MdEdit, MdPerson } from "react-icons/md";
import { useSetRecoilState } from "recoil";

import { authModelState } from "../../atoms/authModalAtom";
import useDirectory from "../../hooks/useDirectory";
import UpdateProfileModal from "../Modal/Profile/UpdateProfileModal";
import { getAvatarUrl } from "../../utils/apiConfig";

type Props = {};

function ProfileSide({}: Props) {
  const { user } = useAuth();
  const { toggleMenuOpen } = useDirectory();
  const setAuthModelState = useSetRecoilState(authModelState);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const bg = useColorModeValue("white", "#1A202C");
  const borderColor = useColorModeValue("gray.300", "#2D3748");
  const cardBg = useColorModeValue("gray.50", "#2D3748");

  const onClick = () => {
    if (!user) {
      setAuthModelState({ open: true, view: "login" });
      return;
    }

    toggleMenuOpen();
  };

  const getGenderText = () => {
    if (user?.profile?.gender === null || user?.profile?.gender === undefined) {
      return "Not specified";
    }
    return user.profile.gender ? "Male" : "Female";
  };

  return (
    <Flex
      direction="column"
      bg={bg}
      borderRadius={4}
      cursor="pointer"
      border="1px solid"
      borderColor={borderColor}
    >
      <Flex
        align="flex-end"
        justify="center"
        color="white"
        p="6px 10px"
        bg="blue.500"
        height="140px"
        borderRadius="4px 4px 0px 0px"
        fontWeight={600}
        bgImage="url(/images/recCommsArt.png)"
        backgroundSize="cover"
        bgGradient="linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.75)),
        url('https://source.unsplash.com/1600x900/?nature,photography,technolog')"
      ></Flex>
      <Flex justify="center">
        {user?.profile?.avatar ? (
          <Image
            src={getAvatarUrl(user?.profile?.avatar)}
            rounded="md"
            height="80px"
            mt="-50px"
            border="4px"
            borderColor="#fff"
            alt={`${user.profile.full_name || "User"} avatar`}
          />
        ) : (
          <Avatar
            src={user?.profile?.avatar || undefined}
            name={
              user?.profile?.full_name || (user?.email?.split("@")[0] as string)
            }
            width="80px"
            height="80px"
            mt="-50px"
            rounded="md"
          />
        )}
      </Flex>

      <Flex
        position="relative"
        align="center"
        justify="center"
        fontSize="10pt"
        fontWeight={600}
      >
        <Flex align="center" justify="center" gap={2}>
          <Text fontWeight="bold" fontSize="18pt">
            {user?.profile?.full_name || user?.email?.split("@")[0]}
          </Text>
        </Flex>
      </Flex>
      <Text fontWeight="bold" fontSize="8pt" textAlign="center">
        u/{user?.profile?.full_name?.replace(/\s+/g, "")}
      </Text>
      <Button
        width={80}
        mt={2}
        mb={2}
        ml="auto"
        mr="auto"
        height="30px"
        bgGradient="linear(to-r, brand.100, brand.100, yellow.500)"
        _hover={{
          bgGradient: "linear(to-r, brand.100, brand.100, yellow.500)",
        }}
        display="flex"
        justifyContent="start"
        gap={20}
        onClick={onOpen}
      >
        <Icon as={MdEdit} />
        Edit Profile
      </Button>
      <Flex
        justify="space-between"
        gap={4}
        pt={5}
        pb={5}
        px={4}
        direction={{ base: "column", md: "row" }}
      >
        <Flex
          flex={1}
          direction="column"
          border="1px solid"
          borderColor={borderColor}
          borderRadius={8}
          p={4}
          bg={cardBg}
        >
          <Text fontWeight="bold" fontSize="11pt" mb={2}>
            Email
          </Text>
          <Text fontWeight="medium" fontSize="10pt" color="gray.600">
            {user?.email}
          </Text>
        </Flex>
        <Flex
          flex={1}
          direction="column"
          border="1px solid"
          borderColor={borderColor}
          borderRadius={8}
          p={4}
          bg={cardBg}
        >
          <Text fontWeight="bold" fontSize="11pt" mb={2}>
            Gender
          </Text>
          <Flex align="center" gap={2}>
            <Icon as={MdPerson} color="blue.500" />
            <Text fontWeight="medium" fontSize="10pt" color="gray.600">
              {getGenderText()}
            </Text>
          </Flex>
        </Flex>
      </Flex>
      <Button
        width={80}
        mt={2}
        mb={2}
        ml="auto"
        mr="auto"
        height="30px"
        display="flex"
        justifyContent="center"
        rounded="md"
        onClick={onClick}
      >
        NEW POST
      </Button>
      <UpdateProfileModal isOpen={isOpen} onClose={onClose} />
    </Flex>
  );
}

export default ProfileSide;
