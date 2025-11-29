import {
  Box,
  Icon,
  Badge,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverArrow,
  Button,
  Text,
  VStack,
  HStack,
  Spinner,
  useColorModeValue,
} from '@chakra-ui/react';
import { IoNotificationsOutline } from 'react-icons/io5';
import { useState, useEffect } from 'react';
import { useNotifications } from '../../hooks/useNotifications';

const NotificationBell: React.FC = () => {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead, socketConnected } = useNotifications();
  const hoverBg = useColorModeValue('gray.200', '#2A4365');
  const bg = useColorModeValue('white', 'gray.800');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const formatTime = (dateString: string) => {
    if (!isClient) return 'Loading...'; // Fallback for SSR
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <Popover>
      <PopoverTrigger>
        <Box
          position="relative"
          cursor="pointer"
          padding={1}
          borderRadius={4}
          _hover={{ bg: hoverBg }}
        >
          <Icon as={IoNotificationsOutline} fontSize={20} />
          
          {isClient && unreadCount > 0 && (
            <Badge
              position="absolute"
              top={-1}
              right={-1}
              colorScheme="red"
              borderRadius="full"
              fontSize="xs"
              minW="18px"
              h="18px"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Box>
      </PopoverTrigger>
      <PopoverContent bg={bg} width="400px" maxHeight="500px">
        <PopoverArrow />
        <PopoverBody p={0}>
          <Box p={3} borderBottom="1px solid" borderColor="gray.200">
            <HStack justify="space-between">
              <HStack spacing={2}>
                <Text fontWeight="bold">Notifications</Text>
              </HStack>
              {isClient && unreadCount > 0 && (
                <Button size="sm" variant="ghost" onClick={markAllAsRead}>
                  Mark all as read
                </Button>
              )}
            </HStack>
          </Box>
          
          <Box maxHeight="400px" overflowY="auto">
            {loading ? (
              <Box p={4} textAlign="center">
                <Spinner />
              </Box>
            ) : !isClient ? (
              <Box p={4} textAlign="center">
                <Spinner />
              </Box>
            ) : !notifications || notifications.length === 0 ? (
              <Box p={4} textAlign="center">
                <Text color="gray.500">No notifications yet</Text>
              </Box>
            ) : (
              <VStack spacing={0} align="stretch">
                {notifications?.map((notification) => (
                  <Box
                    key={notification.id}
                    p={3}
                    borderBottom="1px solid"
                    borderColor="gray.100"
                    bg={!notification.read ? 'blue.50' : 'transparent'}
                    cursor="pointer"
                    onClick={() => markAsRead(notification.id)}
                    _hover={{ bg: 'gray.50' }}
                  >
                    <VStack align="start" spacing={1}>
                      <Text fontWeight={notification.read ? 'normal' : 'bold'}>
                        {notification.title}
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        {notification.message}
                      </Text>
                      <Text fontSize="xs" color="gray.400">
                        {formatTime(notification.createdAt)}
                      </Text>
                    </VStack>
                  </Box>
                ))}
              </VStack>
            )}
          </Box>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
