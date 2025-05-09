// src/app/ai-generation/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container, VStack, Heading, Box, Text, Button, Alert, AlertIcon,
  AlertTitle, AlertDescription, useToast, Flex, Spinner
} from '@chakra-ui/react';
import { FiRefreshCw } from 'react-icons/fi';
import Header from '@/components/Header';
import GeneratingAnimation from '@/components/GeneratingAnimation';
import GroupInfoCard from '@/components/GroupInfoCard';  // Import GroupInfoCard
import { usePhotoContext } from '@/context/PhotoContext';

// Add this helper function at the top level of your component
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error("Failed to convert file to base64"));
      }
    };
    reader.onerror = error => reject(error);
  });
};

export default function AIGenerationPage() {
  const router = useRouter();
  const toast = useToast();
  const { groups, aiGeneratedTexts, setAiGeneratedTextForGroup, updateGroup, setEditedText } = usePhotoContext();
  
  // Track generation status per group
  const [generatingGroups, setGeneratingGroups] = useState<Record<string, boolean>>({});
  const isAnyGenerating = Object.values(generatingGroups).some(isGenerating => isGenerating);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Check if we have the required data
  useEffect(() => {
    if (groups.length === 0) {
      router.push('/group-info');
      return;
    }
    
    // Auto-generate for any groups without text
    groups.forEach(group => {
      if (!aiGeneratedTexts[group.id] && !generatingGroups[group.id] && !errors[group.id]) {
        generateDiaryForGroup(group.id);
      }
    });
  }, [groups, aiGeneratedTexts]);
  
  // Function to generate diary for a specific group
  const generateDiaryForGroup = async (groupId: string) => {
    setGeneratingGroups(prev => ({ ...prev, [groupId]: true }));
    setErrors(prev => ({ ...prev, [groupId]: '' }));
    
    try {
      const group = groups.find(g => g.id === groupId);
      if (!group) throw new Error('Group not found');
      
      // Convert cover photo to base64
      let imageBase64 = null;
      if (group.coverPhoto?.file) {
        try {
          imageBase64 = await fileToBase64(group.coverPhoto.file);
        } catch (error) {
          console.error('Error converting image:', error);
        }
      }
      
      // Prepare single group data
      const groupData = [{
        id: group.id,
        group_name: group.location,
        earliest_time_stamp: group.startTime?.toISOString(),
        latest_time_stamp: group.endTime?.toISOString(),
        rating: group.rating,
        review: group.review,
        representative_location: group.location,
        photo_count: group.photos.length,
        image_data: imageBase64
      }];
      
      // Call API for just this group
      const response = await fetch('/api/generateLog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupData }),
      });
      
      if (!response.ok) throw new Error(`Error: ${response.statusText}`);
      
      const data = await response.json();
      setAiGeneratedTextForGroup(groupId, data.aiText);
      
      // Also update the review field in the group
      updateGroup(groupId, { review: data.aiText });
    } catch (error) {
      console.error(`Failed to generate diary for ${groupId}:`, error);
      setErrors(prev => ({ 
        ...prev, 
        [groupId]: error instanceof Error ? error.message : 'Unknown error' 
      }));
      
      toast({
        title: 'Generation failed',
        description: 'Could not generate diary for this location. Try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setGeneratingGroups(prev => ({ ...prev, [groupId]: false }));
    }
  };
  
  // Handle regeneration for a specific group
  const handleRegenerateForGroup = (groupId: string) => {
    generateDiaryForGroup(groupId);
  };
  
  // Handle save log instead of proceeding to editing
  const handleSaveLog = () => {
    const anyGenerated = Object.keys(aiGeneratedTexts).length > 0;
    if (!anyGenerated) {
      toast({
        title: 'No content to save',
        description: 'Please wait for the AI to generate content',
        status: 'warning',
        duration: 3000,
      });
      return;
    }
    
    // Create combined text from all group entries
    const fullDiary = groups
      .filter(group => aiGeneratedTexts[group.id])
      .map(group => (
        `# ${group.location}\n\n${aiGeneratedTexts[group.id]}\n\n`
      ))
      .join('\n');
    
    // Save the combined text to context
    setEditedText(fullDiary);
    
    toast({
      title: 'Travel log saved',
      description: 'Your travel log has been saved successfully',
      status: 'success',
      duration: 3000,
    });
    
    // Navigate to saved-log page instead of edit-log
    router.push('/saved-log');
  };

  return (
    <>
      <Header />
      <Container maxW="container.md" py={8} position="relative">
        {isAnyGenerating && (
          <Flex 
            position="fixed"
            top="0"
            left="0"
            right="0"
            bottom="0"
            bg="rgba(0, 0, 0, 0.7)"
            zIndex="overlay"
            justifyContent="center"
            alignItems="center"
            flexDirection="column"
          >
            <Box 
              bg="white" 
              p={8} 
              borderRadius="md" 
              maxW="md" 
              textAlign="center"
              boxShadow="xl"
            >
              <GeneratingAnimation size="lg" />
              <Heading size="md" mt={6} mb={2}>
                AI is generating your travel log...
              </Heading>
              <Text color="gray.600">
                This may take a moment as we craft a personalized narrative
              </Text>
            </Box>
          </Flex>
        )}
        <VStack
          spacing={8}
          align="stretch"
          display={isAnyGenerating ? 'none' : 'flex'}
        >
          <Box>
            <Heading as="h1" size="xl" mb={2}>AI-Generated Travel Diaries</Heading>
            <Text color="gray.600">
              Review the AI-generated content for each of your travel locations.
            </Text>
          </Box>
          
          {/* Display groups in same format as group-info page */}
          <VStack spacing={4} align="stretch">
            {groups.map((group, index) => (
              <Box key={group.id} position="relative">
                {/* Show loading spinner or error above the card */}
                {generatingGroups[group.id] && (
                  <Flex 
                    position="absolute" 
                    top="0" 
                    left="0" 
                    right="0" 
                    bottom="0" 
                    bg="rgba(255,255,255,0.8)" 
                    zIndex="1"
                    justifyContent="center"
                    alignItems="center"
                    flexDirection="column"
                  >
                    <GeneratingAnimation />
                    <Text mt={2} fontWeight="medium">Generating diary...</Text>
                  </Flex>
                )}
                
                {errors[group.id] && (
                  <Alert status="error" borderRadius="md" mb={2}>
                    <AlertIcon />
                    <AlertTitle>Generation Failed</AlertTitle>
                    <AlertDescription>{errors[group.id]}</AlertDescription>
                    <Button 
                      ml="auto" 
                      size="sm" 
                      colorScheme="red" 
                      onClick={() => generateDiaryForGroup(group.id)}
                    >
                      Retry
                    </Button>
                  </Alert>
                )}
                
                {/* Use GroupInfoCard with the AI text in review field */}
                <Box position="relative">
                  <GroupInfoCard
                    group={group}
                    index={index}
                    onChange={(id, updates) => {
                      // Only allow changing location and rating, not review
                      const safeUpdates = {...updates};
                      if (updates.review !== undefined) {
                        delete safeUpdates.review;
                      }
                      updateGroup(id, safeUpdates);
                    }}
                    hasError={false}
                  />
                  
                  {/* Add regenerate button */}
                  {!generatingGroups[group.id] && aiGeneratedTexts[group.id] && (
                    <Button
                      position="absolute"
                      top="10px"
                      right="10px"
                      size="sm"
                      leftIcon={<FiRefreshCw />}
                      colorScheme="teal"
                      variant="ghost"
                      onClick={() => handleRegenerateForGroup(group.id)}
                      zIndex="2"
                      isDisabled={isAnyGenerating}
                    >
                      Regenerate
                    </Button>
                  )}
                </Box>
              </Box>
            ))}
          </VStack>
          
          {/* Action buttons - Fixed the misplaced closing tags */}
          <Flex justify="center" mt={4}>
            <Button
              colorScheme="teal"
              size="lg"
              onClick={handleSaveLog}
              isDisabled={isAnyGenerating || Object.keys(aiGeneratedTexts).length === 0}
            >
              Save Log
            </Button>
          </Flex>
        </VStack>
      </Container>
    </>
  );
}