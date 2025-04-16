// src/components/ShareDialog.tsx
'use client';

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Input,
  InputGroup,
  InputRightElement,
  VStack,
  Text,
  useClipboard,
  useToast,
  HStack,
  IconButton,
  Icon,
  Divider,
} from '@chakra-ui/react';
import { FiTwitter, FiFacebook, FiMail, FiCopy, FiLink, FiCheckCircle, FiLinkedin, FiMessageCircle, FiSend } from 'react-icons/fi';

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  shareUrl: string;
  title: string;
}

const ShareDialog: React.FC<ShareDialogProps> = ({ isOpen, onClose, shareUrl, title }) => {
  const { hasCopied, onCopy } = useClipboard(shareUrl);
  const toast = useToast();

  // Web Share API support check
  const isWebShareSupported = typeof navigator !== 'undefined' && 'share' in navigator;

  // Handle native share (mobile)
  const handleNativeShare = async () => {
    try {
      await navigator.share({
        title: title || 'My Travel Log',
        text: 'Check out my travel log!',
        url: shareUrl,
      });

      toast({
        title: 'Shared successfully',
        status: 'success',
        duration: 2000,
      });
    } catch (error) {
      if ((error as Error)?.name !== 'AbortError') {
        toast({
          title: 'Sharing failed',
          description: (error as Error)?.message || 'An error occurred',
          status: 'error',
          duration: 3000,
        });
      }
    }
  };

  // Sharing links
  const twitterShareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent('Check out my travel log!')}`;
  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
  const mailtoUrl = `mailto:?subject=${encodeURIComponent(title || 'My Travel Log')}&body=${encodeURIComponent(`Check out my travel log: ${shareUrl}`)}`;
  const linkedInShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
  const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(`${title}: ${shareUrl}`)}`;
  const telegramShareUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Share Your Travel Log</ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <VStack spacing={4} align="stretch">
            <Text>Share this link with friends and family:</Text>

            <InputGroup size="md">
              <Input
                pr="4.5rem"
                value={shareUrl}
                readOnly
              />
              <InputRightElement width="4.5rem">
                <Button
                  h="1.75rem"
                  size="sm"
                  onClick={onCopy}
                  leftIcon={hasCopied ? <FiCheckCircle /> : <FiCopy />}
                >
                  {hasCopied ? 'Copied' : 'Copy'}
                </Button>
              </InputRightElement>
            </InputGroup>

            <Divider />

            <Text>Share on social media:</Text>

            <HStack spacing={4} justifyContent="center">
              <IconButton
                aria-label="Share on Twitter"
                icon={<Icon as={FiTwitter} boxSize={5} />}
                colorScheme="twitter"
                onClick={() => window.open(twitterShareUrl, '_blank')}
                rounded="full"
              />

              <IconButton
                aria-label="Share on Facebook"
                icon={<Icon as={FiFacebook} boxSize={5} />}
                colorScheme="facebook"
                onClick={() => window.open(facebookShareUrl, '_blank')}
                rounded="full"
              />

              <IconButton
                aria-label="Share via Email"
                icon={<Icon as={FiMail} boxSize={5} />}
                colorScheme="red"
                onClick={() => window.open(mailtoUrl, '_blank')}
                rounded="full"
              />

              <IconButton
                aria-label="Share on LinkedIn"
                icon={<Icon as={FiLinkedin} boxSize={5} />}
                colorScheme="linkedin"
                onClick={() => window.open(linkedInShareUrl, '_blank')}
                rounded="full"
              />
              
              <IconButton
                aria-label="Share on WhatsApp"
                icon={<Icon as={FiMessageCircle} boxSize={5} />}
                colorScheme="whatsapp"
                onClick={() => window.open(whatsappShareUrl, '_blank')}
                rounded="full"
              />
              
              <IconButton
                aria-label="Share on Telegram"
                icon={<Icon as={FiSend} boxSize={5} />}
                colorScheme="telegram"
                onClick={() => window.open(telegramShareUrl, '_blank')}
                rounded="full"
              />

              {isWebShareSupported && (
                <IconButton
                  aria-label="Native Share"
                  icon={<Icon as={FiLink} boxSize={5} />}
                  colorScheme="purple"
                  onClick={handleNativeShare}
                  rounded="full"
                />
              )}
            </HStack>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ShareDialog;
