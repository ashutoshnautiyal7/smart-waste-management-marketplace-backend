import express from 'express';
import multer from 'multer';
import fs from 'fs';
import fetch from 'node-fetch';
import { Ollama } from 'ollama';
import cors from 'cors'
import "dotenv/config";
import ApiRoutes from './routes/api.js'
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";


// Create an instance of the Express app
const app = express();
app.use(cors()); 

app.use(cookieParser());
// def middlewares 
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(bodyParser.urlencoded({ extended: true }));

// Set up multer for handling image uploads
const upload = multer({ dest: 'uploads/' });

// Patch global fetch in Node.js
globalThis.fetch = fetch;

// Create an instance of the Ollama client
const ollama = new Ollama({ host: 'http://0.0.0.0:11434' });

app.use('/api', ApiRoutes);

// API endpoint to handle image upload and interaction with LLava model
app.post('/describe-image', upload.single('image'), async (req, res) => {
  const filePath = req.file.path;
  const prompt = req.body.prompt; 

  try {
    // Read the uploaded image as a binary buffer
    const imageBuffer = fs.readFileSync(filePath);

    // Encode the image buffer as a Base64 string
    const imageBase64 = imageBuffer.toString('base64');

    // Send the request to the Ollama server
    const output = await ollama.generate({
      model: 'llava:13b',
      prompt: prompt,
      images: [imageBase64],
    });

    console.log("the output is " , output);

    // Send the response from LLava model back to the client
    res.json({ description: output.response });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to process image' });
  } finally {
    // Clean up the uploaded file
    fs.unlinkSync(filePath);
  }
});



app.post('/reuse', upload.single('image'), async (req, res) => {
    const filePath = req.file.path;
  
    try {
      // Read the uploaded image as a binary buffer
      const imageBuffer = fs.readFileSync(filePath);
  
      // Encode the image buffer as a Base64 string
      const imageBase64 = imageBuffer.toString('base64');
  
      // Send the request to the Ollama server
      const output = await ollama.generate({
        model: 'llava:13b',
        prompt: "how can I reuse the waste in image? Give answer in only 4 lines. Include relevant image links or online resources for guidance.",
        images: [imageBase64],
      });
  
      console.log("the output is " , output.response);
  
      // Send the response from LLava model back to the client
      res.json({ description: output.response });
  
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Failed to process image' });
    } finally {
      // Clean up the uploaded file
      fs.unlinkSync(filePath);
    }
  });
  
app.post('/recycle', upload.single('image'), async (req, res) => {
    const filePath = req.file.path;
  
    try {
      // Read the uploaded image as a binary buffer
      const imageBuffer = fs.readFileSync(filePath);
  
      // Encode the image buffer as a Base64 string
      const imageBase64 = imageBuffer.toString('base64');
  
      // Send the request to the Ollama server
      const output = await ollama.generate({
        model: 'llava:13b',
        prompt: "Identify waste items in this image. Segregate the waste and list recycling mehtods. ",
        images: [imageBase64],
      }); 


      const resources ="https://www.youtube.com/watch?v=4JDGFNoY-rQ https://udd.uk.gov.in/files/20170825_SWM_action_plan__revised_final_draft_with_comments_sent_to_state-_August_II.pdf"
      
  
      console.log("the output is " , output.response + resources);
  
      // Send the response from LLava model back to the client
      res.json({ description: output.response +  resources});
  
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Failed to process image' });
    } finally {
      // Clean up the uploaded file
      fs.unlinkSync(filePath);
    }
  });
  
// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
