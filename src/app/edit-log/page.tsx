// src/app/edit-log/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  VStack,
  Heading,
  Text,
  Box,
  Button,
  HStack,
  useToast,
  useDisclosure,
  Alert,
  AlertIcon,
  AlertDescription,
  Icon,
} from '@chakra-ui/react';
import { FiShare2 } from 'react-icons/fi';
import Header from '@/components/Header';
import RichTextEditor from '@/components/RichTextEditor';
import ShareDialog from '@/components/ShareDialog';
import { usePhotoContext } from '@/context/PhotoContext';

export default function EditLogPage() {
  const router = useRouter();
  const toast = useToast();
  const { groups, aiGeneratedText, setEditedText } = usePhotoContext();

  const [content, setContent] = useState(aiGeneratedText || '');
  const [isSaving, setIsSaving] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);

  const { isOpen, onOpen, onClose } = useDisclosure();

  // Redirect if no AI text is available
  useEffect(() => {
    if (!aiGeneratedText) {
      router.push('/ai-generation');
    }
  }, [aiGeneratedText, router]);

  // Handle content changes from editor
  const handleContentChange = (newContent: string) => {
    setContent(newContent);
  };

  // Handle save
  const handleSave = async () => {
    if (!content.trim()) {
      toast({
        title: 'Cannot save empty content',
        description: 'Please add some text to your travel log',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    setIsSaving(true);

    try {
      // In a real app, we would save to the database here
      // const response = await fetch('/api/logs', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     groupId: groups[0]?.id, // Use the first group ID as the main ID
      //     aiGeneratedText,
      //     editedText: content
      //   }),
      // });

      // if (!response.ok) throw new Error('Failed to save');

      // Save to context for now (simulating database save)
      setEditedText(content);

      // Show success
      toast({
        title: 'Travel log saved',
        description: 'Your travel log has been saved successfully',
        status: 'success',
        duration: 3000,
      });

      // Generate a mock share URL for demonstration
      const mockShareId = `${Math.random().toString(36).substring(2, 9)}`;
      setShareUrl(`${window.location.origin}/share/${mockShareId}`);

    } catch (error) {
      toast({
        title: 'Save failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle share button click
  const handleShare = async () => {
    // If we already have a share URL, just open the dialog
    if (shareUrl) {
      onOpen();
      return;
    }

    setIsSharing(true);

    try {
      // In a real app, this is where we'd call our API
      // Get the first group location as the title
      const title = groups[0]?.location 
        ? `My Trip to ${groups[0].location}` 
        : "My Travel Log";
      
      // Try to get the first photo URL as the preview image
      const imageUrl = groups.length > 0 && groups[0].photos.length > 0 
        ? groups[0].photos[0].fileUrl 
        : null;
        
      // Create a brief description from the edited text
      const description = content
        .split('\n')
        .find(line => line.trim() && !line.startsWith('#'))
        ?.slice(0, 160) || "Check out my travel log!";
      
      // Call the API to generate a share link
      const response = await fetch('/api/shareTrip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tripId: 'mock-trip-id', // In a real app, this would be the actual trip ID
          title,
          imageUrl,
          description
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create share link');
      }
      
      const data = await response.json();
      setShareUrl(data.shareLink);
      
      // Show success
      toast({
        title: 'Share link created',
        description: 'Your travel log can now be shared with others',
        status: 'success',
        duration: 3000,
      });
      
      // Open the share dialog
      onOpen();
      
    } catch (error) {
      console.error('Share error:', error);
      toast({
        title: 'Failed to generate share link',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsSharing(false);
    }
  };

  // If redirecting due to no content, show minimal loading UI
  if (!aiGeneratedText) {
    return (
      <>
        <Header />
        <Container maxW="container.md" py={8} centerContent>
          <Text>Loading content...</Text>
        </Container>
      </>
    );
  }

  return (
    <>
      <Header />
      <Container maxW="container.md" py={8}>
        <VStack spacing={8} align="stretch">
          <Box>
            <Heading as="h1" size="xl" mb={2}>Edit Your Travel Log</Heading>
            <Text color="gray.600">
              Personalize the AI-generated travel log to reflect your unique experience.
            </Text>
          </Box>

          <Box>
            <Alert status="info" mb={4} borderRadius="md">
              <AlertIcon />
              <AlertDescription>
                You can use Markdown formatting: **bold**, *italic*, ## Headings, and links: [text](url)
              </AlertDescription>
            </Alert>

            <RichTextEditor
              initialValue={content}
              onChange={handleContentChange}
              minHeight="500px"
            />
          </Box>

          <HStack justifyContent="center" spacing={4}>
            <Button
              colorScheme="teal"
              size="lg"
              onClick={handleSave}
              isLoading={isSaving}
              loadingText="Saving..."
            >
              Save Log
            </Button>
            
            <Button
              colorScheme="blue"
              size="lg"
              onClick={handleShare}
              isDisabled={!content.trim() || isSaving}
              isLoading={isSharing}
              loadingText="Creating link..."
              leftIcon={<Icon as={FiShare2} />}
            >
              Share
            </Button>
          </HStack>
        </VStack>
      </Container>

      {/* Share Dialog */}
      {shareUrl && (
        <ShareDialog
          isOpen={isOpen}
          onClose={onClose}
          shareUrl={shareUrl}
          title={groups[0]?.location ? `My Trip to ${groups[0].location}` : "My Travel Log"}
        />
      )}
    </>
  );
}
