import React, { useState, useEffect } from 'react';
import { Box, Button } from '@chakra-ui/react';
import HangmanAreaController from '../../../../classes/interactable/HangmanAreaController'; // Adjust the import path as needed

export type HangmanBoardProps = {
  gameAreaController: HangmanAreaController;
};

const HangmanBoard = ({ gameAreaController }: HangmanBoardProps): JSX.Element => {
  const [currentGuess, setCurrentGuess] = useState<string[]>(gameAreaController.currentGuess);
  const [mistakeCount, setMistakeCount] = useState<number>(gameAreaController.mistakeCount);

  useEffect(() => {
    const handleBoardChange = (newGuess: string[]) => {
      setCurrentGuess(newGuess);
    };

    const handleTurnChange = (isOurTurn: boolean) => {
      // Handle turn change logic here
    };

    gameAreaController.addListener('boardChanged', handleBoardChange);
    gameAreaController.addListener('turnChanged', handleTurnChange);

    return () => {
      gameAreaController.removeListener('boardChanged', handleBoardChange);
      gameAreaController.removeListener('turnChanged', handleTurnChange);
    };
  }, [gameAreaController]);

  const renderWord = () => {
    return currentGuess.map((letter, index) => (
      <Box key={index} as="span" m={1}>
        {letter || '_'}
      </Box>
    ));
  };

  const handleGuess = async (letter: string) => {
    try {
      await gameAreaController.makeMove(letter);
    } catch (error) {
      console.error('Error making move:', error);
    }
  };

  return (
    <Box>
      <Box>{renderWord()}</Box>
      {/* Add buttons or inputs for making guesses */}
      {/* Example: */}
      <Button onClick={() => handleGuess('A')}>Guess 'A'</Button>
      {/* Display mistake count or hangman figure */}
      <Box>Mistakes: {mistakeCount}</Box>
    </Box>
  );
};

export default HangmanBoard;
