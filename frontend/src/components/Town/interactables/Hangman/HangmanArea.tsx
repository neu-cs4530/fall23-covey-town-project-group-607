import * as react from '@chakra-ui/react';
import React, { useCallback, useEffect, useState } from 'react';
import HangmanAreaController from '../../../../classes/interactable/HangmanAreaController';
import { useInteractable, useInteractableAreaController } from '../../../../classes/TownController';
import GameAreaInteractable from '../GameArea';
import { InteractableID } from '../../../../types/CoveyTownSocket';
import useTownController from '../../../../hooks/useTownController';

function HangmanArea({ interactableID }: { interactableID: InteractableID }): JSX.Element {
  const gameAreaController = useInteractableAreaController<HangmanAreaController>(interactableID);
  const [mistakes, setMistakes] = useState(gameAreaController.mistakeCount);

  // Handle all the game updates
  const handleGameUpdate = () => {
    setMistakes(gameAreaController.mistakeCount);
  };

  const handleGameEnd = () => {
    setMistakes(gameAreaController.mistakeCount);
  };

  useEffect(() => {
    gameAreaController.addListener('gameUpdated', handleGameUpdate);
    gameAreaController.addListener('gameEnd', handleGameEnd);

    return () => {
      gameAreaController.removeListener('gameUpdated', handleGameUpdate);
      gameAreaController.removeListener('gameEnd', handleGameEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameAreaController]);
  return (
    <div>
      <h3>{mistakes}</h3>
    </div>
  );
}

/**
 * A wrapper component for the TicTacToeArea component.
 * Determines if the player is currently in a tic tac toe area on the map, and if so,
 * renders the TicTacToeArea component in a modal.
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
