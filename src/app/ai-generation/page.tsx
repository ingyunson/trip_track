// src/app/ai-generation/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  VStack,
  Heading,
  Box,
  Text,
  Button,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useToast,
  Flex,
} from '@chakra-ui/react';
import Header from '@/components/Header';
import GeneratingAnimation from '@/components/GeneratingAnimation';
import { usePhotoContext } from '@/context/PhotoContext';

export default function AIGenerationPage() {
  const router = useRouter();
  const toast = useToast();
  const { groups, aiGeneratedText, setAiGeneratedText } = usePhotoContext();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Check if we have the required data from previous steps
  useEffect(() => {
    if (groups.length === 0) {
      router.push('/group-info');
      return;
    }
    
    // Auto-generate if we don't have AI text yet
    if (!aiGeneratedText && !isGenerating && !error) {
      generateTravelLog();
    }
  }, [groups, aiGeneratedText, isGenerating, error]);
  
  // Function to generate travel log
  const generateTravelLog = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      // Prepare the data for the API
      const groupData = groups.map(group => ({
        id: group.id,
        group_name: group.location,
        earliest_time_stamp: group.startTime?.toISOString(),
        latest_time_stamp: group.endTime?.toISOString(),
        rating: group.rating,
        review: group.review,
        representative_location: group.location,
        photo_count: group.photos.length
      }));
      
      // Call the API to generate the travel log
      const response = await fetch('/api/generateLog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ groupData }),
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      
      const data = await response.json();
      setAiGeneratedText(data.aiText);
      
    } catch (error) {
      console.error('Failed to generate travel log:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      
      toast({
        title: 'Generation failed',
        description: 'We could not generate your travel log. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Function to handle proceeding to edit page
  const handleEditLog = () => {
    if (!aiGeneratedText) {
      toast({
        title: 'No content to edit',
        description: 'Please wait for the AI to generate content first',
        status: 'warning',
        duration: 3000,
      });
      return;
    }
    
    router.push('/edit-log');
  };
  
  // Function to retry generation
  const handleRetryGeneration = () => {
    generateTravelLog();
  };
  
  return (
    <>
      <Header />
      <Container maxW="container.md" py={8}>
        <VStack spacing={8} align="stretch">
          <Box>
            <Heading as="h1" size="xl" mb={2}>AI Travel Log Generation</Heading>
            <Text color="gray.600">
              We&apos;re using AI to create a personalized travel log based on your photos and group information.
            </Text>
          </Box>
          
          {/* Error state */}
          {error && (
            <Alert 
              status="error" 
              variant="subtle" 
              flexDirection="column" 
              alignItems="center" 
              justifyContent="center" 
              textAlign="center" 
              borderRadius="md"
              p={5}
            >
              <AlertIcon boxSize={8} mr={0} mb={4} />
              <AlertTitle fontSize="lg">Generation Failed</AlertTitle>
              <AlertDescription maxWidth="md">
                {error}. Please try again or contact support if the problem persists.
              </AlertDescription>
              <Button 
                mt={4} 
                colorScheme="red" 
                onClick={handleRetryGeneration}
              >
                Try Again
              </Button>
            </Alert>
          )}
          
          {/* Loading state */}
          {isGenerating && <GeneratingAnimation />}
          
          {/* Generated content display */}
          {!isGenerating && aiGeneratedText && !error && (
            <>
              <Box
                borderWidth={1}
                borderRadius="md"
                p={5}
                bg="white"
                boxShadow="sm"
                maxHeight="500px"
                overflowY="auto"
              >
                <Text fontSize="sm" color="gray.500" mb={4}>
                  AI-Generated Travel Log Preview:
                </Text>
                
                {/* Render the AI-generated text with basic formatting */}
                <Box whiteSpace="pre-wrap">
                  {aiGeneratedText.split('\n').map((line, index) => {
                    // Handle Markdown headers
                    if (line.startsWith('# ')) {
                      return <Heading as="h1" size="xl" mt={4} mb={3} key={index}>{line.substring(2)}</Heading>;
                    }
                    if (line.startsWith('## ')) {
                      return <Heading as="h2" size="lg" mt={4} mb={2} key={index}>{line.substring(3)}</Heading>;
                    }
                    if (line.startsWith('### ')) {
                      return <Heading as="h3" size="md" mt={3} mb={2} key={index}>{line.substring(4)}</Heading>;
                    }
                    
                    // Handle empty lines as paragraph breaks
                    if (line.trim() === '') {
                      return <Box key={index} height="1em" />;
                    }
                    
                    // Regular paragraph text
                    return <Text mb={2} key={index}>{line}</Text>;
                  })}
                </Box>
              </Box>
              
              {/* Action buttons */}
              <Flex justify="center" mt={4}>
                <Button
                  colorScheme="teal"
                  size="lg"
                  onClick={handleEditLog}
                >
                  Edit Travel Log
                </Button>
              </Flex>
            </>
          )}
        </VStack>
      </Container>
    </>
  );
}