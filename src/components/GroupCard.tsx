// src/components/GroupCard.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Text,
  Badge,
  Image,
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  SimpleGrid,
  Divider,
  Tooltip,
  HStack,
  Icon,
  VStack,
} from '@chakra-ui/react';
import { FiClock, FiMapPin, FiInfo } from 'react-icons/fi';
import { PhotoGroup } from '@/lib/groupingAlgorithm';

interface GroupCardProps {
  group: PhotoGroup;
  index: number;
  onSplitGroup: (groupId: string) => void;
  onSelectGroupForMerge: (groupId: string) => void;
  isSelected: boolean;
}

const GroupCard: React.FC<GroupCardProps> = ({
  group,
  index,
  onSplitGroup,
  onSelectGroupForMerge,
  isSelected
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [coverPhotoUrl, setCoverPhotoUrl] = useState<string | null>(null);
  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    if (group.coverPhoto?.file) {
      const newCoverPhotoUrl = URL.createObjectURL(group.coverPhoto.file);
      setCoverPhotoUrl(newCoverPhotoUrl);
      
      const newPhotoUrls: Record<string, string> = {};
      group.photos.forEach(photo => {
        if (photo.file) {
          newPhotoUrls[photo.id] = URL.createObjectURL(photo.file);
        }
      });
      setPhotoUrls(newPhotoUrls);
      
      return () => {
        URL.revokeObjectURL(newCoverPhotoUrl);
        Object.values(newPhotoUrls).forEach(url => URL.revokeObjectURL(url));
      };
    }
  }, [group.coverPhoto, group.photos]);

  // Format coordinates for display
  const formatCoordinates = (lat: number | null, lng: number | null) => {
    if (lat === null || lng === null) return "No coordinates";
    
    // Format to 6 decimal places (roughly meter precision)
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  };

  // Format time for display
  const formatTime = (timestamp: Date | null) => {
    if (!timestamp) return "No timestamp";
    return timestamp.toLocaleString([], {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format time range for display
  const formatTimeRange = () => {
    if (!group.startTime) return 'Unknown time';

    const startTime = group.startTime.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });

    if (!group.endTime || group.startTime === group.endTime) {
      return startTime;
    }

    const endTime = group.endTime.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });

    return `${startTime} - ${endTime}`;
  };

  // Format date for display
  const formatDate = () => {
    if (!group.startTime) return 'Unknown date';

    return group.startTime.toLocaleDateString([], {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <>
      <Box
        borderWidth={isSelected ? '2px' : '1px'}
        borderColor={isSelected ? 'teal.500' : 'gray.200'}
        borderRadius="lg"
        overflow="hidden"
        bg="white"
        transition="all 0.2s"
        _hover={{ transform: 'translateY(-2px)', boxShadow: 'md' }}
      >
        {/* Cover Image */}
        <Box
          height="160px"
          overflow="hidden"
          position="relative"
          cursor="pointer"
          onClick={onOpen}
        >
          {coverPhotoUrl ? ( // Use coverPhotoUrl instead of group.coverPhoto.fileUrl
            <Image
              src={coverPhotoUrl}
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
              <Text color="gray.400">No Image</Text>
            </Flex>
          )}

          <Badge
            position="absolute"
            top="2"
            right="2"
            colorScheme="teal"
          >
            {group.photos.length} photo{group.photos.length !== 1 ? 's' : ''}
          </Badge>
        </Box>

        {/* Group Info */}
        <Box p={4}>
          <Text fontWeight="bold" fontSize="md" mb={1}>
            Group {index + 1}
          </Text>

          <Flex fontSize="sm" color="gray.600" mb={2}>
            <Text mr={2}>{formatDate()}</Text>
            <Text>{formatTimeRange()}</Text>
          </Flex>

          {/* Action Buttons */}
          <Flex mt={3} justifyContent="space-between">
            <Button
              size="sm"
              colorScheme="red"
              variant="outline"
              onClick={() => onSplitGroup(group.id)}
            >
              Split
            </Button>

            <Button
              size="sm"
              colorScheme={isSelected ? "teal" : "gray"}
              variant={isSelected ? "solid" : "outline"}
              onClick={() => onSelectGroupForMerge(group.id)}
            >
              {isSelected ? "Selected" : "Select to Merge"}
            </Button>
          </Flex>
        </Box>
      </Box>

      {/* Enhanced Preview Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent maxW="900px">
          <ModalHeader>
            Group {index + 1} Photos
            <Text fontSize="sm" color="gray.600" mt={1}>
              {group.photos.length} photos • {formatDate()}
            </Text>
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
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
                        <Text color="gray.400">No Image</Text>
                      </Flex>
                    )}
                  </Box>
                  
                  {/* Metadata */}
                  <Box p={3}>
                    <Tooltip label={photo.fileName} placement="top">
                      <Text fontWeight="medium" isTruncated>
                        {photo.fileName}
                      </Text>
                    </Tooltip>
                    
                    <Divider my={2} />
                    
                    <VStack align="start" spacing={1}>
                      <HStack fontSize="sm">
                        <Icon as={FiClock} color="gray.500" />
                        <Text>{formatTime(photo.timeStamp)}</Text>
                      </HStack>
                      
                      <HStack fontSize="sm">
                        <Icon as={FiMapPin} color="gray.500" />
                        <Text>{formatCoordinates(photo.latitude, photo.longitude)}</Text>
                      </HStack>
                      
                      {photo.processingError && (
                        <HStack fontSize="sm" color="red.500">
                          <Icon as={FiInfo} />
                          <Text>Processing error</Text>
                        </HStack>
                      )}
                    </VStack>
                  </Box>
                </Box>
              ))}
            </SimpleGrid>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default GroupCard;
