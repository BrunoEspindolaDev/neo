import axios from 'axios';

const TEXT_TO_SPEECH_API_KEY = import.meta.env
  .VITE_APP_GOOGLE_TEXT_TO_SPEECH_API_KEY;

const textToSpeech = text => {
  const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${TEXT_TO_SPEECH_API_KEY}`;

  return axios.post(
    url,
    JSON.stringify({
      input: { text },
      voice: { languageCode: 'en-US', name: 'en-US-Standard-B' },
      audioConfig: { audioEncoding: 'MP3' }
    }),
    {
      headers: { 'Content-Type': 'application/json' }
    }
  );
};

export default {
  textToSpeech
};
