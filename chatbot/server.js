const express = require("express");
const pdfParse = require("pdf-parse");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY is not set in the .env file");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Use built‑in middleware so Twilio can POST URL‑encoded data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// --- Helper: Send a Twilio message using Basic Auth ---
async function sendTwilioMessage(to, from, body) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const authString = Buffer.from(`${accountSid}:${authToken}`).toString(
    "base64"
  );
  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

  const data = new URLSearchParams();
  data.append("Body", body);
  data.append("From", from);
  data.append("To", to);

  await axios.post(url, data, {
    headers: {
      Authorization: `Basic ${authString}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
}

// --- Helper: Generate MCQs using Gemini ---
async function generateMCQsFromText(text) {
  const prompt = `
You are an educational content creator. Based on the following content, generate 10 multiple choice questions (MCQs) with 4 options each. Specify the correct answer as the option index (0, 1, 2, or 3). Return the result as raw JSON in exactly the following format without any extra text:
{
  "mcqs": [
    { "question": "Example question", "options": ["Option A", "Option B", "Option C", "Option D"], "correctAnswer": 0 }
  ]
}

Content:
${text}
`;

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.7, topP: 0.8, maxOutputTokens: 8192 },
  });

  if (!result || !result.response) {
    throw new Error("No response from Gemini API");
  }

  let responseText = result.response.text();

  // Strip markdown formatting if present (remove starting and trailing triple backticks)
  responseText = responseText
    .trim()
    .replace(/^```(json)?/, "")
    .replace(/```$/, "")
    .trim();

  let mcqData;
  try {
    mcqData = JSON.parse(responseText);
  } catch (parseError) {
    throw new Error(`Failed to parse Gemini response as JSON: ${responseText}`);
  }
  return mcqData;
}

// --- Webhook endpoint for Twilio WhatsApp ---
app.post("/webhook", async (req, res) => {
  try {
    // Extract relevant Twilio parameters from the form POST
    const sender = req.body.From; // The user's WhatsApp number
    const receiver = req.body.To; // Your Twilio number
    const mediaUrl = req.body.MediaUrl0;
    const mediaContentType = req.body.MediaContentType0;

    if (mediaUrl && mediaContentType === "application/pdf") {
      console.log(`Received PDF from ${sender}: ${mediaUrl}`);

      // Download the PDF using Basic Auth
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const authString = Buffer.from(`${accountSid}:${authToken}`).toString(
        "base64"
      );
      const pdfResponse = await axios.get(mediaUrl, {
        responseType: "arraybuffer",
        headers: { Authorization: `Basic ${authString}` },
      });
      const pdfBuffer = Buffer.from(pdfResponse.data);

      // Save the PDF temporarily
      const uploadDir = path.join(__dirname, "uploads");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const tempFile = path.join(uploadDir, `${Date.now()}-document.pdf`);
      fs.writeFileSync(tempFile, pdfBuffer);
      console.log(`PDF saved to ${tempFile}`);

      // Extract text from PDF
      const pdfData = await pdfParse(fs.readFileSync(tempFile));
      const extractedText = pdfData.text;
      fs.unlinkSync(tempFile); // Delete temporary file
      console.log(`Extracted ${extractedText.length} characters of text`);

      // Generate MCQs via Gemini API using the extracted text
      const mcqData = await generateMCQsFromText(extractedText);

      // For demonstration, pick the first generated MCQ and format a message.
      let messageBody = "";
      if (mcqData.mcqs && mcqData.mcqs.length > 0) {
        const question = mcqData.mcqs[0];
        messageBody += `MCQ: ${question.question}\n`;
        question.options.forEach((opt, idx) => {
          messageBody += `${String.fromCharCode(65 + idx)}. ${opt}\n`;
        });
        messageBody += `Answer: ${String.fromCharCode(
          65 + question.correctAnswer
        )}`;
      } else {
        messageBody = "No MCQs were generated from the PDF.";
      }

      // Send the MCQ message back to the user
      await sendTwilioMessage(sender, receiver, messageBody);
    } else {
      // If no PDF was sent, instruct the user to send a PDF.
      await sendTwilioMessage(
        sender,
        receiver,
        "Please send a PDF document to generate MCQs."
      );
    }

    // Respond to Twilio with minimal TwiML (an empty <Response> element)
    res.writeHead(200, { "Content-Type": "text/xml" });
    res.end("<Response></Response>");
  } catch (error) {
    console.error("Error in webhook:", error);
    res.writeHead(200, { "Content-Type": "text/xml" });
    res.end("<Response>Error processing your request.</Response>");
  }
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
