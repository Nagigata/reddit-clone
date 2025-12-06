import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Flex,
  Icon,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { BiPoll } from "react-icons/bi";
import { BsLink45Deg, BsMic } from "react-icons/bs";
import { IoDocumentText, IoImageOutline } from "react-icons/io5";

import useSelectFile from "../../hooks/useSelectFile";
import { postService } from "../../services/postService";
import { useAuth } from "../../contexts/AuthContext";
import useCommunityData from "../../hooks/useCommunityData";
import ImageUpload from "./postsForm/ImageUpload";
import TextInput from "./postsForm/TextInput";
//@ts-ignore
import TabItem from "./TabItem";

type NewPostFormProps = {
  communityImageURL?: string;
};

const formTabs = [
  {
    title: "Post",
    icon: IoDocumentText,
  },
  {
    title: "Images & Video",
    icon: IoImageOutline,
  },
  {
    title: "Link",
    icon: BsLink45Deg,
  },
  {
    title: "Poll",
    icon: BiPoll,
  },
  {
    title: "Talk",
    icon: BsMic,
  },
];

export type TabItem = {
  title: string;
  icon: typeof Icon.arguments;
};

const NewPostForm: React.FC<NewPostFormProps> = ({
  communityImageURL,
}) => {
  const router = useRouter();
  const { user } = useAuth();
  const { communityStateValue } = useCommunityData();
  const [selectedTab, setSelectTab] = useState(formTabs[0].title);
  const [textInput, setTextInput] = useState({
    title: "",
    body: "",
  });
  //const [selectedFile, setSelectedFile] = useState<string>();
  const { selectedFile, setSelectedFile, onSelectedFile } = useSelectFile();
  const [selectedFileObj, setSelectedFileObj] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const bg = useColorModeValue("white", "#1A202C");
  const borderColor = useColorModeValue("gray.300", "#2D3748");

  const currentCommunity = communityStateValue.currentCommunity;
  
  // Check if user is a member (status APPROVED)
  const isMember = !!communityStateValue.mySnippets.find(
    (snippet) => snippet.communityId === currentCommunity?.id
  );
  const isCreator = user && currentCommunity && String(user.id) === currentCommunity.creatorId;
  const hasAccess = isMember || isCreator;

  // Private or Restricted: only members can create posts
  const isPrivate = currentCommunity?.typeId === 1;
  const isRestricted = currentCommunity?.typeId === 3;
  const requiresMembership = isPrivate || isRestricted;
  const canCreatePost = !requiresMembership || hasAccess;

  const handleCreatePost = async () => {
    if (!user) return;

    // Check access for private/restricted communities
    if (requiresMembership && !hasAccess) {
      setError(true);
      return;
    }

    setLoading(true);
    try {
      const subreddit_id =
        currentCommunity?.backendId ?? 
        (currentCommunity?.id ? Number(currentCommunity.id) : undefined);

      // Determine media_type based on selected tab and file
      let media_type: string | undefined;
      if (selectedTab === "Images & Video" && selectedFileObj) {
        // Determine media type from file
        const fileType = selectedFileObj.type;
        if (fileType.startsWith('image/')) {
          media_type = 'image';
        } else if (fileType.startsWith('video/')) {
          media_type = 'video';
        } else {
          media_type = 'image'; // default
        }
      }

      await postService.createPost({
        title: textInput.title,
        content: textInput.body || undefined,
        subreddit_id:
          subreddit_id && !isNaN(subreddit_id) ? subreddit_id : undefined,
        media_type: media_type,
        file: selectedFileObj || undefined,
      });

      router.back();
    } catch (error: any) {
      console.log(error.message);
      setError(true);
    }
    setLoading(false);
  };

  const onTextChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const {
      target: { name, value },
    } = event;
    setTextInput((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Show access denied message for private/restricted communities
  if (requiresMembership && !hasAccess) {
    return (
      <Box
        p={8}
        textAlign="center"
        bg={bg}
        borderRadius={4}
        border="1px solid"
        borderColor={borderColor}
        mt={2}
      >
        <Text fontSize="16pt" fontWeight={600} mb={2}>
          {isPrivate ? "This is a private community" : "This is a restricted community"}
        </Text>
        <Text fontSize="10pt" color="gray.500" mb={4}>
          {isPrivate 
            ? "You must be a member to create posts"
            : "You must join this community to create posts"}
        </Text>
        <Button onClick={() => router.push(`/r/${currentCommunity?.id}`)}>
          {isPrivate ? "Join Community" : "Join to Post"}
        </Button>
      </Box>
    );
  }

  return (
    <Flex direction="column" bg={bg} borderRadius={4} mt={2}>
      <Flex width="100%">
        {formTabs.map((item) => (
          <TabItem
            key={item.title}
            item={item}
            selected={item.title === selectedTab}
            setSelectTab={setSelectTab}
          />
        ))}
      </Flex>
      <Flex p={4}>
        {selectedTab === "Post" && (
          <TextInput
            textInputs={textInput}
            onChange={onTextChange}
            handleCreatePost={handleCreatePost}
            loading={loading}
          />
        )}
        {selectedTab === "Images & Video" && (
          <ImageUpload
            selectedFile={selectedFile}
            onSelectedImage={(event) => {
              onSelectedFile(event);
              // Also store the File object
              if (event.target.files?.[0]) {
                setSelectedFileObj(event.target.files[0]);
              }
            }}
            setSelectTab={setSelectTab}
            setSelectedFile={(value) => {
              setSelectedFile(value);
              if (!value) {
                setSelectedFileObj(null);
              }
            }}
            handleCreatePost={handleCreatePost}
            loading={loading}
            title={textInput.title}
          />
        )}
      </Flex>
      {error && (
        <Alert status="error">
          <AlertIcon />
          <Text mr={2}>
            {requiresMembership && !hasAccess
              ? "You must be a member to create posts"
              : "Error Creating Post"}
          </Text>
        </Alert>
      )}
    </Flex>
  );
};
export default NewPostForm;
