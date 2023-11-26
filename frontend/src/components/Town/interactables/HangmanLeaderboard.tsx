import { Table, Tbody, Td, Thead, Tr } from '@chakra-ui/react';
import React from 'react';
import { GameResult } from '../../../types/CoveyTownSocket';

export default function HangmanLeaderboard({ results }: { results: GameResult[] }): JSX.Element {
  const winsByPlayer: Record<string, { player: string; wins: number }> = {};

  results.forEach(result => {
    const players = Object.keys(result.scores);
    const winner = result.scores[players[0]] > result.scores[players[1]] ? players[0] : players[1];

    if (winner) {
      winsByPlayer[winner] = {
        player: winner,
        wins: (winsByPlayer[winner]?.wins || 0) + 1,
      };
    }
  });

  const rows = Object.values(winsByPlayer);
  rows.sort((a, b) => b.wins - a.wins);

  return (
    <Table>
      <Thead>
        <Tr>
          <th>Player</th>
          <th>Wins</th>
        </Tr>
      </Thead>
      <Tbody>
        {rows.map(record => (
          <Tr key={record.player}>
            <Td>{record.player}</Td>
            <Td>{record.wins}</Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
}
