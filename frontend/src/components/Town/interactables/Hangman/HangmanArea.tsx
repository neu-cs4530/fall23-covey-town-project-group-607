import * as react from '@chakra-ui/react';
import React, { useCallback, useEffect, useState } from 'react';
import HangmanAreaController from '../../../../classes/interactable/HangmanAreaController';
import { useInteractable, useInteractableAreaController } from '../../../../classes/TownController';
import GameAreaInteractable from '../GameArea';
import { GameStatus, HangManLetters, InteractableID } from '../../../../types/CoveyTownSocket';
import useTownController from '../../../../hooks/useTownController';
import {
  Box,
  Button,
  Input,
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  VStack,
} from '@chakra-ui/react';

function HangmanArea({ interactableID }: { interactableID: InteractableID }): JSX.Element {
  const gameAreaController = useInteractableAreaController<HangmanAreaController>(interactableID);
  const townController = useTownController();
  const [mistakes, setMistakes] = useState<number>(gameAreaController.mistakeCount);
  const [guessCount, setGuessCount] = useState<number>(gameAreaController.guessCount);
  const [gameStatus, setGameStatus] = useState<GameStatus>(gameAreaController.status);
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [joiningGame, setJoiningGame] = useState(false);
  const [letterGuess, setLetterGuess] = useState('');
  const [wordGuess, setWordGuess] = useState('');
  const toast = react.useToast();

  // Handle all the game updates
  const handleGameUpdate = () => {
    setMistakes(gameAreaController.mistakeCount);
  };

  const handleGameEnd = () => {
    setMistakes(gameAreaController.mistakeCount);
    setIsModalOpen(false);
    const winner = gameAreaController.winner;
    if (!winner) {
      toast({
        title: 'Game over',
        description: 'Game ended in a tie',
        status: 'info',
      });
    } else if (winner === townController.ourPlayer) {
      toast({
        title: 'Game over',
        description: 'You won!',
        status: 'success',
      });
    } else {
      toast({
        title: 'Game over',
        description: `You lost :(`,
        status: 'error',
      });
    }
  };

  const handleLetterGuess = async () => {
    try {
      await gameAreaController.makeMove(letterGuess as HangManLetters, '');
      setLetterGuess('');
    } catch (e) {
      console.error('Unable to submit letter:', e);
    }
  };

  const handleWordGuess = async () => {
    try {
      await gameAreaController.makeMove(letterGuess as HangManLetters, wordGuess); //fix
      setWordGuess('');
    } catch (e) {
      console.error('Unable to submit word:', e);
    }
  };

  useEffect(() => {
    gameAreaController.addListener('gameUpdated', handleGameUpdate);
    gameAreaController.addListener('gameEnd', handleGameEnd);

    return () => {
      gameAreaController.removeListener('gameUpdated', handleGameUpdate);
      gameAreaController.removeListener('gameEnd', handleGameEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [townController, gameAreaController, toast]);

  const closeModal = () => {
    setIsModalOpen(false);
  };

  let gameStatusText = <></>;
  if (gameStatus === 'IN_PROGRESS') {
    gameStatusText = (
      <>
        Game in progress, {guessCount} guesses in, {gameAreaController.maxMistakes - mistakes}{' '}
        guesses left
      </>
    );
  } else {
    let joinGameButton = <></>;
    if (
      (gameAreaController.status === 'WAITING_TO_START' && !gameAreaController.isPlayer) ||
      gameAreaController.status === 'OVER'
    ) {
      joinGameButton = (
        <Button
          onClick={async () => {
            setJoiningGame(true);
            try {
              await gameAreaController.joinGame();
            } catch (err) {
              toast({
                title: 'Error joining game',
                description: (err as Error).toString(),
                status: 'error',
              });
            }
            setJoiningGame(false);
          }}
          isLoading={joiningGame}
          disabled={joiningGame}>
          Join New Game
        </Button>
      );
    }
    gameStatusText = (
      <b>
        Game {gameStatus === 'WAITING_TO_START' ? 'not yet started' : 'over'}. {joinGameButton}
      </b>
    );
  }

  return (
    <Modal isOpen={isModalOpen} onClose={closeModal} closeOnOverlayClick={false}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{gameAreaController.name}</ModalHeader>
        <ModalCloseButton />
        <VStack spacing={4}>
          {/* <Hangman mistakeCount={mistakes} /> */}
          <div>
            <h3>{mistakes}</h3>
          </div>
          <h1>Current Guess: {wordGuess.join(' ')}</h1>
          <h1>Mistakes: {mistakes}</h1>
          <h1>Mistakes: {gameAreaController.mistakeCount}</h1>
          <Box>
            <Input
              placeholder='Guess a letter'
              value={letterGuess}
              onChange={e => setLetterGuess(e.target.value)}
              isDisabled={wordGuess !== ''}
            />
            <Button
              colorScheme='blue'
              onClick={handleLetterGuess}
              isDisabled={letterGuess === '' || wordGuess !== ''}>
              Guess Letter
            </Button>
          </Box>
          <Box>
            <Input
              placeholder='Guess the word'
              value={wordGuess}
              onChange={e => setWordGuess(e.target.value)}
              isDisabled={letterGuess !== ''}
            />
            <Button
              colorScheme='blue'
              onClick={handleWordGuess}
              isDisabled={wordGuess === '' || letterGuess !== ''}>
              Guess Word
            </Button>
          </Box>
        </VStack>
      </ModalContent>
    </Modal>
  );
}

/**
 * A wrapper component for the HangmanArea component.
 * Determines if the player is currently in a hang man game area on the map, and if so,
 * renders the HangmanArea component in a modal.
 *
 */
export default function HangmanAreaWrapper(): JSX.Element {
  const gameArea = useInteractable<GameAreaInteractable>('gameArea');
  const townController = useTownController();
  const closeModal = useCallback(() => {
    if (gameArea) {
      townController.interactEnd(gameArea);
      const controller = townController.getGameAreaController(gameArea);
      controller.leaveGame();
    }
  }, [townController, gameArea]);

  if (gameArea && gameArea.getData('type') === 'Hangman') {
    return (
      <react.Modal isOpen={true} onClose={closeModal} closeOnOverlayClick={false}>
        <react.ModalOverlay />
        <react.ModalContent>
          <react.ModalHeader>{gameArea.name}</react.ModalHeader>
          <react.ModalCloseButton />
          <HangmanArea interactableID={gameArea.name} />;
        </react.ModalContent>
      </react.Modal>
    );
  }
  return <></>;
}
