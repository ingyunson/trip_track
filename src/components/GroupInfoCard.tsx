// src/components/GroupInfoCard.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  Box, Flex, Text, Image, FormControl, FormLabel, Input,
  Textarea, FormErrorMessage, Heading, HStack, Icon,
  Collapse, useDisclosure, Button,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody,
  ModalCloseButton, SimpleGrid, ModalFooter
} from '@chakra-ui/react';
import { FiChevronDown, FiChevronUp, FiMapPin, FiCalendar, FiClock, FiImage } from 'react-icons/fi';
import { PhotoGroup } from '@/lib/groupingAlgorithm';
import { formatDateRange, formatTimeRange } from '@/utils/dateUtils';
import StarRating from './StarRating';

interface GroupInfoCardProps {
  group: PhotoGroup;
  index: number;
  onChange: (groupId: string, updates: Partial<PhotoGroup>) => void;
  hasError: boolean;
}

const GroupInfoCard: React.FC<GroupInfoCardProps> = ({ group, index, onChange, hasError }) => {
  const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: false });
  
  // New state for photo gallery modal
  const { isOpen: isGalleryOpen, onOpen: openGallery, onClose: closeGallery } = useDisclosure();
  
  // State to manage blob URLs for photos
  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({});
  
  // Create blob URLs when gallery opens
  useEffect(() => {
    if (isGalleryOpen && group.photos.length > 0) {
      const urls: Record<string, string> = {};
      
      group.photos.forEach(photo => {
        if (photo.file) {
          urls[photo.id] = URL.createObjectURL(photo.file);
        }
      });
      
      setPhotoUrls(urls);
      
      // Clean up URLs when gallery closes
      return () => {
        Object.values(urls).forEach(url => URL.revokeObjectURL(url));
      };
    }
  }, [isGalleryOpen, group.photos]);

  const handleInputChange = (field: string, value: string | number) => {
    onChange(group.id, { [field]: value });
  };

  // Handle star rating change
  const handleRatingChange = (newRating: number) => {
    onChange(group.id, { rating: newRating || null });
  };

  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      borderColor={hasError ? "red.300" : "gray.200"}
      bg="white"
      boxShadow="sm"
    >
      {/* Header - Always visible */}
      <Flex
        p={4}
        alignItems="center"
        cursor="pointer"
        onClick={onToggle}
        bg={hasError ? "red.50" : ""}
      >
        {/* Cover image thumbnail */}
        <Box
          width="80px"
          height="80px"
          borderRadius="md"
          overflow="hidden"
          mr={4}
          flexShrink={0}
        >
          {group.coverPhoto?.fileUrl ? (
            <Image
              src={group.coverPhoto.fileUrl}
              alt={`Group ${index + 1}`}
              width="100%"
              height="100%"
              objectFit="cover"
            />
          ) : (
            <Flex
              bg="gray.100"
              height="100%"
              alignItems="center"
              justifyContent="center"
            >
              <Icon as={FiImage} color="gray.400" boxSize={5} />
            </Flex>
          )}
        </Box>

        <Box flex="1">
          <Flex justifyContent="space-between" alignItems="center">
            <Heading size="md" mb={1}>Group {index + 1}</Heading>
            <Icon
              as={isOpen ? FiChevronUp : FiChevronDown}
              boxSize={5}
              color="gray.500"
            />
          </Flex>

          <HStack fontSize="sm" color="gray.600" spacing={4}>
            <Flex alignItems="center">
              <Icon as={FiCalendar} mr={1} />
              <Text>{formatDateRange(group.startTime, group.endTime)}</Text>
            </Flex>

            <Flex alignItems="center">
              <Icon as={FiClock} mr={1} />
              <Text>{formatTimeRange(group.startTime, group.endTime)}</Text>
            </Flex>

            <Flex alignItems="center">
              <Icon as={FiImage} mr={1} />
              <Text>{group.photos.length} photo{group.photos.length !== 1 ? 's' : ''}</Text>
            </Flex>
          </HStack>

          {group.location && (
            <Flex alignItems="center" mt={1} color="teal.500">
              <Icon as={FiMapPin} mr={1} />
              <Text fontWeight="medium">{group.location}</Text>
            </Flex>
          )}

          {group.rating && (
            <Flex alignItems="center" mt={1} color="yellow.400">
              <StarRating 
                rating={group.rating} 
                onChange={() => {}} // Read-only in header
                size="14px"
              />
              <Text ml={1} fontSize="sm">{group.rating}/5</Text>
            </Flex>
          )}

          {hasError && (
            <Text color="red.500" fontSize="sm" mt={1}>
              Please enter a place name
            </Text>
          )}
        </Box>
      </Flex>

      {/* Expandable form section */}
      <Collapse in={isOpen} animateOpacity>
        <Box p={4} pt={0} borderTopWidth="1px" borderColor="gray.100">
          <FormControl isRequired isInvalid={hasError} mt={4}>
            <FormLabel htmlFor={`location-${group.id}`}>Place Name</FormLabel>
            <Input
              id={`location-${group.id}`}
              placeholder="e.g. Eiffel Tower, Louvre Museum"
              value={group.location || ''}
              onChange={(e) => handleInputChange('location', e.target.value)}
            />
            <FormErrorMessage>Place name is required</FormErrorMessage>
          </FormControl>

          {/* Replace NumberInput with StarRating */}
          <FormControl mt={4}>
            <FormLabel htmlFor={`rating-${group.id}`}>Rating (optional)</FormLabel>
            <StarRating 
              rating={group.rating} 
              onChange={handleRatingChange}
            />
          </FormControl>

          <FormControl mt={4}>
            <FormLabel htmlFor={`review-${group.id}`}>Review (optional)</FormLabel>
            <Textarea
              id={`review-${group.id}`}
              placeholder="Add your thoughts about this place..."
              rows={3}
              value={group.review || ''}
              onChange={(e) => handleInputChange('review', e.target.value)}
            />
          </FormControl>

          {/* Update the button to open the gallery */}
          <Button
            mt={4}
            size="sm"
            leftIcon={<Icon as={FiImage} />}
            variant="outline"
            colorScheme="teal"
            onClick={(e) => {
              e.stopPropagation();
              openGallery();
            }}
          >
            View All Photos ({group.photos.length})
          </Button>
        </Box>
      </Collapse>
      
      {/* Add photo gallery modal */}
      <Modal isOpen={isGalleryOpen} onClose={closeGallery} size="xl" scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent maxW="900px">
          <ModalHeader>
            {group.location || `Group ${index + 1}`} - All Photos
            <Text fontSize="sm" color="gray.600" mt={1}>
              {group.photos.length} photos
            </Text>
          </ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
              {group.photos.map((photo) => (
                <Box
                  key={photo.id}
                  borderWidth="1px"
                  borderRadius="md"
                  overflow="hidden"
                  boxShadow="sm"
                >
                  {/* Photo */}
                  <Box height="200px" overflow="hidden">
                    {photoUrls[photo.id] ? (
                      <Image
                        src={photoUrls[photo.id]}
                        alt={photo.fileName}
                        width="100%"
                        height="100%"
                        objectFit="cover"
                      />
                    ) : (
                      <Flex bg="gray.100" height="100%" alignItems="center" justifyContent="center">
                        <Text color="gray.400">Loading...</Text>
                      </Flex>
                    )}
                  </Box>
                  
                  {/* Photo metadata */}
                  <Box p={2}>
                    <Text fontSize="sm" noOfLines={1} fontWeight="medium">
                      {photo.fileName}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {photo.timeStamp?.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Text>
                  </Box>
                </Box>
              ))}
            </SimpleGrid>
          </ModalBody>
          
          <ModalFooter>
            <Button colorScheme="blue" onClick={closeGallery}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default GroupInfoCard;
