import {
  Box,
  Container,
  Heading,
  VStack,
  HStack,
  Switch,
  Text,
  Button,
  useToast,
  Spinner,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase/clientApp';
import { useNotifications } from '../hooks/useNotifications';

const NotificationsPage: React.FC = () => {
  const [user] = useAuthState(auth);
  const router = useRouter();
  const toast = useToast();
  const { preferences, updatePreferences, loading } = useNotifications();

  const handlePreferenceChange = async (key: keyof typeof preferences, value: boolean | string) => {
    if (!preferences) return;

    try {
      await updatePreferences({ [key]: value });
      toast({
        title: 'Preferences updated',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Failed to update preferences',
        status: 'error',
        duration: 2000,
        isClosable: true,
      });
    }
  };

  if (!user) {
    router.push('/');
    return null;
  }

  if (loading) {
    return (
      <Container maxW="container.md" py={8}>
        <Box textAlign="center">
          <Spinner size="xl" />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={6} align="stretch">
        <Heading>Notification Settings</Heading>
        
        {preferences && (
          <VStack spacing={4} align="stretch">
            <HStack justify="space-between">
              <VStack align="start" spacing={1}>
                <Text fontWeight="medium">In-app notifications</Text>
                <Text fontSize="sm" color="gray.600">
                  Show notifications in the app
                </Text>
              </VStack>
              <Switch
                isChecked={preferences.inApp}
                onChange={(e) => handlePreferenceChange('inApp', e.target.checked)}
              />
            </HStack>

            <HStack justify="space-between">
              <VStack align="start" spacing={1}>
                <Text fontWeight="medium">Email notifications</Text>
                <Text fontSize="sm" color="gray.600">
                  Receive notifications via email
                </Text>
              </VStack>
              <Switch
                isChecked={preferences.email}
                onChange={(e) => handlePreferenceChange('email', e.target.checked)}
              />
            </HStack>

            <HStack justify="space-between">
              <VStack align="start" spacing={1}>
                <Text fontWeight="medium">Push notifications</Text>
                <Text fontSize="sm" color="gray.600">
                  Receive push notifications on your device
                </Text>
              </VStack>
              <Switch
                isChecked={preferences.push}
                onChange={(e) => handlePreferenceChange('push', e.target.checked)}
              />
            </HStack>
          </VStack>
        )}
      </VStack>
    </Container>
  );
};

export default NotificationsPage;
