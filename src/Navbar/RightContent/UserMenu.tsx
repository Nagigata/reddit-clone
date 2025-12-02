import { ChevronDownIcon } from "@chakra-ui/icons";
import {
  Flex,
  Icon,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Switch,
  Text,
  useColorMode,
} from "@chakra-ui/react";
import React from "react";
import { CgProfile } from "react-icons/cg";
import { FaRedditSquare } from "react-icons/fa";
import { MdOutlineLogin } from "react-icons/md";
import { VscAccount } from "react-icons/vsc";

import { useRouter } from "next/router";
import { IoSparkles } from "react-icons/io5";
import { useSetRecoilState } from "recoil";
import { authModelState } from "../../atoms/authModalAtom";
import { auth } from "../../firebase/clientApp";
import { useUser } from "../../context/userContext";

interface UserProfile {
  profile_id: number;
  full_name: string;
  avatar: string | null;
  gender: string | null;
}

export interface User {
  user_id: number;
  email: string;
  is_admin: boolean;
  profile: UserProfile;
}

type UserMenuProps = {
  user?: User | null;
};

const UserMenu: React.FC<UserMenuProps> = ({ user }) => {
  const router = useRouter();
  const setAuthModalState = useSetRecoilState(authModelState);
  const { signOut } = useUser();
  const { colorMode, toggleColorMode } = useColorMode();

  const handelNavigatePage = () => {
    if (user) {
      router.push({
        pathname: `/profile/${user?.user_id}`,
        query: {
          uid: user?.user_id.toString(),
        },
      });
    }
  };

  const logout = async () => {
    signOut();
  };

  return (
    <Menu>
      <MenuButton
        cursor="pointer"
        padding="0px 6px"
        borderRadius={4}
        _hover={{ outline: "1px solid", outlineColor: "gray.200" }}
      >
        <Flex align="center">
          <Flex align="center">
            {user ? (
              <>
                <Icon
                  fontSize={24}
                  mr={1}
                  color="gray.300"
                  as={FaRedditSquare}
                />
                <Flex
                  display={{ base: "none", lg: "flex" }}
                  flexDirection="column"
                  fontSize="8pt"
                  alignItems="flex-start"
                  mr={8}
                >
                  <Text fontWeight={700}>
                    {user?.profile.full_name || user?.email?.split("@")[0]}
                  </Text>
                  <Flex alignItems="center">
                    <Icon as={IoSparkles} color="brand.100" mr={1} />
                    <Text color="gray.400">1 karma</Text>
                  </Flex>
                </Flex>
              </>
            ) : (
              <Icon fontSize={24} color="gray.400" as={VscAccount} />
            )}
          </Flex>
          <ChevronDownIcon />
        </Flex>
      </MenuButton>
      <MenuList mt={2}>
        <MenuItem fontSize="10pt" fontWeight="700" closeOnSelect={false}>
          <Flex gap={2} align="center">
            <Switch
              isChecked={colorMode === "dark" ? true : false}
              onChange={toggleColorMode}
            />
            <Text>Dark Mode</Text>
          </Flex>
        </MenuItem>
        {user ? (
          <>
            <MenuDivider />
            <MenuItem
              fontSize="10px"
              fontWeight={700}
              _hover={{ bg: "blue.500", color: "white" }}
            >
              <Flex align="center" onClick={handelNavigatePage}>
                <Icon fontSize={20} mr={2} as={CgProfile} />
                Profile
              </Flex>
            </MenuItem>
            <MenuDivider />
            <MenuItem
              fontSize="10px"
              fontWeight={700}
              _hover={{ bg: "blue.500", color: "white" }}
              onClick={logout}
            >
              <Flex align="center">
                <Icon fontSize={20} mr={2} as={MdOutlineLogin} />
                Log Out
              </Flex>
            </MenuItem>
          </>
        ) : (
          <>
            <MenuItem
              fontSize="10px"
              fontWeight={700}
              _hover={{ bg: "blue.500", color: "white" }}
              onClick={() => setAuthModalState({ open: true, view: "login" })}
            >
              <Flex align="center">
                <Icon fontSize={20} mr={2} as={MdOutlineLogin} />
                Log In / Sign Up
              </Flex>
            </MenuItem>
          </>
        )}
      </MenuList>
    </Menu>
  );
};
export default UserMenu;
