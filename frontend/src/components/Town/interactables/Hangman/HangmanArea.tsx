import React, { useCallback, useEffect, useState } from 'react';
import HangmanAreaController from '../../../../classes/interactable/HangmanAreaController';
import { useInteractable, useInteractableAreaController } from '../../../../classes/TownController';
import GameAreaInteractable from '../GameArea';
import { GameResult, GameStatus, InteractableID } from '../../../../types/CoveyTownSocket';
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
  useToast,
  VStack,
} from '@chakra-ui/react';
import PlayerController from '../../../../classes/PlayerController';
import HangmanBoard from './HangmanBoard';
import Leaderboard from '../Leaderboard';

export type HangmanBoardProps = {
  gameAreaController: HangmanAreaController;
};

function HangmanArea({ interactableID }: { interactableID: InteractableID }): JSX.Element {
  const gameAreaController = useInteractableAreaController<HangmanAreaController>(interactableID);
  const townController = useTownController();
  const toast = useToast();

  const [mistakes, setMistakes] = useState<number>(gameAreaController.mistakeCount);
  const [guessCount, setGuessCount] = useState<number>(gameAreaController.guessCount);
  const [gameStatus, setGameStatus] = useState<GameStatus>(gameAreaController.status);
  const [player1, setPlayer1] = useState<PlayerController | undefined>(gameAreaController.player1);
  const [player2, setPlayer2] = useState<PlayerController | undefined>(gameAreaController.player2);
  const [player3, setPlayer3] = useState<PlayerController | undefined>(gameAreaController.player3);
  const [player4, setPlayer4] = useState<PlayerController | undefined>(gameAreaController.player4);
  const [observers, setObservers] = useState<PlayerController[]>(gameAreaController.observers);
  const [history, setHistory] = useState<GameResult[]>(gameAreaController.history);
  //const [isModalOpen, setIsModalOpen] = useState(true);
  const [joiningGame, setJoiningGame] = useState(false);

  useEffect(() => {
    // Update guess count and game status when the gameAreaController changes
    // Handle all the game updates
    const updateGameState = () => {
      setGuessCount(gameAreaController.guessCount);
      setGameStatus(gameAreaController.status || 'WAITING_TO_START');
      setMistakes(gameAreaController.mistakeCount);
      setPlayer1(gameAreaController.player1);
      setPlayer2(gameAreaController.player2);
      setPlayer3(gameAreaController.player3);
      setPlayer4(gameAreaController.player4);
      setObservers(gameAreaController.observers);
      setHistory(gameAreaController.history);
    };

    gameAreaController.addListener('gameUpdated', updateGameState);

    const handleGameEnd = () => {
      setMistakes(gameAreaController.mistakeCount);
      const winners = gameAreaController.winner;
      if (!winners || winners.length === 0) {
        toast({
          title: 'Game over',
          description: 'Game ended in a tie',
          status: 'info',
        });
      } else {
        const ourPlayerId = townController.ourPlayer.id;
        if (winners.some(player => player.id === ourPlayerId)) {
          toast({
            title: 'Game over',
            description: 'You are one of the winners!',
            status: 'success',
          });
        } else {
          toast({
            title: 'Game over',
            description: `You lost :(`,
            status: 'error',
          });
        }
        // Display all winners
        const winnerNames = winners.map(winner => winner.userName || `(Player ${winner.id})`);
        toast({
          title: 'Winners',
          description: `Winners: ${winnerNames.join(', ')}`,
          status: 'success',
        });
      }
    };
    gameAreaController.addListener('gameEnd', handleGameEnd);
    return () => {
      gameAreaController.removeListener('gameUpdated', updateGameState);
      gameAreaController.removeListener('gameEnd', handleGameEnd);
    };
  }, [townController, gameAreaController, toast]);

  // const closeModal = () => {
  //   setIsModalOpen(false);
  // };

  let gameStatusText = <></>;
  if (gameStatus === 'IN_PROGRESS') {
    gameStatusText = (
      <>
        Game in progress, {guessCount} guesses in, {10 - mistakes} guesses left, currently{' '}
        {gameAreaController.whoseTurn === townController.ourPlayer
          ? 'your'
          : gameAreaController.whoseTurn?.userName + "'s"}{' '}
        turn
      </>
    );
  } else {
    let joinGameButton = <></>;
    // Check if the game is waiting to start and the current player is not in the game,
    // or if the game is over
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
    <Container>
      {/* <ModalHeader>{'HangMan Game'}</ModalHeader> */}
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
          <AccordionPanel>
            <Leaderboard results={history} /> {/* Will add Hangman leaderboard component here */}
          </AccordionPanel>
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
              {observers.map(player => {
                return <ListItem key={player.id}>{player.userName}</ListItem>;
              })}
            </List>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
      {gameStatusText}
      <List aria-label='list of players in the game'>
        <ListItem>Player 1: {player1?.userName || '(No player yet!)'}</ListItem>
        <ListItem>Player 2: {player2?.userName || '(No player yet!)'}</ListItem>
        <ListItem>Player 3: {player3?.userName || '(No player yet!)'}</ListItem>
        <ListItem>Player 4: {player4?.userName || '(No player yet!)'}</ListItem>
        {gameAreaController.players.map((player, index) => {
          return (
            <ListItem key={player.id}>
              {index === 0 ? 'Player 1: ' : 'Player 2: '}
              {player.userName || '(No player yet!)'}
            </ListItem>
          );
        })}
      </List>
      <VStack>
        <Box>
          <Heading as='h1'>Hangman</Heading>
          <p>{gameStatusText}</p>
        </Box>
        <Box>
          <Heading as='h3'>Word</Heading>
          <p>
            {gameAreaController.word?.split('').map((letter, index) => (
              <span key={index}>
                {gameAreaController.currentGuess.includes(letter) ? letter : ' _ '}
              </span>
            ))}
          </p>
        </Box>
        <Box>
          <Heading as='h3'>Mistakes</Heading>
          <p>{gameAreaController.mistakeCount}</p>
        </Box>
        <Box>
          <Heading as='h3'>Guesses Left</Heading>
          <p>{10 - mistakes}</p>
        </Box>
        <Box>
          <Heading as='h3'>Letters Guessed</Heading>
          <List>
            {gameAreaController.currentGuess.map((letter, index) => (
              <ListItem key={index}>{letter}</ListItem>
            ))}
          </List>
        </Box>
      </VStack>
      <VStack spacing={4}>
        <div>
          <h3>{mistakes}</h3>
        </div>
        {/* render an h1 element with the characters in the wordGuess string, separated by spaces, then join them back as a string. */}
        {/* <h1>Current Guess: {wordGuess.split('').join(' ')}</h1> */}
        <h1>Mistakes: {mistakes}</h1>
      </VStack>
      <HangmanBoard gameAreaController={gameAreaController} />
    </Container>
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
