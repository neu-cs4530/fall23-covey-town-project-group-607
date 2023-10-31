import { move } from 'ramda';
import InvalidParametersError, {
    BOARD_POSITION_NOT_EMPTY_MESSAGE,
    GAME_FULL_MESSAGE,
    GAME_NOT_IN_PROGRESS_MESSAGE,
    MOVE_NOT_YOUR_TURN_MESSAGE,
    PLAYER_ALREADY_IN_GAME_MESSAGE,
    PLAYER_NOT_IN_GAME_MESSAGE,
    INVALID_MOVE_MESSAGE
  } from '../../lib/InvalidParametersError';
import Player from '../../lib/Player';
import { GameMove, HangmanGameState, HangmanMove } from '../../types/CoveyTownSocket';
import Game from './Game';

/**
 * A HangmanGame is a game that implements the rules of Hangman
 */
export default class HangmanGame extends Game<HangmanGameState, HangmanMove>{
    public currentGuess: string[];
    public constructor() {
        super({
            guesses: [],
            mistakes: [],
            word: 'apple',
            status:'WAITING_TO_START',
        });
        this.currentGuess = [];
        // initialize currentGuesses
        for(const i of this.state.word) {
            this.currentGuess.push('')
        }

    }

    /**
     * Applies a player's move to the Hangman game.
     * Validates the move before applyin git. If the move is invalid, throws an InvalidParametersError
     * with the error message specified below.
     * A move is invalid if:
     *      - letterGuess & wordGuess are both undefined (INVALID_MOVE_MESSAGE)
     *      - The move is not the player's turn (MOVE_NOT_YOUR_TURN_MESSAGE)
     *      - the game is not in progress (GAME_NOT_IN_PROGRESS_MESSAGE)
     *      - Player is not in the game (PLAYER_NOT_IN_GAME_MESSAGE)
     * If the move is valid, applied the move to the game and updates the game state.
     * 
     * If the move ends the game (guesses the whole word either the last valid letter is given or guessed word matches the word), updates the game's state
     * If the move results in a lose, updated the game's state to set the status to OVER and sets the winner to undefined (not sure what to set the winner to by player1? represent the whole team)
     * If the move results in a win, updates the game's state to set the status to OVER and sets the winner to the player who made the move
     * The players win if their guessedWord is the same as word or guessLetter is the last and correct letter guess (currentGuess matches word)
     * @param move 
     */
    public applyMove(move: GameMove<HangmanMove>): void {
        // check if letterGuess and wordGuess is not given
        if(move.move.letterGuess === undefined && move.move.wordGuess === undefined) {
            throw new InvalidParametersError(INVALID_MOVE_MESSAGE);
        } // check if the game is IN_PROGRESS 
        else if(this.state.status !== 'IN_PROGRESS') {
            throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
        }

        // if not the player's turn
        if((this.state.guesses.length % 4 === 0 && move.playerID !== this.state.player1) ||
            (this.state.guesses.length % 1 === 0 && move.playerID !== this.state.player2) ||
            (this.state.guesses.length % 2 === 0 && move.playerID !== this.state.player3) ||
            (this.state.guesses.length % 3 === 0 && move.playerID !== this.state.player4)
            ) {
                throw new InvalidParametersError(MOVE_NOT_YOUR_TURN_MESSAGE);
            }
        
        // apply move after checking if the move is invalid
        this._validMove(move);
    }

