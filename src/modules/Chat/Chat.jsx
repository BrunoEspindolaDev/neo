import gemini from '../../services/gemini';
import google from '../../services/google';
import React, { useEffect, useState, useRef } from 'react';
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

    const prompt = `You are a friendly person practicing English with someone who speaks Portuguese. Respond only in English, like a natural conversation between two people. Do not use special characters like quotation marks or asterisks. Punctuation like commas and question marks is okay.\n\nThe conversation so far:\n${formattedConversation}\n\nYou:`;

    setMessages(updatedMessages);
    setIsLoading(true);

    gemini
      .sendMessage(prompt)
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
        borderColor={listening ? 'blue.500' : 'transparent'}
        onClick={handleClickAudioButton}
      />
      <Button
        mb={2}
        size="sm"
        w="100px"
        fontSize="sm"
        rounded="full"
        alignSelf="center"
        onClick={toggleLanguage}>
        {language}
      </Button>
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
          {messages.map((msg, i) => (
            <Box
              key={i}
              alignSelf={msg.role === 'user' ? 'flex-end' : 'flex-start'}
              bg={msg.role === 'user' ? 'blue.100' : 'gray.100'}
              px={4}
              py={2}
              borderRadius="lg"
              maxW="80%">
              <Text fontSize="sm" color="blackAlpha.800">
                {msg.text}
              </Text>
            </Box>
          ))}
          {isLoading && (
            <Box
              alignSelf="flex-start"
              bg="gray.100"
              px={4}
              py={2}
              borderRadius="lg"
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
