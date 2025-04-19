// src/app/upload/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import {
  Container,
  VStack,
  Heading,
  Button,
  Box,
  useToast,
  Text
} from '@chakra-ui/react';
import { nanoid } from 'nanoid';
import FileUploadArea from '../../components/FileUploadArea';
import FileStatusList from '../../components/FileStatusList';
import { usePhotoContext, PhotoMetadata } from '../../context/PhotoContext';
import { extractExifData, isValidFileType, isValidFileSize } from '../../utils/exifUtils';

// Import Header with no SSR
const Header = dynamic(() => import('../../components/Header'), { ssr: false });

const UploadPage = () => {
  const router = useRouter();
  const toast = useToast();
  const { photos, addPhotos, updatePhoto, removePhoto, clearPhotos } = usePhotoContext();
  const [isProcessing, setIsProcessing] = useState(false);
  const [allProcessed, setAllProcessed] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  // Fixed useEffect to check if photos are processed
  useEffect(() => {
    if (photos.length > 0 && !isProcessing) {
      const areAllProcessed = photos.every(photo => photo.processed);
      
      if (areAllProcessed !== allProcessed) {
        setAllProcessed(areAllProcessed);
      }
    }
  }, [photos, isProcessing, allProcessed]);

  // Add this function to your UploadPage component
  const handleFilesSelected = useCallback(async (files: File[]) => {
    setIsProcessing(true);
    
    const newPhotos = [];
    
    for (const file of files) {
      // Validate file type and size
      if (!isValidFileType(file)) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a supported image format.`,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        continue;
      }
      
      if (!isValidFileSize(file)) {
        toast({
          title: "Invalid file size",
          description: `${file.name} exceeds the maximum file size of 10MB.`,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        continue;
      }
      
      // Generate unique ID for the photo
      const id = nanoid();
      
      // Create object URL for thumbnail display
      const fileUrl = URL.createObjectURL(file);
      
      try {
        // Extract EXIF data
        const exifData = await extractExifData(file);
        
        newPhotos.push({
          id,
          file,
          fileName: file.name,
          fileSize: file.size,
          fileUrl,
          timeStamp: exifData.timestamp,
          latitude: exifData.latitude,
          longitude: exifData.longitude,
          processed: true,
          processingError: null,
          groupId: 'ungrouped'
        });
        
      } catch (error) {
        console.error(`Error processing ${file.name}:`, error);
        newPhotos.push({
          id,
          file,
          fileName: file.name,
          fileSize: file.size,
          fileUrl,
          processed: true,
          processingError: `Failed to extract metadata: ${error.message}`,
          groupId: 'ungrouped'
        });
      }
    }
    
    if (newPhotos.length > 0) {
      addPhotos(newPhotos);
    }
    
    setIsProcessing(false);
  }, [addPhotos, toast]);

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      photos.forEach(photo => {
        if (photo.fileUrl && photo.fileUrl.startsWith('blob:')) {
          URL.revokeObjectURL(photo.fileUrl);
        }
      });
    };
  }, [photos]);

  // Add this function to handle removing photos
  const handleRemovePhoto = useCallback((id: string) => {
    const photoToRemove = photos.find(p => p.id === id);
    if (photoToRemove?.fileUrl && photoToRemove.fileUrl.startsWith('blob:')) {
      URL.revokeObjectURL(photoToRemove.fileUrl);
    }
    removePhoto(id);
  }, [photos, removePhoto]);

  const handleNext = useCallback(() => {
    if (photos.length === 0) {
      toast({
        title: "No photos",
        description: "Please upload at least one photo to continue.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    router.push('/group');
  }, [photos.length, toast, router]);

  // Add or modify this function in your component
  const handleContinue = useCallback(() => {
    if (photos.length === 0) {
      toast({
        title: "No photos uploaded",
        description: "Please upload at least one photo to continue.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    // Correct route for Next.js App Router
    router.push('/group-info');
  }, [photos.length, router, toast]);

  return (
    <>
      <Header />
      <Container maxW="container.xl" pt={20} pb={10}>
        <VStack spacing={8} align="stretch">
          <Heading as="h1" size="xl" textAlign="center">
            Upload Your Travel Photos
          </Heading>
          
          <FileUploadArea 
            onFilesSelected={handleFilesSelected}
            isProcessing={isProcessing}
          />
          
          {/* Only show the FileStatusList during upload process, hide it when showing the final list */}
          {photos.length > 0 && isProcessing && (
            <FileStatusList 
              photos={photos} 
              onRemovePhoto={handleRemovePhoto} 
            />
          )}
          
          {/* When upload is complete, show Your Photos section */}
          {photos.length > 0 && !isProcessing && (
            <Box>
              <Heading as="h2" size="md" mb={4}>
                Your Photos ({photos.length})
              </Heading>
              <FileStatusList 
                photos={photos} 
                onRemovePhoto={handleRemovePhoto}
              />
              <Button 
                mt={6} 
                colorScheme="teal" 
                size="lg" 
                onClick={handleContinue}
                isDisabled={photos.length === 0}
                width="100%"
              >
                {isProcessing ? "Processing..." : "Continue"}
              </Button>
            </Box>
          )}
        </VStack>
      </Container>
    </>
  );
};

export default UploadPage;
