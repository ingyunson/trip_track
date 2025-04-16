// src/components/GeneratingAnimation.tsx
'use client';

import { Box, Flex, Text, useColorModeValue } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';

const pulse = keyframes`
  0% { transform: scale(0.95); opacity: 0.5; }
  50% { transform: scale(1.05); opacity: 1; }
  100% { transform: scale(0.95); opacity: 0.5; }
`;

const typing = keyframes`
  from { width: 0 }
  to { width: 100% }
`;

const blinkCaret = keyframes`
  from, to { border-color: transparent }
  50% { border-color: currentColor; }
`;

interface GeneratingAnimationProps {
  message?: string;
}

const GeneratingAnimation: React.FC<GeneratingAnimationProps> = ({
  message = "AI is generating your travel log..."
}) => {
  const bgColor = useColorModeValue('teal.50', 'teal.900');
  const textColor = useColorModeValue('teal.600', 'teal.200');
  const iconColor = useColorModeValue('teal.500', 'teal.300');

  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      p={8}
      bg={bgColor}
      borderRadius="md"
      boxShadow="sm"
      minH="200px"
    >
      {/* Brain or AI icon */}
      <Box
        fontSize="3xl"
        animation={`${pulse} 2s infinite ease-in-out`}
        mb={4}
        color={iconColor}
      >
        🧠
      </Box>

      {/* Animated message */}
      <Box
        position="relative"
        maxW="400px"
        overflow="hidden"
        whiteSpace="nowrap"
        mb={3}
      >
        <Text
          fontSize="lg"
          fontWeight="medium"
          color={textColor}
          overflow="hidden"
          borderRight=".15em solid"
          animation={`${typing} 3.5s steps(40, end), ${blinkCaret} .75s step-end infinite`}
        >
          {message}
        </Text>
      </Box>

      {/* Additional message */}
      <Text color="gray.500" fontSize="sm" textAlign="center" maxW="400px">
        This may take a moment as we craft a personalized narrative based on your travel information.
      </Text>
    </Flex>
  );
};

export default GeneratingAnimation;
