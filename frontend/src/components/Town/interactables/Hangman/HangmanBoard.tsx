import React, { useState, useEffect } from 'react';
import { Box, Button, Input, VStack, Text } from '@chakra-ui/react';
import HangmanAreaController from '../../../../classes/interactable/HangmanAreaController';
import { HangManLetters } from '../../../../types/CoveyTownSocket';

export type HangmanBoardProps = {
  gameAreaController: HangmanAreaController;
};

export default function HangmanBoard({ gameAreaController }: HangmanBoardProps): JSX.Element {
  const [letterGuess, setLetterGuess] = useState('');
  const [wordGuess, setWordGuess] = useState('');
  const [displayedWord, setDisplayedWord] = useState('');
  // const [guessesSoFar, setGuessesSoFar] = useState('');
  const [isOurTurn, setIsOurTurn] = useState(gameAreaController.isOurTurn);
  const [currentGuess, setCurrentGuess] = useState(gameAreaController.currentGuess);
  const [occupants, setOccupants] = useState(gameAreaController.occupants);
  // const toast = useToast();

  useEffect(() => {
    const handleBoardChanged = () => {
      setCurrentGuess(gameAreaController.currentGuess);
      setOccupants(gameAreaController.occupants);
      setWord(gameAreaController.word);
    };

    const handleTurnChanged = () => {
      setIsOurTurn(gameAreaController.isOurTurn);
    };
    // Update the displayed word when the current guess changes
    const newDisplayedWord = currentGuess?.map(letter => letter || '_ ').join('');
    setDisplayedWord(newDisplayedWord);
    gameAreaController.addListener('boardChanged', handleBoardChanged);
    gameAreaController.addListener('turnChanged', handleTurnChanged);
    return () => {
      gameAreaController.removeListener('boardChanged', handleBoardChanged);
      gameAreaController.removeListener('turnChanged', handleTurnChanged);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [HangmanBoard]);

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
      await gameAreaController.makeMove(wordGuess as HangManLetters);
      setWordGuess('');
      gameAreaController.updateFrom(gameAreaController.toInteractableAreaModel(), occupants);
    } catch (e) {
      console.error('Error making word guess:', e);
    }
  };

  return (
    <VStack spacing={4}>
      <Text fontSize='xl'>Word: {displayedWord}</Text>

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
