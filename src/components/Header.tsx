// src/components/Header.tsx
'use client';

import React from 'react';
import { Box, Flex, Heading, Button, HStack } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';

const Header = () => {
  const router = useRouter();

  return (
    <Box as="header" bg="teal.500" color="white" py={4} px={8}>
      <Flex justify="space-between" align="center" maxW="container.lg" mx="auto">
        <Heading size="md" cursor="pointer" onClick={() => router.push('/')}>
          TravelLog
        </Heading>
        <HStack spacing={4}>
          <Button variant="ghost" colorScheme="whiteAlpha" size="sm" onClick={() => router.push('/upload')}>
            Upload Photos
          </Button>
        </HStack>
      </Flex>
    </Box>
  );
};

export default Header;