    /**
     * Adds the player's move, updates the game state, and adds the player's move to this.guesses
     * Then it alternates the turn to the next player
     * @param player_move is the player's move
     */
    private _validMove(player_move: GameMove<HangmanMove>): void {
        // add move to the guesses list and update game status
        const updatedGuesses = [...this.state.guesses, player_move]
        let updatedMistakes = [...this.state.mistakes, player_move]

        // if the move is given a letterGuess
        if(player_move.move.letterGuess) {
            const letterGuess = player_move.move.letterGuess;
            // check if word contains that letter first
            if(this.state.word.includes(letterGuess)) {
                // add correct letter guess to currentGuess at the correct index
                const index = this.state.word.indexOf(letterGuess);
                this.currentGuess[index] = letterGuess;
                this.state = {
                    ...this.state,
                    guesses: updatedGuesses
                }
            } // if the word does not contain that letter add to mistakes
            else {

                // check to see if the amount of mistakes after updating the mistakes is 6
                if(updatedMistakes.length === 6) {
                    // change the game state to be OVER
                    this.state = {
                        ...this.state,
                        guesses: updatedGuesses,
                        mistakes: updatedMistakes,
                        status: 'OVER'
                    }
                } else {
                    this.state = {
                        ...this.state,
                        guesses: updatedGuesses,
                        mistakes: updatedMistakes,
                    }
                }
            }
        }

        // if the move is given a wordGuess
        if(player_move.move.wordGuess) {
            const wordGuess = player_move.move.wordGuess;
            // check if the word matches with the guessed word
            if(this.state.word === wordGuess) {
                // add the word to guesses
                this.state = {
                    ...this.state,
                    guesses: updatedGuesses,
                    status: 'OVER',
                    winner: player_move.playerID
                }
            } // check if the word does not match guessed word
            else {
                // add the word to guesses and mistakes
                this.state = {
                    ...this.state,
                    guesses: updatedGuesses,
                    mistakes: updatedMistakes
                }
            }
        }

    }

    /**
     * Adds a player to the game.
     * Updates the game's state to reflect the new player
     * If the game is now full (has 4 players), updates the game's state to set the status IN_PROGRESS
     * 
     * @param player The player to join the game
     * @throws InvalidParametersError if the player is already in the game (PLAYER_ALREADY_IN_GAME_MESSAGE)
     *  or the game is full (GAME_FULL_MESSAGE) or if the game is not WAITING_TO_START (AME_NOT_IN_PROGRESS_MESSAGE)
     */
    public _join(player: Player): void {
        if(this.state.status !== 'WAITING_TO_START') {
            throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
        }

        for(const player of this._players) {
            // If there is no one in the game
            if(this._players.length === 0) {
                break;
            } // if player is in the list of _players throw error
            else if (JSON.stringify(player) === JSON.stringify(player)) {
                throw new InvalidParametersError(PLAYER_ALREADY_IN_GAME_MESSAGE)
            }
        }

        if (this._players.length === 0 && !this.state.player1) {
            this.state.player1 = player.id;
        } else if (this._players.length === 1 && !this.state.player2) {
            this.state.player2 = player.id;
        } else if (this._players.length === 2 && !this.state.player3) {
            this.state.player3 = player.id;
        } else if (this._players.length === 3 && !this.state.player4) {
            this.state.player4 = player.id;
            this.state.status = 'IN_PROGRESS';
        } else {
            throw new InvalidParametersError(GAME_FULL_MESSAGE);
        }
    }

    /**
     * Removes a player from the game.
     * Updates the game's state to reflect the player leaving.
     * If the game has 1-4 player in it at the time of call to this method and the game is IN_PROGRESS,
     *  updates the game's status to OVER and sets the winner to be undefined
     * If the game does not yet have 1-3 players in it at the time of call to this method,
     *  updates the game's status to WAITING_TO_START
     * @param player The player to remove from the game
     * @throws InvalidParametersError if the player is not in the game (PLAYER_NOT_IN_GAME_MESSAGE)
     */
    public _leave(player: Player): void {
        // check if the player is in the game and make sure the status is still WAITING_TO_START
        if(this._players.includes(player) && this.state.status === 'WAITING_TO_START') {
            if(player.id === this.state.player1) {
                this.state.player1 = undefined;
            } else if (player.id === this.state.player2) {
                this.state.player2 = undefined;
            } else if (player.id === this.state.player3) {
                this.state.player3 = undefined;
            } else if (player.id === this.state.player4) {
                this.state.player4 = undefined;
            }
        }

        if(this._players.includes(player) && this.state.status === 'IN_PROGRESS') {
            this.state.status = 'OVER';
        } else {
            if(!this._players.includes(player)) {
                throw new InvalidParametersError(PLAYER_NOT_IN_GAME_MESSAGE);
            } else if (this.state.status !== 'IN_PROGRESS') {
                throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
            }
        }

    }
}