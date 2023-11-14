import React, { useState } from 'react';
import { Box, Button, Input, VStack, Text } from '@chakra-ui/react';
import HangmanAreaController from '../../../../classes/interactable/HangmanAreaController';
import { HangManLetters, HangManMove } from '../../../../types/CoveyTownSocket';
import Hangman from './HangmanComponent'

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

  return (
    <VStack spacing={4}>
            <Hangman mistakeCount={gameAreaController.mistakeCount} />
      <Text fontSize="xl">Current Guess: {gameAreaController.currentGuess.join(' ')}</Text>
      <Text fontSize="xl">Mistakes: {gameAreaController.mistakeCount}</Text>

      <Box>
        <Input 
          placeholder="Guess a letter" 
          value={letterGuess}
          onChange={(e) => setLetterGuess(e.target.value)}
          isDisabled={wordGuess !== ''}
        />
        <Button 
          colorScheme="blue" 
          onClick={handleLetterGuessSubmit}
          isDisabled={letterGuess === '' || wordGuess !== ''}
        >
          Guess Letter
        </Button>
      </Box>

      <Box>
        <Input 
          placeholder="Guess the word" 
          value={wordGuess}
          onChange={(e) => setWordGuess(e.target.value)}
          isDisabled={letterGuess !== ''}
        />
        <Button 
          colorScheme="blue" 
          onClick={handleWordGuessSubmit}
          isDisabled={wordGuess === '' || letterGuess !== ''}
        >
          Guess Word
        </Button>
      </Box>
    </VStack>
  );
}

