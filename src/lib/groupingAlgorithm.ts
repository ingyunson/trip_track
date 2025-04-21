// src/lib/groupingAlgorithm.ts
import { PhotoMetadata } from '@/context/PhotoContext';

// Calculate time difference in hours between two timestamps
export function calculateTimeDifference(timestamp1: Date | null, timestamp2: Date | null): number {
  if (!timestamp1 || !timestamp2) return Infinity;

  const diffMs = Math.abs(timestamp1.getTime() - timestamp2.getTime());
  return diffMs / (1000 * 60 * 60); // Convert milliseconds to hours
}

// Calculate distance in kilometers between two coordinates using Haversine formula
export function calculateDistance(
  lat1: number | null,
  lon1: number | null,
  lat2: number | null,
  lon2: number | null
): number {
  if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;

  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export interface PhotoGroup {
  id: string;
  photos: PhotoMetadata[];
  coverPhoto: PhotoMetadata;
  location: string;
  rating: number | null;
  review: string;
  startTime: Date | null;
  endTime: Date | null;
}

// Group photos by time and location proximity
export function groupPhotosByTimeAndLocation(
  photos: PhotoMetadata[],
  maxHoursDiff: number = 2,
  maxKmDiff: number = 5
): PhotoGroup[] {
  console.log('===== PHOTO GROUPING PROCESS STARTED =====');
  console.log(`GROUPING: Processing ${photos.length} photos with parameters:`, { maxHoursDiff, maxKmDiff });
  
  if (photos.length === 0) {
    console.log('GROUPING: No photos to process, returning empty array');
    return [];
  }
  
  // Log raw metadata before validation
  console.log('===== RAW PHOTO METADATA =====');
  photos.forEach((photo, index) => {
    console.log(`Photo ${index + 1} (ID: ${photo.id.substring(0,8)}):`, {
      fileName: photo.fileName,
      fileSize: photo.fileSize ? `${(photo.fileSize / (1024 * 1024)).toFixed(2)} MB` : 'unknown',
      timeStamp: photo.timeStamp ? photo.timeStamp.toISOString() : null,
      latitude: photo.latitude,
      longitude: photo.longitude,
      hasValidTimestamp: photo.timeStamp instanceof Date,
      hasValidCoordinates: photo.latitude !== null && photo.longitude !== null && 
                        !isNaN(Number(photo.latitude)) && !isNaN(Number(photo.longitude))
    });
  });

  // Validate and clean photo metadata
  console.log('===== VALIDATING PHOTO METADATA =====');
  const validatedPhotos = photos.map(photo => {
    const validated = {
      ...photo,
      timeStamp: photo.timeStamp instanceof Date ? photo.timeStamp : null,
      latitude: photo.latitude !== null && !isNaN(Number(photo.latitude)) ? Number(photo.latitude) : null,
      longitude: photo.longitude !== null && !isNaN(Number(photo.longitude)) ? Number(photo.longitude) : null
    };
    
    if (validated.timeStamp !== photo.timeStamp || validated.latitude !== photo.latitude || 
        validated.longitude !== photo.longitude) {
      console.log(`Validation changed metadata for photo ${photo.id.substring(0,8)}:`, {
        timeStamp: { before: photo.timeStamp, after: validated.timeStamp },
        latitude: { before: photo.latitude, after: validated.latitude },
        longitude: { before: photo.longitude, after: validated.longitude }
      });
    }
    return validated;
  });
  
  // Log metadata statistics
  const photosWithTimestamp = validatedPhotos.filter(p => p.timeStamp !== null).length;
  const photosWithLocation = validatedPhotos.filter(p => p.latitude !== null && p.longitude !== null).length;
  const photosWithBoth = validatedPhotos.filter(p => p.timeStamp !== null && 
                                               p.latitude !== null && p.longitude !== null).length;
  
  console.log('===== METADATA VALIDATION STATISTICS =====');
  console.log(`- Total photos: ${photos.length}`);
  console.log(`- Photos with valid timestamps: ${photosWithTimestamp} (${(photosWithTimestamp/photos.length*100).toFixed(1)}%)`);
  console.log(`- Photos with valid coordinates: ${photosWithLocation} (${(photosWithLocation/photos.length*100).toFixed(1)}%)`);
  console.log(`- Photos with both timestamp and coordinates: ${photosWithBoth} (${(photosWithBoth/photos.length*100).toFixed(1)}%)`);
  
  // Categorize photos based on available metadata
  console.log('===== CATEGORIZING PHOTOS =====');
  const photosWithFullMetadata = validatedPhotos.filter(p => p.timeStamp !== null && 
                                                      p.latitude !== null && p.longitude !== null);
  const photosWithTimeNoLocation = validatedPhotos.filter(p => p.timeStamp !== null && 
                                                       (p.latitude === null || p.longitude === null));
  const photosWithoutMetadata = validatedPhotos.filter(p => p.timeStamp === null);
  
  console.log(`- Photos with full metadata: ${photosWithFullMetadata.length}`);
  console.log(`- Photos with time but no location: ${photosWithTimeNoLocation.length}`);
  console.log(`- Photos without metadata: ${photosWithoutMetadata.length}`);
  
  // Sort photos by timestamp for grouping
  console.log('===== SORTING PHOTOS BY TIMESTAMP =====');
  const sortedPhotos = [...photosWithFullMetadata].sort((a, b) => {
    return a.timeStamp!.getTime() - b.timeStamp!.getTime();
  });
  
  if (sortedPhotos.length > 0) {
    console.log(`Date range: ${sortedPhotos[0].timeStamp?.toISOString()} to ${sortedPhotos[sortedPhotos.length-1].timeStamp?.toISOString()}`);
  }
  
  // Begin grouping process
  console.log('===== FORMING GROUPS BASED ON TIME AND LOCATION PROXIMITY =====');
  const groups: PhotoGroup[] = [];
  let currentGroup: PhotoMetadata[] = [];
  
  for (let i = 0; i < sortedPhotos.length; i++) {
    const photo = sortedPhotos[i];
    
    // If this is the first photo, start a new group
    if (currentGroup.length === 0) {
      currentGroup = [photo];
      console.log(`Started new group with photo ${photo.id.substring(0,8)}`);
      continue;
    }
    
    // Get the last photo in the current group
    const lastPhoto = currentGroup[currentGroup.length - 1];
    
    // Calculate time and distance between current and last photo
    const timeDiff = calculateTimeDifference(photo.timeStamp!, lastPhoto.timeStamp!);
    const distanceDiff = calculateDistance(
      photo.latitude!, photo.longitude!,
      lastPhoto.latitude!, lastPhoto.longitude!
    );
    
    console.log(`Comparing photos: ${photo.id.substring(0,8)} vs ${lastPhoto.id.substring(0,8)}`);
    console.log(`- Time difference: ${timeDiff.toFixed(2)} hours`);
    console.log(`- Distance: ${distanceDiff.toFixed(2)} km`);
    
    // If within thresholds, add to current group; otherwise, start a new group
    if (timeDiff <= maxHoursDiff && distanceDiff <= maxKmDiff) {
      currentGroup.push(photo);
      console.log(`- DECISION: Added to current group (now ${currentGroup.length} photos)`);
    } else {
      // Create a new group with the photos we've collected
      if (currentGroup.length > 0) {
        const newGroup = createGroupFromPhotos(currentGroup);
        groups.push(newGroup);
        console.log(`- DECISION: Completed group with ${currentGroup.length} photos, ID: ${newGroup.id.substring(0,8)}`);
        console.log(`  Location: ${newGroup.location}, Time: ${newGroup.startTime?.toISOString()} - ${newGroup.endTime?.toISOString()}`);
      }
      
      // Start a new group with this photo
      currentGroup = [photo];
      console.log(`Started new group with photo ${photo.id.substring(0,8)}`);
    }
  }
  
  // Add the last group if it has photos
  if (currentGroup.length > 0) {
    const newGroup = createGroupFromPhotos(currentGroup);
    groups.push(newGroup);
    console.log(`Completed final group with ${currentGroup.length} photos, ID: ${newGroup.id.substring(0,8)}`);
    console.log(`Location: ${newGroup.location}, Time: ${newGroup.startTime?.toISOString()} - ${newGroup.endTime?.toISOString()}`);
  }
  
  // Handle photos with time but no location
  if (photosWithTimeNoLocation.length > 0) {
    console.log('===== HANDLING PHOTOS WITH TIME BUT NO LOCATION =====');
    // Your existing code for handling these photos
    console.log(`Created group(s) for ${photosWithTimeNoLocation.length} photos with time but no location`);
  }
  
  // Handle photos without metadata
  if (photosWithoutMetadata.length > 0) {
    console.log('===== HANDLING PHOTOS WITHOUT METADATA =====');
    const noMetadataGroup = createGroupFromPhotos(photosWithoutMetadata);
    noMetadataGroup.location = "Unknown Location";
    groups.push(noMetadataGroup);
    console.log(`Created group for ${photosWithoutMetadata.length} photos without metadata, ID: ${noMetadataGroup.id.substring(0,8)}`);
  }
  
  // Summarize results
  console.log('===== GROUPING RESULTS SUMMARY =====');
  console.log(`Created ${groups.length} total groups from ${photos.length} photos`);
  groups.forEach((group, i) => {
    console.log(`Group #${i+1} (ID: ${group.id.substring(0,8)}): ${group.photos.length} photos, Location: ${group.location}`);
    if (group.startTime && group.endTime) {
      console.log(`- Time span: ${group.startTime.toISOString()} to ${group.endTime.toISOString()}`);
    }
  });
  
  return groups;
}

// Helper function to create a group from a collection of photos
function createGroupFromPhotos(photos: PhotoMetadata[]): PhotoGroup {
  // Sort photos by time (just to be safe)
  const sortedPhotos = [...photos].sort((a, b) => {
    if (!a.timeStamp) return -1;
    if (!b.timeStamp) return 1;
    return a.timeStamp.getTime() - b.timeStamp.getTime();
  });

  // Generate a unique ID for the group
  const id = `group-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  // Use the first photo as the cover photo
  const coverPhoto = sortedPhotos[0];

  // Extract time range
  const startTime = sortedPhotos[0]?.timeStamp || null;
  const endTime = sortedPhotos[sortedPhotos.length - 1]?.timeStamp || null;

  return {
    id,
    photos: sortedPhotos,
    coverPhoto,
    location: '', // To be filled in later
    rating: null,
    review: '',
    startTime,
    endTime
  };
}
