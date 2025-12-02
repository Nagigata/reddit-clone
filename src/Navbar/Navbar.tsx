import { Flex, Image, useColorMode, useColorModeValue } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { defaultMenuItem } from "../atoms/directoryMenuAtom";
import useDirectory from "../hooks/useDirectory";
import Directory from "./Directory/Directory";
import RightContent from "./RightContent/RightContent";
import SearchInput from "./SearchInput";
import { redditProfileImage } from "./store";
import { useUser } from "../context/userContext";
import axios from "axios";

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

const Navbar: React.FC = () => {
  const { onSelectMenuItem } = useDirectory();
  const { colorMode } = useColorMode();
  const bg = useColorModeValue("white", "blackAlpha.800");
  const [userInfoLocal, setUserInfoLocal] = useState<User | null>();
  const { accessToken, setUserInfo } = useUser();

  const getUserData = async () => {
    if (accessToken) {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/profile`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        const dataUser : User = {
          user_id: response.data.id,
          email: response.data.email,
          is_admin: response.data.is_admin,
          profile: {
            profile_id: response.data.profile_id,
            full_name: response.data.user_id,
            avatar: response.data.avatar,
            gender: response.data.gender
          }
        }
        setUserInfoLocal(dataUser);
        setUserInfo(dataUser);
      } catch (error) {
        console.log(error);
      }
    } else return;
  };

  useEffect(() => {
    getUserData();
  }, [accessToken]);

  useEffect(() => {
    if(!accessToken) {
      setUserInfoLocal(null);
    }
  }, [accessToken]);

  return (
    <Flex
      bg={bg}
      height="44px"
      padding="6px 12px"
      justify={{ md: "space-between" }}
    >
      <Flex
        align="center"
        width={{ base: "40px", md: "auto" }}
        mr={{ base: 0, md: 2 }}
        cursor="pointer"
        onClick={() => onSelectMenuItem(defaultMenuItem)}
      >
        <Image src="/images/redditFace.svg" height="30px" />
        <Image
          src={
            colorMode === "light"
              ? "/images/redditText.svg"
              : "/images/Reddit-Word-Dark.svg"
          }
          height="46px"
          display={{ base: "none", md: "unset" }}
        />
      </Flex>
      {userInfoLocal && <Directory />}
      <SearchInput user={userInfoLocal} />
      <RightContent user={userInfoLocal} />
    </Flex>
  );
};
export default Navbar;
