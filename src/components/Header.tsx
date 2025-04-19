// src/components/Header.tsx
'use client';

import { useState, useEffect } from 'react';
import { 
  Box, 
  Flex, 
  Button, 
  useColorMode, 
  useColorModeValue,
  Link as ChakraLink
} from '@chakra-ui/react';
import NextLink from 'next/link';

export default function Header() {
  // Use null as initial state to prevent hydration mismatch
  const [isScrolled, setIsScrolled] = useState(null);
  const { colorMode, toggleColorMode } = useColorMode();
  
  // Only run scroll logic on the client
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    // Set initial state
    setIsScrolled(window.scrollY > 10);
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const bgColor = useColorModeValue(
    isScrolled === null ? 'transparent' : isScrolled ? 'white' : 'transparent',
    isScrolled === null ? 'transparent' : isScrolled ? 'gray.800' : 'transparent'
  );
  
  const textColor = useColorModeValue(
    isScrolled === null ? 'white' : isScrolled ? 'gray.800' : 'white',
    isScrolled === null ? 'white' : isScrolled ? 'white' : 'white'
  );

  return (
    <Box 
      as="header"
      position="fixed"
      top="0"
      left="0"
      right="0"
      bg={bgColor}
      color={textColor}
      py={4}
      px={8}
      zIndex={10}
      boxShadow={isScrolled ? "sm" : "none"}
      transition="all 0.3s"
    >
      <Flex justify="space-between" align="center">
        {/* FIX: Use as prop instead of nesting anchors */}
        <NextLink href="/" passHref legacyBehavior>
          <ChakraLink 
            fontWeight="bold" 
            fontSize="xl" 
            _hover={{ textDecoration: 'none' }}
          >
            Travel Log
          </ChakraLink>
        </NextLink>
        
        <Flex>
          <Button onClick={toggleColorMode} size="sm" variant="ghost" mr={2}>
            {colorMode === 'light' ? 'Dark' : 'Light'} Mode
          </Button>
          {/* FIX: Use as prop to avoid nesting anchors */}
          <NextLink href="/upload" passHref legacyBehavior>
            <Button as="a" colorScheme="teal" size="sm">
              Upload Photos
            </Button>
          </NextLink>
        </Flex>
      </Flex>
    </Box>
  );
}
