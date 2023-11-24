import {
  GameArea,
  GameMoveCommand,
  GameStatus,
  HangManGameState,
  HangManLetters,
  HangManMove,
} from '../../types/CoveyTownSocket';
import PlayerController from '../PlayerController';
import GameAreaController, { GameEventTypes } from './GameAreaController';

export const PLAYER_NOT_IN_GAME_ERROR = 'Player is not in game';

export const NO_GAME_IN_PROGRESS_ERROR = 'No game in progress';

export type HangManEvents = GameEventTypes & {
  boardChanged: (board: string[]) => void;
  turnChanged: (isOurTurn: boolean) => void;
};

export default class HangmanAreaController extends GameAreaController<
  HangManGameState,
  HangManEvents
> {
  /**
   * Checks if the game is currently active or not
   */
  public isActive(): boolean {
    return this._model.game?.state.status === 'IN_PROGRESS';
  }

  /**
   * Returns the status of the game.
   * Defaults to 'WAITING_TO_START' if the game is not in progress
   */
  get status(): GameStatus {
    const status = this._model.game?.state.status;
    if (!status) {
      return 'WAITING_TO_START';
    }
    return status;
  }

  /**
   * Gets the total amount of mistakes in the game
   */
  get mistakeCount() {
    return this._model.game?.state.mistakes.length || 0;
  }

  /**
   * Gets the total amount of guesses in the game
   */
  get guess() {
    return this._model.game?.state.guesses;
  }

  /**
   * Gets the total amount of guesses in the game
   */
  get guessCount() {
    return this._model.game?.state.guesses.length || 0;
  }

  /**
   * Gets an array of the letters that are guessed in the hangman game
   */
  get currentGuess() {
    const theWord = this._model.game?.state.word;

    //Intializes the currentGuess array
    const currentGuessArray = [];
    if (theWord) {
      for (let i = 0; i < theWord?.length; i++) {
        currentGuessArray[i] = '';
      }
    }

    // If the guessword === array then we fill all the letters
    // If the letterword === some of the array we fill the letters
    //Adds the letters to the array if guessed
    if (this._model.game?.state.guesses) {
      for (const guess of this._model.game.state.guesses) {
        if (guess.letterGuess) {
          if (theWord?.includes(guess.letterGuess)) {
            for (let k = 0; k < theWord.length; k++) {
              if (theWord[k] === guess.letterGuess) {
                currentGuessArray[k] = guess.letterGuess;
              }
            }
          }
        }
        if (guess.wordGuess) {
          if (guess.wordGuess === theWord) {
            for (let j = 0; j < theWord.length; j++) {
              currentGuessArray[j] = theWord[j];
            }
          }
        }
      }
      return currentGuessArray;
    }
    return currentGuessArray;
  }

  /**
   * Gets an array of the letters that are guessed in the hangman game
   */
  get word() {
    return this._model.game?.state.word;
  }

  /**
   * Returns the winner of the game, if there is one
   */
  get winner(): PlayerController[] | undefined {
    const winner = this._model.game?.state.winner;
    const allWinners = [];
    if (winner) {
      for (const player of winner) {
        allWinners.push(this._townController.getPlayer(player));
      }
      return allWinners;
    }
    return undefined;
  }

  /**
   * Returns the player whose turn it is, if the game is in progress
   * Returns undefined if the game is not in progress
   */
  get whoseTurn(): PlayerController | undefined {
    if (this._model.game?.state.status !== 'IN_PROGRESS') {
      return undefined;
    }
    const totalMoves = this._model.game.state.guesses.length;
    const totalPlayers = this._players.length;
    const currentTurnIndex = totalMoves % totalPlayers;
    const currentTurn = this._players[currentTurnIndex].id;
    if (currentTurn) {
      return this._townController.getPlayer(currentTurn);
    }
  }

  /**
   * Returns true if it is our turn to make a move in the game
   * Returns false if it is not our turn, or if the game is not in progress
   */
  get isOurTurn(): boolean {
    if (this._model.game?.state.status !== 'IN_PROGRESS') {
      return false;
    }
    if (this._townController.ourPlayer === this.whoseTurn) {
      return true;
    }
    return false;
  }

  /**
   * Returns true if the current player is a player in this game
   */
  get isPlayer(): boolean {
    return this._model.game?.players.includes(this._townController.ourPlayer.id) || false;
  }

  /**
   * Returns the first player
   */
  get player1(): PlayerController | undefined {
    const player = this._model.game?.state.player1;
    if (player) {
      return this._townController.getPlayer(player);
    }
    return undefined;
  }

  /**
   * Returns the second player
   */
  get player2(): PlayerController | undefined {
    const player = this._model.game?.state.player2;
    if (player) {
      return this._townController.getPlayer(player);
    }
    return undefined;
  }

  /**
   * Returns the third player
   */
  get player3(): PlayerController | undefined {
    const player = this._model.game?.state.player3;
    if (player) {
      return this._townController.getPlayer(player);
    }
    return undefined;
  }

  /**
   * Returns the fourth player
   */
  get player4(): PlayerController | undefined {
    const player = this._model.game?.state.player4;
    if (player) {
      return this._townController.getPlayer(player);
    }
    return undefined;
  }

  protected _updateFrom(newModel: GameArea<HangManGameState>): void {
    //Initialize the past states fo the board
    const currentGuess = this.currentGuess;
    const previousTurn = this.isOurTurn;
    super._updateFrom(newModel);
    //TODO
    if (this._checkArrays(currentGuess, this.currentGuess)) {
      this.emit('boardChanged', this.currentGuess);
    }
    if (this.isOurTurn !== previousTurn) {
      this.emit('turnChanged', this.isOurTurn);
    }
  }

  /**
   * Helper function to check if the arrays are the same or not
   * @param board1 The first board
   * @param board2 The second board
   * @returns true if there is a difference between the boards and false if the boards are the same.
   */
  private _checkArrays(board1: string[], board2: string[]): boolean {
    for (let i = 0; i < board1.length; i++) {
      if (board1[i] !== board2[i]) {
        return true;
      }
    }
    return false;
  }

  /**
   * Sends a request to the server to make a move in the game
   *
   * If the game is not in progress, throws an error NO_GAME_IN_PROGRESS_ERROR
   *
   * @param letter the letter of the guess
   * @param word the word of the guess
   */
  public async makeMove(letter?: HangManLetters, word?: string) {
    if (!this.isActive || !this._instanceID) {
      throw new Error(NO_GAME_IN_PROGRESS_ERROR);
    }

    const playerMove: HangManMove = {
      playerID: this._townController.ourPlayer.id,
      wordGuess: word,
      letterGuess: letter,
    };
    const request: GameMoveCommand<HangManMove> = {
      type: 'GameMove',
      gameID: this._instanceID,
      move: playerMove,
    };
    await this._townController.sendInteractableCommand(this.id, request);
  }
}
