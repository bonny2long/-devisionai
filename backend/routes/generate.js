import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import 'dotenv/config';

const router = express.Router();

const upload = multer({ dest: 'uploads/' });

async function transcribeAudio(filePath) {
  // TODO: Replace this with Claude/Whisper transcription call
  // For now, fake it
  return 'Transcript from audio file. (Replace this with real transcription.)';
}

async function callClaude(prompt) {
  const apiKey = process.env.CLAUDE_API_KEY;

  const response = await axios.post(
    'https://api.anthropic.com/v1/messages',
    {
      model: 'claude-3-opus-20240229',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    },
    {
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
    }
  );

  return response.data?.content?.[0]?.text || 'No response.';
}


router.post('/', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const ext = path.extname(file.originalname).toLowerCase();

    let transcript = '';

    if (ext === '.txt') {
      // Read plain text file
      transcript = fs.readFileSync(file.path, 'utf-8');
    } else if (ext === '.mp3' || ext === '.m4a') {
      // Audio file – send to transcription (stubbed here)
      transcript = await transcribeAudio(file.path);
    } else {
      return res.status(400).json({ error: 'Unsupported file type.' });
    }

    // Generate SOAP + Summary from Claude
    const soapNote = await callClaude('You are a medical assistant. Create a SOAP note for this transcript:\n' + transcript);
    const patientSummary = await callClaude('Summarize the following transcript in plain, friendly language:\n' + transcript);

    // Clean up temp file
    fs.unlinkSync(file.path);

    res.json({ soapNote, patientSummary });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong.' });
  }
});

export default router;
