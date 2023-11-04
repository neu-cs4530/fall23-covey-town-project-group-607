import {
  GAME_FULL_MESSAGE,
  GAME_IN_PROGRESS_MESSAGE,
  PLAYER_ALREADY_IN_GAME_MESSAGE,
} from '../../lib/InvalidParametersError';
import { createPlayerForTesting } from '../../TestUtils';
import HangmanGame from './HangmanGame';

describe('HangmanGame', () => {
  let game: HangmanGame;

  beforeEach(() => {
    game = new HangmanGame();
  });

  describe('[T1.1] _join', () => {
    it('should throw an error if the player is already in the game', () => {
      const player = createPlayerForTesting();
      game.join(player);
      expect(() => game.join(player)).toThrowError(PLAYER_ALREADY_IN_GAME_MESSAGE);
      const player2 = createPlayerForTesting();
      game.join(player2);
      expect(() => game.join(player2)).toThrowError(PLAYER_ALREADY_IN_GAME_MESSAGE);
    });
    it('should throw an error if the game is full', () => {
      const player1 = createPlayerForTesting();
      const player2 = createPlayerForTesting();
      const player3 = createPlayerForTesting();
      const player4 = createPlayerForTesting();
      const player5 = createPlayerForTesting();
      game.join(player1);
      expect(game.state.player1).toEqual(player1.id);
      game.join(player2);
      expect(game.state.player2).toEqual(player2.id);
      game.join(player3);
      expect(game.state.player3).toEqual(player3.id);
      game.join(player4);
      expect(game.state.player4).toEqual(player4.id);
      expect(() => game.join(player5)).toThrowError(GAME_FULL_MESSAGE);
    });
    it('should throw an error if joining a game in progress', () => {
      const player1 = createPlayerForTesting();
      const player2 = createPlayerForTesting();
      const player3 = createPlayerForTesting();
      game.join(player1);
      game.join(player2);
      game.state.status = 'IN_PROGRESS';
      expect(() => game.join(player3)).toThrowError(GAME_IN_PROGRESS_MESSAGE);
    });

    it('should throw an error if player is already in game', () => {
      const player1 = createPlayerForTesting();
      game.join(player1);
      expect(() => game.join(player1)).toThrowError(PLAYER_ALREADY_IN_GAME_MESSAGE);
    });
  });
  describe('[T1.2] _leave', () => {
    it('should throw an error if player is already in game', () => {
      const player1 = createPlayerForTesting();
      game.join(player1);
      game._start();
      expect(game.state.status).toEqual('IN_PROGRESS');
      game.leave(player1);
      expect(game.state.status).toEqual('WAITING_TO_START');
    });
  });
});
