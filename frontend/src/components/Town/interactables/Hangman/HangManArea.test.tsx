import React from 'react';
import { mock, mockReset } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import {
  GameArea,
  GameStatus,
  GameResult,
  PlayerLocation,
  HangManGameState,
  HangManMove,
} from '../../../../types/CoveyTownSocket';
import PhaserGameArea from '../GameArea';
import * as Leaderboard from '../Leaderboard';
import * as HangmanBoard from './HangmanBoard';
import HangmanAreaController from '../../../../classes/interactable/HangmanAreaController';
import PlayerController from '../../../../classes/PlayerController';
import HangmanAreaWrapper from './HangmanArea';
import { ChakraProvider } from '@chakra-ui/react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import TownControllerContext from '../../../../contexts/TownControllerContext';
import TownController, * as TownControllerHooks from '../../../../classes/TownController';
import { act } from 'react-dom/test-utils';

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
  let gameAreaController = new MockHangManAreaController();
  let joinGameResolve: () => void;
  let joinGameReject: (err: Error) => void;

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
    mockReset(townController);
    gameAreaController.mockReset();
    useInteractableAreaControllerSpy.mockReturnValue(gameAreaController);
    leaderboardComponentSpy.mockClear();
    mockToast.mockClear();
    gameAreaController.joinGame.mockReset();
    gameAreaController.makeMove.mockReset();

    gameAreaController.joinGame.mockImplementation(
      () =>
        new Promise<void>((resolve, reject) => {
          joinGameResolve = resolve;
          joinGameReject = reject;
        }),
    );
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

    it('Creates new listeners if the gameAreaController changes', () => {
      const removeListenerSpy = jest.spyOn(gameAreaController, 'removeListener');
      const addListenerSpy = jest.spyOn(gameAreaController, 'addListener');
      addListenerSpy.mockClear();
      removeListenerSpy.mockClear();
      const renderData = renderHangManArea();
      expect(addListenerSpy).toBeCalledTimes(2);

      gameAreaController = new MockHangManAreaController();
      const removeListenerSpy2 = jest.spyOn(gameAreaController, 'removeListener');
      const addListenerSpy2 = jest.spyOn(gameAreaController, 'addListener');

      useInteractableAreaControllerSpy.mockReturnValue(gameAreaController);
      renderData.rerender(
        <ChakraProvider>
          <TownControllerContext.Provider value={townController}>
            <HangmanAreaWrapper />
          </TownControllerContext.Provider>
        </ChakraProvider>,
      );
      expect(removeListenerSpy).toBeCalledTimes(2);

      expect(addListenerSpy2).toBeCalledTimes(2);
      expect(removeListenerSpy2).not.toBeCalled();
    });
  });

  describe('[T2.2] Rendering the leaderboard', () => {
    it('Renders the leaderboard with the history when the component is mounted', () => {
      gameAreaController.mockHistory = [
        {
          gameID: nanoid(),
          scores: {
            [nanoid()]: 1,
            [nanoid()]: 0,
          },
        },
      ];
      renderHangManArea();
      expect(leaderboardComponentSpy).toHaveBeenCalledWith(
        {
          results: gameAreaController.mockHistory,
        },
        {},
      );
    });

    it('Renders the leaderboard with the history when the game is updated', () => {
      gameAreaController.mockHistory = [
        {
          gameID: nanoid(),
          scores: {
            [nanoid()]: 1,
            [nanoid()]: 0,
          },
        },
      ];
      renderHangManArea();
      expect(leaderboardComponentSpy).toHaveBeenCalledWith(
        {
          results: gameAreaController.mockHistory,
        },
        {},
      );

      gameAreaController.mockHistory = [
        {
          gameID: nanoid(),
          scores: {
            [nanoid()]: 1,
            [nanoid()]: 1,
          },
        },
      ];
      act(() => {
        gameAreaController.emit('gameUpdated');
      });
      expect(leaderboardComponentSpy).toHaveBeenCalledWith(
        {
          results: gameAreaController.mockHistory,
        },
        {},
      );
    });
  });

  describe('[T2.3]  Join game button', () => {
    it('Is not shown when the player is in a not-yet-started game', () => {
      gameAreaController.mockStatus = 'WAITING_TO_START';
      gameAreaController.mockPlayer1 = ourPlayer;
      gameAreaController.mockIsPlayer = true;
      renderHangManArea();
      expect(screen.queryByText('Join New Game')).not.toBeInTheDocument();
    });
    it('Is not shown if the game is in progress', () => {
      gameAreaController.mockStatus = 'IN_PROGRESS';
      gameAreaController.mockPlayer1 = new PlayerController(
        'player 1',
        'player 2',
        randomLocation(),
      );
      gameAreaController.mockPlayer2 = new PlayerController(
        'player 1',
        'player 2',
        randomLocation(),
      );
      gameAreaController.mockIsPlayer = false;
      renderHangManArea();
      expect(screen.queryByText('Join New Game')).not.toBeInTheDocument();
    });

    it('Is enabled when the player is not in a game and the game is not in progress', () => {
      gameAreaController.mockStatus = 'WAITING_TO_START';
      gameAreaController.mockPlayer1 = undefined;
      gameAreaController.mockPlayer2 = new PlayerController(
        'player 2',
        'player 2',
        randomLocation(),
      );
      gameAreaController.mockPlayer3 = new PlayerController(
        'player 3',
        'player 3',
        randomLocation(),
      );
      gameAreaController.mockPlayer4 = new PlayerController(
        'player 4',
        'player 4',
        randomLocation(),
      );
      gameAreaController.mockIsPlayer = false;
      renderHangManArea();
      expect(screen.queryByText('Join New Game')).toBeInTheDocument();
    });

    describe('When clicked', () => {
      it('Calls joinGame on the gameAreaController', () => {
        gameAreaController.mockStatus = 'WAITING_TO_START';
        gameAreaController.mockIsPlayer = false;
        renderHangManArea();
        const button = screen.getByText('Join New Game');
        fireEvent.click(button);
        expect(gameAreaController.joinGame).toBeCalled();
      });
      it('Displays a toast with the error message if there is an error joining the game', async () => {
        gameAreaController.mockStatus = 'WAITING_TO_START';
        gameAreaController.mockIsPlayer = false;
        const errorMessage = nanoid();
        renderHangManArea();
        const button = screen.getByText('Join New Game');
        fireEvent.click(button);
        expect(gameAreaController.joinGame).toBeCalled();
        act(() => {
          joinGameReject(new Error(errorMessage));
        });
        await waitFor(() => {
          expect(mockToast).toBeCalledWith(
            expect.objectContaining({
              description: `Error: ${errorMessage}`,
              status: 'error',
            }),
          );
        });
      });

      it('Is disabled and set to loading when the player is joining a game', async () => {
        gameAreaController.mockStatus = 'WAITING_TO_START';
        gameAreaController.mockIsPlayer = false;
        renderHangManArea();
        const button = screen.getByText('Join New Game');
        expect(button).toBeEnabled();
        expect(within(button).queryByText('Loading...')).not.toBeInTheDocument(); //Check that the loading text is not displayed
        fireEvent.click(button);
        expect(gameAreaController.joinGame).toBeCalled();
        expect(button).toBeDisabled();
        expect(within(button).queryByText('Loading...')).toBeInTheDocument(); //Check that the loading text is displayed
        act(() => {
          joinGameResolve();
        });
        await waitFor(() => expect(button).toBeEnabled());
        expect(within(button).queryByText('Loading...')).not.toBeInTheDocument(); //Check that the loading text is not displayed
      });
    });
    it('Adds the display of the button when a game becomes possible to join', () => {
      gameAreaController.mockStatus = 'IN_PROGRESS';
      gameAreaController.mockIsPlayer = false;
      gameAreaController.mockPlayer1 = new PlayerController(
        'player 1',
        'player 1',
        randomLocation(),
      );
      gameAreaController.mockPlayer2 = new PlayerController(
        'player 2',
        'player 2',
        randomLocation(),
      );
      gameAreaController.mockPlayer4 = new PlayerController(
        'player 3',
        'player 3',
        randomLocation(),
      );
      gameAreaController.mockPlayer4 = new PlayerController(
        'player 4',
        'player 4',
        randomLocation(),
      );
      renderHangManArea();
      expect(screen.queryByText('Join New Game')).not.toBeInTheDocument();
      act(() => {
        gameAreaController.mockStatus = 'OVER';
        gameAreaController.emit('gameUpdated');
      });
      expect(screen.queryByText('Join New Game')).toBeInTheDocument();
    });
    it('Removes the display of the button when a game becomes no longer possible to join', () => {
      gameAreaController.mockStatus = 'WAITING_TO_START';
      gameAreaController.mockIsPlayer = false;
      gameAreaController.mockPlayer1 = undefined;
      gameAreaController.mockPlayer2 = new PlayerController(
        'player 2',
        'player 2',
        randomLocation(),
      );
      renderHangManArea();
      expect(screen.queryByText('Join New Game')).toBeInTheDocument();
      act(() => {
        gameAreaController.mockStatus = 'IN_PROGRESS';
        gameAreaController.mockPlayer1 = new PlayerController(
          'player 1',
          'player 1',
          randomLocation(),
        );
        gameAreaController.emit('gameUpdated');
      });
      expect(screen.queryByText('Join New Game')).not.toBeInTheDocument();
    });
  });
  describe('[T2.4] Rendering the current observers', () => {
    beforeEach(() => {
      gameAreaController.mockObservers = [
        new PlayerController('player 1', 'player 1', randomLocation()),
        new PlayerController('player 2', 'player 2', randomLocation()),
        new PlayerController('player 3', 'player 3', randomLocation()),
        new PlayerController('player 4', 'player 4', randomLocation()),
      ];
      gameAreaController.mockStatus = 'IN_PROGRESS';
      gameAreaController.mockIsPlayer = false;
      gameAreaController.mockPlayer1 = new PlayerController(
        'player 1',
        'player 1',
        randomLocation(),
      );
      gameAreaController.mockPlayer2 = new PlayerController(
        'player 2',
        'player 2',
        randomLocation(),
      );
    });
    it('Displays the correct observers when the component is mounted', () => {
      renderHangManArea();
      const observerList = screen.getByLabelText('list of observers in the game');
      const observerItems = observerList.querySelectorAll('li');
      expect(observerItems).toHaveLength(gameAreaController.mockObservers.length);
      for (let i = 0; i < observerItems.length; i++) {
        expect(observerItems[i]).toHaveTextContent(gameAreaController.mockObservers[i].userName);
      }
    });
    it('Displays the correct observers when the game is updated', () => {
      renderHangManArea();
      act(() => {
        gameAreaController.mockObservers = [
          new PlayerController('player 1', 'player 1', randomLocation()),
          new PlayerController('player 2', 'player 2', randomLocation()),
          new PlayerController('player 3', 'player 3', randomLocation()),
          new PlayerController('player 4', 'player 4', randomLocation()),
        ];
        gameAreaController.emit('gameUpdated');
      });
      const observerList = screen.getByLabelText('list of observers in the game');
      const observerItems = observerList.querySelectorAll('li');
      expect(observerItems).toHaveLength(gameAreaController.mockObservers.length);
      for (let i = 0; i < observerItems.length; i++) {
        expect(observerItems[i]).toHaveTextContent(gameAreaController.mockObservers[i].userName);
      }
    });
  });
  describe('[T2.5] Players in the game text', () => {
    it('Displays the username of the first player if the first player is in the game', () => {
      gameAreaController.mockStatus = 'IN_PROGRESS';
      gameAreaController.mockIsPlayer = false;
      gameAreaController.mockPlayer1 = new PlayerController(nanoid(), nanoid(), randomLocation());
      renderHangManArea();
      const listOfPlayers = screen.getByLabelText('list of players in the game');
      expect(
        within(listOfPlayers).getByText(`Player 1: ${gameAreaController.mockPlayer1?.userName}`),
      ).toBeInTheDocument();
      expect(listOfPlayers).toHaveTextContent(
        `Player 1: ${gameAreaController.mockPlayer1?.userName}`,
      );
    });
    it('Displays the username of the seconf player if the second player is in the game', () => {
      gameAreaController.mockStatus = 'IN_PROGRESS';
      gameAreaController.mockIsPlayer = false;
      gameAreaController.mockPlayer2 = new PlayerController(nanoid(), nanoid(), randomLocation());
      renderHangManArea();
      const listOfPlayers = screen.getByLabelText('list of players in the game');
      expect(
        within(listOfPlayers).getByText(`Player 2: ${gameAreaController.mockPlayer2?.userName}`),
      ).toBeInTheDocument();
    });
    it('Displays "Player 1: (No player yet!)" if the first player is not in the game', () => {
      gameAreaController.mockStatus = 'IN_PROGRESS';
      gameAreaController.mockIsPlayer = false;
      gameAreaController.mockPlayer1 = undefined;
      renderHangManArea();
      const listOfPlayers = screen.getByLabelText('list of players in the game');
      expect(within(listOfPlayers).getByText(`Player 1: (No player yet!)`)).toBeInTheDocument();
      expect(listOfPlayers).toHaveTextContent(`Player 1: (No player yet!)`);
    });
    it('Displays "Player 2: (No player yet!)" if the second player is not in the game', () => {
      gameAreaController.mockStatus = 'IN_PROGRESS';
      gameAreaController.mockIsPlayer = false;
      gameAreaController.mockPlayer2 = undefined;
      renderHangManArea();
      const listOfPlayers = screen.getByLabelText('list of players in the game');
      expect(within(listOfPlayers).getByText(`Player 2: (No player yet!)`)).toBeInTheDocument();
    });
    it('Updates the first player when the game is updated', () => {
      gameAreaController.mockStatus = 'IN_PROGRESS';
      gameAreaController.mockIsPlayer = false;
      renderHangManArea();
      const listOfPlayers = screen.getByLabelText('list of players in the game');
      expect(within(listOfPlayers).getByText(`Player 1: (No player yet!)`)).toBeInTheDocument();
      expect(listOfPlayers).toHaveTextContent('Player 1: (No player yet!)');
      act(() => {
        gameAreaController.mockPlayer1 = new PlayerController(nanoid(), nanoid(), randomLocation());
        gameAreaController.emit('gameUpdated');
      });
      expect(
        within(listOfPlayers).getByText(`Player 1: ${gameAreaController.mockPlayer1?.userName}`),
      ).toBeInTheDocument();
      expect(listOfPlayers).toHaveTextContent(
        `Player 1: ${gameAreaController.mockPlayer1?.userName}`,
      );
    });
    it('Updates the second player when the game is updated', () => {
      gameAreaController.mockStatus = 'IN_PROGRESS';
      gameAreaController.mockIsPlayer = false;
      renderHangManArea();
      const listOfPlayers = screen.getByLabelText('list of players in the game');
      expect(within(listOfPlayers).getByText(`O: (No player yet!)`)).toBeInTheDocument();
      act(() => {
        gameAreaController.mockPlayer2 = new PlayerController(nanoid(), nanoid(), randomLocation());
        gameAreaController.emit('gameUpdated');
      });
      expect(
        within(listOfPlayers).getByText(`Player 2: ${gameAreaController.mockPlayer2?.userName}`),
      ).toBeInTheDocument();
    });
  });
  describe('[T2.6] Game status text', () => {
    it('Displays the correct text when the game is waiting to start', () => {
      gameAreaController.mockStatus = 'WAITING_TO_START';
      renderHangManArea();
      expect(screen.getByText('Game not yet started', { exact: false })).toBeInTheDocument();
    });
    it('Displays the correct text when the game is in progress', () => {
      gameAreaController.mockStatus = 'IN_PROGRESS';
      renderHangManArea();
      expect(screen.getByText('Game in progress', { exact: false })).toBeInTheDocument();
    });
    it('Displays the correct text when the game is over', () => {
      gameAreaController.mockStatus = 'OVER';
      renderHangManArea();
      expect(screen.getByText('Game over', { exact: false })).toBeInTheDocument();
    });
    describe('When a game is in progress', () => {
      beforeEach(() => {
        gameAreaController.mockStatus = 'IN_PROGRESS';
        gameAreaController.mockMoveCount = 2;
        gameAreaController.mockPlayer1 = ourPlayer;
        gameAreaController.mockPlayer2 = new PlayerController(
          'player 1',
          'player 2',
          randomLocation(),
        );
        gameAreaController.mockWhoseTurn = gameAreaController.mockPlayer1;
        gameAreaController.mockIsOurTurn = true;
      });

      it('Displays a message "Game in progress, {numMoves} moves in" and indicates whose turn it is when it is our turn', () => {
        renderHangManArea();
        expect(
          screen.getByText(`Game in progress, 2 moves in, currently your turn`, { exact: false }),
        ).toBeInTheDocument();
      });

      it('Displays a message "Game in progress, {numMoves} moves in" and indicates whose turn it is when it is the other player\'s turn', () => {
        gameAreaController.mockMoveCount = 1;
        gameAreaController.mockWhoseTurn = gameAreaController.mockPlayer2;
        gameAreaController.mockIsOurTurn = false;
        renderHangManArea();
        expect(
          screen.getByText(
            `Game in progress, 1 moves in, currently ${gameAreaController.player2?.userName}'s turn`,
            { exact: false },
          ),
        ).toBeInTheDocument();
      });

      it('Updates the move count when the game is updated', () => {
        renderHangManArea();
        expect(
          screen.getByText(`Game in progress, 2 moves in`, { exact: false }),
        ).toBeInTheDocument();
        act(() => {
          gameAreaController.mockMoveCount = 3;
          gameAreaController.mockWhoseTurn = gameAreaController.mockPlayer2;
          gameAreaController.mockIsOurTurn = false;
          gameAreaController.emit('gameUpdated');
        });
        expect(
          screen.getByText(`Game in progress, 3 moves in`, { exact: false }),
        ).toBeInTheDocument();
      });
      it('Updates the whose turn it is when the game is updated', () => {
        renderHangManArea();
        expect(screen.getByText(`, currently your turn`, { exact: false })).toBeInTheDocument();
        act(() => {
          gameAreaController.mockMoveCount = 3;
          gameAreaController.mockWhoseTurn = gameAreaController.mockPlayer2;
          gameAreaController.mockIsOurTurn = false;
          gameAreaController.emit('gameUpdated');
        });
        expect(
          screen.getByText(`, currently ${gameAreaController.mockPlayer2?.userName}'s turn`, {
            exact: false,
          }),
        ).toBeInTheDocument();
      });
    });
    it('Updates the game status text when the game is updated', () => {
      gameAreaController.mockStatus = 'WAITING_TO_START';
      renderHangManArea();
      expect(screen.getByText('Game not yet started', { exact: false })).toBeInTheDocument();
      act(() => {
        gameAreaController.mockStatus = 'IN_PROGRESS';
        gameAreaController.emit('gameUpdated');
      });
      expect(screen.getByText('Game in progress', { exact: false })).toBeInTheDocument();
      act(() => {
        gameAreaController.mockStatus = 'OVER';
        gameAreaController.emit('gameUpdated');
      });
      expect(screen.getByText('Game over', { exact: false })).toBeInTheDocument();
    });
    describe('When the game ends', () => {
      it('Displays a toast with the winner', () => {
        gameAreaController.mockStatus = 'IN_PROGRESS';
        gameAreaController.mockIsPlayer = false;
        gameAreaController.mockPlayer1 = ourPlayer;
        gameAreaController.mockPlayer2 = new PlayerController(
          'player 1',
          'player 2',
          randomLocation(),
        );
        gameAreaController.mockWinner = [ourPlayer];
        renderHangManArea();
        act(() => {
          gameAreaController.emit('gameEnd');
        });
        expect(mockToast).toBeCalledWith(
          expect.objectContaining({
            description: `You won!`,
          }),
        );
      });
      it('Displays a toast with the loser', () => {
        gameAreaController.mockStatus = 'IN_PROGRESS';
        gameAreaController.mockIsPlayer = false;
        gameAreaController.mockPlayer1 = ourPlayer;
        gameAreaController.mockPlayer2 = new PlayerController(
          'player 1',
          'player 2',
          randomLocation(),
        );
        gameAreaController.mockWinner = [gameAreaController.mockPlayer2]; // Assuming mockPlayer2 is the winner
        renderHangManArea();
        act(() => {
          gameAreaController.emit('gameEnd');
        });
        expect(mockToast).toBeCalledWith(
          expect.objectContaining({
            description: `You lost :(`,
          }),
        );
      });
      it('Displays a toast with a tie', () => {
        gameAreaController.mockStatus = 'IN_PROGRESS';
        gameAreaController.mockIsPlayer = false;
        gameAreaController.mockPlayer1 = ourPlayer;
        gameAreaController.mockPlayer2 = new PlayerController(
          'player 1',
          'player 2',
          randomLocation(),
        );
        gameAreaController.mockWinner = undefined;
        renderHangManArea();
        act(() => {
          gameAreaController.emit('gameEnd');
        });
        expect(mockToast).toBeCalledWith(
          expect.objectContaining({
            description: `Game ended in a tie`,
          }),
        );
      });
    });
  });
});
