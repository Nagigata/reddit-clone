import {
  Box,
  Button,
  Divider,
  Flex,
  Icon,
  Image,
  Stack,
  Text,
  useColorModeValue,
  Avatar,
  Badge,
  IconButton,
  useToast,
  Switch,
  Tooltip,
} from "@chakra-ui/react";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { FaReddit, FaCrown, FaUserClock, FaUserCheck } from "react-icons/fa";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import { IoPeopleOutline } from "react-icons/io5";
import { IoClose, IoCheckmark } from "react-icons/io5";
import axios from "axios";

import { Community } from "../../atoms/CommunitiesAtom";
import { auth } from "../../firebase/clientApp";
import ConfirmRemoveMemberDialog from "../common/DialogConfirm";

type Member = {
  user_id: number;
  username: string;
  imageUrl?: string;
  joined_at: string;
  is_creator?: boolean;
};

type PendingMember = {
  user_id: number;
  username: string;
  imageUrl?: string;
  requested_at: string;
};

type MembersProps = {
  communityData: Community;
};

const Members: React.FC<MembersProps> = ({ communityData }) => {
  const [user] = useAuthState(auth);
  const [showPending, setShowPending] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [pendingMembers, setPendingMembers] = useState<PendingMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingMember, setRemovingMember] = useState<number | null>(null);
  const [selectedMember, setSelectedMember] = useState<{ id: number; username: string } | null>(null);
  const [approvingMember, setApprovingMember] = useState<number | null>(null);
  const bg = useColorModeValue("white", "#1A202C");
  const hoverBg = useColorModeValue("gray.50", "gray.700");
  const switchBg = useColorModeValue("gray.200", "gray.600");
  const toast = useToast();

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/community-member/${communityData.community_id}`
        );
        setMembers(response.data.members || []);
      } catch (error) {
        console.error("Fetch members error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (communityData.community_id) {
      fetchMembers();
    }
  }, [communityData.community_id]);

  useEffect(() => {
    const fetchPendingMembers = async () => {
      if (!showPending) return;
      
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/community-member/pending/${communityData.community_id}`
        );
        setPendingMembers(response.data.members || []);
      } catch (error) {
        console.error("Fetch pending members error:", error);
      }
    };

    if (communityData.community_id && showPending) {
      fetchPendingMembers();
    }
  }, [communityData.community_id, showPending]);

  const handleRemoveMember = async (memberId: number, username: string) => {
    setSelectedMember({ id: memberId, username });
  };

  const confirmRemoveMember = async () => {
    if (!selectedMember) return;

    setRemovingMember(selectedMember.id);
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/community-member/${communityData.community_id}/reject-member/${selectedMember.id}`
      );

      setMembers((prev) => prev.filter((m) => m.user_id !== selectedMember.id));

      toast({
        title: "Success",
        description: `Removed u/${selectedMember.username} from the community`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      setSelectedMember(null);
    } catch (error) {
      console.error("Remove member error:", error);
      toast({
        title: "Error",
        description: "Unable to remove member. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setRemovingMember(null);
    }
  };

  const handleApproveMember = async (memberId: number) => {
    setApprovingMember(memberId);
    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/community-member/${communityData.community_id}/approve-member/${memberId}`
      );

      setPendingMembers((prev) => prev.filter((m) => m.user_id !== memberId));
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/community-member/${communityData.community_id}`
      );
      setMembers(response.data.members || []);
      toast({
        title: "Success",
        description: `Approved u/user to join the community`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Approve member error:", error);
      toast({
        title: "Error",
        description: "Unable to approve member. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setApprovingMember(null);
    }
  };

  const handleRejectMember = async (memberId: number) => {
    setRemovingMember(memberId);
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/community-member/${communityData.community_id}/reject-member/${memberId}`
      );

      setPendingMembers((prev) => prev.filter((m) => m.user_id !== memberId));

      toast({
        title: "Success",
        description: `Rejected u/user's request`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Reject member error:", error);
      toast({
        title: "Error",
        description: "Unable to reject member. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setRemovingMember(null);
    }
  };

  const isAdmin = communityData.created_by === 1; // SAU NHO THAY DOI ID USER CHO NAY

  return (
    <Box position="sticky" top="14px" marginTop={4}>
      <Flex
        justify="space-between"
        align="center"
        bg="blue.400"
        color="white"
        p={3}
        borderRadius="4px 4px 0px 0px"
      >
        <Flex align="center">
          <Icon as={showPending ? FaUserClock : IoPeopleOutline} fontSize={16} mr={2} />
          <Text fontSize="10pt" fontWeight={700}>
            {showPending ? `Pending Requests (${pendingMembers.length})` : `Members (${members.length})`}
          </Text>
        </Flex>
        
        {isAdmin && (
          <Flex align="center" gap={2}>
            <Tooltip label={showPending ? "Show Members" : "Show Pending Requests"} placement="top">
              <Flex align="center" gap={2}>
                <Icon as={FaUserCheck} fontSize={14} opacity={showPending ? 0.6 : 1} />
                <Switch
                  colorScheme="whiteAlpha"
                  size="sm"
                  isChecked={showPending}
                  onChange={(e) => setShowPending(e.target.checked)}
                  sx={{
                    "span.chakra-switch__track": {
                      bg: switchBg,
                    },
                  }}
                />
                <Icon as={FaUserClock} fontSize={14} opacity={showPending ? 1 : 0.6} />
              </Flex>
            </Tooltip>
          </Flex>
        )}
      </Flex>
      
      <Flex 
        direction="column" 
        p={3} 
        bg={bg} 
        borderRadius="0px 0px 4px 4px"
        maxH="500px"
        overflowY="auto"
      >
        <Stack spacing={2}>
          {loading ? (
            <Text fontSize="10pt" color="gray.500" textAlign="center" py={4}>
              Loading {showPending ? "pending requests" : "members"}...
            </Text>
          ) : showPending ? (
            pendingMembers.length === 0 ? (
              <Text fontSize="10pt" color="gray.500" textAlign="center" py={4}>
                No pending requests
              </Text>
            ) : (
              pendingMembers.map((member) => (
                <Box key={member.user_id}>
                  <Flex
                    align="center"
                    p={2}
                    borderRadius="4px"
                    _hover={{ bg: hoverBg }}
                    transition="all 0.2s"
                  >
                    {member.imageUrl ? (
                      <Avatar
                        src={member.imageUrl}
                        size="sm"
                        name={member.username}
                      />
                    ) : (
                      <Icon
                        as={FaReddit}
                        fontSize={32}
                        color="brand.100"
                      />
                    )}
                    
                    <Flex direction="column" ml={3} flex={1}>
                      <Text fontSize="10pt" fontWeight={600}>
                        u/user{member.user_id}
                      </Text>
                      <Text fontSize="8pt" color="gray.500">
                        Requested {moment(new Date(member.requested_at)).format("MMM DD, YYYY")}
                      </Text>
                    </Flex>

                    <Flex gap={1}>
                      <IconButton
                        aria-label="Approve member"
                        icon={<IoCheckmark />}
                        size="sm"
                        colorScheme="green"
                        variant="ghost"
                        isLoading={approvingMember === member.user_id}
                        onClick={() => handleApproveMember(member.user_id)}
                        _hover={{ bg: "green.100" }}
                      />
                      <IconButton
                        aria-label="Reject member"
                        icon={<IoClose />}
                        size="sm"
                        colorScheme="red"
                        variant="ghost"
                        isLoading={removingMember === member.user_id}
                        onClick={() => handleRejectMember(member.user_id)}
                        _hover={{ bg: "red.100" }}
                      />
                    </Flex>
                  </Flex>
                  <Divider />
                </Box>
              ))
            )
          ) : members.length === 0 ? (
            <Text fontSize="10pt" color="gray.500" textAlign="center" py={4}>
              No members yet
            </Text>
          ) : (
            members.map((member) => (
              <Box key={member.user_id}>
                <Flex
                  align="center"
                  p={2}
                  borderRadius="4px"
                  cursor="pointer"
                  _hover={member.user_id === 1 ? {} : { bg: hoverBg }} // SAU NHO THAY DOI ID USER CHO NAY CHO DUNG
                  transition="all 0.2s"
                  backgroundColor={member.user_id === 1 ? 'yellow.100' : 'white'} // SAU NHO THAY DOI ID USER CHO NAY CHO DUNG
                >
                  {member.imageUrl ? (
                    <Avatar
                      src={member.imageUrl}
                      size="sm"
                      name={member.username}
                    />
                  ) : (
                    <Icon
                      as={FaReddit}
                      fontSize={32}
                      color="brand.100"
                    />
                  )}
                  
                  <Flex direction="column" ml={3} flex={1}>
                    <Flex align="center">
                      <Text fontSize="10pt" fontWeight={600}>
                        u/user{member.user_id}
                      </Text>
                      {member.is_creator && (
                        <Badge ml={2} colorScheme="yellow" fontSize="8pt">
                          <Flex align="center">
                            <Icon as={FaCrown} mr={1} />
                            Creator
                          </Flex>
                        </Badge>
                      )}
                    </Flex>
                    <Text fontSize="8pt" color="gray.500">
                      Joined {moment(new Date(member.joined_at)).format("MMM DD, YYYY")}
                    </Text>
                  </Flex>

                  {isAdmin && member.user_id !== 1 && ( // SAU NHO THAY DOI ID USER CHO NAY CHO DUNG
                    <IconButton
                      aria-label="Remove member"
                      icon={<IoClose />}
                      size="md"
                      colorScheme="red"
                      variant="ghost"
                      isLoading={removingMember === member.user_id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveMember(member.user_id, member.username);
                      }}
                      _hover={{ bg: "red.100" }}
                    />
                  )}
                </Flex>
                <Divider />
              </Box>
            ))
          )}
        </Stack>
      </Flex>

      <ConfirmRemoveMemberDialog
        isOpen={selectedMember !== null}
        onClose={() => setSelectedMember(null)}
        onConfirm={confirmRemoveMember}
        username={selectedMember?.username || "user"}
        isLoading={removingMember !== null}
      />
    </Box>
  );
};

export default Members;