// src/app/share/[shareId]/SharedTripView.tsx
'use client';

import {
  Container,
  Box,
  Heading,
  Text,
  Image,
  VStack,
  Flex,
  Badge,
  Link,
  Icon,
  Divider,
  Button,
  HStack,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiUser, FiCalendar, FiMapPin, FiClock, FiImage, FiCornerUpLeft } from 'react-icons/fi';

interface TravelLog {
  id: string;
  title: string;
  author: string;
  date: string;
  content: string;
  coverImage: string;
  locations: string[];
  photoCount: number;
  tripDuration: string;
}

interface SharedTripViewProps {
  travelLog: TravelLog;
  shareId: string;
}

export default function SharedTripView({ travelLog, shareId }: SharedTripViewProps) {
  // Now we can safely use hooks here since this is a client component
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const contentBgColor = useColorModeValue('white', 'gray.800');
  
  // Parse Markdown content into React components
  const renderContent = () => {
    return travelLog.content.split('\n').map((line, index) => {
      // Handle Markdown headers
      if (line.startsWith('# ')) {
        return <Heading as="h1" size="xl" mt={6} mb={4} key={index}>{line.substring(2)}</Heading>;
      }
      if (line.startsWith('## ')) {
        return <Heading as="h2" size="lg" mt={5} mb={3} key={index}>{line.substring(3)}</Heading>;
      }
      if (line.startsWith('### ')) {
        return <Heading as="h3" size="md" mt={4} mb={2} key={index}>{line.substring(4)}</Heading>;
      }
      
      // Handle bold and italic (basic Markdown)
      let processedLine = line;
      // Bold: **text**
      processedLine = processedLine.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      // Italic: *text*
      processedLine = processedLine.replace(/\*(.*?)\*/g, '<em>$1</em>');
      
      // Handle empty lines as paragraph breaks
      if (line.trim() === '') {
        return <Box key={index} height="1em" />;
      }
      
      // Regular paragraph text with processed Markdown
      return <Text mb={3} key={index} dangerouslySetInnerHTML={{ __html: processedLine }} />;
    });
  };
  
  return (
    <Box bg={bgColor} minHeight="100vh">
      <Container maxW="container.md" py={8}>
        <VStack spacing={6} align="stretch">
          {/* Cover Image */}
          <Box
            position="relative"
            height={{ base: "200px", md: "300px" }}
            overflow="hidden"
            borderRadius="lg"
            boxShadow="md"
          >
            <Image
              src={travelLog.coverImage}
              alt={travelLog.title}
              width="100%"
              height="100%"
              objectFit="cover"
            />
            <Box
              position="absolute"
              bottom="0"
              left="0"
              right="0"
              bg="blackAlpha.600"
              p={4}
              color="white"
            >
              <Heading size="lg">{travelLog.title}</Heading>
              <Flex align="center" mt={2}>
                <Icon as={FiUser} mr={1} />
                <Text mr={4}>{travelLog.author}</Text>
                <Icon as={FiCalendar} mr={1} />
                <Text>{travelLog.date}</Text>
              </Flex>
            </Box>
          </Box>
          
          {/* Trip Summary */}
          <Box
            bg={contentBgColor}
            p={4}
            borderRadius="md"
            boxShadow="sm"
          >
            <HStack spacing={6} wrap="wrap" justify="center">
              <Flex align="center">
                <Icon as={FiMapPin} mr={2} color="teal.500" />
                <Text>{travelLog.locations.join(' • ')}</Text>
              </Flex>
              <Flex align="center">
                <Icon as={FiClock} mr={2} color="teal.500" />
                <Text>{travelLog.tripDuration}</Text>
              </Flex>
              <Flex align="center">
                <Icon as={FiImage} mr={2} color="teal.500" />
                <Text>{travelLog.photoCount} photos</Text>
              </Flex>
            </HStack>
          </Box>
          
          {/* Content */}
          <Box bg={contentBgColor} p={{ base: 4, md: 6 }} borderRadius="md" boxShadow="sm">
            <Flex justify="space-between" align="center" mb={4}>
              <Badge colorScheme="teal" fontSize="0.8em" p={1}>
                Travel Log
              </Badge>
              <Text fontSize="sm" color="gray.500">
                Share ID: {shareId}
              </Text>
            </Flex>
            
            <Divider mb={4} />
            
            {/* Render the content with markdown formatting */}
            <Box fontSize="md" lineHeight="1.7">
              {renderContent()}
            </Box>
          </Box>
          
          {/* Footer with "Create your own" action */}
          <Box textAlign="center" mt={4}>
            <Text fontSize="sm" color="gray.500" mb={3}>
              © {new Date().getFullYear()} Travel Log App. All rights reserved.
            </Text>
            <Button 
              as={Link}
              href="/"
              leftIcon={<Icon as={FiCornerUpLeft} />}
              colorScheme="teal" 
              variant="outline"
              _hover={{ textDecoration: 'none' }}
            >
              Create your own travel log
            </Button>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}