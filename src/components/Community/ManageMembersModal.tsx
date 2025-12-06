import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
  Box,
  Divider,
  Flex,
  Icon,
  Spinner,
  Stack,
  Text,
  useColorModeValue,
  useToast,
  Avatar,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { FaUserClock, FaUsers } from "react-icons/fa";
import { useSetRecoilState } from "recoil";
import moment from "moment";

import { Community, CommunityState } from "../../atoms/CommunitiesAtom";
import { useAuth } from "../../contexts/AuthContext";
import { MemberDto, communityService } from "../../services/communityService";
import { userService, User } from "../../services/userService";
import { getAvatarUrl } from "../../utils/apiConfig";

type ManageMembersModalProps = {
  isOpen: boolean;
  onClose: () => void;
  communityData: Community;
};

interface MemberWithUser extends MemberDto {
  user?: User;
}

const ManageMembersModal: React.FC<ManageMembersModalProps> = ({
  isOpen,
  onClose,
  communityData,
}) => {
  const { user } = useAuth();
  const toast = useToast();
  const setCommunityStateValue = useSetRecoilState(CommunityState);
  
  const [pendingMembers, setPendingMembers] = useState<MemberDto[]>([]);
  const [members, setMembers] = useState<MemberWithUser[]>([]);
  const [loadingPending, setLoadingPending] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [removingUserId, setRemovingUserId] = useState<number | null>(null);

  const bg = useColorModeValue("white", "#1A202C");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const hoverBg = useColorModeValue("gray.50", "gray.700");

  const isAdmin = user && String(user.id) === String(communityData.creatorId);
  const isPublic = communityData.typeId === 2;

  // Fetch pending members
  useEffect(() => {
    const fetchPending = async () => {
      if (!isAdmin || isPublic || !isOpen) return;
      try {
        setLoadingPending(true);
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
        setLoadingPending(false);
      }
    };

    fetchPending();
  }, [isAdmin, isPublic, communityData.backendId, communityData.id, isOpen]);

  // Fetch approved members
  useEffect(() => {
    const fetchMembers = async () => {
      if (!isAdmin || !isOpen) return;
      try {
        setLoadingMembers(true);
        const communityIdNum =
          communityData.backendId ?? Number(communityData.id);
        if (!communityIdNum || Number.isNaN(communityIdNum)) return;

        const membersData = await communityService.getCommunityMembers(
          communityIdNum
        );

        const approvedMembers = membersData.filter(
          (m) => m.status === "APPROVED"
        );

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
        setLoadingMembers(false);
      }
    };

    fetchMembers();
  }, [isAdmin, communityData.backendId, communityData.id, isOpen, toast]);

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

      // Refresh members list
      const membersData = await communityService.getCommunityMembers(
        communityIdNum
      );
      const approvedMembers = membersData.filter(
        (m) => m.status === "APPROVED"
      );
      const membersWithUsers = await Promise.all(
        approvedMembers.map(async (m) => {
          try {
            const userData = await userService.getUserById(m.user_id);
            return { ...m, user: userData };
          } catch {
            return { ...m, user: undefined };
          }
        })
      );
      setMembers(membersWithUsers);

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
    <Modal isOpen={isOpen} onClose={onClose} size="lg" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Manage Members</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <Tabs>
            <TabList>
              <Tab>
                <Flex align="center" gap={2}>
                  <Icon as={FaUsers} />
                  <Text>Members ({members.length})</Text>
                </Flex>
              </Tab>
              {!isPublic && (
                <Tab>
                  <Flex align="center" gap={2}>
                    <Icon as={FaUserClock} />
                    <Text>Pending ({pendingMembers.length})</Text>
                  </Flex>
                </Tab>
              )}
            </TabList>

            <TabPanels>
              {/* Members Tab */}
              <TabPanel>
                {loadingMembers ? (
                  <Flex align="center" justify="center" py={8}>
                    <Spinner size="lg" />
                  </Flex>
                ) : members.length === 0 ? (
                  <Text fontSize="10pt" color="gray.500" textAlign="center" py={8}>
                    No members found
                  </Text>
                ) : (
                  <Stack spacing={3} mt={4}>
                    {members.map((member) => (
                      <Box
                        key={member.id}
                        p={3}
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
                                mr={3}
                              />
                            ) : (
                              <Avatar size="sm" mr={3} />
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
                              size="sm"
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
              </TabPanel>

              {/* Pending Members Tab */}
              {!isPublic && (
                <TabPanel>
                  {loadingPending ? (
                    <Flex align="center" justify="center" py={8}>
                      <Spinner size="lg" />
                    </Flex>
                  ) : pendingMembers.length === 0 ? (
                    <Text fontSize="10pt" color="gray.500" textAlign="center" py={8}>
                      No pending members
                    </Text>
                  ) : (
                    <Stack spacing={3} mt={4}>
                      {pendingMembers.map((member) => (
                        <Box
                          key={member.id}
                          p={3}
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
                                size="sm"
                                colorScheme="green"
                                onClick={() => handleApprove(member)}
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
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
                </TabPanel>
              )}
            </TabPanels>
          </Tabs>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ManageMembersModal;

