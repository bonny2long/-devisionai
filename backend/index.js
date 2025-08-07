import express from 'express';
import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;


app.use(cors({
  origin: 'https://devisionai.netlify.app', 
  methods: ['GET', 'POST'],
  credentials: false
}));
