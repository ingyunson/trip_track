// src/app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  Stack,
  Flex,
  Icon,
  SimpleGrid,
  HStack,
  Image,
  useColorModeValue,
  VStack,
  Badge,
} from '@chakra-ui/react';
import { 
  FiCamera, 
  FiMap, 
  FiEdit, 
  FiCpu,
  FiShare2, 
  FiClock, 
  FiImage,
  FiArrowRight
} from 'react-icons/fi';

// Feature card component
interface FeatureProps {
  title: string;
  text: string;
  icon: React.ReactElement;
}

const Feature = ({ title, text, icon }: FeatureProps) => {
  return (
    <Stack 
      bg={useColorModeValue('white', 'gray.800')}
      borderRadius="lg"
      boxShadow="md"
      p={5}
      transition="transform 0.3s, box-shadow 0.3s"
      _hover={{
        transform: 'translateY(-5px)',
        boxShadow: 'lg'
      }}
    >
      <Flex
        w={16}
        h={16}
        align={'center'}
        justify={'center'}
        color={'white'}
        rounded={'full'}
        bg={'teal.500'}
        mb={4}
      >
        {icon}
      </Flex>
      <Text fontWeight={600} fontSize="lg">{title}</Text>
      <Text color={useColorModeValue('gray.600', 'gray.400')}>{text}</Text>
    </Stack>
  );
};

// Example card component
interface ExampleCardProps {
  title: string;
  image: string;
  locations: string[];
}

const ExampleCard = ({ title, image, locations }: ExampleCardProps) => {
  return (
    <Box
      maxW="sm"
      borderRadius="lg"
      overflow="hidden"
      boxShadow="md"
      bg={useColorModeValue('white', 'gray.800')}
      transition="transform 0.3s"
      _hover={{ transform: 'scale(1.02)' }}
    >
      <Box h="200px" overflow="hidden">
        <Image 
          src={image} 
          alt={title} 
          w="100%" 
          h="100%" 
          objectFit="cover" 
          transition="transform 0.5s"
          _hover={{ transform: 'scale(1.05)' }}
        />
      </Box>
      <Box p={5}>
        <Heading size="md" mb={2}>{title}</Heading>
        <HStack spacing={2} mt={2} wrap="wrap">
          {locations.map((location, index) => (
            <Badge key={index} colorScheme="teal" mb={1}>
              {location}
            </Badge>
          ))}
        </HStack>
      </Box>
    </Box>
  );
};

