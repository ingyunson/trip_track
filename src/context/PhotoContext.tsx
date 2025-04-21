// src/context/PhotoContext.tsx
'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { PhotoGroup } from '@/lib/groupingAlgorithm';

// Define types for photo metadata
export interface PhotoMetadata {
  id: string;
  file: File;
  fileName: string;
  fileUrl: string;
  timeStamp: Date | null;
  latitude: number | null;
  longitude: number | null;
  processed: boolean;
  processingError: string | null;
}

export interface Group {
  id: string;
  photos: PhotoMetadata[];
  // Add missing coverPhoto property to match PhotoGroup
  coverPhoto: PhotoMetadata;
  location: string;
  // Fix: Make rating consistent with PhotoGroup by allowing null
  rating: number | null;
  review: string;
  startTime: Date | null;
  endTime: Date | null;
}

interface PhotoContextType {
  photos: PhotoMetadata[];
  groups: PhotoGroup[];
  aiGeneratedText: string | null;
  editedText: string | null;
  addPhotos: (newPhotos: PhotoMetadata[]) => void;
  updatePhoto: (id: string, updates: Partial<PhotoMetadata>) => void;
  removePhoto: (id: string) => void;
  clearPhotos: () => void;
  setGroups: (groups: PhotoGroup[]) => void;
  updateGroup: (id: string, updates: Partial<PhotoGroup>) => void;
  removeGroup: (id: string) => void;
  mergeGroups: (groupIds: string[]) => void;
  splitGroup: (groupId: string) => void;
  reorderGroups: (newOrder: PhotoGroup[]) => void;
  setAiGeneratedText: (text: string) => void;
  setEditedText: (text: string | null) => void;
  clearBlobUrls: () => void;
}

const PhotoContext = createContext<PhotoContextType | undefined>(undefined);

export const PhotoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [photos, setPhotos] = useState<PhotoMetadata[]>([]);
  const [groups, setGroups] = useState<PhotoGroup[]>([]);
  const [aiGeneratedText, setAiGeneratedText] = useState<string | null>(null);
  const [editedText, setEditedText] = useState<string | null>(null);

  const addPhotos = (newPhotos: PhotoMetadata[]) => {
    setPhotos(prevPhotos => [...prevPhotos, ...newPhotos]);
  };

  const updatePhoto = (id: string, updates: Partial<PhotoMetadata>) => {
    setPhotos(prevPhotos =>
      prevPhotos.map(photo =>
        photo.id === id ? { ...photo, ...updates } : photo
      )
    );
  };

  const removePhoto = (id: string) => {
    setPhotos(prevPhotos => prevPhotos.filter(photo => photo.id !== id));
  };

  const clearPhotos = () => {
    setPhotos([]);
  };

  const updateGroup = (id: string, updates: Partial<PhotoGroup>) => {
    setGroups(prevGroups =>
      prevGroups.map(group =>
        group.id === id ? { ...group, ...updates } : group
      )
    );
  };

  const removeGroup = (id: string) => {
    setGroups(prevGroups => prevGroups.filter(group => group.id !== id));
  };

  const mergeGroups = (groupIds: string[]) => {
    if (groupIds.length < 2) return;

    // Find the groups to merge
    const groupsToMerge = groups.filter(group => groupIds.includes(group.id));
    const otherGroups = groups.filter(group => !groupIds.includes(group.id));
    
    // Combine all photos from the groups
    const allPhotos = groupsToMerge.flatMap(group => group.photos);
    
    // Sort photos by timestamp
    const sortedPhotos = [...allPhotos].sort((a, b) => {
      if (!a.timeStamp) return -1;
      if (!b.timeStamp) return 1;
      return a.timeStamp.getTime() - b.timeStamp.getTime();
    });
    
    // Find the first non-null rating if available
    const firstNonNullRating = groupsToMerge.find(g => g.rating !== null)?.rating || null;
    
    // Create a new merged group
    const mergedGroup: PhotoGroup = {
      id: generateUniqueId(),
      photos: sortedPhotos,
      coverPhoto: sortedPhotos[0],  // Make sure coverPhoto is set correctly
      location: groupsToMerge[0]?.location || '',
      rating: firstNonNullRating,
      review: groupsToMerge[0]?.review || '',
      startTime: sortedPhotos[0]?.timeStamp || null,
      endTime: sortedPhotos[sortedPhotos.length - 1]?.timeStamp || null
    };
    
    // Update state with the new group arrangement
    setGroups([...otherGroups, mergedGroup]);
  };

  const splitGroup = (groupId: string) => {
    // Find the group to split
    const groupToSplit = groups.find(group => group.id === groupId);
    if (!groupToSplit || groupToSplit.photos.length < 2) return;
    
    const otherGroups = groups.filter(group => group.id !== groupId);
    
    // Simple split: divide photos in half
    const splitIndex = Math.floor(groupToSplit.photos.length / 2);
    const firstGroupPhotos = groupToSplit.photos.slice(0, splitIndex);
    const secondGroupPhotos = groupToSplit.photos.slice(splitIndex);
    
    // Create two new groups
    const firstGroup: PhotoGroup = {
      id: generateUniqueId(),
      photos: firstGroupPhotos,
      coverPhoto: firstGroupPhotos[0],
      startTime: firstGroupPhotos[0]?.timeStamp,
      endTime: firstGroupPhotos[firstGroupPhotos.length - 1]?.timeStamp,
      location: groupToSplit.location,
      rating: groupToSplit.rating,
      review: groupToSplit.review
    };

    const secondGroup: PhotoGroup = {
      id: generateUniqueId(),
      photos: secondGroupPhotos,
      coverPhoto: secondGroupPhotos[0],
      startTime: secondGroupPhotos[0]?.timeStamp,
      endTime: secondGroupPhotos[secondGroupPhotos.length - 1]?.timeStamp,
      location: groupToSplit.location,
      rating: groupToSplit.rating,
      review: groupToSplit.review
    };

    setGroups([...otherGroups, firstGroup, secondGroup]);
  };

  const reorderGroups = (newOrder: PhotoGroup[]) => {
    setGroups(newOrder);
  };

  const clearBlobUrls = () => {
    photos.forEach(photo => {
      if (photo.fileUrl && photo.fileUrl.startsWith('blob:')) {
        URL.revokeObjectURL(photo.fileUrl);
      }
    });
  };

  function generateUniqueId() {
    return `group-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  return (
    <PhotoContext.Provider value={{
      photos,
      groups,
      aiGeneratedText,
      editedText,
      addPhotos,
      updatePhoto,
      removePhoto,
      clearPhotos,
      setGroups,
      updateGroup,
      removeGroup,
      mergeGroups,
      splitGroup,
      reorderGroups,
      setAiGeneratedText,
      setEditedText,
      clearBlobUrls
    }}>
      {children}
    </PhotoContext.Provider>
  );
};

export const usePhotoContext = () => {
  const context = useContext(PhotoContext);
  if (context === undefined) {
    throw new Error('usePhotoContext must be used within a PhotoProvider');
  }
  return context;
};
