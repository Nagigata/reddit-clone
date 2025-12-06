import {
  Box,
  Button,
  Flex,
  Icon,
  Image,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import React from "react";
import { Community } from "../../atoms/CommunitiesAtom";
import { FaReddit } from "react-icons/fa";
import useCommunityData from "../../hooks/useCommunityData";

type HeaderProps = {
  communityData: Community;
};

const Header: React.FC<HeaderProps> = ({ communityData }) => {
  const bg = useColorModeValue("white", "#1A202C");
  const { communityStateValue, onJoinOrCommunity, loading } =
    useCommunityData();
  const isJoined = !!communityStateValue.mySnippets.find(
    (item) => item.communityId === communityData.id
  );
  const isPending = communityStateValue.pendingCommunityIds?.includes(
    communityData.id
  );

  return (
    <Flex direction="column" width="100%" height="146px">
      <Box 
        height="50%" 
        bgGradient="linear(to-r, blue.400, blue.500)"
        boxShadow="inset 0 -1px 0 0 rgba(0, 0, 0, 0.1)"
      />
      <Flex justifyContent="center" bg={bg} height="50%">
        <Flex width="95%" maxWidth="860px">
          {communityStateValue.currentCommunity?.imageURL ? (
            <Image
              borderRadius="full"
              boxSize="66px"
              src={communityStateValue.currentCommunity.imageURL}
              alt="profile Image"
              position="relative"
              top={-3}
              color="blue.500"
              border="4px solid white"
            />
          ) : (
            <Icon
              as={FaReddit}
              fontSize={64}
              position="relative"
              top={-3}
              color="blue.500"
              border="4px solid white"
              borderRadius="50%"
            />
          )}
          <Flex padding="10px 16px">
            <Flex direction="column" mr={6}>
              <Text fontWeight={800} fontSize="16px">
                {communityData.name}
              </Text>
              <Text fontWeight={600} fontSize="10px" color="gray.500">
                r/{communityData.name}
              </Text>
            </Flex>
            <Button
              variant={isJoined ? "outline" : "solid"}
              height="30px"
              pr={6}
              pl={6}
              isLoading={loading}
              isDisabled={isPending}
              onClick={() => {
                onJoinOrCommunity(communityData, isJoined);
              }}
              _hover={{ transform: "translateY(-1px)", boxShadow: "md" }}
              transition="all 0.2s ease-in-out"
            >
              {isPending ? "Pending" : isJoined ? "Joined" : "Join"}
            </Button>
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
};
export default Header;
