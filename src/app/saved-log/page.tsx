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
  Icon,
  Flex,
  SimpleGrid,
  Image,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  IconButton,
} from '@chakra-ui/react';
import { FiShare2, FiClock, FiMapPin, FiImage, FiCalendar, FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import { FaStar } from 'react-icons/fa';
import Header from '@/components/Header';
import ShareDialog from '@/components/ShareDialog';
import { usePhotoContext } from '@/context/PhotoContext';

export default function SavedLogPage() {
  const router = useRouter();
  const toast = useToast();
  const { groups, editedText } = usePhotoContext();
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [sortedGroups, setSortedGroups] = useState([...groups]);

  // State for photo viewer modal
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null);
  const [selectedGroupIndex, setSelectedGroupIndex] = useState<number | null>(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState<number>(0);
  const { isOpen: isShareOpen, onOpen: onShareOpen, onClose: onShareClose } = useDisclosure();
  const { isOpen: isPhotoOpen, onOpen: onPhotoOpen, onClose: onPhotoClose } = useDisclosure();

  // Redirect if no saved text is available
  useEffect(() => {
    if (!editedText || editedText.trim() === '') {
      router.push('/group-info');
      return;
    }
  }, [editedText, router]);

  useEffect(() => {
    const sorted = [...groups].sort((a, b) => {
      const timeA = a.startTime?.getTime() || 0;
      const timeB = b.startTime?.getTime() || 0;
      return timeA - timeB;
    });
    setSortedGroups(sorted);
  }, [groups]);

  // Handle share button click
  const handleShare = async () => {
    // If we already have a share URL, just open the dialog
    if (shareUrl) {
      onShareOpen();
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
      const description = editedText
        .split('\n')
        .find(line => line.trim() && !line.startsWith('#'))
        ?.slice(0, 160) || "Check out my travel log!";
      
      // Mock API call for share link
      setTimeout(() => {
        // Generate a mock share URL for demonstration
        const mockShareId = `${Math.random().toString(36).substring(2, 9)}`;
        const mockShareUrl = `${window.location.origin}/share/${mockShareId}`;
        setShareUrl(mockShareUrl);
        
        // Show success
        toast({
          title: 'Share link created',
          description: 'Your travel log can now be shared with others',
          status: 'success',
          duration: 3000,
        });
        
        // Open the share dialog
        onShareOpen();
        setIsSharing(false);
      }, 1000);
      
    } catch (error) {
      console.error('Share error:', error);
      toast({
        title: 'Failed to generate share link',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        status: 'error',
        duration: 5000,
      });
      setIsSharing(false);
    }
  };

  // Handle photo click
  const handlePhotoClick = (groupIndex, photoIndex) => {
    setSelectedGroupIndex(groupIndex);
    setCurrentPhotoIndex(photoIndex);
    setSelectedPhoto(sortedGroups[groupIndex].photos[photoIndex]);
    onPhotoOpen();
  };

  // Navigate to next photo
  const handleNextPhoto = () => {
    if (selectedGroupIndex === null) return;
    
    const groupPhotos = sortedGroups[selectedGroupIndex].photos;
    const nextIndex = (currentPhotoIndex + 1) % groupPhotos.length;
    
    setCurrentPhotoIndex(nextIndex);
    setSelectedPhoto(groupPhotos[nextIndex]);
  };

  // Navigate to previous photo
  const handlePrevPhoto = () => {
    if (selectedGroupIndex === null) return;
    
    const groupPhotos = sortedGroups[selectedGroupIndex].photos;
    const prevIndex = (currentPhotoIndex - 1 + groupPhotos.length) % groupPhotos.length;
    
    setCurrentPhotoIndex(prevIndex);
    setSelectedPhoto(groupPhotos[prevIndex]);
  };

  // If redirecting due to no content, show minimal loading UI
  if (!editedText) {
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
            <Heading as="h1" size="xl" mb={2}>Your Saved Travel Log</Heading>
            <Text color="gray.600">
              Your travel log has been saved successfully. You can share it with others.
            </Text>
          </Box>

          <Box mt={6}>
            <Heading as="h2" size="md" mb={4}>Trip Details</Heading>
            <Accordion allowMultiple defaultIndex={[0]}>
              {sortedGroups.map((group, groupIndex) => (
                <AccordionItem
                  key={group.id}
                  borderWidth="1px"
                  borderRadius="md"
                  mb={4}
                  bg="white"
                  boxShadow="sm"
                  overflow="hidden"
                >
                  <AccordionButton py={4} _hover={{ bg: 'gray.50' }}>
                    <Flex width="100%" align="center">
                      {group.photos[0]?.fileUrl && (
                        <Box
                          width="60px"
                          height="60px"
                          borderRadius="md"
                          overflow="hidden"
                          mr={4}
                          flexShrink={0}
                        >
                          <Image
                            src={group.photos[0].fileUrl}
                            alt={group.location}
                            width="100%"
                            height="100%"
                            objectFit="cover"
                          />
                        </Box>
                      )}
                      <Box flex="1" textAlign="left">
                        <Heading size="sm">{group.location || `Location ${groupIndex + 1}`}</Heading>
                        <HStack fontSize="sm" color="gray.600" spacing={4} mt={1}>
                          <Flex alignItems="center">
                            <Icon as={FiCalendar} mr={1} />
                            <Text>{group.startTime?.toLocaleDateString()} - {group.endTime?.toLocaleDateString()}</Text>
                          </Flex>
                          <Flex alignItems="center">
                            <Icon as={FiImage} mr={1} />
                            <Text>{group.photos.length} photo{group.photos.length !== 1 ? 's' : ''}</Text>
                          </Flex>
                        </HStack>
                        {group.rating && (
                          <Flex mt={1} align="center">
                            {[...Array(5)].map((_, i) => (
                              <Icon
                                key={i}
                                as={FaStar}
                                color={i < group.rating ? "yellow.400" : "gray.300"}
                                boxSize={3}
                                mr={0.5}
                              />
                            ))}
                          </Flex>
                        )}
                      </Box>
                      <AccordionIcon />
                    </Flex>
                  </AccordionButton>
                  <AccordionPanel pb={4}>
                    <VStack align="stretch" spacing={4}>
                      <Box>
                        <Text fontSize="sm" fontWeight="medium" mb={1}>Time</Text>
                        <Flex align="center" color="gray.700">
                          <Icon as={FiClock} mr={2} />
                          <Text>{group.startTime?.toLocaleTimeString()} - {group.endTime?.toLocaleTimeString()}</Text>
                        </Flex>
                      </Box>
                      <Box>
                        <Text fontSize="sm" fontWeight="medium" mb={2}>Photos ({group.photos.length})</Text>
                        <SimpleGrid columns={[2, 3, 4]} spacing={2}>
                          {group.photos.map((photo, photoIndex) => (
                            <Box
                              key={photoIndex}
                              height="80px"
                              borderRadius="md"
                              overflow="hidden"
                              cursor="pointer"
                              onClick={() => handlePhotoClick(groupIndex, photoIndex)}
                            >
                              <Image
                                src={photo.fileUrl}
                                alt={`Photo ${photoIndex + 1}`}
                                width="100%"
                                height="100%"
                                objectFit="cover"
                              />
                            </Box>
                          ))}
                        </SimpleGrid>
                      </Box>
                      {group.review && (
                        <Box>
                          <Text fontSize="sm" fontWeight="medium" mb={1}>Notes</Text>
                          <Text bg="gray.50" p={3} borderRadius="md">{group.review}</Text>
                        </Box>
                      )}
                    </VStack>
                  </AccordionPanel>
                </AccordionItem>
              ))}
            </Accordion>
          </Box>

          <HStack justifyContent="center" spacing={4}>
            <Button
              colorScheme="blue"
              size="lg"
              onClick={handleShare}
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
          isOpen={isShareOpen}
          onClose={onShareClose}
          shareUrl={shareUrl}
          title={groups[0]?.location ? `My Trip to ${groups[0].location}` : "My Travel Log"}
        />
      )}

      {/* Photo Viewer Modal */}
      <Modal isOpen={isPhotoOpen} onClose={onPhotoClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedGroupIndex !== null && sortedGroups[selectedGroupIndex]?.location || 'Photo View'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedPhoto && (
              <VStack spacing={4}>
                <Box position="relative" width="100%">
                  <Image 
                    src={selectedPhoto.fileUrl} 
                    alt="Selected photo" 
                    width="100%" 
                    borderRadius="md"
                  />
                  
                  {/* Navigation buttons */}
                  {selectedGroupIndex !== null && sortedGroups[selectedGroupIndex]?.photos.length > 1 && (
                    <>
                      <IconButton
                        aria-label="Previous photo"
                        icon={<FiArrowLeft />}
                        position="absolute"
                        left={2}
                        top="50%"
                        transform="translateY(-50%)"
                        colorScheme="blackAlpha"
                        onClick={handlePrevPhoto}
                      />
                      <IconButton
                        aria-label="Next photo"
                        icon={<FiArrowRight />}
                        position="absolute"
                        right={2}
                        top="50%"
                        transform="translateY(-50%)"
                        colorScheme="blackAlpha"
                        onClick={handleNextPhoto}
                      />
                    </>
                  )}
                </Box>

                {/* Photo Information */}
                <Box width="100%" bg="gray.50" p={4} borderRadius="md">
                  <VStack align="start" spacing={2}>
                    <Flex align="center">
                      <Icon as={FiClock} mr={2} />
                      <Text>
                        {selectedPhoto.timestamp ? new Date(selectedPhoto.timestamp).toLocaleString() : 'Time unknown'}
                      </Text>
                    </Flex>
                    <Flex align="center">
                      <Icon as={FiMapPin} mr={2} />
                      <Text>
                        {selectedPhoto.latitude && selectedPhoto.longitude 
                          ? `${selectedPhoto.latitude.toFixed(6)}, ${selectedPhoto.longitude.toFixed(6)}` 
                          : 'Location coordinates not available'}
                      </Text>
                    </Flex>
                  </VStack>
                </Box>

                {/* Photo counter */}
                {selectedGroupIndex !== null && sortedGroups[selectedGroupIndex]?.photos.length > 1 && (
                  <Text textAlign="center" fontWeight="medium">
                    Photo {currentPhotoIndex + 1} of {sortedGroups[selectedGroupIndex].photos.length}
                  </Text>
                )}
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={onPhotoClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