export default function Home() {
  const router = useRouter();
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Header */}
      <Box 
        position="fixed"
        top="0"
        left="0"
        right="0"
        bg={useColorModeValue(
          isScrolled ? 'white' : 'transparent', 
          isScrolled ? 'gray.800' : 'transparent'
        )}
        boxShadow={isScrolled ? 'sm' : 'none'}
        zIndex="10"
        transition="all 0.3s"
      >
        <Container maxW="container.xl" py={3}>
          <Flex justifyContent="space-between" alignItems="center">
            <Heading size="md">Trip Track</Heading>
            <Button 
              colorScheme="teal" 
              onClick={() => router.push('/upload')}
              rightIcon={<FiArrowRight />}
            >
              Start Now
            </Button>
          </Flex>
        </Container>
      </Box>

      {/* Hero Section */}
      <Box 
        bg={useColorModeValue('gray.50', 'gray.900')} 
        pt={{ base: "100px", md: "150px" }}
        pb={{ base: "50px", md: "100px" }}
      >
        <Container maxW="container.xl">
          <Stack 
            direction={{ base: 'column', lg: 'row' }}
            alignItems="center"
            spacing={{ base: 8, md: 10 }}
          >
            <Stack flex={1} spacing={{ base: 5, md: 8 }}>
              <Heading
                lineHeight={1.1}
                fontWeight={700}
                fontSize={{ base: '3xl', sm: '4xl', lg: '6xl' }}
              >
                <Text
                  as={'span'}
                  position={'relative'}
                >
                  Turn your travel photos
                </Text>
                <br />
                <Text as={'span'} color={'teal.400'}>
                  into beautiful memories
                </Text>
              </Heading>
              <Text color={useColorModeValue('gray.600', 'gray.400')} fontSize="xl">
                Upload your photos and let our AI generate a personalized travel log. 
                Organize your memories by time and location, add your thoughts, and share 
                your adventures with friends and family.
              </Text>
              <Stack
                spacing={{ base: 4, sm: 6 }}
                direction={{ base: 'column', sm: 'row' }}
              >
                <Button
                  size="lg"
                  colorScheme="teal"
                  px={6}
                  onClick={() => router.push('/upload')}
                >
                  Get Started
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => {
                    const howItWorksSection = document.getElementById('how-it-works');
                    howItWorksSection?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  How It Works
                </Button>
              </Stack>
            </Stack>
            <Flex
              flex={1}
              justify={'center'}
              align={'center'}
              position={'relative'}
              w={'full'}
            >
              <Box
                position={'relative'}
                height={{ base: '300px', md: '400px' }}
                width={'full'}
                overflow={'hidden'}
                borderRadius={'xl'}
                boxShadow={'2xl'}
              >
                <Image
                  alt={'Hero Image'}
                  fit={'cover'}
                  align={'center'}
                  w={'100%'}
                  h={'100%'}
                  src={
                    'https://images.unsplash.com/photo-1488085061387-422e29b40080?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1331&q=80'
                  }
                />
              </Box>
            </Flex>
          </Stack>
        </Container>
      </Box>

      {/* How it Works Section */}
      <Box py={20} bg={useColorModeValue('white', 'gray.800')} id="how-it-works">
        <Container maxW="container.xl">
          <VStack spacing={8}>
            <Heading textAlign="center">How It Works</Heading>
            <Text fontSize="lg" textAlign="center" maxW="container.md">
              Transform your photos into a beautiful travel log in just a few simple steps
            </Text>
            
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={10} mt={10}>
              <Feature
                icon={<Icon as={FiImage} w={10} h={10} />}
                title={'Upload Photos'}
                text={'Upload your travel photos. We automatically extract location and time information from EXIF metadata.'}
              />
              <Feature
                icon={<Icon as={FiClock} w={10} h={10} />}
                title={'Automatic Grouping'}
                text={'Photos are automatically grouped by time and location. You can adjust the groups as needed.'}
              />
              <Feature
                icon={<Icon as={FiMap} w={10} h={10} />}
                title={'Add Trip Details'}
                text={'Name the places you visited and add ratings and reviews to remember your experiences.'}
              />
              <Feature
                icon={<Icon as={FiCpu} w={10} h={10} />}
                title={'AI-Generated Log'}
                text={'Our AI creates a beautifully written travel log based on your photos and trip details.'}
              />
              <Feature
                icon={<Icon as={FiEdit} w={10} h={10} />}
                title={'Edit & Personalize'}
                text={'Review and edit the AI-generated content to make it truly yours.'}
              />
              <Feature
                icon={<Icon as={FiShare2} w={10} h={10} />}
                title={'Share Your Journey'}
                text={'Share your travel log with friends and family through a unique link or on social media.'}
              />
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* Example Travel Logs */}
      <Box py={20} bg={bgColor}>
        <Container maxW="container.xl">
          <VStack spacing={8}>
            <Heading textAlign="center">Example Travel Logs</Heading>
            <Text fontSize="lg" textAlign="center" maxW="container.md">
              See what others have created with Trip Track
            </Text>
            
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={10} mt={10}>
              <ExampleCard
                title="European Summer Adventure"
                image="https://images.unsplash.com/photo-1499856871958-5b9627545d1a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
                locations={['Paris', 'Rome', 'Barcelona']}
              />
              <ExampleCard
                title="Asian Exploration"
                image="https://images.unsplash.com/photo-1528164344705-47542687000d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1169&q=80"
                locations={['Tokyo', 'Kyoto', 'Osaka']}
              />
              <ExampleCard
                title="American Road Trip"
                image="https://images.unsplash.com/photo-1531366936337-7c912a4589a7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
                locations={['New York', 'Chicago', 'San Francisco']}
              />
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* Call to Action */}
      <Box py={20} bg={useColorModeValue('teal.500', 'teal.700')}>
        <Container maxW="container.xl">
          <Stack direction={{ base: 'column', md: 'row' }} spacing={8} align="center" justify="space-between">
            <VStack align="flex-start" spacing={3} maxW="container.md">
              <Heading color="white">Start creating your own travel log today</Heading>
              <Text color="white" opacity={0.8}>
                Turn your travel photos into beautiful memories in minutes.
                No sign-up required.
              </Text>
            </VStack>
            <Button 
              size="lg" 
              colorScheme="white" 
              variant="solid" 
              color="teal.500"
              onClick={() => router.push('/upload')}
              rightIcon={<FiArrowRight />}
              _hover={{ 
                transform: 'translateY(-2px)', 
                boxShadow: 'lg' 
              }}
            >
              Get Started Now
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* Footer */}
      <Box bg={useColorModeValue('gray.50', 'gray.900')} py={8}>
        <Container maxW="container.xl">
          <VStack>
            <Text>© {new Date().getFullYear()} Trip Track. All rights reserved.</Text>
            <Text fontSize="sm" color={useColorModeValue('gray.500', 'gray.400')}>
              Made with ❤️ for travelers everywhere
            </Text>
          </VStack>
        </Container>
      </Box>
    </>
  );
}