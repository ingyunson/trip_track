// src/components/RichTextEditor.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Textarea,
  Flex,
  ButtonGroup,
  IconButton,
  Tooltip,
  useColorModeValue,
  Text,
} from '@chakra-ui/react';
import {
  FiBold, FiItalic, FiHash, FiList, FiLink, FiImage, FiType
} from 'react-icons/fi';

interface RichTextEditorProps {
  initialValue: string;
  onChange: (value: string) => void;
  minHeight?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  initialValue,
  onChange,
  minHeight = '400px'
}) => {
  const [text, setText] = useState(initialValue || '');
  const [selectionStart, setSelectionStart] = useState(0);
  const [selectionEnd, setSelectionEnd] = useState(0);
  const textAreaRef = React.useRef<HTMLTextAreaElement>(null);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Load initial value
  useEffect(() => {
    setText(initialValue);
  }, [initialValue]);

  // Track selection for formatting commands
  const handleSelect = () => {
    if (textAreaRef.current) {
      setSelectionStart(textAreaRef.current.selectionStart);
      setSelectionEnd(textAreaRef.current.selectionEnd);
    }
  };

  // Apply formatting to selected text
  const applyFormatting = (prefix: string, suffix: string = prefix) => {
    if (textAreaRef.current) {
      const currentText = textAreaRef.current.value;
      const beforeText = currentText.substring(0, selectionStart);
      const selectedText = currentText.substring(selectionStart, selectionEnd);
      const afterText = currentText.substring(selectionEnd);

      const newText = beforeText + prefix + selectedText + suffix + afterText;
      setText(newText);
      onChange(newText);

      // Focus back to textarea after formatting
      setTimeout(() => {
        if (textAreaRef.current) {
          textAreaRef.current.focus();
          textAreaRef.current.setSelectionRange(
            selectionStart + prefix.length,
            selectionEnd + prefix.length
          );
        }
      }, 0);
    }
  };

  // Handle text changes
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    onChange(newText);
  };

  // Markdown formatting commands
  const formatBold = () => applyFormatting('**', '**');
  const formatItalic = () => applyFormatting('*', '*');
  const formatHeading = () => applyFormatting('## ');
  const formatSubheading = () => applyFormatting('### ');
  const formatList = () => applyFormatting('- ');
  const formatLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      applyFormatting('[', `](${url})`);
    }
  };
  const insertImage = () => {
    const url = prompt('Enter image URL:');
    const alt = prompt('Enter image description:');
    if (url) {
      applyFormatting(`![${alt || 'image'}](${url})`);
    }
  };

  return (
    <Box borderWidth="1px" borderRadius="md" borderColor={borderColor} overflow="hidden">
      {/* Toolbar */}
      <Flex
        bg={useColorModeValue('gray.50', 'gray.700')}
        p={2}
        borderBottomWidth="1px"
        borderColor={borderColor}
      >
        <ButtonGroup size="sm" isAttached variant="outline">
          <Tooltip label="Bold">
            <IconButton
              aria-label="Bold"
              icon={<FiBold />}
              onClick={formatBold}
            />
          </Tooltip>
          <Tooltip label="Italic">
            <IconButton
              aria-label="Italic"
              icon={<FiItalic />}
              onClick={formatItalic}
            />
          </Tooltip>
          <Tooltip label="Heading">
            <IconButton
              aria-label="Heading"
              icon={<FiHash />}
              onClick={formatHeading}
            />
          </Tooltip>
          <Tooltip label="Subheading">
            <IconButton
              aria-label="Subheading"
              icon={<FiType />}
              onClick={formatSubheading}
            />
          </Tooltip>
          <Tooltip label="List">
            <IconButton
              aria-label="List"
              icon={<FiList />}
              onClick={formatList}
            />
          </Tooltip>
          <Tooltip label="Link">
            <IconButton
              aria-label="Link"
              icon={<FiLink />}
              onClick={formatLink}
            />
          </Tooltip>
          <Tooltip label="Image">
            <IconButton
              aria-label="Image"
              icon={<FiImage />}
              onClick={insertImage}
            />
          </Tooltip>
        </ButtonGroup>

        <Text ml="auto" fontSize="xs" color="gray.500" alignSelf="center">
          Markdown formatting supported
        </Text>
      </Flex>

      {/* Text Editor */}
      <Textarea
        ref={textAreaRef}
        value={text}
        onChange={handleChange}
        onSelect={handleSelect}
        onMouseUp={handleSelect}
        onKeyUp={handleSelect}
        p={4}
        minHeight={minHeight}
        fontSize="md"
        lineHeight="1.7"
        borderWidth="0"
        borderRadius="0"
        resize="vertical"
        spellCheck="true"
        backgroundColor={bgColor}
        fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
        _focus={{
          boxShadow: "none",
        }}
      />
    </Box>
  );
};

export default RichTextEditor;
