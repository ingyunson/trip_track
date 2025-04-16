// src/components/GroupInfoCard.tsx
'use client';

import React, { useState } from 'react';
import {
  Box,
  Flex,
  Text,
  Image,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  FormErrorMessage,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Heading,
  HStack,
  Icon,
  Collapse,
  useDisclosure,
  Button,
} from '@chakra-ui/react';
import { FiChevronDown, FiChevronUp, FiMapPin, FiCalendar, FiClock, FiImage } from 'react-icons/fi';
import { PhotoGroup } from '@/lib/groupingAlgorithm';
import { formatDateRange, formatTimeRange } from '@/utils/dateUtils';

interface GroupInfoCardProps {
  group: PhotoGroup;
  index: number;
  onChange: (groupId: string, updates: Partial<PhotoGroup>) => void;
  hasError: boolean;
}

const GroupInfoCard: React.FC<GroupInfoCardProps> = ({ group, index, onChange, hasError }) => {
  const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: false });

  const handleInputChange = (field: string, value: string | number) => {
    onChange(group.id, { [field]: value });
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

          <FormControl mt={4}>
            <FormLabel htmlFor={`rating-${group.id}`}>Rating (optional)</FormLabel>
            <NumberInput
              id={`rating-${group.id}`}
              min={1}
              max={5}
              defaultValue={group.rating || 0}
              onChange={(_, valueAsNumber) => handleInputChange('rating', valueAsNumber)}
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
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

          {/* Preview photos button */}
          <Button
            mt={4}
            size="sm"
            leftIcon={<Icon as={FiImage} />}
            variant="outline"
            colorScheme="teal"
            onClick={(e) => {
              e.stopPropagation();
              // Could open a modal with all photos
            }}
          >
            View All Photos ({group.photos.length})
          </Button>
        </Box>
      </Collapse>
    </Box>
  );
};

export default GroupInfoCard;
