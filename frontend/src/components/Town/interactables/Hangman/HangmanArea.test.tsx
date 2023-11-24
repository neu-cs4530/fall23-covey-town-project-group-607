import React from 'react';
import { mock } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import {
  GameArea,
  GameStatus,
  GameResult,
  HangManGameState,
  HangManMove,
  PlayerLocation,
} from '../../../../types/CoveyTownSocket';
import PhaserGameArea from '../GameArea';
import * as Leaderboard from '../Leaderboard';
import * as HangmanBoard from './HangmanBoard';
import HangmanAreaController from '../../../../classes/interactable/HangmanAreaController';
import PlayerController from '../../../../classes/PlayerController';
import HangmanAreaWrapper from './HangmanArea';
import { ChakraProvider } from '@chakra-ui/react';
import { render } from '@testing-library/react';
// import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import TownControllerContext from '../../../../contexts/TownControllerContext';
//import { act } from 'react-dom/test-utils';
import TownController, * as TownControllerHooks from '../../../../classes/TownController';

const mockToast = jest.fn();
jest.mock('@chakra-ui/react', () => {
  const ui = jest.requireActual('@chakra-ui/react');
  const mockUseToast = () => mockToast;
  return {
    ...ui,
    useToast: mockUseToast,
  };
});
const mockGameArea = mock<PhaserGameArea>();
mockGameArea.getData.mockReturnValue('HangMan');
jest.spyOn(TownControllerHooks, 'useInteractable').mockReturnValue(mockGameArea);
const useInteractableAreaControllerSpy = jest.spyOn(
  TownControllerHooks,
  'useInteractableAreaController',
);
const leaderboardComponentSpy = jest.spyOn(Leaderboard, 'default');
leaderboardComponentSpy.mockReturnValue(<div data-testid='leaderboard' />);
const boardComponentSpy = jest.spyOn(HangmanBoard, 'default');
boardComponentSpy.mockReturnValue(<div data-testid='board' />);

const randomLocation = (): PlayerLocation => ({
  moving: Math.random() < 0.5,
  rotation: 'front',
  x: Math.random() * 1000,
  y: Math.random() * 1000,
});

class MockHangManAreaController extends HangmanAreaController {
  makeMove = jest.fn();

  joinGame = jest.fn();

  mockBoard2: string[] = [
    '_____', // Represents the hidden word with underscores
    '|   |', // Hangman figure: head, body, and legs
    '|   O',
    '|  /|\\',
    '|  / \\',
    '|',
  ];

  mockBoard: string[][] = [
    ['_', '_', '_'], // Represents the hidden word with underscores
    ['|', ' ', '|'], // Hangman figure: head, body, and legs
    ['|', ' ', 'O'],
    ['|', '/|\\'],
    ['|', '/ \\'],
    ['|'],
  ];

  mockIsPlayer = false;

  mockIsOurTurn = false;

  mockObservers: PlayerController[] = [];

  mockMoveCount = 0;

  mockWinner: PlayerController[] | undefined = undefined;

  mockWhoseTurn: PlayerController | undefined = undefined;

  mockStatus: GameStatus = 'WAITING_TO_START';

  mockPlayer1: PlayerController | undefined = undefined;

  mockPlayer2: PlayerController | undefined = undefined;

  mockPlayer3: PlayerController | undefined = undefined;

  mockPlayer4: PlayerController | undefined = undefined;

  mockCurrentGame: GameArea<HangManGameState> | undefined = undefined;

  mockIsActive = false;

  mockGuess: HangManMove[] | undefined = undefined;

  mockMistakeCount = 0;

  mockTotalGuess = 0;

  mockCurrentGuess = [''];

  mockWord = '';

  mockHistory: GameResult[] = [];

  public constructor() {
    super(nanoid(), mock<GameArea<HangManGameState>>(), mock<TownController>());
  }

  get history(): GameResult[] {
    return this.mockHistory;
  }

  get isOurTurn() {
    return this.mockIsOurTurn;
  }

  get player1(): PlayerController | undefined {
    return this.mockPlayer1;
  }

  get player2(): PlayerController | undefined {
    return this.mockPlayer2;
  }

  get player3(): PlayerController | undefined {
    return this.mockPlayer3;
  }

  get player4(): PlayerController | undefined {
    return this.mockPlayer4;
  }

  get observers(): PlayerController[] {
    return this.mockObservers;
  }

  get moveCount(): number {
    return this.mockMoveCount;
  }

  get winner(): PlayerController[] | undefined {
    return this.mockWinner;
  }

  get whoseTurn(): PlayerController | undefined {
    return this.mockWhoseTurn;
  }

  get status(): GameStatus {
    return this.mockStatus;
  }

  get isPlayer() {
    return this.mockIsPlayer;
  }

  public isActive(): boolean {
    return this.mockIsActive;
  }

  get mistakeCount(): number {
    return this.mockMistakeCount;
  }

  get guess() {
    return this.mockGuess;
  }

  get guessCount(): number {
    return this.mockTotalGuess;
  }

  get currentGuess(): string[] {
    return this.mockCurrentGuess;
  }

  get word(): string {
    return this.mockWord;
  }

  get board(): string[] {
    // Convert the 2D array to a 1D array of strings for testing purposes
    const flatBoard: string[] = [];
    for (const row of this.mockBoard) {
      flatBoard.push(...row.map(cell => (cell === undefined ? '' : cell.toString())));
    }
    return flatBoard;
  }

