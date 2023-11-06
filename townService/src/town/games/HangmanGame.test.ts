import {
  GAME_FULL_MESSAGE,
  GAME_NOT_IN_PROGRESS_MESSAGE,
  INVALID_GUESS,
  MOVE_NOT_YOUR_TURN_MESSAGE,
  PLAYER_ALREADY_IN_GAME_MESSAGE,
  PLAYER_NOT_IN_GAME_MESSAGE,
} from '../../lib/InvalidParametersError';
import Player from '../../lib/Player';
import { createPlayerForTesting } from '../../TestUtils';
import HangmanGame from './HangmanGame';

describe('HangmanGame', () => {
  let game: HangmanGame;

  beforeEach(() => {
    game = new HangmanGame();
  });

  describe('_join', () => {
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
    it('should throw an error if player is already in game', () => {
      const player1 = createPlayerForTesting();
      game.join(player1);
      expect(() => game.join(player1)).toThrowError(PLAYER_ALREADY_IN_GAME_MESSAGE);
    });
  });
  describe('_leave', () => {
    it('check if the states resets if the last player leaves', () => {
      const player1 = createPlayerForTesting();
      const player2 = createPlayerForTesting();
      const player3 = createPlayerForTesting();
      const player4 = createPlayerForTesting();
      game.join(player1);
      expect(game.state.player1).toEqual(player1.id);
      game.join(player2);
      expect(game.state.player2).toEqual(player2.id);
      game.join(player3);
      expect(game.state.player3).toEqual(player3.id);
      game.join(player4);
      expect(game.state.player4).toEqual(player4.id);
      game.leave(player1);
      expect(game.state.player1).toEqual(undefined);
      game.leave(player2);
      expect(game.state.player2).toEqual(undefined);
      game.leave(player4);
      expect(game.state.player4).toEqual(undefined);
      game.leave(player3);
      expect(game.state.player3).toEqual(undefined);
      expect(game.state.status).toEqual('OVER');
      expect(game.state.mistakes).toEqual([]);
      expect(game.state.guesses).toEqual([]);
      expect(game.activePlayers.length).toEqual(0);
    });
    it('should throw an error if the player is not in the game', () => {
      const player1 = createPlayerForTesting();
      game.join(player1);
      game.leave(player1);
      expect(() => game.leave(player1)).toThrowError(PLAYER_NOT_IN_GAME_MESSAGE);
    });
  });
  describe('applyMove', () => {
    describe('Given invalid moves', () => {
      it('should throw an error if the player is not in the game', () => {
        const player1 = createPlayerForTesting();
        game.join(player1);
        expect(() =>
          game.applyMove({
            gameID: game.id,
            playerID: player1.id,
            move: {
              letterGuess: 'a',
              playerID: player1.id,
            },
          }),
        ).toThrowError(GAME_NOT_IN_PROGRESS_MESSAGE);
      });
      describe('When game in progress', () => {
        let player1: Player;
        let player2: Player;
        let player3: Player;
        let player4: Player;
        beforeEach(() => {
          player1 = createPlayerForTesting();
          player2 = createPlayerForTesting();
          player3 = createPlayerForTesting();
          player4 = createPlayerForTesting();
          game.join(player1);
          game.join(player2);
          game.join(player3);
          game.join(player4);
          expect(game.state.status).toEqual('IN_PROGRESS');
        });
        it('should throw an error if the player is not in the game', () => {
          expect(game.state.guesses).toEqual([]);
          expect(game.state.mistakes).toEqual([]);
        });
        it('should throw error if its not their turn', () => {
          game.applyMove({
            gameID: game.id,
            playerID: player1.id,
            move: {
              letterGuess: 'a',
              playerID: player1.id,
            },
          });
          expect(() =>
            game.applyMove({
              gameID: game.id,
              playerID: player3.id,
              move: {
                letterGuess: 'b',
                playerID: player3.id,
              },
            }),
          ).toThrowError(MOVE_NOT_YOUR_TURN_MESSAGE);
        });

        it('should throw error if they make an invalid guess', () => {
          game.applyMove({
            gameID: game.id,
            playerID: player1.id,
            move: {
              letterGuess: 'a',
              playerID: player1.id,
            },
          });
          expect(() =>
            game.applyMove({
              gameID: game.id,
              playerID: player2.id,
              move: {
                letterGuess: 'a',
                playerID: player2.id,
              },
            }),
          ).toThrowError(INVALID_GUESS);
        });

        it('should throw error if they make an invalid guess by giving an already guessed word', () => {
          game.applyMove({
            gameID: game.id,
            playerID: player1.id,
            move: {
              wordGuess: 'apple',
              playerID: player1.id,
            },
          });
          expect(() =>
            game.applyMove({
              gameID: game.id,
              playerID: player2.id,
              move: {
                wordGuess: 'apple',
                playerID: player2.id,
              },
            }),
          ).toThrowError(INVALID_GUESS);
        });
        it('checks if it all goes to the correct turn', () => {
          expect(game.state.guesses).toEqual([]);
          game.applyMove({
            gameID: game.id,
            playerID: player1.id,
            move: {
              letterGuess: 'a',
              playerID: player1.id,
            },
          });
          game.applyMove({
            gameID: game.id,
            playerID: player2.id,
            move: {
              letterGuess: 'b',
              playerID: player2.id,
            },
          });
          game.applyMove({
            gameID: game.id,
            playerID: player3.id,
            move: {
              letterGuess: 'c',
              playerID: player3.id,
            },
          });
          game.applyMove({
            gameID: game.id,
            playerID: player4.id,
            move: {
              letterGuess: 'd',
              playerID: player4.id,
            },
          });
          expect(game.state.guesses.length).toEqual(4);
        });
        it('if player leaves mid game, the next player takes the turn', () => {
          expect(game.state.guesses).toEqual([]);
          game.applyMove({
            gameID: game.id,
            playerID: player1.id,
            move: {
              letterGuess: 'a',
              playerID: player1.id,
            },
          });
          game.applyMove({
            gameID: game.id,
            playerID: player2.id,
            move: {
              letterGuess: 'b',
              playerID: player2.id,
            },
          });
          game.leave(player3);
          game.applyMove({
            gameID: game.id,
            playerID: player4.id,
            move: {
              letterGuess: 'd',
              playerID: player4.id,
            },
          });
          expect(game.state.guesses.length).toEqual(3);
        });
        // it('win case', () => {
        //   game.state.word = 'cup';
        //   expect(game.state.guesses).toEqual([]);
        //   game.applyMove({
        //     gameID: game.id,
        //     playerID: player1.id,
        //     move: {
        //       letterGuess: 'c',
        //       playerID: player1.id,
        //     },
        //   });
        //   game.applyMove({
        //     gameID: game.id,
        //     playerID: player2.id,
        //     move: {
        //       letterGuess: 'u',
        //       playerID: player2.id,
        //     },
        //   });
        //   game.applyMove({
        //     gameID: game.id,
        //     playerID: player3.id,
        //     move: {
        //       letterGuess: 'p',
        //       playerID: player3.id,
        //     },
        //   });
        //   expect(game.state.status).toEqual('OVER');
        // });
      });
    });
  });
});
