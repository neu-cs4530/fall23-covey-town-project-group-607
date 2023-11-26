import React, { useState, useEffect } from 'react';
import { Box, Button, Input, VStack, Text } from '@chakra-ui/react';
import HangmanAreaController from '../../../../classes/interactable/HangmanAreaController';
import { HangManLetters, HangManMove } from '../../../../types/CoveyTownSocket';

export type HangmanBoardProps = {
  gameAreaController: HangmanAreaController;
};

export default function HangmanBoard({ gameAreaController }: HangmanBoardProps): JSX.Element {
  const [letterGuess, setLetterGuess] = useState('');
  const [wordGuess, setWordGuess] = useState('');
  const [displayedWord, setDisplayedWord] = useState('');
  const [mistakes, setMistakes] = useState<ReadonlyArray<HangManMove>>([]);
  const [isOurTurn, setIsOurTurn] = useState(gameAreaController.isOurTurn);
  const [occupants] = useState(gameAreaController.occupants);
  // const toast = useToast();

  useEffect(() => {
    const handleBoardChanged = () => {
      // Directly use gameAreaController.currentGuess to update displayedWord
      const newDisplayedWord = gameAreaController.currentGuess
        .map(letter => letter || '_ ')
        .join('');
      setDisplayedWord(newDisplayedWord);
      setMistakes(gameAreaController.mistakes);
      console.log('Mistakes:', mistakes);
    };

    const handleTurnChanged = () => {
      setIsOurTurn(gameAreaController.isOurTurn);
    };

    gameAreaController.addListener('boardChanged', handleBoardChanged);
    gameAreaController.addListener('turnChanged', handleTurnChanged);

    // Initial update for displayedWord
    handleBoardChanged();

    return () => {
      gameAreaController.removeListener('boardChanged', handleBoardChanged);
      gameAreaController.removeListener('turnChanged', handleTurnChanged);
    };
  }, [gameAreaController, mistakes]);

  const guessedLetters = Array.from(mistakes)
    .map(move => move.letterGuess)
    .filter(Boolean);

  const handleLetterGuessSubmit = async () => {
    try {
      await gameAreaController.makeMove(letterGuess as HangManLetters);
      setLetterGuess('');
      gameAreaController.updateFrom(gameAreaController.toInteractableAreaModel(), occupants);
    } catch (e) {
      console.error('Error making letter guess:', e);
    }
  };

  const handleWordGuessSubmit = async () => {
    try {
      await gameAreaController.makeMove(undefined, wordGuess);
      setWordGuess('');
      gameAreaController.updateFrom(gameAreaController.toInteractableAreaModel(), occupants);
    } catch (e) {
      console.error('Error making word guess:', e);
    }
  };

  return (
    <VStack spacing={4}>
      <Text fontSize='xl'>Word: {displayedWord}</Text>

      {/* Display guessed letters */}
      <Text fontSize='md'>Guessed Letters: {guessedLetters.join(', ')}</Text>

      <Box>
        <Input
          placeholder='Guess a letter'
          value={letterGuess}
          onChange={e => setLetterGuess(e.target.value)}
          isDisabled={wordGuess !== '' || !isOurTurn}
        />
        <Button
          colorScheme='blue'
          onClick={handleLetterGuessSubmit}
          isDisabled={letterGuess === '' || wordGuess !== ''}>
          Guess Letter
        </Button>
      </Box>

      <Box>
        <Input
          placeholder='Guess the word'
          value={wordGuess}
          onChange={e => setWordGuess(e.target.value)}
          isDisabled={letterGuess !== '' || !isOurTurn}
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
