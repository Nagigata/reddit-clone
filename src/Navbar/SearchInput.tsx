import React from "react";
import {
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  useColorModeValue,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { User } from "firebase/auth";

type SearchInputProps = {
  user?: User | null;
};

const SearchInput: React.FC<SearchInputProps> = ({ user }) => {
  const bg = useColorModeValue("gray.100", "whiteAlpha.100");
  const iconColor = useColorModeValue("gray.300", "white");
  const focusedInputBg = useColorModeValue("white", "#171923");
  const searchBorder = useColorModeValue("gray.200", "#4A5568");

  return (
    <Flex flexGrow={1} maxWidth={user ? "auto" : "600px"} mr={2} align="center">
      <InputGroup>
        <InputLeftElement pointerEvents="none">
          <SearchIcon color={iconColor} mb={1} />
        </InputLeftElement>
        <Input
          type="tel"
          placeholder="Search Reddit"
          fontSize="10pt"
          bg={bg}
          borderRadius={20}
          border="1px solid"
          borderColor="transparent"
          _placeholder={{ color: "gray.500" }}
          _hover={{
            bg: focusedInputBg,
            border: "1px solid",
            borderColor: searchBorder,
            boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
          }}
          _focus={{
            outline: "none",
            border: "1px solid",
            borderColor: "blue.500",
            bg: focusedInputBg,
            boxShadow: "0 0 0 3px rgba(66, 153, 225, 0.1)",
          }}
          transition="all 0.2s ease-in-out"
        />
      </InputGroup>
    </Flex>
  );
};
export default SearchInput;
