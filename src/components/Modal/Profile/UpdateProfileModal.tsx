import {
  Button,
  Flex,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { userService, UpdateProfileDto } from "../../../services/userService";

interface UpdateProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UpdateProfileModal: React.FC<UpdateProfileModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { user, refreshUser } = useAuth();
  const [formData, setFormData] = useState({
    full_name: "",
    gender: "",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && user?.profile) {
      setFormData({
        full_name: user.profile.full_name || "",
        gender: user.profile.gender === null ? "" : user.profile.gender ? "1" : "0",
      });
      setAvatarPreview(user.profile.avatar || null);
      setAvatarFile(null);
      setError("");
    }
  }, [isOpen, user]);

  const searchBorder = useColorModeValue("blue.500", "#4A5568");
  const inputBg = useColorModeValue("gray.50", "#4A5568");
  const focusedInputBg = useColorModeValue("white", "#2D3748");
  const placeholderColor = useColorModeValue("gray.500", "#CBD5E0");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const updateData: UpdateProfileDto = {
        full_name: formData.full_name,
        gender: formData.gender || undefined,
        avatar: avatarFile || undefined,
      };

      await userService.updateProfile(updateData);
      await refreshUser();
      onClose();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update profile";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      full_name: user?.profile?.full_name || "",
      gender: user?.profile?.gender === null ? "" : user?.profile?.gender ? "1" : "0",
    });
    setAvatarFile(null);
    setAvatarPreview(user?.profile?.avatar || null);
    setError("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Update Profile</ModalHeader>
        <ModalCloseButton />
        <form onSubmit={handleSubmit}>
          <ModalBody>
            <Flex direction="column" gap={4}>
              {/* Avatar Upload */}
              <Flex direction="column" align="center" gap={2}>
                <Flex
                  w="100px"
                  h="100px"
                  borderRadius="full"
                  overflow="hidden"
                  border="2px solid"
                  borderColor={searchBorder}
                  cursor="pointer"
                  onClick={() => fileInputRef.current?.click()}
                  align="center"
                  justify="center"
                  bg={inputBg}
                >
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Avatar preview"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <Text fontSize="2xl">👤</Text>
                  )}
                </Flex>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  display="none"
                />
                <Button
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                >
                  Change Avatar
                </Button>
              </Flex>

              {/* Full Name */}
              <Flex direction="column">
                <Text fontSize="sm" mb={1} fontWeight="medium">
                  Full Name
                </Text>
                <Input
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  bg={inputBg}
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
                  _placeholder={{ color: placeholderColor }}
                />
              </Flex>

              {/* Gender */}
              <Flex direction="column">
                <Text fontSize="sm" mb={1} fontWeight="medium">
                  Gender
                </Text>
                <Select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  bg={inputBg}
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
                >
                  <option value="">Not specified</option>
                  <option value="0">Female</option>
                  <option value="1">Male</option>
                </Select>
              </Flex>

              {error && (
                <Text color="red.500" fontSize="sm" textAlign="center">
                  {error}
                </Text>
              )}
            </Flex>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" isLoading={loading} colorScheme="blue">
              Update
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default UpdateProfileModal;

