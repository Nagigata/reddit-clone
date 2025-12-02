import { Button, Flex } from "@chakra-ui/react";
import React from "react";
import AuthModel from "../../components/Modal/Auth/AuthModel";
import AuthButtons from "./AuthButtons";
import Icons from "./Icons";
import UserMenu from "./UserMenu";

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

type RightContentProps = {
  user?: User | null;
};

const RightContent: React.FC<RightContentProps> = ({ user }) => {
  return (
    <>
      <AuthModel />
      <Flex justify="center" align="center">
        {user ? <Icons /> : <AuthButtons />}
        <UserMenu user={user} />
      </Flex>
    </>
  );
};
export default RightContent;
