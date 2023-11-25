import React from 'react';
import { Box, VStack, Circle, Text, HStack } from '@chakra-ui/react';

export type HangmanProps = {
  mistakeCount: number;
};

const HangmanComponent: React.FC<HangmanProps> = ({ mistakeCount }) => {
  return (
    <VStack spacing={0} align='center' position='relative' paddingBottom='20px'>
      {/* Ground Base */}
      <Box height='30px'>
        {mistakeCount > 0 && (
          <Text fontSize='2xl' position='absolute' bottom='4'>
            _____
          </Text>
        )}
      </Box>
      {/* Vertical Post */}
      <Box height='100px' position='relative'>
        {mistakeCount > 1 && (
          <>
            <Text fontSize='2xl' position='absolute' bottom='0px' left='2'>
              |
            </Text>
            <Text fontSize='2xl' position='absolute' bottom='20px' left='2'>
              |
            </Text>
            <Text fontSize='2xl' position='absolute' bottom='40px' left='2'>
              |
            </Text>
            <Text fontSize='2xl' position='absolute' bottom='60px' left='2'>
              |
            </Text>
            <Text fontSize='2xl' position='absolute' bottom='70px' left='2'>
              |
            </Text>
          </>
        )}
        {/* Horizontal Beam */}
        {mistakeCount > 3 && (
          <HStack position='absolute' bottom='90px' left='0px'>
            <Text fontSize='2xl'>_____</Text>
          </HStack>
        )}
        {/* Support Brace */}
        {mistakeCount > 2 && (
          <Text fontSize='2xl' position='absolute' left='10px' bottom='70px'>
            /
          </Text>
        )}
        {/* Rope */}
        {mistakeCount > 4 && (
          <>
            {' '}
            <Text fontSize='2xl' position='absolute' left='28px' top='0px'>
              |
            </Text>
            <Text fontSize='2xl' position='absolute' left='28px' bottom='70px'>
              |
            </Text>
          </>
        )}
        {/* Head */}
        {mistakeCount > 5 && (
          <Circle size='10px' bg='black' position='absolute' left='25px' top='30px' />
        )}
        {/* Body */}
        {mistakeCount > 6 && (
          <Text fontSize='2xl' position='absolute' left='28px' top='30px'>
            |
          </Text>
        )}
        {/* Arms */}
        {mistakeCount > 7 && (
          <Box position='absolute' left='25px' top='35px'>
            <Text fontSize='2xl'>/</Text>
          </Box>
        )}
        {mistakeCount > 8 && (
          <Box position='absolute' left='30px' top='35px'>
            <Text fontSize='2xl'>\</Text>
          </Box>
        )}
        {/* Legs */}
        {mistakeCount > 9 && (
          <Box position='absolute' left='25px' top='50px'>
            <Text fontSize='2xl'>/</Text>
          </Box>
        )}
        {
          (mistakeCount = 10 && (
            <Box position='absolute' left='30px' top='50px'>
              <Text fontSize='2xl'>\</Text>
            </Box>
          ))
        }
      </Box>
    </VStack>
  );
};

export default HangmanComponent;
