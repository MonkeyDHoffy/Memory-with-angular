import { PlayerId, SymbolDefinition, WinnerId } from '../themes/theme.model';

export interface MemoryCard {
  id: number;
  symbolKey: string;
  frontImage: string;
  frontFilter: string | null;
}

export type BoardSizeId = 16 | 24 | 36;

interface DeckEntry {
  symbolKey: string;
  frontImage: string;
  frontFilter: string | null;
}

export function parseBoardSize(boardSizeParam: string | null): BoardSizeId {
  const parsedBoardSize = Number(boardSizeParam);

  if (parsedBoardSize === 24 || parsedBoardSize === 36) {
    return parsedBoardSize;
  }

  return 16;
}

export function parseStartingPlayer(playerParam: string | null): PlayerId {
  return playerParam === 'orange' ? 'orange' : 'blue';
}

export function createShuffledDeck(symbolPool: SymbolDefinition[], boardSize: BoardSizeId): MemoryCard[] {
  const pairCount = boardSize / 2;
  const selectedSymbols = symbolPool.slice(0, pairCount);

  const pairedDeck: DeckEntry[] = selectedSymbols.flatMap((symbol) => [
    {
      symbolKey: symbol.key,
      frontImage: symbol.frontImage,
      frontFilter: symbol.frontFilter,
    },
    {
      symbolKey: symbol.key,
      frontImage: symbol.frontImage,
      frontFilter: symbol.frontFilter,
    },
  ]);

  const shuffledDeck = shuffleDeck(pairedDeck);

  return shuffledDeck.map((card, id) => ({
    id,
    symbolKey: card.symbolKey,
    frontImage: card.frontImage,
    frontFilter: card.frontFilter,
  }));
}

export function resolveWinnerByScore(blueScore: number, orangeScore: number): WinnerId {
  if (blueScore > orangeScore) {
    return 'blue';
  }

  if (orangeScore > blueScore) {
    return 'orange';
  }

  return 'draw';
}

export function pickRandomPlayerWinner(): PlayerId {
  return Math.random() < 0.5 ? 'blue' : 'orange';
}

function shuffleDeck(cards: DeckEntry[]): DeckEntry[] {
  const shuffled = [...cards];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    const currentCard = shuffled[index];
    shuffled[index] = shuffled[randomIndex];
    shuffled[randomIndex] = currentCard;
  }

  return shuffled;
}
