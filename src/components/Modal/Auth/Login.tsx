import { Button, Flex, Input, Text, useColorModeValue } from "@chakra-ui/react";
import React, { useState } from "react";
import { useSignInWithEmailAndPassword } from "react-firebase-hooks/auth";
import { useSetRecoilState } from "recoil";

import { authModelState } from "../../../atoms/authModalAtom";
import { auth } from "../../../firebase/clientApp";
import { FIREBASE_ERRORS } from "../../../firebase/errors";
import axios from "axios";
import { useUser } from "../../../context/userContext";

type LoginProps = {};

const Login: React.FC<LoginProps> = () => {
  const setAuthModelState = useSetRecoilState(authModelState);
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });
  const { accessToken, setEmail, setAccessToken, setRefreshToken } = useUser();
  const searchBorder = useColorModeValue("blue.500", "#4A5568");
  const inputBg = useColorModeValue("gray.50", "#4A5568");
  const focusedInputBg = useColorModeValue("white", "#2D3748");
  const placeholderColor = useColorModeValue("gray.500", "#CBD5E0");

  const LoginFunc = async () => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/login`,
        JSON.stringify({
          email: loginForm.email,
          password: loginForm.password
        }),
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
      setEmail(loginForm.email);
      setAccessToken(response.data.access_token);
      setRefreshToken(response.data.refresh_token);
    } catch(error: any) {
      console.log(">>> Error login: ", error);
    }
  }

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await LoginFunc();
    console.log(">>> access: ", accessToken)
  };

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // update state
    setLoginForm((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  return (
    <form onSubmit={onSubmit}>
      <Input
        required
        name="email"
        placeholder="Email..."
        type="email"
        mb={2}
        onChange={onChange}
        fontSize="10pt"
        _placeholder={{ color: placeholderColor }}
        _hover={{
          bg: focusedInputBg,
          border: "1px solid",
          borderColor: searchBorder,
        }}
        _focus={{
          outline: "none",
          bg: focusedInputBg,
          border: "1px solid",
          borderColor: searchBorder,
        }}
        bg={inputBg}
      />
      <Input
        required
        name="password"
        placeholder="Password..."
        type="password"
        mb={2}
        onChange={onChange}
        fontSize="10pt"
        _placeholder={{ color: placeholderColor }}
        _hover={{
          bg: focusedInputBg,
          border: "1px solid",
          borderColor: searchBorder,
        }}
        _focus={{
          outline: "none",
          bg: focusedInputBg,
          border: "1px solid",
          borderColor: searchBorder,
        }}
        bg={inputBg}
      />
      <Button
        width="100%"
        height="36px"
        mt={2}
        mb={2}
        type="submit"
      >
        Log In
      </Button>
      <Flex justifyContent="center" mb={2}>
        <Text fontSize="9pt" mr={1}>
          Forgot your password?
        </Text>
        <Text
          fontSize="9pt"
          color="blue.500"
          cursor="pointer"
          onClick={() =>
            setAuthModelState((prev) => ({
              ...prev,
              view: "resetPassword",
            }))
          }
        >
          Reset
        </Text>
      </Flex>
      <Flex fontSize="9pt" justifyContent="center">
        <Text mr={1}>New Here?</Text>
        <Text
          color="blue.500"
          fontWeight={700}
          cursor="pointer"
          onClick={() =>
            setAuthModelState((prev) => ({
              ...prev,
              view: "signup",
            }))
          }
        >
          Sign Up
        </Text>
      </Flex>
    </form>
  );
};
export default Login;
