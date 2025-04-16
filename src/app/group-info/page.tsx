// src/app/group-info/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  VStack,
  Heading,
  Text,
  Button,
  Box,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  Flex,
  Spacer,
  Progress,
} from '@chakra-ui/react';
import Header from '@/components/Header';
import GroupInfoCard from '@/components/GroupInfoCard';
import { usePhotoContext } from '@/context/PhotoContext';
import { PhotoGroup } from '@/lib/groupingAlgorithm';

export default function GroupInfoPage() {
  const router = useRouter();
  const toast = useToast();
  const { groups, updateGroup } = usePhotoContext();
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate and track completion status
  const [completionPercentage, setCompletionPercentage] = useState(0);

  useEffect(() => {
    // Redirect if no groups
    if (groups.length === 0) {
      router.push('/grouping');
      return;
    }

    // Check for errors and calculate completion percentage
    const newErrors: Record<string, boolean> = {};
    let completedCount = 0;

    groups.forEach(group => {
      // Place name is required
      const hasError = !group.location || group.location.trim() === '';
      newErrors[group.id] = hasError;

      if (!hasError) {
        completedCount++;
      }
    });

    setErrors(newErrors);
    setCompletionPercentage(groups.length > 0 ? (completedCount / groups.length) * 100 : 0);
  }, [groups, router]);

  // Handler for updating group info
  const handleGroupUpdate = (groupId: string, updates: Partial<PhotoGroup>) => {
    updateGroup(groupId, updates);
  };

  // Handle next button click
  const handleNext = () => {
    // Check if all groups have required fields
    const missingFields = Object.values(errors).some(error => error);

    if (missingFields) {
      toast({
        title: 'Missing information',
        description: 'Please provide a place name for all groups',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);

    // In a real app, you might save to the database here
    setTimeout(() => {
      setIsSubmitting(false);
      router.push('/ai-generation');
    }, 1000);
  };

  return (
    <>
      <Header />
      <Container maxW="container.md" py={8}>
        <VStack spacing={8} align="stretch">
          <Box>
            <Heading as="h1" size="xl" mb={2}>Group Information</Heading>
            <Text color="gray.600">
              Add details to each photo group to create your travel log.
              Please provide at least a place name for each group.
            </Text>
          </Box>

          {/* Progress indicator */}
          <Box>
            <Flex align="center" mb={2}>
              <Text fontSize="sm" fontWeight="medium">
                {Math.round(completionPercentage)}% Complete
              </Text>
              <Spacer />
              <Text fontSize="sm" color="gray.500">
                {groups.length - Object.values(errors).filter(Boolean).length}/{groups.length} groups completed
              </Text>
            </Flex>
            <Progress
              value={completionPercentage}
              size="sm"
              colorScheme="teal"
              borderRadius="full"
            />
          </Box>

          {/* Group list */}
          {groups.length === 0 ? (
            <Alert status="info">
              <AlertIcon />
              <AlertTitle>No groups found</AlertTitle>
              <Text>Please go back to the grouping page to create groups.</Text>
            </Alert>
          ) : (
            <VStack spacing={4} align="stretch">
              {groups.map((group, index) => (
                <GroupInfoCard
                  key={group.id}
                  group={group}
                  index={index}
                  onChange={handleGroupUpdate}
                  hasError={errors[group.id]}
                />
              ))}
            </VStack>
          )}

          {/* Navigation */}
          <Flex justify="center" mt={4}>
            <Button
              colorScheme="teal"
              size="lg"
              onClick={handleNext}
              isLoading={isSubmitting}
              loadingText="Saving..."
              isDisabled={Object.values(errors).some(Boolean)}
            >
              Generate AI Travel Log
            </Button>
          </Flex>
        </VStack>
      </Container>
    </>
  );
}
