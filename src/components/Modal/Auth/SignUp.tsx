import { Button, Flex, Input, Text, useColorModeValue } from "@chakra-ui/react";
import React, { useState } from "react";
import { useSetRecoilState } from "recoil";

import { authModelState } from "../../../atoms/authModalAtom";
import { useUser } from "../../../context/userContext";
import axios from "axios";

const SignUp: React.FC = () => {
  const setAuthModelState = useSetRecoilState(authModelState);
  const [signUpForm, setSignUpForm] = useState({
    fullname: '',
    email: "",
    password: "",
    conformPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { setEmail, setAccessToken, setRefreshToken } = useUser();
  
  const searchBorder = useColorModeValue("blue.500", "#4A5568");
  const inputBg = useColorModeValue("gray.50", "#4A5568");
  const focusedInputBg = useColorModeValue("white", "#2D3748");
  const placeholderColor = useColorModeValue("gray.500", "#CBD5E0");

  const RegisterFunc = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/register`,
        JSON.stringify({
          full_name: signUpForm.fullname,
          email: signUpForm.email,
          password: signUpForm.password
        }),
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
      
      // Lưu thông tin user vào context
      setEmail(signUpForm.email);
      setAccessToken(response.data.access_token);
      setRefreshToken(response.data.refresh_token);
      
      // Reset form sau khi đăng ký thành công
      setSignUpForm({
        fullname: '',
        email: "",
        password: "",
        conformPassword: "",
      });
      
    } catch(error: any) {
      console.log(">>> Error register: ", error);
      setError(error.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (error) setError("");

    // Validate password match
    if (signUpForm.password !== signUpForm.conformPassword) {
      setError("Password Do Not Match");
      return;
    }

    // Validate fullname
    if (!signUpForm.fullname.trim()) {
      setError("Full name is required");
      return;
    }

    await RegisterFunc();
  };

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Clear error when user types
    if (error) setError("");
    
    // update state
    setSignUpForm((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  return (
    <form onSubmit={onSubmit}>
      <Input
        required
        name="fullname"
        placeholder="Fullname..."
        type="text"
        mb={2}
        onChange={onChange}
        value={signUpForm.fullname}
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
        name="email"
        placeholder="Email..."
        type="email"
        mb={2}
        onChange={onChange}
        value={signUpForm.email}
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
        value={signUpForm.password}
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
        name="conformPassword"
        placeholder="Confirm Password..."
        type="password"
        mb={2}
        onChange={onChange}
        value={signUpForm.conformPassword}
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
      
      {error && (
        <Text textAlign="center" color="red" fontSize="10px" mb={2}>
          {error}
        </Text>
      )}
      
      <Button
        width="100%"
        height="36px"
        mt={2}
        mb={2}
        type="submit"
        isLoading={loading}
      >
        Sign Up
      </Button>
      <Flex fontSize="9pt" justifyContent="center">
        <Text mr={1}>Already a redditor?</Text>
        <Text
          color="blue.500"
          fontWeight={700}
          cursor="pointer"
          onClick={() =>
            setAuthModelState((prev) => ({
              ...prev,
              view: "login",
            }))
          }
        >
          Log In
        </Text>
      </Flex>
    </form>
  );
};
export default SignUp;