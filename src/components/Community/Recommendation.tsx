import {
  Box,
  Button,
  Flex,
  Icon,
  Image,
  Skeleton,
  SkeletonCircle,
  Stack,
  Text,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { FaReddit } from "react-icons/fa";
import { HiLockClosed } from "react-icons/hi";
import { useRouter } from "next/router";
import { useSetRecoilState } from "recoil";
import axios from "axios";

import { Community, CommunityState } from "../../atoms/CommunitiesAtom";
import useCommunityData from "../../hooks/useCommunityData";

const Recommendation: React.FC = () => {
  const router = useRouter();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [isViewAll, setIsViewAll] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const { communityStateValue } = useCommunityData();
  const setCommunityStateValue = useSetRecoilState(CommunityState);
  const bg = useColorModeValue("white", "#1A202C");
  const borderColor = useColorModeValue("gray.300", "#2D3748");
  const textColor = useColorModeValue("gray.500", "gray.400");
  const toast = useToast();

  const getCommunityRecommendation = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/community/top-community`);
      const data = res.data as Community[];
      console.log(">>> Check data: ", data);
      if (isViewAll) {
        setCommunities(data);
      } else {
        setCommunities(data.slice(0, 5));
      }
    } catch (error) {
      console.log("getCommunityRecommendation", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    getCommunityRecommendation();
  }, [isViewAll]);

  const handleClickJoinCommunity = async (community: Community, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const isJoined = !!communityStateValue.mySnippets.find(
      (snippet) => snippet.communityId === community.community_id
    );
    
    if (isJoined) return;
    
    const status = community.type === 'Private' ? 'PENDING' : 'APPROVED';
    
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/community-member`, {
        community_id: community.community_id,
        user_id: 1,
        role: 'member',
        status: status
      });

      setCommunityStateValue((prev) => ({
        ...prev,
        mySnippets: [
          ...prev.mySnippets,
          {
            communityId: community.community_id,
            isModerator: false,
            imageURL: community.avatar || "",
            statusCommunity: status,
            communityName: community.name
          },
        ],
      }));
      
      toast({
        title: community.type === 'Private' ? "Request Sent" : "Joined!",
        description: community.type === 'Private' 
          ? "Your request is pending approval"
          : `You've joined r/${community.name}`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch(error: any) {
      console.log(">>> error: ", error);
      toast({
        title: "Error",
        description: "Unable to join. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleClickNavigator = (isPending: boolean, name: string) => {
    if (isPending) return;
    router.push(`/r/${name}`);
  };

  return (
    <Flex
      direction="column"
      bg={bg}
      borderRadius={4}
      cursor="pointer"
      border="1px solid"
      borderColor={borderColor}
    >
      <Flex
        align="flex-end"
        color="white"
        p="6px 10px"
        bg="blue.500"
        height="70px"
        borderRadius="4px 4px 0px 0px"
        fontWeight={600}
        bgImage="url(/images/recCommsArt.png)"
        backgroundSize="cover"
        bgGradient="linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.75)),
        url('images/xw6wqhhjubh31.webp')"
      >
        Top Communities
      </Flex>
      <Flex direction="column">
        {loading ? (
          <Stack mt={2} p={3}>
            <Flex justify="space-between" align="center">
              <SkeletonCircle size="10" />
              <Skeleton height="10px" width="70%" />
            </Flex>
            <Flex justify="space-between" align="center">
              <SkeletonCircle size="10" />
              <Skeleton height="10px" width="70%" />
            </Flex>
            <Flex justify="space-between" align="center">
              <SkeletonCircle size="10" />
              <Skeleton height="10px" width="70%" />
            </Flex>
          </Stack>
        ) : (
          <>
            {communities.map((item, index) => {
              const isJoined = !!communityStateValue.mySnippets.find(
                (snippet) => snippet.communityId === item.community_id
              );
              const isPending = !!communityStateValue.mySnippets.find(
                (snippet) =>
                  Number(snippet.communityId) === item?.community_id &&
                  snippet.statusCommunity === 'PENDING'
              );
              return (
                <Box key={item.community_id} onClick={() => handleClickNavigator(isPending, item.name)}>
                  <Flex
                    position="relative"
                    align="center"
                    fontSize="10pt"
                    borderBottom="1px solid"
                    borderColor={borderColor}
                    p="10px 12px"
                    fontWeight={600}
                  >
                    <Flex width="80%" align="center">
                      <Flex width="15%">
                        <Text mr={2}>{index + 1}</Text>
                      </Flex>
                      <Flex align="center" width="80%">
                        {item.avatar ? (
                          <Image
                            borderRadius="full"
                            boxSize="28px"
                            src={item.avatar}
                            mr={2}
                          />
                        ) : (
                          <Icon
                            as={FaReddit}
                            fontSize={30}
                            color="brand.100"
                            mr={2}
                          />
                        )}
                        <span
                          style={{
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >{`r/${item.name}`}</span>
                        {item?.type === 'Private' && (
                          <Icon marginLeft={2} as={HiLockClosed} color={textColor} mr={2} />
                        )}
                      </Flex>
                    </Flex>
                    <Box position="absolute" right="10px">
                      <Button
                        height="22px"
                        fontSize="8pt"
                        variant={isPending ? "outline" : (isJoined ? "outline" : "solid")}
                        onClick={(e) => handleClickJoinCommunity(item, e)}
                        isDisabled={isJoined || isPending}
                      >
                        {isPending ? "Pending" : (isJoined ? "Joined" : "Join")}
                      </Button>
                    </Box>
                  </Flex>
                </Box>
              );
            })}
            <Box p="10px 20px">
              <Button
                height="30px"
                width="100%"
                onClick={() =>
                  isViewAll ? setIsViewAll(false) : setIsViewAll(true)
                }
              >
                {isViewAll ? "Collapse Items" : "View All"}
              </Button>
            </Box>
          </>
        )}
      </Flex>
    </Flex>
  );
};

export default Recommendation;