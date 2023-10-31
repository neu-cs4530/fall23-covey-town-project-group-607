import Player from '../../lib/Player';
import Game from './Game';
import { GameMove, HangManGameState, HangManMove } from '../../types/CoveyTownSocket';

export default class HangManGame extends Game<HangManGameState, HangManMove> {
  public constructor() {
    super({
      moves: [],
      status: 'WAITING_TO_START',
      currentWord: '',
      mistakes: 0,
    });
  }

  public applyMove(move: GameMove<HangManMove>): void {
    throw new Error('Method not implemented.');
  }

  protected _join(player: Player): void {
    throw new Error('Method not implemented.');
  }

  protected _leave(player: Player): void {
    throw new Error('Method not implemented.');
  }
}
