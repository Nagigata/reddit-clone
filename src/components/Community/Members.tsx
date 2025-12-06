import {
  Box,
  Button,
  Divider,
  Flex,
  Icon,
  Spinner,
  Stack,
  Text,
  useColorModeValue,
  useToast,
  Avatar,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { FaUsers } from "react-icons/fa";
import { useSetRecoilState } from "recoil";
import moment from "moment";

import { Community, CommunityState } from "../../atoms/CommunitiesAtom";
import { useAuth } from "../../contexts/AuthContext";
import { MemberDto, communityService } from "../../services/communityService";
import { getAvatarUrl } from "../../utils/apiConfig";
import { userService, User } from "../../services/userService";

type MembersProps = {
  communityData: Community;
};

interface MemberWithUser extends MemberDto {
  user?: User;
}

const Members: React.FC<MembersProps> = ({ communityData }) => {
  const { user } = useAuth();
  const toast = useToast();
  const setCommunityStateValue = useSetRecoilState(CommunityState);
  const [members, setMembers] = useState<MemberWithUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [removingUserId, setRemovingUserId] = useState<number | null>(null);

  const bg = useColorModeValue("white", "#1A202C");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const hoverBg = useColorModeValue("gray.50", "gray.700");

  const isAdmin =
    user && String(user.id) === String(communityData.creatorId);

  useEffect(() => {
    const fetchMembers = async () => {
      if (!isAdmin) return;
      try {
        setLoading(true);
        const communityIdNum =
          communityData.backendId ?? Number(communityData.id);
        if (!communityIdNum || Number.isNaN(communityIdNum)) return;
        
        const membersData = await communityService.getCommunityMembers(
          communityIdNum
        );

        // Filter only APPROVED members
        const approvedMembers = membersData.filter(
          (m) => m.status === "APPROVED"
        );

        // Fetch user information for each member
        const membersWithUsers = await Promise.all(
          approvedMembers.map(async (member) => {
            try {
              const userData = await userService.getUserById(member.user_id);
              return { ...member, user: userData };
            } catch (error) {
              console.log(`Failed to fetch user ${member.user_id}:`, error);
              return { ...member, user: undefined };
            }
          })
        );

        setMembers(membersWithUsers);
      } catch (error) {
        console.log("fetchMembers error", error);
        toast({
          title: "Failed to fetch members",
          status: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [isAdmin, communityData.backendId, communityData.id, toast]);

  const handleRemoveMember = async (member: MemberWithUser) => {
    if (!confirm(`Are you sure you want to remove this member from the community?`)) {
      return;
    }

    try {
      setRemovingUserId(member.user_id);
      const communityIdNum =
        communityData.backendId ?? Number(communityData.id);
      if (!communityIdNum || Number.isNaN(communityIdNum)) return;

      await communityService.rejectMember(communityIdNum, member.user_id);

      setMembers((prev) => prev.filter((m) => m.user_id !== member.user_id));
      
      setCommunityStateValue((prev) => ({
        ...prev,
        currentCommunity: {
          ...prev.currentCommunity,
          numberOfMembers: Math.max(0, (prev.currentCommunity?.numberOfMembers || 0) - 1),
        } as Community,
      }));

      toast({
        title: "Member removed",
        status: "success",
      });
    } catch (error: any) {
      console.log("remove member error", error);
      toast({
        title: "Failed to remove member",
        description: error.message,
        status: "error",
      });
    } finally {
      setRemovingUserId(null);
    }
  };

  if (!isAdmin) return null;

  return (
    <Box position="sticky" top="190px" mt={4}>
      <Flex
        justify="space-between"
        align="center"
        bgGradient="linear(to-r, blue.500, blue.600)"
        color="white"
        p={3}
        borderRadius="8px 8px 0px 0px"
        boxShadow="0 1px 3px 0 rgba(0, 0, 0, 0.1)"
      >
        <Flex align="center">
          <Icon as={FaUsers} mr={2} />
          <Text fontSize="10pt" fontWeight={700}>
            Members ({members.length})
          </Text>
        </Flex>
      </Flex>
      <Box
        p={3}
        bg={bg}
        borderRadius="0px 0px 8px 8px"
        boxShadow="0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)"
        border="1px solid"
        borderColor={borderColor}
        borderTop="none"
        maxH="400px"
        overflowY="auto"
      >
        {loading ? (
          <Flex align="center" justify="center" py={4}>
            <Spinner size="sm" />
          </Flex>
        ) : members.length === 0 ? (
          <Text fontSize="9pt" color="gray.500">
            No members found
          </Text>
        ) : (
          <Stack spacing={3} fontSize="9pt">
            {members.map((member) => (
              <Box
                key={member.id}
                p={2}
                borderRadius={6}
                border="1px solid"
                borderColor={borderColor}
                _hover={{ bg: hoverBg }}
                transition="background-color 0.2s"
              >
                <Flex justify="space-between" align="center">
                  <Flex align="center" flex={1} minW={0}>
                    {member.user?.profile?.avatar ? (
                      <Avatar
                        size="sm"
                        src={getAvatarUrl(member.user.profile.avatar)}
                        mr={2}
                      />
                    ) : (
                      <Avatar size="sm" mr={2} />
                    )}
                    <Stack spacing={0} minW={0} flex={1}>
                      <Text fontWeight={600} isTruncated>
                        {member.user?.profile?.full_name || 
                         member.user?.email?.split("@")[0] || 
                         `User #${member.user_id}`}
                      </Text>
                      <Flex align="center" fontSize="8pt" color="gray.500">
                        <Text mr={2}>Role: {member.role}</Text>
                        {member.joined_at && (
                          <Text>
                            Joined {moment(member.joined_at).format("MMM DD, YYYY")}
                          </Text>
                        )}
                      </Flex>
                    </Stack>
                  </Flex>
                  {String(member.user_id) !== String(communityData.creatorId) && (
                    <Button
                      size="xs"
                      colorScheme="red"
                      variant="outline"
                      onClick={() => handleRemoveMember(member)}
                      isLoading={removingUserId === member.user_id}
                      ml={2}
                    >
                      Remove
                    </Button>
                  )}
                </Flex>
              </Box>
            ))}
          </Stack>
        )}
        <Divider mt={3} />
      </Box>
    </Box>
  );
};

export default Members;

