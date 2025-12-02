import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Text,
  Flex,
  Icon,
  Box,
  useColorModeValue,
} from "@chakra-ui/react";
import React from "react";
import { IoWarningOutline } from "react-icons/io5";
import { FaUserMinus } from "react-icons/fa";

type ConfirmRemoveMemberDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  username: string;
  isLoading?: boolean;
};

const ConfirmRemoveMemberDialog: React.FC<ConfirmRemoveMemberDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  username,
  isLoading = false,
}) => {
  const bg = useColorModeValue("white", "gray.800");
  const warningBg = useColorModeValue("red.50", "red.900");
  const warningColor = useColorModeValue("red.600", "red.200");

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
      <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
      <ModalContent bg={bg} borderRadius="12px" mx={4}>
        <ModalHeader pt={6} pb={2}>
          <Flex align="center" gap={3}>
            <Flex
              bg={warningBg}
              p={2}
              borderRadius="full"
              w="40px"
              h="40px"
              align="center"
              justify="center"
            >
              <Icon as={IoWarningOutline} fontSize={24} color={warningColor} />
            </Flex>
            <Text fontSize="lg" fontWeight={700}>
              Remove Member
            </Text>
          </Flex>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody py={4}>
          <Box>
            <Text fontSize="14pt" mb={3}>
              Are you sure you want to remove{" "}
              <Text as="span" fontWeight={700} color="blue.500">
                u/{username}
              </Text>{" "}
              from this community?
            </Text>

            <Box
              bg={warningBg}
              p={3}
              borderRadius="8px"
              border="1px solid"
              borderColor={warningColor}
            >
              <Flex align="flex-start" gap={2}>
                <Icon
                  as={FaUserMinus}
                  fontSize={16}
                  color={warningColor}
                  mt={0.5}
                />
                <Box>
                  <Text fontSize="10pt" fontWeight={600} color={warningColor}>
                    This action cannot be undone
                  </Text>
                  <Text fontSize="9pt" color={warningColor} mt={1}>
                    The user will be removed from the community and lose access
                    to private content.
                  </Text>
                </Box>
              </Flex>
            </Box>
          </Box>
        </ModalBody>

        <ModalFooter gap={3} pb={6}>
          <Button
            variant="ghost"
            onClick={onClose}
            isDisabled={isLoading}
            _hover={{ bg: "gray.100" }}
          >
            Cancel
          </Button>
          <Button
            colorScheme="red"
            onClick={onConfirm}
            isLoading={isLoading}
            loadingText="Removing..."
            leftIcon={<FaUserMinus />}
            _hover={{ bg: "red.600" }}
          >
            Remove Member
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ConfirmRemoveMemberDialog;