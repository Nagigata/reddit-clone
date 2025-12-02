import {
  Box,
  Button,
  Checkbox,
  Flex,
  Icon,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import {
  doc,
  runTransaction,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { BsFillEyeFill, BsFillPersonFill } from "react-icons/bs";
import { HiLockClosed } from "react-icons/hi";

import { auth, firestore } from "../../../firebase/clientApp";
import useDirectory from "../../../hooks/useDirectory";
import axios from "axios";

type CreateCommunityModelProps = {
  open: boolean;
  handleClose: () => void;
};

type CommuType = {
  type_id: number,
  type: string,
  description: string
}

const CreateCommunityModel: React.FC<CreateCommunityModelProps> = ({
  open,
  handleClose,
}) => {
  const [user] = useAuthState(auth);
  const [CommunitiesName, setCommunities] = useState("");
  const [charsRemaining, setCharsRemaining] = useState(21);
  const [communityType, setCommunityType] = useState("");
  const [typeId, setTypeId] = useState('');
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toggleMenuOpen } = useDirectory();
  const bg = useColorModeValue("gray.100", "#1A202C");
  const textColor = useColorModeValue("gray.500", "gray.400");
  const [listCommunityType, setListCommunityType] = useState<CommuType[]>([]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.value.length > 21) return;

    setCommunities(event.target.value);
    setCharsRemaining(21 - event.target.value.length);
  };

  const onCommunityTypeChange = (item: any) => {
    setCommunityType(item.type);
    setTypeId(item.type_id);
  };

  const handleCreateCommunity = async () => {
    if (error) setError("");

    const format = /[ `!@#$%^&*()+\-=\[\]{};':"\\|,.<>\/?~]/;

    if (format.test(CommunitiesName) || CommunitiesName.length < 3) {
      return setError(
        "Community names must be between 3–21 characters, and can only contain letters, numbers, or underscores."
      );
    }

    setLoading(true);

    try {

      await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/community`, {
        name: CommunitiesName,
        type_id: typeId,
        created_by: 1 //Thay đổi user id cho chỗ này
      });

      handleClose();
      toggleMenuOpen();
      setCommunityType("");
      setCommunities("");
      router.push(`r/${CommunitiesName}`);
    } catch (error: any) {
      console.log("HandleCreateCommunity Error", error);
      setError(error.response.data.error);
    }

    setLoading(false);
    //setError("")
  };

  const updateCommunitySnippet = async (userId: string, transaction: any) => {
    if (!userId) return;

    const communityUpdateDocRef = doc(
      firestore,
      `communities/${CommunitiesName}/userInCommunity/${userId}`
    );

    await transaction.set(communityUpdateDocRef, {
      userId: userId,
      userEmail: user?.email,
    });
  };

  const GetAllCommunityType = async () => {
    try {
      const data = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/community-type`);
      setListCommunityType(data?.data)
    } catch(error) {
      console.log(">>> Error: ", error);
    }
  }

  useEffect(() => {
    GetAllCommunityType();
  }, []);

  return (
    <>
      <Modal isOpen={open} onClose={handleClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            display="flex"
            flexDirection="column"
            fontSize={15}
            padding={3}
          >
            Create a Community
          </ModalHeader>

          <Box pl={3} pr={3}>
            <ModalCloseButton />
            <ModalBody display="flex" flexDirection="column" padding="10px 0px">
              <Text fontWeight={600} fontSize={15}>
                Name
              </Text>
              <Text fontSize={11} color={textColor}>
                Community Names including capitalization cannot be changed
              </Text>
              <Text
                position="relative"
                top="28px"
                left="10px"
                width="20px"
                color="gray.400"
              >
                r/
              </Text>
              <Input
                position="relative"
                value={CommunitiesName}
                size="sm"
                pl="22px"
                onChange={handleChange}
              />
              <Text
                fontSize="9pt"
                color={charsRemaining === 0 ? "red" : textColor}
              >
                {charsRemaining} Characters Remaining
              </Text>
              <Text fontSize="9pt" color="red" pt={1}>
                {error}
              </Text>
              <Box mt={4} mb={4}>
                <Text fontWeight={600} fontSize={15}>
                  Community Type
                </Text>
                <Stack spacing={2}>
                  {listCommunityType.map((item) => (
                    <Checkbox
                      name={item?.type}
                      isChecked={communityType === item?.type}
                      onChange={() => onCommunityTypeChange(item)}
                      key={item?.type_id}
                    >
                      <Flex align="center">
                        {item?.type === 'Public' && (
                          <Icon as={BsFillPersonFill} color={textColor} mr={2} />
                        )}
                        {item?.type === 'Restricted' && (
                          <Icon as={BsFillEyeFill} color={textColor} mr={2} />
                        )}
                        {item?.type === 'Private' && (
                          <Icon as={HiLockClosed} color={textColor} mr={2} />
                        )}

                        <Text fontSize="10pt" mr={1}>
                          {item?.type}
                        </Text>
                        <Text fontSize="8pt" color={textColor} pt={1}>
                          {item?.description}
                        </Text>
                      </Flex>
                    </Checkbox>                    
                  ))}
                </Stack>
              </Box>
            </ModalBody>
          </Box>

          <ModalFooter bg={bg} borderRadius="0px 0px 10px 10px">
            <Button
              variant="outline"
              height="30px"
              mr={3}
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              height="30px"
              onClick={handleCreateCommunity}
              isLoading={loading}
            >
              Create Community
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
export default CreateCommunityModel;
