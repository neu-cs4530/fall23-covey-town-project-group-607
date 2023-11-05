import InvalidParametersError, {
  GAME_ID_MISSMATCH_MESSAGE,
  GAME_NOT_IN_PROGRESS_MESSAGE,
  INVALID_COMMAND_MESSAGE,
} from '../../lib/InvalidParametersError';
import Player from '../../lib/Player';
import {
  GameInstance,
  HangManGameState,
  HangManMove,
  InteractableCommand,
  InteractableCommandReturnType,
  InteractableType,
} from '../../types/CoveyTownSocket';
import GameArea from './GameArea';
import HangmanGame from './HangmanGame';

/**
 * A TicTacToeGameArea is a GameArea that hosts a TicTacToeGame.
 * @see HangmanGameArea
 * @see GameArea
 */
export default class HangmanGameArea extends GameArea<HangmanGame> {
  protected getType(): InteractableType {
    return 'HangmanArea';
  }

  private _stateUpdated(updatedState: GameInstance<HangManGameState>) {
    if (updatedState.state.status === 'OVER') {
      // If we haven't yet recorded the outcome, do so now.
      const gameID = this._game?.id;
      if (gameID && !this._history.find(eachResult => eachResult.gameID === gameID)) {
          const { player1, player2, player3, player4 } = updatedState.state;
          let player1Name = "";
          let player2Name ="";
          let player3Name ="";
          let player4Name ="";

          let isPlayer1Winner = false;
          let isPlayer2Winner = false;
          let isPlayer3Winner = false;
          let isPlayer4Winner = false;
          if (player1) {
              player1Name = this._occupants.find(eachPlayer => eachPlayer.id === player1)?.userName || player1;
              if (updatedState.state.winner?.includes(player1)) {
                  isPlayer1Winner = true
              }
          } else {
              player1Name = "Player 1 (Undefined)"
          }
          if (player2) {
              player2Name = this._occupants.find(eachPlayer => eachPlayer.id === player2)?.userName || player2;
              if (updatedState.state.winner?.includes(player2)) {
                  isPlayer2Winner = true
              }
          } else {
              player2Name = "Player 2 (Undefined)"
          }
          if (player3) {
              player3Name = this._occupants.find(eachPlayer => eachPlayer.id === player3)?.userName || player3;
              if (updatedState.state.winner?.includes(player3)) {
                  isPlayer3Winner = true
              }
          } else {
              player3Name = "Player 3 (Undefined)"
          }
          if (player4) {
              player4Name = this._occupants.find(eachPlayer => eachPlayer.id === player4)?.userName || player4;
              if (updatedState.state.winner?.includes(player4)) {
                  isPlayer4Winner = true
              }
          } else {
              player4Name = "Player 4 (Undefined)"
          }

          const score = {
              [player1Name]: isPlayer1Winner ? 1 : 0,
              [player2Name]: isPlayer2Winner ? 1 : 0,
              [player3Name]: isPlayer3Winner ? 1 : 0,
              [player4Name]: isPlayer4Winner ? 1 : 0,
          }

          this._history.push({
              gameID,
              scores: score,
          });
      }
    }
    this._emitAreaChanged();
  }

  /**
   * Handle a command from a player in this game area.
   * Supported commands:
   * - JoinGame (joins the game `this._game`, or creates a new one if none is in progress)
   * - GameMove (applies a move to the game)
   * - LeaveGame (leaves the game)
   *
   * If the command ended the game, records the outcome in this._history
   * If the command is successful (does not throw an error), calls this._emitAreaChanged (necessary
   *  to notify any listeners of a state update, including any change to history)
   * If the command is unsuccessful (throws an error), the error is propagated to the caller
   *
   * @see InteractableCommand
   *
   * @param command command to handle
   * @param player player making the request
   * @returns response to the command, @see InteractableCommandResponse
   * @throws InvalidParametersError if the command is not supported or is invalid. Invalid commands:
   *  - LeaveGame and GameMove: No game in progress (GAME_NOT_IN_PROGRESS_MESSAGE),
   *        or gameID does not match the game in progress (GAME_ID_MISSMATCH_MESSAGE)
   *  - Any command besides LeaveGame, GameMove and JoinGame: INVALID_COMMAND_MESSAGE
   */
  public handleCommand<CommandType extends InteractableCommand>(
    command: CommandType,
    player: Player,
  ): InteractableCommandReturnType<CommandType> {
    if (command.type === 'GameMove') {
      const game = this._game;
      if (!game) {
        throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
      }
      if (this._game?.id !== command.gameID) {
        throw new InvalidParametersError(GAME_ID_MISSMATCH_MESSAGE);
      }
      
      game.applyMove({
        gameID: command.gameID,
        playerID: player.id,
        move: command.move as HangManMove,
      });
      this._stateUpdated(game.toModel());
      return undefined as InteractableCommandReturnType<CommandType>;
    }
    if (command.type === 'JoinGame') {
      let game = this._game;
      if (!game || game.state.status === 'OVER') {
        // No game in progress, make a new one
        game = new HangmanGame();
        this._game = game;
      }
      game.join(player);
      this._stateUpdated(game.toModel());
      return { gameID: game.id } as InteractableCommandReturnType<CommandType>;
    }
    if (command.type === 'LeaveGame') {
      const game = this._game;
      if (!game) {
        throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
      }
      if (this._game?.id !== command.gameID) {
        throw new InvalidParametersError(GAME_ID_MISSMATCH_MESSAGE);
      }
      game.leave(player);
      this._stateUpdated(game.toModel());
      return undefined as InteractableCommandReturnType<CommandType>;
    }
    throw new InvalidParametersError(INVALID_COMMAND_MESSAGE);
  }
}