import {
  ConversationArea,
  Interactable,
  TicTacToeGameState,
  ViewingArea,
  GameArea,
  HangManGameState,
} from './CoveyTownSocket';

/**
 * Test to see if an interactable is a conversation area
 */
export function isConversationArea(interactable: Interactable): interactable is ConversationArea {
  return interactable.type === 'ConversationArea';
}

/**
 * Test to see if an interactable is a viewing area
 */
export function isViewingArea(interactable: Interactable): interactable is ViewingArea {
  return interactable.type === 'ViewingArea';
}

export function isTicTacToeArea(
  interactable: Interactable,
): interactable is GameArea<TicTacToeGameState> {
  return interactable.type === 'TicTacToeArea';
}

export function isHangmanArea(
  interactable: Interactable,
): interactable is GameArea<HangManGameState> {
  return interactable.type === 'HangmanArea';
}
