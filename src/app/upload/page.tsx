// src/app/upload/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  VStack,
  Heading,
  Button,
  Box,
  useToast,
  Text
} from '@chakra-ui/react';
import Header from '../../components/Header';
import FileUploadArea from '../../components/FileUploadArea';
import FileStatusList from '../../components/FileStatusList';
import { usePhotoContext, PhotoMetadata } from '../../context/PhotoContext';
import { extractExifData, isValidFileType, isValidFileSize } from '../../utils/exifUtils';

const UploadPage = () => {
  const router = useRouter();
  const toast = useToast();
  const { photos, addPhotos, updatePhoto, removePhoto, clearPhotos } = usePhotoContext();
  const [isProcessing, setIsProcessing] = useState(false);
  const [allProcessed, setAllProcessed] = useState(true);

  // Reset photos when page loads
  useEffect(() => {
    clearPhotos();
  }, [clearPhotos]);

  // Update allProcessed state when photos change
  useEffect(() => {
    const stillProcessing = photos.some(photo => !photo.processed);
    setAllProcessed(!stillProcessing);
  }, [photos]);

  const handleFilesSelected = async (files: File[]) => {
    setIsProcessing(true);

    // Process files in batches to avoid overloading browser
    for (const file of files) {
      try {
        // Validate file type
        if (!isValidFileType(file)) {
          toast({
            title: "Unsupported file type",
            description: `${file.name} is not a supported image format. Please use JPG, PNG, or HEIC.`,
            status: "error",
            duration: 5000,
            isClosable: true,
          });
          continue;
        }

        // Validate file size
        if (!isValidFileSize(file)) {
          toast({
            title: "File too large",
            description: `${file.name} exceeds the 10MB size limit.`,
            status: "error",
            duration: 5000,
            isClosable: true,
          });
          continue;
        }

        // Create object URL for preview
        const fileUrl = URL.createObjectURL(file);

        // Add file to state with temporary ID
        const tempId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

        const newPhoto: PhotoMetadata = {
          id: tempId,
          file,
          fileName: file.name,
          fileUrl,
          timeStamp: null,
          latitude: null,
          longitude: null,
          processed: false,
          processingError: null
        };

        addPhotos([newPhoto]);

        // Extract EXIF data
        try {
          const exifData = await extractExifData(file);

          // Update the photo with EXIF data
          updatePhoto(tempId, {
            timeStamp: exifData.timestamp,
            latitude: exifData.latitude,
            longitude: exifData.longitude,
            processed: true
          });
        } catch (error) {
          console.error("EXIF extraction error:", error);
          updatePhoto(tempId, {
            processed: true,
            processingError: "Failed to read EXIF data"
          });
        }
      } catch (error) {
        console.error("File processing error:", error);
        toast({
          title: "Error processing file",
          description: error instanceof Error ? error.message : "An unknown error occurred",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    }

    setIsProcessing(false);
  };

  const handleNext = () => {
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

    if (!allProcessed) {
      toast({
        title: "Processing in progress",
        description: "Please wait until all photos are processed.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Navigate to the next page
    router.push('/grouping');
  };

  return (
    <>
      <Header />
      <Container maxW="container.md" py={8}>
        <VStack spacing={8} align="stretch">
          <Heading as="h1" size="xl">Upload Your Travel Photos</Heading>

          <Text>
            Upload your travel photos to get started. We&apos;ll automatically extract location and time information
            to help organize your trip.
          </Text>

          <FileUploadArea
            onFilesSelected={handleFilesSelected}
            isProcessing={isProcessing}
          />

          <FileStatusList
            photos={photos}
            onRemovePhoto={removePhoto}
          />

          {photos.length > 0 && (
            <Box textAlign="center">
              <Button
                colorScheme="teal"
                size="lg"
                onClick={handleNext}
                isDisabled={!allProcessed || photos.length === 0}
              >
                Next: Group Photos
              </Button>
            </Box>
          )}
        </VStack>
      </Container>
    </>
  );
};

export default UploadPage;
