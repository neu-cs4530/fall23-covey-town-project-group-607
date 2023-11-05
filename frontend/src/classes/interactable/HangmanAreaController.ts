import {
    GameArea,
    GameMove,
    GameStatus,
    HangManGameState,
    HangManMove,
    PlayerID,
  } from '../../types/CoveyTownSocket';

import PlayerController from '../PlayerController';
import GameAreaController, { GameEventTypes } from './GameAreaController';
export const PLAYER_NOT_IN_GAME_ERROR = 'Player is not in game';

export const NO_GAME_IN_PROGRESS_ERROR = 'No game in progress';
export type HangManEvents = GameEventTypes & {
    guessesChanged: (guesses: ReadonlyArray<HangManMove>) => void;
    turnChanged: (isOurTurn: boolean) => void;
  };
/**
 * This class is responsible for managing the state of Hangman Game and for sending commands to the server
 */
export default class HangmanAreaController extends GameAreaController<HangManGameState, HangManEvents> {
    /**
     * Returns the current state of the guesses of the game
     */
    get guesses(): ReadonlyArray<HangManMove> {
        return this._model.game?.state.guesses || [];
    }

    /**
     * Returns the number of mistakes that have been made in the game
     */
    get mistakesCount(): number {
        return this._model.game?.state.mistakes.length || 0;
    }

    /**
     * Returns the winner of the game if there is one
     */
    get winner(): PlayerController[] | undefined {
        const winner: string[] = this._model.game?.state.winner as string[]
        if (winner) {
            let winners: PlayerController[] = []
            for(const occupant of this.occupants) {
                if (occupant.id in winner) {
                    winners.push(occupant)
                }
            }
            return winners;
        }
    }

    /**
     * Returns whos turn it is if the game is in progress
     * returns undefined if the game is not in progress
     */
    get whoseTurn(): PlayerController | undefined {
        return undefined
    }

    /**
     * Check if it is our turn
     */
    get isOurTurn(): boolean {
        return this.whoseTurn?.id === this._townController.ourPlayer?.id
    }

    /**
     * Returns the status of the game
     * defaults to 'WAITING_TO_START' if the game is not in progress
     */
    get status(): GameStatus {
        const status = this._model.game?.state.status
        if (!status) {
            return 'WAITING_TO_START'
        }
        return status
    }

    public isActive(): boolean {
        return this._model.game?.state.status === 'IN_PROGRESS';
    }

    /**
     * Updates the internal state of this HangmanAreaController to match the new model
     * 
     * Calls super._updateFrom, which updates the occupants of the game area and other
     * common properties (including this._model)
     * 
     * If the guesses has changed, emits guessesChanged event with a new list of guesses. If the 
     * list of guesses has not changed, does not emit the event
     * 
     * If the turn has changed, emits a turnChanged event with true if it is our turn, and false otherwise
     * If the turn has not changed, it does not emit the event
     */
    protected _updateFrom(newModel: GameArea<HangManGameState>): void {
        const beforeGuessCount = this.guesses.length;
        const beforeTurn = this.whoseTurn;
        super._updateFrom(newModel);
        const afterGuessCount = this.guesses.length;
        const afterTurn = this.whoseTurn;
        if (beforeGuessCount < afterGuessCount) {
            this.emit("guessChanged", this.guesses)
        }

        if (beforeTurn !== afterTurn) {
            this.emit('turnChanged', this.isOurTurn)
        }
        
    }

    /**
     * Sends a request to the server to make a move in the game
     * 
     * If the game is not in progress, throws an error NO_GAME_IN_PROGRESS_ERROR
     */
    public async makeMove(
        letter?:'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L' | 'M'| 'O' |
        'P' | 'Q' | 'R' | 'S' | 'T' | 'U'| 'V' | 'W' | 'X' | 'Y' | 'Z', 
        word?: string, id?: PlayerID) {
        const hangmanMove: HangManMove = {letterGuess: letter, wordGuess: word, playerID: id}
        const instanceID = this._instanceID;
        if(!instanceID || this._model.game?.state.status !== 'IN_PROGRESS') {
            throw new Error(NO_GAME_IN_PROGRESS_ERROR);
        }
        await this._townController.sendInteractableCommand(this.id, {
            type: 'GameMove',
            gameID: instanceID,
            move: hangmanMove
        })
    }
}