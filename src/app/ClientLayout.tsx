'use client';

import { ReactNode, useState, useEffect } from 'react';
import { Box, useColorModeValue } from '@chakra-ui/react';

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  
  // Use null as initial state to defer rendering until client
  const [isScrolled, setIsScrolled] = useState<boolean | null>(null);
  
  useEffect(() => {
    // Set initial scroll position immediately after mounting
    setIsScrolled(window.scrollY > 10);
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Box bg={bgColor} minH="100vh">
      {children}
    </Box>
  );
}