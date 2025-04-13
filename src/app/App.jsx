import Chat from '../modules/Chat';
import { Center, Stack } from '@chakra-ui/react';

const App = () => {
  return (
    <Center w="100vw" h="100dvh" p={6}>
      <Stack flex={1} w="100%" maxW="500px" h="600px">
        <Chat />
      </Stack>
    </Center>
  );
};

export default App;
