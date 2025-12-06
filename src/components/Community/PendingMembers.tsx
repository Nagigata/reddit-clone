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
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { FaUserClock } from "react-icons/fa";
import { useSetRecoilState } from "recoil";

import { Community, CommunityState } from "../../atoms/CommunitiesAtom";
import { useAuth } from "../../contexts/AuthContext";
import { MemberDto, communityService } from "../../services/communityService";

type PendingMembersProps = {
  communityData: Community;
};

const PendingMembers: React.FC<PendingMembersProps> = ({ communityData }) => {
  const { user } = useAuth();
  const toast = useToast();
  const setCommunityStateValue = useSetRecoilState(CommunityState);
  const [pendingMembers, setPendingMembers] = useState<MemberDto[]>([]);
  const [loading, setLoading] = useState(false);

  const bg = useColorModeValue("white", "#1A202C");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  const isAdmin =
    user && String(user.id) === String(communityData.creatorId);
  
  const isPublic = communityData.typeId === 2;

  useEffect(() => {
    const fetchPending = async () => {
      if (!isAdmin || isPublic) return;
      try {
        setLoading(true);
        const communityIdNum =
          communityData.backendId ?? Number(communityData.id);
        if (!communityIdNum || Number.isNaN(communityIdNum)) return;
        const pending = await communityService.getPendingMembers(
          communityIdNum
        );
        setPendingMembers(pending);
      } catch (error) {
        console.log("fetchPendingMembers error", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPending();
  }, [isAdmin, isPublic, communityData.backendId, communityData.id]);

  const handleApprove = async (member: MemberDto) => {
    try {
      const communityIdNum =
        communityData.backendId ?? Number(communityData.id);
      if (!communityIdNum || Number.isNaN(communityIdNum)) return;

      await communityService.approveMember(communityIdNum, member.user_id);

      setPendingMembers((prev) =>
        prev.filter((m) => m.user_id !== member.user_id)
      );
      setCommunityStateValue((prev) => ({
        ...prev,
        currentCommunity: {
          ...prev.currentCommunity,
          numberOfMembers: (prev.currentCommunity?.numberOfMembers || 0) + 1,
        } as Community,
      }));

      toast({
        title: "Member approved",
        status: "success",
      });
    } catch (error: any) {
      console.log("approve member error", error);
      toast({
        title: "Failed to approve member",
        description: error.message,
        status: "error",
      });
    }
  };

  const handleReject = async (member: MemberDto) => {
    try {
      const communityIdNum =
        communityData.backendId ?? Number(communityData.id);
      if (!communityIdNum || Number.isNaN(communityIdNum)) return;

      await communityService.rejectMember(communityIdNum, member.user_id);

      setPendingMembers((prev) =>
        prev.filter((m) => m.user_id !== member.user_id)
      );

      toast({
        title: "Member rejected",
        status: "info",
      });
    } catch (error: any) {
      console.log("reject member error", error);
      toast({
        title: "Failed to reject member",
        description: error.message,
        status: "error",
      });
    }
  };

  // Chỉ hiển thị nếu là admin và không phải public community
  if (!isAdmin || isPublic) return null;

  return (
    <Box position="sticky" top="190px" mt={4}>
      <Flex
        justify="space-between"
        align="center"
        bgGradient="linear(to-r, purple.500, pink.500)"
        color="white"
        p={3}
        borderRadius="8px 8px 0px 0px"
        boxShadow="0 1px 3px 0 rgba(0, 0, 0, 0.1)"
      >
        <Flex align="center">
          <Icon as={FaUserClock} mr={2} />
          <Text fontSize="10pt" fontWeight={700}>
            Pending Members
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
        maxH="260px"
        overflowY="auto"
      >
        {loading ? (
          <Flex align="center" justify="center" py={4}>
            <Spinner size="sm" />
          </Flex>
        ) : pendingMembers.length === 0 ? (
          <Text fontSize="9pt" color="gray.500">
            No pending members
          </Text>
        ) : (
          <Stack spacing={3} fontSize="9pt">
            {pendingMembers.map((member) => (
              <Box
                key={member.id}
                p={2}
                borderRadius={6}
                border="1px solid"
                borderColor={borderColor}
              >
                <Flex justify="space-between" align="center">
                  <Stack spacing={0}>
                    <Text fontWeight={600}>{`User #${member.user_id}`}</Text>
                    <Text fontSize="8pt" color="gray.500">
                      Status: {member.status}
                    </Text>
                  </Stack>
                  <Stack direction="row" spacing={2}>
                    <Button
                      size="xs"
                      colorScheme="green"
                      onClick={() => handleApprove(member)}
                    >
                      Approve
                    </Button>
                    <Button
                      size="xs"
                      colorScheme="red"
                      variant="outline"
                      onClick={() => handleReject(member)}
                    >
                      Reject
                    </Button>
                  </Stack>
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

export default PendingMembers;


