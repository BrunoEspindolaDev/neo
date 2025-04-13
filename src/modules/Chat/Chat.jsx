import gemini from '../../services/gemini';
import google from '../../services/google';
import React, { useEffect, useState, useRef } from 'react';
import { dialogWithErrorDetector, translate } from './Chat.constants';
import { PiMicrophoneDuotone, PiMicrophoneSlashDuotone } from 'react-icons/pi';
import SpeechRecognition, {
  useSpeechRecognition
} from 'react-speech-recognition';
import {
  Button,
  Icon,
  IconButton,
  Stack,
  Text,
  Box,
  ButtonGroup
} from '@chakra-ui/react';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState('pt-BR');
  const [promptName, setPromptName] = useState('dialog');
  const [isManuallyListening, setIsManuallyListening] = useState(false);

  const { transcript, listening, resetTranscript } = useSpeechRecognition();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const toggleLanguage = () => {
    stopListening();
    resetTranscript();
    setLanguage(prev => (prev === 'pt-BR' ? 'en-US' : 'pt-BR'));
  };

  const togglePromptName = () => {
    stopListening();
    resetTranscript();
    setPromptName(prev => (prev === 'dialog' ? 'translate' : 'dialog'));
  };

  const startListening = () => {
    setIsManuallyListening(true);
    SpeechRecognition.startListening({ continuous: true, language });
  };

  const stopListening = () => {
    setIsManuallyListening(false);
    SpeechRecognition.stopListening();
  };

  const speak = async text => {
    google
      .textToSpeech(text)
      .then(({ data }) => {
        const audioContent = data.audioContent;
        const audio = new Audio(`data:audio/mp3;base64,${audioContent}`);
        audio.play();
      })
      .catch(() => console.error('Failed to synthesize speech'));
  };

  const sendToGemini = async () => {
    if (!transcript) return;

    const updatedMessages = [...messages, { role: 'user', text: transcript }];
    resetTranscript();

    const formattedConversation = updatedMessages
      .map(msg =>
        msg.role === 'user' ? `Person: ${msg.text}` : `You: ${msg.text}`
      )
      .join('\n');

    const formattedPrompt =
      promptName === 'dialog'
        ? `${dialogWithErrorDetector}.\n\nThe conversation so far:\n${formattedConversation}\n\nYou:`
        : `${translate}.\n${transcript}`;

    setMessages(updatedMessages);
    setIsLoading(true);

    gemini
      .sendMessage(formattedPrompt)
      .then(({ data }) => {
        const aiResponse =
          data.candidates?.[0]?.content?.parts?.[0]?.text ||
          'There was an error generating the response.';

        setMessages(prev => [...prev, { role: 'gemini', text: aiResponse }]);
        speak(aiResponse);
      })
      .catch(() => console.error('Ops, Is something wrong with your message!'))
      .finally(() => setIsLoading(false));
  };

  const handleClickAudioButton = () => {
    if (listening) {
      stopListening();
    } else {
      startListening();
    }
  };

  useEffect(() => {
    if (!isManuallyListening) return;

    const interval = setInterval(() => {
      if (!listening) {
        SpeechRecognition.startListening({ continuous: true, language });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isManuallyListening, listening, language]);

  useEffect(() => {
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.getVoices();
    };
  }, []);

  if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
    return <p>Your browser does not support speech recognition</p>;
  }

  return (
    <Stack flex={1} spacing={4} overflow="hidden">
      <IconButton
        w="120px"
        h="120px"
        rounded="full"
        aria-label="mic"
        alignSelf="center"
        icon={
          <Icon
            w="56px"
            h="56px"
            as={listening ? PiMicrophoneDuotone : PiMicrophoneSlashDuotone}
          />
        }
        borderWidth={3}
        borderColor={listening ? 'green.500' : 'transparent'}
        onClick={handleClickAudioButton}
      />
      <ButtonGroup alignSelf="center">
        <Button
          mb={2}
          size="sm"
          w="100px"
          fontSize="sm"
          rounded="full"
          onClick={toggleLanguage}>
          {language}
        </Button>
        <Button
          mb={2}
          size="sm"
          w="100px"
          fontSize="sm"
          rounded="full"
          onClick={togglePromptName}>
          {promptName}
        </Button>
      </ButtonGroup>
      {transcript && (
        <Stack borderWidth={1} rounded="xl" spacing={4} p={3}>
          <Text>{transcript}</Text>
          <ButtonGroup>
            <Button flex={1} size="sm" rounded="full" onClick={resetTranscript}>
              Clear
            </Button>
            <Button
              flex={1}
              size="sm"
              rounded="full"
              color="black"
              bg="green.400"
              colorScheme="green"
              onClick={sendToGemini}>
              Confirm
            </Button>
          </ButtonGroup>
        </Stack>
      )}
      {messages.length > 0 && (
        <Stack
          flex={1}
          overflowY="auto"
          borderWidth={1}
          rounded="xl"
          p={3}
          spacing={3}>
          {messages.map((msg, i) => {
            const isUser = msg.role === 'user';
            return (
              <Box
                px={4}
                py={2}
                key={i}
                alignSelf={isUser ? 'flex-end' : 'flex-start'}
                bg={isUser ? 'green.300' : 'gray.100'}
                rounded="lg"
                roundedTopLeft={isUser ? 'lg' : 'none'}
                roundedTopRight={isUser ? 'none' : 'lg'}
                maxW="80%">
                <Text fontSize="sm" color="blackAlpha.800">
                  {msg.text}
                </Text>
              </Box>
            );
          })}
          {isLoading && (
            <Box
              alignSelf="flex-start"
              bg="gray.100"
              px={4}
              py={2}
              rounded="lg"
              roundedTopLeft="none"
              maxW="80%">
              <Text fontSize="sm" color="blackAlpha.800">
                ...
              </Text>
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Stack>
      )}
    </Stack>
  );
};

export default Chat;
