import axios from 'axios';

const GEMINI_API_KEY = import.meta.env.VITE_APP_GEMINI_API_KEY;

const sendMessage = prompt => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

  return axios.post(
    url,
    JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    }),
    {
      headers: { 'Content-Type': 'application/json' }
    }
  );
};

export default {
  sendMessage
};
