// src/utils/exifUtils.ts

import type { decode } from 'heic-decode';

/**
 * Check if the file type is valid
 */
export const isValidFileType = (file: File): boolean => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/heic'];
  return validTypes.includes(file.type);
};

/**
 * Check if the file size is under max size (10MB)
 */
export const isValidFileSize = (file: File): boolean => {
  const maxSizeInBytes = 10 * 1024 * 1024; // 10MB
  return file.size <= maxSizeInBytes;
};

/**
 * Convert DMS (Degrees, Minutes, Seconds) coordinates to decimal format
 */
function convertDMSToDecimal(dmsArray: any): number | null {
  if (!dmsArray || !Array.isArray(dmsArray)) {
    return null;
  }

  // Handle different possible formats from EXIF data
  try {
    if (dmsArray.length === 3) {
      // Standard [degrees, minutes, seconds] format
      const [degrees, minutes, seconds] = dmsArray;
      return degrees + minutes / 60 + seconds / 3600;
    } else if (dmsArray.length === 2) {
      // Some formats provide [degrees, decimal minutes]
      const [degrees, minutes] = dmsArray;
      return degrees + minutes / 60;
    } else if (dmsArray.length === 1) {
      // Some just provide decimal degrees directly
      return dmsArray[0];
    }
  } catch (error) {
    console.error("Error converting DMS coordinates:", error);
  }
  
  return null;
}

/**
 * Extracting EXIF data from image file using exifr
 */
async function processHeicFile(file: File): Promise<File> {
  if (file.type === 'image/heic' || file.name.toLowerCase().endsWith('.heic')) {
    try {
      // Dynamically import heic-decode
      const heicDecode = await import('heic-decode');
      
      // Convert HEIC to blob
      const fileArrayBuffer = await file.arrayBuffer();
      const { width, height, data } = await heicDecode.decode({
        buffer: fileArrayBuffer
      });
      
      // Create canvas to convert to JPEG
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      
      // Create ImageData and put it on canvas
      const imageData = new ImageData(
        new Uint8ClampedArray(data),
        width,
        height
      );
      ctx?.putImageData(imageData, 0, 0);
      
      // Convert to blob with EXIF data preserved
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.95);
      });
      
      // Create new file from blob
      return new File([blob], file.name.replace(/\.heic$/i, '.jpg'), {
        type: 'image/jpeg',
        lastModified: file.lastModified
      });
    } catch (error) {
      console.error('Error converting HEIC file:', error);
    }
  }
  
  // Return original file if not HEIC or conversion failed
  return file;
}

export const extractExifData = async (file: File): Promise<{
  timestamp: Date | null;
  latitude: number | null;
  longitude: number | null;
}> => {
  // Pre-process HEIC files if needed
  const processedFile = await processHeicFile(file);

  // Dynamically import exifr to reduce initial page load size
  const exifr = await import('exifr');
  
  try {
    console.log(`Extracting EXIF data from ${processedFile.name} (${processedFile.type})`);
    
    // Parse full EXIF data first to see what's available (debug only)
    const fullExif = await exifr.default.parse(processedFile);
    console.log('Full EXIF data available:', Object.keys(fullExif || {}));
    
    // Parse GPS and date information from the image
    const exifData = await exifr.default.parse(processedFile, {
      // Only extract the tags we need to improve performance
      pick: ['GPSLatitude', 'GPSLongitude', 'GPSLatitudeRef', 'GPSLongitudeRef', 
             'DateTimeOriginal', 'CreateDate', 'ModifyDate'],
      silentErrors: true
    });
    
    console.log('EXIF GPS data found:', {
      hasLatitude: !!exifData?.GPSLatitude,
      hasLongitude: !!exifData?.GPSLongitude,
      latitudeRef: exifData?.GPSLatitudeRef,
      longitudeRef: exifData?.GPSLongitudeRef
    });
    
    // Extract and convert location data if available
    let latitude = null;
    let longitude = null;
    
    if (exifData?.GPSLatitude) {
      latitude = convertDMSToDecimal(exifData.GPSLatitude);
      // Apply S (south) reference as negative value
      if (latitude !== null && exifData.GPSLatitudeRef === 'S') {
        latitude = -latitude;
      }
    }
    
    if (exifData?.GPSLongitude) {
      longitude = convertDMSToDecimal(exifData.GPSLongitude);
      // Apply W (west) reference as negative value
      if (longitude !== null && exifData.GPSLongitudeRef === 'W') {
        longitude = -longitude;
      }
    }
    
    console.log(`Extracted GPS coordinates: ${latitude}, ${longitude} for ${processedFile.name}`);
    
    // Try to extract timestamp from various possible fields
    let timestamp = null;
    if (exifData?.DateTimeOriginal) {
      timestamp = new Date(exifData.DateTimeOriginal);
    } else if (exifData?.CreateDate) {
      timestamp = new Date(exifData.CreateDate);
    } else if (exifData?.ModifyDate) {
      timestamp = new Date(exifData.ModifyDate);
    } else if (processedFile.lastModified) {
      // Fallback to file's last modified date if no EXIF date is found
      timestamp = new Date(processedFile.lastModified);
    }
    
    return {
      timestamp,
      latitude,
      longitude
    };
  } catch (error) {
    console.error('Error extracting EXIF data:', error);
    return {
      timestamp: null,
      latitude: null,
      longitude: null
    };
  }
};