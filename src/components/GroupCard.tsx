// src/components/GroupCard.tsx
'use client';

import React from 'react';
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
} from '@chakra-ui/react';
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

      {/* Preview Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Group {index + 1} Photos</ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <SimpleGrid columns={{ base: 2, md: 3 }} spacing={4}>
              {group.photos.map((photo) => (
                <Box
                  key={photo.id}
                  borderRadius="md"
                  overflow="hidden"
                  height="120px"
                >
                  {photo.fileUrl ? (
                    <Image
                      src={photo.fileUrl}
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
              ))}
            </SimpleGrid>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default GroupCard;
