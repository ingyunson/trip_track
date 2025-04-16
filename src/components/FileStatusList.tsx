// src/components/FileStatusList.tsx
'use client';

import React from 'react';
import {
  Box,
  List,
  ListItem,
  Flex,
  Text,
  Icon,
  Badge,
  Image,
  CloseButton,
  Tooltip
} from '@chakra-ui/react';
import { FiClock } from 'react-icons/fi'; // Removed FiCheck
import { PhotoMetadata } from '../context/PhotoContext';

interface FileStatusListProps {
  photos: PhotoMetadata[];
  onRemovePhoto: (id: string) => void;
}

const FileStatusList: React.FC<FileStatusListProps> = ({ photos, onRemovePhoto }) => {
  if (photos.length === 0) {
    return null;
  }

  return (
    <Box mt={6} borderWidth="1px" borderRadius="lg" overflow="hidden">
      <List spacing={0} maxH="400px" overflowY="auto">
        {photos.map((photo) => (
          <ListItem
            key={photo.id}
            borderBottomWidth={photos.indexOf(photo) === photos.length - 1 ? "0" : "1px"}
            p={4}
          >
            <Flex alignItems="center">
              <Box flexShrink={0} mr={4} width="40px" height="40px" borderRadius="md" overflow="hidden">
                {photo.fileUrl && (
                  <Image
                    src={photo.fileUrl}
                    alt={photo.fileName}
                    width="100%"
                    height="100%"
                    objectFit="cover"
                  />
                )}
              </Box>

              <Box flex="1">
                <Flex justify="space-between" align="center">
                  <Text fontSize="sm" fontWeight="medium" noOfLines={1}>{photo.fileName}</Text>

                  {!photo.processed ? (
                    <Flex align="center">
                      <Icon as={FiClock} color="blue.500" mr={1} />
                      <Text fontSize="xs" color="blue.500">Processing...</Text>
                    </Flex>
                  ) : photo.processingError ? (
                    <Tooltip label={photo.processingError}>
                      <Badge colorScheme="red">Error</Badge>
                    </Tooltip>
                  ) : (
                    <Flex>
                      {photo.timeStamp && (
                        <Badge colorScheme="green" mr={1}>Time</Badge>
                      )}
                      {photo.latitude && photo.longitude && (
                        <Badge colorScheme="blue">Location</Badge>
                      )}
                      {!photo.timeStamp && !photo.latitude && (
                        <Badge colorScheme="yellow">No EXIF</Badge>
                      )} 
                    </Flex>
                  )}
                </Flex>
              </Box>

              <CloseButton
                size="sm"
                ml={2}
                onClick={() => onRemovePhoto(photo.id)}
              />
            </Flex>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default FileStatusList;
