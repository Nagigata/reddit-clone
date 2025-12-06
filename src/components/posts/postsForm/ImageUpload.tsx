import {
  Button,
  Flex,
  Image,
  Stack,
  useColorModeValue,
} from "@chakra-ui/react";
import React, { useRef } from "react";

type ImageUploadProps = {
  selectedFile?: string;
  onSelectedImage: (event: React.ChangeEvent<HTMLInputElement>) => void;
  setSelectTab: (value: string) => void;
  setSelectedFile: (value: string) => void;
  handleCreatePost?: () => void;
  loading?: boolean;
  title?: string;
};

const ImageUpload: React.FC<ImageUploadProps> = ({
  selectedFile,
  onSelectedImage,
  setSelectTab,
  setSelectedFile,
  handleCreatePost,
  loading,
  title,
}) => {
  const selectedFileRef = useRef<HTMLInputElement>(null);
  const searchBorder = useColorModeValue("gray.200", "#718096");

  return (
    <Flex direction="column" justify="center" align="center" width="100%">
      {selectedFile ? (
        <>
          <Image src={selectedFile} maxWidth="400px" maxHeight="400px" />
          <Stack direction="row" mt={4} spacing={2}>
            <Button height="28px" onClick={() => setSelectTab("Post")}>
              Back to Post
            </Button>
            <Button
              variant="outline"
              height="28px"
              onClick={() => setSelectedFile("")}
            >
              Remove
            </Button>
            {handleCreatePost && (
              <Button
                height="28px"
                onClick={handleCreatePost}
                isLoading={loading}
                disabled={!title}
              >
                Post
              </Button>
            )}
          </Stack>
        </>
      ) : (
        <Flex
          justify="center"
          align="center"
          p={20}
          border="1px dashed"
          borderColor={searchBorder}
          width="100%"
          borderRadius={4}
        >
          <Button
            variant="outline"
            height="28px"
            onClick={() => selectedFileRef.current?.click()}
          >
            Upload
          </Button>
          <input
            ref={selectedFileRef}
            type="file"
            hidden
            onChange={onSelectedImage}
          />
        </Flex>
      )}
    </Flex>
  );
};
export default ImageUpload;