  public mockReset() {
    this.mockBoard = [
      ['_', '_', '_'],
      ['|', ' ', '|'],
      ['|', ' ', 'O'],
      ['|', '/|\\'],
      ['|', '/ \\'],
      ['|'],
    ];
    this.makeMove.mockReset();
  }

  //   get board(): string[] {
  //     return this.mockBoard.flat();
  //   }

  //   public mockReset() {
  //     this.mockBoard = [['', '', '']];
  //     this.makeMove.mockReset();
  //   }
}

describe('[T2] HangManArea', () => {
  // Spy on console.error and intercept react key warnings to fail test
  let consoleErrorSpy: jest.SpyInstance<void, [message?: any, ...optionalParms: any[]]>;
  beforeAll(() => {
    // Spy on console.error and intercept react key warnings to fail test
    consoleErrorSpy = jest.spyOn(global.console, 'error');
    consoleErrorSpy.mockImplementation((message?, ...optionalParams) => {
      const stringMessage = message as string;
      if (stringMessage.includes && stringMessage.includes('children with the same key,')) {
        throw new Error(stringMessage.replace('%s', optionalParams[0]));
      } else if (stringMessage.includes && stringMessage.includes('warning-keys')) {
        throw new Error(stringMessage.replace('%s', optionalParams[0]));
      }
      // eslint-disable-next-line no-console -- we are wrapping the console with a spy to find react warnings
      console.warn(message, ...optionalParams);
    });
  });
  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });
  let ourPlayer: PlayerController;
  const townController = mock<TownController>();
  Object.defineProperty(townController, 'ourPlayer', { get: () => ourPlayer });
  const gameAreaController = new MockHangManAreaController();
  //   let joinGameResolve: () => void;
  //   let joinGameReject: (err: Error) => void;

  function renderHangManArea() {
    return render(
      <ChakraProvider>
        <TownControllerContext.Provider value={townController}>
          <HangmanAreaWrapper />
        </TownControllerContext.Provider>
      </ChakraProvider>,
    );
  }

  beforeEach(() => {
    ourPlayer = new PlayerController('player 1', 'player 2', randomLocation());
    ourPlayer = new PlayerController('player 3', 'player 4', randomLocation());
    mockGameArea.name = nanoid();
    // mockReset(townController);
    gameAreaController.mockReset();
    useInteractableAreaControllerSpy.mockReturnValue(gameAreaController);
    leaderboardComponentSpy.mockClear();
    mockToast.mockClear();
    gameAreaController.joinGame.mockReset();
    gameAreaController.makeMove.mockReset();

    // gameAreaController.joinGame.mockImplementation(
    //   () =>
    //     new Promise<void>((resolve, reject) => {
    //       joinGameResolve = resolve;
    //       joinGameReject = reject;
    //     }),
    // );
  });
  describe('[T2.1] Game update listeners', () => {
    it('Registers exactly two listeners when mounted: one for gameUpdated and one for gameEnd', () => {
      const addListenerSpy = jest.spyOn(gameAreaController, 'addListener');
      addListenerSpy.mockClear();

      renderHangManArea();
      expect(addListenerSpy).toBeCalledTimes(2);
      expect(addListenerSpy).toHaveBeenCalledWith('gameUpdated', expect.any(Function));
      expect(addListenerSpy).toHaveBeenCalledWith('gameEnd', expect.any(Function));
    });

    it('Does not register listeners on every render', () => {
      const removeListenerSpy = jest.spyOn(gameAreaController, 'removeListener');
      const addListenerSpy = jest.spyOn(gameAreaController, 'addListener');
      addListenerSpy.mockClear();
      removeListenerSpy.mockClear();
      const renderData = renderHangManArea();
      expect(addListenerSpy).toBeCalledTimes(2);
      addListenerSpy.mockClear();

      renderData.rerender(
        <ChakraProvider>
          <TownControllerContext.Provider value={townController}>
            <HangmanAreaWrapper />
          </TownControllerContext.Provider>
        </ChakraProvider>,
      );

      expect(addListenerSpy).not.toBeCalled();
      expect(removeListenerSpy).not.toBeCalled();
    });

    it('Removes the listeners when the component is unmounted', () => {
      const removeListenerSpy = jest.spyOn(gameAreaController, 'removeListener');
      const addListenerSpy = jest.spyOn(gameAreaController, 'addListener');
      addListenerSpy.mockClear();
      removeListenerSpy.mockClear();
      const renderData = renderHangManArea();
      expect(addListenerSpy).toBeCalledTimes(2);
      const addedListeners = addListenerSpy.mock.calls;
      const addedGameUpdateListener = addedListeners.find(call => call[0] === 'gameUpdated');
      const addedGameEndedListener = addedListeners.find(call => call[0] === 'gameEnd');
      expect(addedGameEndedListener).toBeDefined();
      expect(addedGameUpdateListener).toBeDefined();
      renderData.unmount();
      expect(removeListenerSpy).toBeCalledTimes(2);
      const removedListeners = removeListenerSpy.mock.calls;
      const removedGameUpdateListener = removedListeners.find(call => call[0] === 'gameUpdated');
      const removedGameEndedListener = removedListeners.find(call => call[0] === 'gameEnd');
      expect(removedGameUpdateListener).toEqual(addedGameUpdateListener);
      expect(removedGameEndedListener).toEqual(addedGameEndedListener);
    });
  });
});
