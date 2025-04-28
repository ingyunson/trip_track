// src/components/StarRating.tsx
'use client';

import { HStack, Icon } from '@chakra-ui/react';
import { FiStar } from 'react-icons/fi';
import { FaStar } from 'react-icons/fa';
import React from 'react';

interface StarRatingProps {
  rating: number | null;
  onChange: (newRating: number) => void;
  max?: number;
  size?: string;
}

const StarRating: React.FC<StarRatingProps> = ({
  rating = 0,
  onChange,
  max = 5,
  size = "24px"
}) => {
  const handleClick = (index: number) => {
    // If user clicks on current rating, clear it (set to 0)
    // Otherwise set to the clicked rating
    const newRating = rating === index + 1 ? 0 : index + 1;
    onChange(newRating);
  };

  return (
    <HStack spacing={1}>
      {[...Array(max)].map((_, index) => (
        <Icon
          key={index}
          as={index < (rating || 0) ? FaStar : FiStar}
          color={index < (rating || 0) ? "yellow.400" : "gray.300"}
          boxSize={size}
          cursor="pointer"
          onClick={() => handleClick(index)}
          _hover={{ transform: "scale(1.2)" }}
          transition="transform 0.2s"
        />
      ))}
    </HStack>
  );
};

export default StarRating;