import { VStack, Heading, Button, Input, Box, Text } from '@chakra-ui/react';
import HangmanAreaController from '../../../../classes/interactable/HangmanAreaController';
import { HangManLetters } from '../../../../types/CoveyTownSocket';


export type HangmanBoardProps = {
  gameAreaController: HangmanAreaController;
};

export default function HangmanBoard({ gameAreaController }: HangmanBoardProps): JSX.Element {
  const [letterGuess, setLetterGuess] = useState('');
  const [wordGuess, setWordGuess] = useState('');
  const [displayedWord, setDisplayedWord] = useState('');
  // const [guessesSoFar, setGuessesSoFar] = useState('');
  const [isOurTurn, setIsOurTurn] = useState(gameAreaController.isOurTurn);
  const [currentGuess, setCurrentGuess] = useState(gameAreaController.currentGuess);
  const [occupants, setOccupants] = useState(gameAreaController.occupants);
  // const toast = useToast();

  useEffect(() => {
    const handleBoardChanged = () => {
      setCurrentGuess(gameAreaController.currentGuess);
      setOccupants(gameAreaController.occupants);
      setWord(gameAreaController.word);
    };

    const handleTurnChanged = () => {
      setIsOurTurn(gameAreaController.isOurTurn);
    };
    // Update the displayed word when the current guess changes
    const newDisplayedWord = currentGuess?.map(letter => letter || '_ ').join('');
    setDisplayedWord(newDisplayedWord);
    gameAreaController.addListener('boardChanged', handleBoardChanged);
    gameAreaController.addListener('turnChanged', handleTurnChanged);
    return () => {
      gameAreaController.removeListener('boardChanged', handleBoardChanged);
      gameAreaController.removeListener('turnChanged', handleTurnChanged);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [HangmanBoard]);

  const handleLetterGuessSubmit = async () => {
    try {
      await gameAreaController.makeMove(letterGuess as HangManLetters);
      setLetterGuess('');
      gameAreaController.updateFrom(gameAreaController.toInteractableAreaModel(), occupants);
    } catch (e) {
      console.error('Error making letter guess:', e);
    }
  };

  const handleWordGuessSubmit = async () => {
    try {
      await gameAreaController.makeMove(wordGuess as HangManLetters);
      setWordGuess('');
      gameAreaController.updateFrom(gameAreaController.toInteractableAreaModel(), occupants);
    } catch (e) {
      console.error('Error making word guess:', e);
    }
  };

  // const handleLetterGuess = async () => {
  //   try {
  //     await gameAreaController.makeMove(letterGuess as HangManLetters, '');
  //     setLetterGuess('');
  //   } catch (e) {
  //     console.error('Unable to submit letter: Please try again.', e);
  //     toast({
  //       title: 'Error',
  //       description: `Error: ${e}`,
  //       status: 'error',
  //     });
  //   }
  // };

  // const handleWordGuess = async () => {
  //   try {
  //     // Check if it's our turn to make a move
  //     if (gameAreaController.isOurTurn) {
  //       // Ensure both letter and word guesses are not submitted at the same time
  //       if (letterGuess !== '' && wordGuess !== '') {
  //         console.error('You can only submit a letter or a word, not both.');
  //         return;
  //       }
  //       await gameAreaController.makeMove(letterGuess as HangManLetters, wordGuess);
  //       setWordGuess('');
  //     }
  //   } catch (e) {
  //     console.error('Unable to submit your guess: Please try again', e);
  //     toast({
  //       title: 'Error',
  //       description: `Error: ${e}`,
  //       status: 'error',
  //     });
  //   }
  // };

  return (
    <VStack spacing={4}>
      <Text fontSize='xl'>Word: {displayedWord}</Text>

      <Box>
        <Heading as='h3'>Guess a Letter</Heading>
        <Input
          placeholder='Guess a letter'
          value={letterGuess}
          maxLength={1}
          onChange={e => setLetterGuess(e.target.value)}
          isDisabled={wordGuess !== '' || !isOurTurn}
        />
        <Button
          colorScheme='blue'
          onClick={handleLetterGuessSubmit}
          isDisabled={letterGuess === '' || wordGuess !== ''}>
          Guess Letter
        </Button>
      </Box>
      <Box>
        <Heading as='h3'>Guess the Word</Heading>
        <Input
          placeholder='Guess the word'
          value={wordGuess}
          onChange={e => setWordGuess(e.target.value)}
          isDisabled={letterGuess !== '' || !isOurTurn}
        />
        <Button
          colorScheme='blue'
          onClick={handleWordGuessSubmit}
          isDisabled={wordGuess === '' || letterGuess !== ''}>
          Guess Word
        </Button>
      </Box>
    </VStack>
  );
}
