import React, { useCallback, useEffect, useState } from 'react';
import HangmanAreaController from '../../../../classes/interactable/HangmanAreaController';
import { useInteractable, useInteractableAreaController } from '../../../../classes/TownController';
import GameAreaInteractable from '../GameArea';

import { InteractableID } from '../../../../types/CoveyTownSocket';

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
} from '@chakra-ui/react';
import HangmanBoard from './HangmanBoard';
import HangmanComponent from './HangmanComponent';


export type HangmanBoardProps = {
  gameAreaController: HangmanAreaController;
};

function HangmanArea({ interactableID }: { interactableID: InteractableID }): JSX.Element {
  const gameAreaController = useInteractableAreaController<HangmanAreaController>(interactableID);
  const townController = useTownController();
  const [mistakes, setMistakes] = useState(gameAreaController.mistakeCount);
  const [gameStatus, setGameStatus] = useState(gameAreaController.status);
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [joiningGame, setJoiningGame] = useState(false);
  const [player1, setPlayer1] = useState(gameAreaController.player1);
  const [player2, setPlayer2] = useState(gameAreaController.player2);
  const [player3, setPlayer3] = useState(gameAreaController.player3);
  const [player4, setPlayer4] = useState(gameAreaController.player4);
  const [whoseTurn, setWhoseTurn] = useState(gameAreaController.whoseTurn);
  const [word, setWord] = useState(gameAreaController.word);
  const [winner, setWinner] = useState(gameAreaController.winner);
  const [stateCurrentGuess, setStateCurrentGuess] = useState(gameAreaController.stateCurrentGuess);
  const toast = react.useToast();

  // Handle all the game updates
  const handleGameUpdate = () => {
    setMistakes(gameAreaController.mistakeCount);
    setGameStatus(gameAreaController.status);
    setPlayer1(gameAreaController.player1);
    setPlayer2(gameAreaController.player2);
    setPlayer3(gameAreaController.player3);
    setPlayer4(gameAreaController.player4);
    setWhoseTurn(gameAreaController.whoseTurn);
    setWord(gameAreaController.word);
    setWinner(gameAreaController.winner);
    setMistakes(gameAreaController.mistakeCount);
    setStateCurrentGuess(gameAreaController.stateCurrentGuess);
  };

  const handleGameEnd = () => {
    if (winner === undefined) {
      toast({
        description: 'You lost',
      });
    }
    if (winner?.includes(townController.ourPlayer)) {
      toast({
        description: 'You won!',
      });
    }
  };

  useEffect(() => {
    gameAreaController.addListener('gameUpdated', handleGameUpdate);
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
        {/* Game in progress, {guessCount} guesses in, {gameAreaController.maxMistakes - mistakes}{' '} */}
        Game Status: Game in progress
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
            {player1?.userName ? (
              <ListItem>Player1: {player1.userName}</ListItem>
            ) : (
              <ListItem>Player1: (No player yet!)</ListItem>
            )}
            {player2?.userName ? (
              <ListItem>Player2: {player2.userName}</ListItem>
            ) : (
              <ListItem>Player2: (No player yet!)</ListItem>
            )}
            {player3?.userName ? (
              <ListItem>Player3: {player3.userName}</ListItem>
            ) : (
              <ListItem>Player3: (No player yet!)</ListItem>
            )}
            {player4?.userName ? (
              <ListItem>Player4: {player4.userName}</ListItem>
            ) : (
              <ListItem>Player4: (No player yet!)</ListItem>
            )}
          </List>
          {whoseTurn?.userName ? (
            <p>CurrentTurn: {whoseTurn.userName}</p>
          ) : (
            <p>CurrentTurn: No one</p>
          )}
          <p>Total Mistakes: {mistakes}</p>
          <p>{word}</p>
          <p>CurrentGuess:{stateCurrentGuess?.length}</p>
          {/* <p>Winner:{winner}</p> */}
          <HangmanComponent mistakeCount={mistakes} />
          <HangmanBoard gameAreaController={gameAreaController} />
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
