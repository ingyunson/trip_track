// src/components/FileUploadArea.tsx
'use client';

import React, { useCallback, useState } from 'react';
import { Box, Text, Icon, Center, VStack } from '@chakra-ui/react';
import { FiUploadCloud } from 'react-icons/fi';

interface FileUploadAreaProps {
  onFilesSelected: (files: File[]) => void;
  isProcessing: boolean;
}

const FileUploadArea: React.FC<FileUploadAreaProps> = ({ onFilesSelected, isProcessing }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (isProcessing) return;

    const files = Array.from(e.dataTransfer.files);
    onFilesSelected(files);
  }, [onFilesSelected, isProcessing]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && !isProcessing) {
      const files = Array.from(e.target.files);
      onFilesSelected(files);
      e.target.value = ''; // Reset input
    }
  }, [onFilesSelected, isProcessing]);

  return (
    <Box
      borderWidth="2px"
      borderRadius="lg"
      borderStyle="dashed"
      borderColor={isDragging ? "teal.400" : "gray.300"}
      bg={isDragging ? "teal.50" : "gray.50"}
      p={10}
      textAlign="center"
      transition="all 0.2s"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      position="relative"
      cursor={isProcessing ? "not-allowed" : "pointer"}
      opacity={isProcessing ? 0.6 : 1}
    >
      <input
        type="file"
        multiple
        accept="image/jpeg,image/jpg,image/png,image/heic"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          opacity: 0,
          width: '100%',
          cursor: isProcessing ? "not-allowed" : "pointer",
        }}
        onChange={handleFileSelect}
        disabled={isProcessing}
      />

      <Center>
        <VStack spacing = {3}>
          <Icon as={FiUploadCloud} boxSize={12} color="teal.500" />
          <Text fontSize="xl" fontWeight="medium">
            {isProcessing ? 'Processing...' : 'Drag photos here or click to browse'}
          </Text>
          <Text color="gray.500" fontSize="sm">
            Supports JPG, PNG, and HEIC files (max 10MB)
          </Text>
        </VStack>
      </Center>
    </Box>
  );
};

export default FileUploadArea;
