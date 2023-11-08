import assert from 'assert';
import { mock } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import {
  GameArea,
  GameResult,
  GameStatus,
  HangManGameState,
  HangManMove,
  PlayerID,
} from '../../types/CoveyTownSocket';
import PlayerController from '../PlayerController';
import TownController from '../TownController';
import GameAreaController from './GameAreaController';
import HangmanAreaController, { NO_GAME_IN_PROGRESS_ERROR } from './HangmanAreaController';

describe('[T1] HangmanAreaController', () => {
  const ourPlayer = new PlayerController(nanoid(), nanoid(), {
    x: 0,
    y: 0,
    moving: false,
    rotation: 'front',
  });
  const otherPlayers = [
    new PlayerController(nanoid(), nanoid(), { x: 0, y: 0, moving: false, rotation: 'front' }),
    new PlayerController(nanoid(), nanoid(), { x: 0, y: 0, moving: false, rotation: 'front' }),
    new PlayerController(nanoid(), nanoid(), { x: 0, y: 0, moving: false, rotation: 'front' }),
    new PlayerController(nanoid(), nanoid(), { x: 0, y: 0, moving: false, rotation: 'front' }),
  ];

  const mockTownController = mock<TownController>();
  Object.defineProperty(mockTownController, 'ourPlayer', {
    get: () => ourPlayer,
  });
  Object.defineProperty(mockTownController, 'players', {
    get: () => [ourPlayer, ...otherPlayers],
  });
  mockTownController.getPlayer.mockImplementation(playerID => {
    const p = mockTownController.players.find(player => player.id === playerID);
    assert(p);
    return p;
  });

  function hangmanGameAreaControllerWithProp({
    _id,
    history,
    player1,
    player2,
    player3,
    player4,
    undefinedGame,
    status,
    guesses,
    mistakes,
    currentGuess,
    word,
    winner,
  }: {
    _id?: string;
    history?: GameResult[];
    player1?: PlayerID;
    player2?: PlayerID;
    player3?: PlayerID;
    player4?: PlayerID;
    undefinedGame?: boolean;
    status?: GameStatus;
    guesses?: ReadonlyArray<HangManMove>;
    mistakes?: ReadonlyArray<HangManMove>;
    currentGuess?: string[];
    word?: string;
    winner?: string[];
  }) {
    const id = _id || nanoid();
    const players = [];
    if (player1) players.push(player1);
    if (player2) players.push(player2);
    if (player3) players.push(player3);
    if (player4) players.push(player4);
    const ret = new HangmanAreaController(
      id,
      {
        id,
        occupants: players,
        history: history || [],
        type: 'HangmanArea',
        game: undefinedGame
          ? undefined
          : {
              id,
              players: players,
              state: {
                status: status || 'IN_PROGRESS',
                player1: player1,
                player2: player2,
                player3: player1,
                player4: player2,
                guesses: guesses || [],
                mistakes: mistakes || [],
                currentGuess: currentGuess || [],
                word: word || '',
                winner: winner,
              },
            },
      },
      mockTownController,
    );
    if (players) {
      ret.occupants = players
        .map(eachID => mockTownController.players.find(eachPlayer => eachPlayer.id === eachID))
        .filter(eachPlayer => eachPlayer) as PlayerController[];
    }
    return ret;
  }
  describe('[T1.1]', () => {
    describe('isActive', () => {
      it('should return true if the game is in progress', () => {
        const controller = hangmanGameAreaControllerWithProp({
          status: 'IN_PROGRESS',
        });
        expect(controller.isActive()).toBe(true);
      });
      it('should return false if the game is not in progress', () => {
        const controller = hangmanGameAreaControllerWithProp({
          status: 'OVER',
        });
        expect(controller.isActive()).toBe(false);
      });
    });
    describe('isPlayer', () => {
      it('should return true if the current player is a player in this game', () => {
        const controller = hangmanGameAreaControllerWithProp({
          status: 'IN_PROGRESS',
          player1: ourPlayer.id,
        });
        expect(controller.isPlayer).toBe(true);
      });
      it('should return false if the current player is not a player in this game', () => {
        const controller = hangmanGameAreaControllerWithProp({
          status: 'IN_PROGRESS',
          player1: ourPlayer.id,
          player2: otherPlayers[0].id,
          player3: otherPlayers[1].id,
          player4: otherPlayers[2].id,
        });
        expect(controller.isPlayer).toBe(false);
      });
    });

    describe('status', () => {
      it('should return the status of the game', () => {
        const controller = hangmanGameAreaControllerWithProp({
          status: 'IN_PROGRESS',
        });
        expect(controller.status).toBe('IN_PROGRESS');
      });
      it('should return WAITING_TO_START if the game is not defined', () => {
        const controller = hangmanGameAreaControllerWithProp({
          undefinedGame: true,
        });
        expect(controller.status).toBe('WAITING_TO_START');
      });
    });
    describe('whoseTurn', () => {
      it('should return the player whose turn it is initially', () => {
        const controller = hangmanGameAreaControllerWithProp({
          status: 'IN_PROGRESS',
          player1: ourPlayer.id,
          player2: otherPlayers[0].id,
          player3: otherPlayers[1].id,
          player4: otherPlayers[2].id,
        });
        expect(controller.whoseTurn).toBe(ourPlayer);
      });
      it('should return the player whose turn it is after a move', () => {
        const controller = hangmanGameAreaControllerWithProp({
          status: 'IN_PROGRESS',
          player1: ourPlayer.id,
          player2: otherPlayers[0].id,
          player3: otherPlayers[1].id,
          player4: otherPlayers[2].id,
          guesses: [
            {
              playerID: ourPlayer.id,
              wordGuess: undefined,
              letterGuess: 'a',
            },
          ],
        });
        expect(controller.whoseTurn).toBe(otherPlayers[0]);
      });
      it('should return undefined if the game is not in progress', () => {
        const controller = hangmanGameAreaControllerWithProp({
          status: 'OVER',
          player1: ourPlayer.id,
          player2: otherPlayers[0].id,
          player3: otherPlayers[1].id,
          player4: otherPlayers[2].id,
        });
        expect(controller.whoseTurn).toBe(undefined);
      });
    });
    describe('isOurTurn', () => {
      it('should return true if it is our turn', () => {
        const controller = hangmanGameAreaControllerWithProp({
          status: 'IN_PROGRESS',
          player1: ourPlayer.id,
          player2: otherPlayers[0].id,
          player3: otherPlayers[1].id,
          player4: otherPlayers[2].id,
        });
        expect(controller.isOurTurn).toBe(true);
      });
      it('should return false if it is not our turn', () => {
        const controller = hangmanGameAreaControllerWithProp({
          status: 'IN_PROGRESS',
          player1: otherPlayers[0].id,
          player2: ourPlayer.id,
          player3: otherPlayers[1].id,
          player4: otherPlayers[2].id,
        });
        expect(controller.isOurTurn).toBe(false);
      });
    });
    describe('guessCount', () => {
      it('should return the number of guesses that have been made', () => {
        const controller = hangmanGameAreaControllerWithProp({
          status: 'IN_PROGRESS',
          player1: ourPlayer.id,
          player2: otherPlayers[0].id,
          player3: otherPlayers[1].id,
          player4: otherPlayers[2].id,
          guesses: [
            {
              letterGuess: 'a',
            },
          ],
        });
        expect(controller.guessCount).toBe(1);
      });
    });
    describe('guesses', () => {
      it('should return an empty list of guesses by default', () => {
        const controller = hangmanGameAreaControllerWithProp({
          status: 'IN_PROGRESS',
          player1: ourPlayer.id,
          player2: otherPlayers[0].id,
          player3: otherPlayers[1].id,
          player4: otherPlayers[2].id,
        });
        expect(controller.guesses).toEqual([]);
      });
    });
    describe('player 1', () => {
      it('should return player1 if there is one', () => {
        const controller = hangmanGameAreaControllerWithProp({
          status: 'IN_PROGRESS',
          player1: ourPlayer.id,
          player2: otherPlayers[0].id,
          player3: otherPlayers[1].id,
          player4: otherPlayers[2].id,
        });
        expect(controller.player1).toBe(ourPlayer);
      });
      it('should return undefined if there is no x player and the game is waiting to start', () => {
        const controller = hangmanGameAreaControllerWithProp({
          status: 'WAITING_TO_START',
        });
        expect(controller.player1).toBe(undefined);
      });
      it('should return undefined if there is no x player', () => {
        const controller = hangmanGameAreaControllerWithProp({
          status: 'IN_PROGRESS',
          player2: otherPlayers[0].id,
          player3: otherPlayers[1].id,
          player4: otherPlayers[2].id,
        });
        expect(controller.player1).toBe(undefined);
      });
    });
    describe('player2', () => {
      it('should return the o player if there is one', () => {
        const controller = hangmanGameAreaControllerWithProp({
          status: 'IN_PROGRESS',
          player1: otherPlayers[0].id,
          player2: ourPlayer.id,
          player3: otherPlayers[1].id,
          player4: otherPlayers[2].id,
        });
        expect(controller.player2).toBe(ourPlayer);
      });
      it('should return undefined if there is no o player and the game is waiting to start', () => {
        const controller = hangmanGameAreaControllerWithProp({
          status: 'WAITING_TO_START',
        });
        expect(controller.player2).toBe(undefined);
      });
      it('should return undefined if there is no o player', () => {
        const controller = hangmanGameAreaControllerWithProp({
          status: 'IN_PROGRESS',
          player1: otherPlayers[0].id,
        });
        expect(controller.player2).toBe(undefined);
      });
    });
    describe('player 3', () => {
      it('should return player1 if there is one', () => {
        const controller = hangmanGameAreaControllerWithProp({
          status: 'IN_PROGRESS',
          player1: otherPlayers[0].id,
          player2: otherPlayers[1].id,
          player3: ourPlayer.id,
          player4: otherPlayers[2].id,
        });
        expect(controller.player3).toBe(ourPlayer);
      });
      it('should return undefined if there is no x player and the game is waiting to start', () => {
        const controller = hangmanGameAreaControllerWithProp({
          status: 'WAITING_TO_START',
        });
        expect(controller.player3).toBe(undefined);
      });
      it('should return undefined if there is no x player', () => {
        const controller = hangmanGameAreaControllerWithProp({
          status: 'IN_PROGRESS',
          player1: otherPlayers[0].id,
          player2: otherPlayers[1].id,
          player4: otherPlayers[2].id,
        });
        expect(controller.player3).toBe(undefined);
      });
    });
    describe('player4', () => {
      it('should return the o player if there is one', () => {
        const controller = hangmanGameAreaControllerWithProp({
          status: 'IN_PROGRESS',
          player1: otherPlayers[0].id,
          player2: otherPlayers[0].id,
          player3: otherPlayers[2].id,
          player4: ourPlayer.id,
        });
        expect(controller.player4).toBe(ourPlayer);
      });
      it('should return undefined if there is no o player and the game is waiting to start', () => {
        const controller = hangmanGameAreaControllerWithProp({
          status: 'WAITING_TO_START',
        });
        expect(controller.player4).toBe(undefined);
      });
      it('should return undefined if there is no o player', () => {
        const controller = hangmanGameAreaControllerWithProp({
          status: 'IN_PROGRESS',
          player1: otherPlayers[0].id,
        });
        expect(controller.player4).toBe(undefined);
      });
    });
    describe('winners', () => {
      it('should return the winners if there is one', () => {
        const controller = hangmanGameAreaControllerWithProp({
          status: 'OVER',
          player1: otherPlayers[0].id,
          player2: ourPlayer.id,
          player3: otherPlayers[1].id,
          player4: otherPlayers[2].id,
          winner: [otherPlayers[0].id, ourPlayer.id, otherPlayers[1].id, otherPlayers[2].id],
        });
        const winners = [otherPlayers[0], ourPlayer, otherPlayers[1], otherPlayers[2]];
        expect(controller.winner).toBe(winners);
      });
      it('should return undefined if there is no winner', () => {
        const controller = hangmanGameAreaControllerWithProp({
          status: 'OVER',
          player1: otherPlayers[0].id,
          player2: ourPlayer.id,
          player3: otherPlayers[1].id,
          player4: otherPlayers[2].id,
        });
        expect(controller.winner).toBe(undefined);
      });
    });
    describe('makeMove', () => {
      it('should throw an error if the game is not in progress', async () => {
        const controller = hangmanGameAreaControllerWithProp({});
        await expect(async () => controller.makeMove('a', undefined)).rejects.toEqual(
          new Error(NO_GAME_IN_PROGRESS_ERROR),
        );
      });
      it('Should call townController.sendInteractableCommand', async () => {
        const controller = hangmanGameAreaControllerWithProp({
          status: 'IN_PROGRESS',
          player1: ourPlayer.id,
          player2: otherPlayers[0].id,
          player3: otherPlayers[1].id,
          player4: otherPlayers[2].id,
        });
        // Simulate joining the game for real
        const instanceID = nanoid();
        mockTownController.sendInteractableCommand.mockImplementationOnce(async () => {
          return { gameID: instanceID };
        });
        await controller.joinGame();
        mockTownController.sendInteractableCommand.mockReset();
        await controller.makeMove('a', undefined);
        expect(mockTownController.sendInteractableCommand).toHaveBeenCalledWith(controller.id, {
          type: 'GameMove',
          gameID: instanceID,
          move: {
            playerID: ourPlayer.id,
            letterGuess: 'a',
            wordGuess: undefined,
          },
        });
      });
    });
  });
  describe('[T1.2] _updateFrom', () => {
    describe('if the game is in progress', () => {
      let controller: HangmanAreaController;
      beforeEach(() => {
        controller = hangmanGameAreaControllerWithProp({
          status: 'IN_PROGRESS',
          player1: ourPlayer.id,
          player2: otherPlayers[0].id,
          player3: otherPlayers[1].id,
          player4: otherPlayers[2].id,
        });
      });
      it('should emit a boardChanged event with the new board', () => {
        const model = controller.toInteractableAreaModel();
        const newMoves: ReadonlyArray<HangManMove> = [
          {
            playerID: ourPlayer.id,
            letterGuess: 'a',
            wordGuess: undefined,
          },
          {
            playerID: otherPlayers[0].id,
            letterGuess: 'p',
            wordGuess: undefined,
          },
        ];
        assert(model.game);
        const newModel: GameArea<HangManGameState> = {
          ...model,
          game: {
            ...model.game,
            state: {
              ...model.game?.state,
              guesses: newMoves,
            },
          },
        };
        const emitSpy = jest.spyOn(controller, 'emit');
        controller.updateFrom(newModel, otherPlayers.concat(ourPlayer));
        const guessesChangedCall = emitSpy.mock.calls.find(call => call[0] === 'boardChanged');
        expect(guessesChangedCall).toBeDefined();
        if (guessesChangedCall) expect(guessesChangedCall[1]).toEqual(['a', 'p', 'p', '', '']);
      });
      it('should emit a turnChanged event with true if it is our turn', () => {
        const model = controller.toInteractableAreaModel();
        const newMoves: ReadonlyArray<HangManMove> = [
          {
            playerID: ourPlayer.id,
            letterGuess: 'a',
            wordGuess: undefined,
          },
          {
            playerID: otherPlayers[0].id,
            letterGuess: 'p',
            wordGuess: undefined,
          },
        ];
        assert(model.game);
        const newModel: GameArea<HangManGameState> = {
          ...model,
          game: {
            ...model.game,
            state: {
              ...model.game?.state,
              guesses: [newMoves[0]],
            },
          },
        };
        controller.updateFrom(newModel, otherPlayers.concat(ourPlayer));
        const testModel: GameArea<HangManGameState> = {
          ...model,
          game: {
            ...model.game,
            state: {
              ...model.game?.state,
              guesses: newMoves,
            },
          },
        };
        const emitSpy = jest.spyOn(controller, 'emit');
        controller.updateFrom(testModel, otherPlayers.concat(ourPlayer));
        const turnChangedCall = emitSpy.mock.calls.find(call => call[0] === 'turnChanged');
        expect(turnChangedCall).toBeDefined();
        if (turnChangedCall) expect(turnChangedCall[1]).toEqual(true);
      });
      it('should emit a turnChanged event with false if it is not our turn', () => {
        const model = controller.toInteractableAreaModel();
        const newMoves: ReadonlyArray<HangManMove> = [
          {
            playerID: ourPlayer.id,
            letterGuess: 'a',
            wordGuess: undefined,
          },
        ];
        expect(controller.isOurTurn).toBe(true);
        assert(model.game);
        const newModel: GameArea<HangManGameState> = {
          ...model,
          game: {
            ...model.game,
            state: {
              ...model.game?.state,
              guesses: newMoves,
            },
          },
        };
        const emitSpy = jest.spyOn(controller, 'emit');
        controller.updateFrom(newModel, otherPlayers.concat(ourPlayer));
        const turnChangedCall = emitSpy.mock.calls.find(call => call[0] === 'turnChanged');
        expect(turnChangedCall).toBeDefined();
        if (turnChangedCall) expect(turnChangedCall[1]).toEqual(false);
      });
      it('should not emit a turnChanged event if the turn has not changed', () => {
        const model = controller.toInteractableAreaModel();
        assert(model.game);
        expect(controller.isOurTurn).toBe(true);
        const emitSpy = jest.spyOn(controller, 'emit');
        controller.updateFrom(model, otherPlayers.concat(ourPlayer));
        const turnChangedCall = emitSpy.mock.calls.find(call => call[0] === 'turnChanged');
        expect(turnChangedCall).not.toBeDefined();
      });
      it('should not emit a boardChanged event if the board has not changed', () => {
        const model = controller.toInteractableAreaModel();
        assert(model.game);

        const newMoves: ReadonlyArray<HangManMove> = [
          {
            playerID: ourPlayer.id,
            letterGuess: 'a',
            wordGuess: undefined,
          },
          {
            playerID: ourPlayer.id,
            letterGuess: 'p',
            wordGuess: undefined,
          },
        ];
        const newModel: GameArea<HangManGameState> = {
          ...model,
          game: {
            ...model.game,
            state: {
              ...model.game?.state,
              guesses: newMoves,
            },
          },
        };
        controller.updateFrom(newModel, otherPlayers.concat(ourPlayer));

        const newMovesWithShuffle: ReadonlyArray<HangManMove> = [
          {
            playerID: ourPlayer.id,
            letterGuess: 'a',
            wordGuess: undefined,
          },
          {
            playerID: ourPlayer.id,
            letterGuess: 'p',
            wordGuess: undefined,
          },
        ];

        const newModelWithSuffle: GameArea<HangManGameState> = {
          ...model,
          game: {
            ...model.game,
            state: {
              ...model.game?.state,
              guesses: newMovesWithShuffle,
            },
          },
        };
        const emitSpy = jest.spyOn(controller, 'emit');
        controller.updateFrom(newModelWithSuffle, otherPlayers.concat(ourPlayer));
        const turnChangedCall = emitSpy.mock.calls.find(call => call[0] === 'boardChanged');
        expect(turnChangedCall).not.toBeDefined();
      });
      it('should update the board returned by the board property', () => {
        const model = controller.toInteractableAreaModel();
        const newMoves: ReadonlyArray<HangManMove> = [
          {
            playerID: ourPlayer.id,
            letterGuess: 'a',
            wordGuess: undefined,
          },
          {
            playerID: ourPlayer.id,
            letterGuess: 'p',
            wordGuess: undefined,
          },
        ];
        assert(model.game);
        const newModel: GameArea<HangManGameState> = {
          ...model,
          game: {
            ...model.game,
            state: {
              ...model.game?.state,
              guesses: newMoves,
            },
          },
        };
        controller.updateFrom(newModel, otherPlayers.concat(ourPlayer));
        expect(controller.guesses).toEqual(['a', 'p', 'p', '', '']);
      });
    });
    it('should call super._updateFrom', () => {
      //eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore - we are testing spying on a private method
      const spy = jest.spyOn(GameAreaController.prototype, '_updateFrom');
      const controller = hangmanGameAreaControllerWithProp({});
      const model = controller.toInteractableAreaModel();
      controller.updateFrom(model, otherPlayers.concat(ourPlayer));
      expect(spy).toHaveBeenCalled();
    });
  });
});
