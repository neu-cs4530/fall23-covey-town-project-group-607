import React from 'react';
import { Box, VStack, HStack, Circle, Text } from '@chakra-ui/react';

export type HangmanProps = {
  mistakeCount: number;
};

const Hangman: React.FC<HangmanProps> = ({ mistakeCount }) => {
  return (
    <VStack spacing={2}>
      {/* Ground Base */}
      {mistakeCount > 0 && (
        <Box height="20px">
          <Text fontSize="2xl">___</Text>
        </Box>
      )}
      {/* Post */}
      {mistakeCount > 1 && (
        <Box height="60px">
          <Text fontSize="2xl">|</Text>
        </Box>
      )}
      {/* Support Brace */}
      {mistakeCount > 2 && (
        <HStack>
          <Box width="20px">
            <Text fontSize="2xl">/</Text>
          </Box>
        </HStack>
      )}
      {/* Long Brace (Extending Beam) */}
      {mistakeCount > 3 && (
        <Box height="20px">
          <Text fontSize="2xl">-</Text>
        </Box>
      )}
      {/* Rope */}
      {mistakeCount > 4 && (
        <Box height="20px">
          <Text fontSize="2xl">|</Text>
        </Box>
      )}
      {/* Head */}
      {mistakeCount > 5 && (
        <Box height="20px">
          <Circle size="10px" bg="black" />
        </Box>
      )}
      {/* Body */}
      {mistakeCount > 6 && (
        <Box height="50px">
          <Text fontSize="2xl">|</Text>
        </Box>
      )}
      {/* Arms */}
      {mistakeCount > 7 && (
        <HStack>
          <Box width="20px">
            <Text fontSize="2xl">/</Text>
          </Box>
          <Box width="20px">
            {mistakeCount > 8 && <Text fontSize="2xl">\</Text>}
          </Box>
        </HStack>
      )}
      {/* Legs */}
      {mistakeCount > 9 && (
        <HStack>
          <Box width="20px">
            <Text fontSize="2xl">/</Text>
          </Box>
          <Box width="20px">
            {mistakeCount > 10 && <Text fontSize="2xl">\</Text>}
          </Box>
        </HStack>
      )}
    </VStack>
  );
};

export default Hangman;

