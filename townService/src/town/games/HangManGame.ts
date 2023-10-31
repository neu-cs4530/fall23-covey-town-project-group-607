import Player from '../../lib/Player';
import Game from './Game';
import { GameMove, HangManGameState, HangManMove } from '../../types/CoveyTownSocket';
import InvalidParametersError, {
  GAME_FULL_MESSAGE,
  PLAYER_ALREADY_IN_GAME_MESSAGE,
} from '../../lib/InvalidParametersError';

export default class HangManGame extends Game<HangManGameState, HangManMove> {
  public constructor() {
    super({
      moves: [],
      status: 'WAITING_TO_START',
      currentWord: '',
      mistakes: 9,
    });
  }

  public applyMove(move: GameMove<HangManMove>): void {
    throw new Error('Method not implemented.');
  }

  /**
   * Adds a player to the game.
   * Updates the game's state to reflect the new player
   * If the game is now full (has two players), updates the game's state to set the status to IN_PROGRESS
   * @param player The player to join the game
   * @throws InvalidParametersError if the player is already in the game (PLAYER_ALREADY_IN_GAME_MESSAGE) 
   * or the game is full (GAME_FULL_MESSAGE)
   */
  protected _join(player: Player): void {
    // Case for player in game
    if (this._players.includes(player)) {
      throw new InvalidParametersError(PLAYER_ALREADY_IN_GAME_MESSAGE);
    }
    // Case for the first player
    if (this._players.length === 0) {
      this.state = {
        ...this.state,
        p1: player.id,
      };
      this.state.winner = undefined;
    }

    if (this._players.length === 1) {
      this.state = {
        ...this.state,
        p2: player.id,
      };
      this.state.winner = undefined;
    }

    if (this._players.length === 2) {
      this.state = {
        ...this.state,
        p3: player.id,
      };
      this.state.winner = undefined;
    }

    if (this._players.length === 3) {
      this.state = {
        ...this.state,
        p4: player.id,
      };
      this.state.status = 'IN_PROGRESS';
      this.state.winner = undefined;
    }

    if (this._players.length === 4) {
      throw new InvalidParametersError(GAME_FULL_MESSAGE);
    }
  }

  protected _leave(player: Player): void {
    throw new Error('Method not implemented.');
  }
}
