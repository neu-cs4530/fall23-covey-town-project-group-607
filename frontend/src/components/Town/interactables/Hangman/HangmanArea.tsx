import * as react from '@chakra-ui/react';
import React, { useCallback, useEffect, useState } from 'react';
import HangmanAreaController from '../../../../classes/interactable/HangmanAreaController';
import { useInteractable, useInteractableAreaController } from '../../../../classes/TownController';
import GameAreaInteractable from '../GameArea';
import { GameStatus, HangManLetters, InteractableID } from '../../../../types/CoveyTownSocket';
import useTownController from '../../../../hooks/useTownController';
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Container,
  Heading,
  List,
  ListItem,
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  VStack,
} from '@chakra-ui/react';

export type HangmanBoardProps = {
  gameAreaController: HangmanAreaController;
};

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
    } else if (winner) {
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
        {/* Game in progress, {guessCount} guesses in, {gameAreaController.maxMistakes - mistakes}{' '} */}
        Game in progress, {guessCount} guesses in, {10 - mistakes} guesses left
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
        <ModalHeader>{'HangMan Game'}</ModalHeader>
        <ModalCloseButton />
        <Container>
          <Accordion allowToggle>
            <AccordionItem>
              <Heading as='h3'>
                <AccordionButton>
                  <Box as='span' flex='1' textAlign='left'>
                    Leaderboard
                    <AccordionIcon />
                  </Box>
                </AccordionButton>
              </Heading>
              <AccordionPanel>{/* Will add Hangman leaderboard component here */}</AccordionPanel>
            </AccordionItem>
            <AccordionItem>
              <Heading as='h3'>
                <AccordionButton>
                  <Box as='span' flex='1' textAlign='left'>
                    Current Observers
                    <AccordionIcon />
                  </Box>
                </AccordionButton>
              </Heading>
              <AccordionPanel>
                <List aria-label='list of observers in the game'>
                  {gameAreaController.observers.map(player => {
                    return <ListItem key={player.id}>{player.userName}</ListItem>;
                  })}
                </List>
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
          {gameStatusText}
          <List aria-label='list of players in the game'>
            <ListItem>Players: {/* I dont know if we are adding players names */}</ListItem>
            {gameAreaController.players.map((player, index) => {
              return (
                <ListItem key={player.id}>
                  {index === 0 ? 'Player 1: ' : 'Player 2: '}
                  {player.userName || '(No player yet!)'}
                </ListItem>
              );
            })}
          </List>
          {/* Will add Hangman leaderboard component here */}
          <VStack spacing={4}>
            <div>
              <h3>{mistakes}</h3>
            </div>
            {/* render an h1 element withthe characters in the wordGuess string, separated by spaces, then join them back as a string. */}
            <h1>Current Guess: {wordGuess.split('').join(' ')}</h1>
            <h1>Mistakes: {mistakes}</h1>
            <Box>
              <input
                placeholder='Guess a letter'
                value={letterGuess}
                onChange={e => setLetterGuess(e.target.value)}
                disabled={wordGuess !== '' || gameStatus !== 'IN_PROGRESS'}
              />
              <Button
                colorScheme='green'
                onClick={handleLetterGuess}
                disabled={letterGuess === '' || wordGuess !== '' || gameStatus !== 'IN_PROGRESS'}>
                Guess Letter
              </Button>
            </Box>
            <Box>
              <input
                placeholder='Guess the word'
                value={wordGuess}
                onChange={e => setWordGuess(e.target.value)}
                disabled={letterGuess !== ''}
              />
              <Button
                colorScheme='blue'
                onClick={handleWordGuess}
                disabled={wordGuess === '' || letterGuess !== ''}>
                Guess Word
              </Button>
            </Box>
          </VStack>
          {/* <HangmanBoard gameAreaController={gameAreaController} /> */}
        </Container>
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
      <Modal isOpen={true} onClose={closeModal} closeOnOverlayClick={false}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{gameArea.name}</ModalHeader>
          <ModalCloseButton />
          <HangmanArea interactableID={gameArea.name} />;
        </ModalContent>
      </Modal>
    );
  }
  return <></>;
}
