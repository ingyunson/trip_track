// src/app/grouping/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  VStack,
  Heading,
  Button,
  SimpleGrid,
  Text,
  Box,
  useToast,
  Flex,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';

import Header from '@/components/Header';
import GroupCard from '@/components/GroupCard';
import { usePhotoContext } from '@/context/PhotoContext';
import { groupPhotosByTimeAndLocation, PhotoGroup } from '@/lib/groupingAlgorithm';

export default function GroupingPage() {
  const router = useRouter();
  const toast = useToast();
  const { photos, groups, setGroups, mergeGroups, splitGroup } = usePhotoContext();
  
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  
  // Run grouping algorithm when the page loads if we don't have groups yet
  useEffect(() => {
    // Redirect if no photos
    if (photos.length === 0) {
      router.push('/upload');
      return;
    }
    
    // Skip if we already have groups
    if (groups.length > 0) {
      return;
    }
    
    // Run the grouping algorithm
    const initialGroups = groupPhotosByTimeAndLocation(photos);
    setGroups(initialGroups);
  }, [photos, groups.length, setGroups, router]);
  
  // Handle selecting groups for merge
  const handleSelectGroup = (groupId: string) => {
    setSelectedGroups(current => {
      if (current.includes(groupId)) {
        return current.filter(id => id !== groupId);
      } else {
        return [...current, groupId];
      }
    });
  };
  
  // Handle merging the selected groups
  const handleMergeGroups = () => {
    if (selectedGroups.length < 2) {
      toast({
        title: 'Select at least two groups',
        description: 'You need to select two or more groups to merge',
        status: 'warning',
        duration: 3000,
      });
      return;
    }
    
    mergeGroups(selectedGroups);
    setSelectedGroups([]);
    
    toast({
      title: 'Groups merged',
      description: 'The selected groups have been combined',
      status: 'success',
      duration: 2000,
    });
  };
  
  // Handle splitting a group
  const handleSplitGroup = (groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    
    if (!group || group.photos.length < 2) {
      toast({
        title: 'Cannot split group',
        description: 'The group needs at least two photos to be split',
        status: 'warning',
        duration: 3000,
      });
      return;
    }
    
    splitGroup(groupId);
    
    toast({
      title: 'Group split',
      description: 'The group has been divided into two parts',
      status: 'success',
      duration: 2000,
    });
  };
  
  // Handle proceeding to the next step
  const handleNext = () => {
    if (groups.length === 0) {
      toast({
        title: 'No groups created',
        description: 'You need at least one group to continue',
        status: 'warning',
        duration: 3000,
      });
      return;
    }
    
    router.push('/group-info');
  };
  
  return (
    <>
      <Header />
      <Container maxW="container.lg" py={8}>
        <VStack spacing={8} align="stretch">
          <Box>
            <Heading as="h1" size="xl" mb={2}>Photo Grouping</Heading>
            <Text color="gray.600">
              Your photos have been automatically grouped by time and location. You can adjust these groups by splitting or merging them.
            </Text>
          </Box>
          
          {groups.length === 0 ? (
            <Alert status="info" borderRadius="md">
              <AlertIcon />
              <AlertTitle>Processing photos...</AlertTitle>
              <AlertDescription>The photos are being organized into groups.</AlertDescription>
            </Alert>
          ) : (
            <>
              {/* Merge Controls */}
              {selectedGroups.length > 0 && (
                <Flex justify="center" mb={4}>
                  <Button 
                    colorScheme="teal" 
                    onClick={handleMergeGroups}
                    leftIcon={<span>🔀</span>}
                  >
                    Merge {selectedGroups.length} Selected Groups
                  </Button>
                </Flex>
              )}
              
              {/* Group Grid */}
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                {groups.map((group, index) => (
                  <GroupCard
                    key={group.id}
                    group={group}
                    index={index}
                    onSplitGroup={handleSplitGroup}
                    onSelectGroupForMerge={handleSelectGroup}
                    isSelected={selectedGroups.includes(group.id)}
                  />
                ))}
              </SimpleGrid>
              
              {/* Navigation */}
              <Flex justify="center" mt={8}>
                <Button 
                  colorScheme="teal" 
                  size="lg" 
                  onClick={handleNext}
                >
                  Next: Add Group Information
                </Button>
              </Flex>
            </>
          )}
        </VStack>
      </Container>
    </>
  );
}