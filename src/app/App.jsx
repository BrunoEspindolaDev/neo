import Chat from '../modules/Chat';
import logo from '../assets/logo_complete.png';
import { Image, Stack } from '@chakra-ui/react';

const App = () => {
  return (
    <Stack align="center" w="100vw" h="100dvh" p={6}>
      <Stack w="100%" maxW="450px" h="700px">
        <Image src={logo} w="100px" h="auto" mb={10} />
        <Chat />
      </Stack>
    </Stack>
  );
};

export default App;
