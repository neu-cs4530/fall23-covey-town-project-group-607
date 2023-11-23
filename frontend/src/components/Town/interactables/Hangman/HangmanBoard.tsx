import React, { useState } from 'react';
import { Box, Button, Input, VStack, Text, Heading } from '@chakra-ui/react';
import HangmanAreaController from '../../../../classes/interactable/HangmanAreaController';
import { HangManLetters } from '../../../../types/CoveyTownSocket';
import Hangman from './HangmanComponent';

export type HangmanBoardProps = {
  gameAreaController: HangmanAreaController;
};

export default function HangmanBoard({ gameAreaController }: HangmanBoardProps): JSX.Element {
  const [letterGuess, setLetterGuess] = useState('');
  const [wordGuess, setWordGuess] = useState('');

  const handleLetterGuessSubmit = async () => {
    try {
      await gameAreaController.makeMove(letterGuess as HangManLetters);
      setLetterGuess('');
    } catch (e) {
      console.error('Error making letter guess:', e);
    }
  };

  const handleWordGuessSubmit = async () => {
    try {
      await gameAreaController.makeMove(wordGuess as HangManLetters);
      setWordGuess('');
    } catch (e) {
      console.error('Error making word guess:', e);
    }
  };

  // const handleLetterGuess = async () => {
  //   try {
  //     await gameAreaController.makeMove(letterGuess as HangManLetters, '');
  //     setLetterGuess('');
  //   } catch (e) {
  //     console.error('Unable to submit letter: Please try again.', e);
  //     toast({
  //       title: 'Error',
  //       description: `Error: ${e}`,
  //       status: 'error',
  //     });
  //   }
  // };

  // const handleWordGuess = async () => {
  //   try {
  //     // Check if it's our turn to make a move
  //     if (gameAreaController.isOurTurn) {
  //       // Ensure both letter and word guesses are not submitted at the same time
  //       if (letterGuess !== '' && wordGuess !== '') {
  //         console.error('You can only submit a letter or a word, not both.');
  //         return;
  //       }
  //       await gameAreaController.makeMove(letterGuess as HangManLetters, wordGuess);
  //       setWordGuess('');
  //     }
  //   } catch (e) {
  //     console.error('Unable to submit your guess: Please try again', e);
  //     toast({
  //       title: 'Error',
  //       description: `Error: ${e}`,
  //       status: 'error',
  //     });
  //   }
  // };

  return (
    <VStack spacing={4}>
      <Hangman mistakeCount={gameAreaController.mistakeCount} />
      <Text fontSize='xl'>Current Guess: {gameAreaController.currentGuess.join(' ')}</Text>
      <Text fontSize='xl'>Mistakes: {gameAreaController.mistakeCount}</Text>

      <Box>
        <Heading as='h3'>Guess a Letter</Heading>
        <Input
          placeholder='Guess a letter'
          value={letterGuess}
          maxLength={1}
          onChange={e => setLetterGuess(e.target.value)}
          isDisabled={wordGuess !== ''}
        />
        <Button
          colorScheme='blue'
          onClick={handleLetterGuessSubmit}
          isDisabled={letterGuess === '' || wordGuess !== ''}>
          Guess Letter
        </Button>
      </Box>
      <Box>
        <Heading as='h3'>Guess the Word</Heading>
        <Input
          placeholder='Guess the word'
          value={wordGuess}
          onChange={e => setWordGuess(e.target.value)}
          isDisabled={letterGuess !== ''}
        />
        <Button
          colorScheme='blue'
          onClick={handleWordGuessSubmit}
          isDisabled={wordGuess === '' || letterGuess !== ''}>
          Guess Word
        </Button>
      </Box>
    </VStack>
  );
}
