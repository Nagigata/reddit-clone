import {
  Box,
  Container,
  Heading,
  VStack,
  HStack,
  Switch,
  Text,
  useToast,
  Spinner,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../hooks/useNotifications';


type BooleanPreferenceKey = 'inApp' | 'email' | 'push';

const NotificationsPage: React.FC = () => {
  const { user, loading: loadingUser } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const { preferences, updatePreferences, loading } = useNotifications();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !loadingUser && !user) {
      router.push('/');
    }
  }, [mounted, loadingUser, user, router]);

  const handlePreferenceChange = async (key: BooleanPreferenceKey, value: boolean) => {
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

  // Show loading or nothing during SSR and initial mount
  if (!mounted || loadingUser) {
    return (
      <Container maxW="container.md" py={8}>
        <Box textAlign="center">
          <Spinner size="xl" />
        </Box>
      </Container>
    );
  }

  if (!user) {
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

// Disable static generation for this page
export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {},
  };
};
