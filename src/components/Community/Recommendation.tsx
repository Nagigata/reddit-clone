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
} from "@chakra-ui/react";
import Link from "next/link";
import React, { useCallback, useEffect, useState } from "react";
import { FaReddit } from "react-icons/fa";

import { Community } from "../../atoms/CommunitiesAtom";
import useCommunityData from "../../hooks/useCommunityData";
import { communityService } from "../../services/communityService";

const Recommendation: React.FC = () => {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [isViewAll, setIsViewAll] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const { communityStateValue, onJoinOrCommunity } = useCommunityData();
  const bg = useColorModeValue("white", "#1A202C");
  const borderColor = useColorModeValue("gray.300", "#2D3748");
  const hoverBg = useColorModeValue("gray.50", "gray.700");

  const getCommunityRecommendation = useCallback(async () => {
    setLoading(true);
    try {
      const data = await communityService.getTopCommunities();

      const mapped: Community[] = data.map((c) => {
        const backendId = c.community_id ?? c.id;
        const slug = backendId ? String(backendId) : "";
        return {
          id: slug, 
          backendId,
          name: c.name, 
          creatorId: String(c.created_by || ""),
          numberOfMembers: c.members ?? 0,
          privacyType: "public",
          createdAt: undefined as any,
          imageURL: c.avatar,
        };
      });

      if (isViewAll) {
        setCommunities(mapped);
      } else {
        setCommunities(mapped.slice(0, 5));
      }
    } catch (error) {
      console.log("getCommunityRecommendation", error);
    }
    setLoading(false);
  }, [isViewAll]);

  useEffect(() => {
    getCommunityRecommendation();
  }, [getCommunityRecommendation]);

  return (
    <Flex
      direction="column"
      bg={bg}
      borderRadius={8}
      cursor="pointer"
      border="1px solid"
      borderColor={borderColor}
      boxShadow="0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)"
      overflow="hidden"
      mb={4}
    >
      <Flex
        align="flex-end"
        color="white"
        p="6px 10px"
        bgGradient="linear(to-r, blue.500, blue.600)"
        height="70px"
        borderRadius="8px 8px 0px 0px"
        fontWeight={600}
        bgImage="url(/images/recCommsArt.png)"
        backgroundSize="cover"
        backgroundPosition="center"
        position="relative"
        _before={{
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bgGradient: "linear(to-b, transparent, rgba(0, 0, 0, 0.6))",
          borderRadius: "8px 8px 0px 0px",
        }}
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
                (snippet) => snippet.communityId === item.id
              );
              const isPending =
                communityStateValue.pendingCommunityIds?.includes(item.id);
              return (
                <Link key={item.id} href={`/r/${item.id}`}>
                  <Flex
                    position="relative"
                    align="center"
                    fontSize="10pt"
                    borderBottom="1px solid"
                    borderColor={borderColor}
                    p="10px 12px"
                    fontWeight={600}
                    _hover={{ bg: hoverBg }}
                    transition="background-color 0.2s ease-in-out"
                  >
                    <Flex width="80%" align="center">
                      <Flex width="15%">
                        <Text mr={2}>{index + 1}</Text>
                      </Flex>
                      <Flex align="center" width="80%">
                        {item.imageURL ? (
                          <Image
                            borderRadius="full"
                            boxSize="28px"
                            src={item.imageURL}
                            alt={`${item.id} avatar`}
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
                        >{`r/${item.name || item.id}`}</span>
                      </Flex>
                    </Flex>
                    <Box position="absolute" right="10px">
                      <Button
                        height="22px"
                        fontSize="8pt"
                        variant={isJoined ? "outline" : "solid"}
                        isDisabled={isPending}
                      >
                        {isPending ? "Pending" : isJoined ? "Joined" : "Join"}
                      </Button>
                    </Box>
                  </Flex>
                </Link>
              );
            })}
            <Box p="10px 20px">
              <Button
                height="30px"
                width="100%"
                onClick={() =>
                  isViewAll ? setIsViewAll(false) : setIsViewAll(true)
                }
                _hover={{ transform: "translateY(-1px)", boxShadow: "md" }}
                transition="all 0.2s ease-in-out"
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
