require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const readline = require("readline");
const chalk = require("chalk");
const figlet = require("figlet");
const clear = require("clear");
const fs = require("fs");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth"); // Importing mammoth for DOC/DOCX files
const { generatePDF, generateTextFile } = require("./utils/fileHandler");
const analyzeSentiment = require("./utils/sentiment");
const { displayExamples } = require("./utils/examples");
const nlp = require("compromise"); // Importing compromise for keyword extraction
const nodemailer = require("nodemailer"); // Nodemailer for email functionality

if (!process.env.GEMINI_API_KEY) {
  console.error(chalk.red("❌ Error: GEMINI_API_KEY is not set in the .env file."));
  process.exit(1);
}

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-exp",
  systemInstruction: "You are an AI assistant specializing in summarization and insights.",
});

/**
 * Display the Main Menu
 */
function showMenu() {
  clear();
  figlet("AI Summarizer", (err, data) => {
    if (err) {
      console.log(chalk.red("❌ Error generating header."));
      return;
    }
    console.log(chalk.blueBright(data));
    rl.question(
      chalk.cyan("\n🔍 Welcome to the Summarist CLI!\nChoose an option:\n\n1. Summarize text\n2. Summarize a file\n3. Help\n4. Exit\n\nEnter your choice: "),
      handleMenuChoice
    );
  });
}

/**
 * Handle the user's menu choice
 */
async function handleMenuChoice(choice) {
  switch (choice) {
    case "1":
      rl.question(chalk.green("\n📝 Enter the text to summarize: "), async (input) => {
        await summarizeContent(input, "text");
        returnToMenu();
      });
      break;
    case "2":
      rl.question(chalk.green("\n📂 Enter the file path (PDF, DOC/DOCX, TXT) to summarize: "), async (filePath) => {
        await summarizeContent(filePath, "file");
        returnToMenu();
      });
      break;
    case "3":
      displayExamples();
      returnToMenu();
      break;
    case "4":
      showExitMessage();
      break;
    default:
      console.log(chalk.red("❌ Invalid choice, please select again."));
      showMenu();
      break;
  }
}

/**
 * Summarize content (text or file)
 */
async function summarizeContent(input, type) {
  try {
    let userPrompt;
    let textToSummarize;

    if (type === "text") {
      textToSummarize = input;
      userPrompt = `Summarize the following text:\n\n${input}`;
    } else if (type === "file") {
      console.log(chalk.blue("\n🔄 Extracting text from the file..."));

      // Handle file formats
      const fileExtension = input.split(".").pop().toLowerCase();
      if (fileExtension === "pdf") {
        const pdfBuffer = fs.readFileSync(input);
        const pdfData = await pdfParse(pdfBuffer);
        textToSummarize = pdfData.text;
      } else if (fileExtension === "doc" || fileExtension === "docx") {
        const docData = await mammoth.extractRawText({ path: input });
        textToSummarize = docData.value;
      } else if (fileExtension === "txt") {
        textToSummarize = fs.readFileSync(input, "utf-8");
      } else {
        throw new Error("Unsupported file format. Please provide a PDF, DOC/DOCX, or TXT file.");
      }

      userPrompt = `Summarize the following content extracted from a file:\n\n${textToSummarize}`;
    } else {
      throw new Error("Invalid content type.");
    }

    console.log(chalk.blue("\n🔄 Generating summary, please wait..."));
    const chatSession = model.startChat({
      generationConfig,
      history: [{ role: "user", parts: [{ text: userPrompt }] }],
    });
    const result = await chatSession.sendMessage(userPrompt);
    const summary = await result.response.text();

    console.log(chalk.green("\n✅ Summary Generated:\n"));
    console.log(chalk.white(summary));

    const sentimentResult = analyzeSentiment(summary);
    displayInsights(summary, sentimentResult);

    rl.question(
      chalk.cyan("\n💾 Do you want to save the summary? (yes/no): "),
      (saveResponse) => handleSaveResponse(saveResponse, summary, sentimentResult)
    );
  } catch (error) {
    console.error(chalk.red("\n❌ Error while summarizing:"));
    console.error(chalk.red(error.message || error));
  }
}

/**
 * Extract keywords from the text (Nouns, important terms)
 */
function extractKeywords(text) {
  const doc = nlp(text);
  const keywords = doc.nouns().out('array'); // Extract nouns
  return keywords;
}

/**
 * Display insights including sentiment and keywords
 */
function displayInsights(summary, sentimentResult) {
  const keywords = extractKeywords(summary); // Extract keywords from the summary

  console.log(chalk.yellow("\n🔍 Insights:"));
  console.log(chalk.green(`Summary Word Count: ${summary.split(" ").length}`));
  console.log(chalk.magenta(`Sentiment Score: ${sentimentResult.score}`));
  console.log(chalk.cyan(`Positive Words: ${sentimentResult.positive.join(", ")}`));
  console.log(chalk.red(`Negative Words: ${sentimentResult.negative.join(", ")}`));
  console.log(chalk.green(`Overall Sentiment: ${sentimentResult.overallSentiment}`));
  console.log(chalk.blue(`Keywords: ${keywords.join(", ")}`)); // Display extracted keywords
}

/**
 * Handle saving the summary
 */
function handleSaveResponse(answer, summary, insights) {
  if (answer.toLowerCase() === "yes") {
    rl.question(
      chalk.cyan("\n📂 Enter the output file format (txt/pdf/doc/all): "),
      (format) => saveSummary(summary, insights, format)
    );
  } else {
    returnToMenu();
  }
}

/**
 * Save summary as file
 */
function saveSummary(summary, insights, format) {
  const filenameBase = "summary_output";
  try {
    const normalizedFormat = format.toLowerCase();

    // Generate files based on the user's choice
    if (normalizedFormat === "txt" || normalizedFormat === "all") {
      generateTextFile(summary, insights, `${filenameBase}.txt`);
      console.log(chalk.green(`✔️ Summary saved as '${filenameBase}.txt'.`));
    }

    if (normalizedFormat === "pdf" || normalizedFormat === "all") {
      generatePDF(summary, insights, `${filenameBase}.pdf`);
      console.log(chalk.green(`✔️ Summary saved as '${filenameBase}.pdf'.`));
    }

    if (normalizedFormat === "doc" || normalizedFormat === "all") {
      generatePDF(summary, insights, `${filenameBase}.doc`);
      console.log(chalk.green(`✔️ Summary saved as '${filenameBase}.doc'.`));
    }

    // Ask user if they want to send the file via email
    rl.question(
      chalk.cyan("\n📧 Do you want to send the summary by email? (yes/no): "),
      (emailResponse) => {
        if (emailResponse.toLowerCase() === "yes") {
          rl.question(
            chalk.cyan("\n📧 Enter the recipient's email address: "),
            (email) => {
              sendEmail(`${filenameBase}.doc`, email)
                .then(() => returnToMenu())
                .catch(() => returnToMenu());
            }
          );
        } else {
          returnToMenu();
        }
      }
    );
  } catch (error) {
    console.error(chalk.red("❌ Error saving summary:"));
    console.error(chalk.red(error.message));
  } finally {
    returnToMenu();
  }
}

/**
 * Send email with the summary file as attachment
 */
async function sendEmail(filePath, recipientEmail) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',  // You can use other services or SMTP server as needed
    auth: {
      user: process.env.EMAIL_USER, // Your email address
      pass: process.env.EMAIL_PASS, // Your email password or app-specific password
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: recipientEmail,
    subject: 'Summarized Document',
    text: 'Please find the summarized document attached.',
    attachments: [
      {
        filename: filePath,
        path: filePath,
      },
    ],
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(chalk.green(`✔️ Summary sent to ${recipientEmail}.`));
  } catch (error) {
    console.error(chalk.red("❌ Error sending email:"));
    console.error(chalk.red(error.message));
  }
}

/**
 * Return to main menu
 */
function returnToMenu() {
  rl.question(chalk.cyan("\n🔄 Return to the main menu? (yes/no): "), (response) => {
    if (response.toLowerCase() === "yes") {
      showMenu();
    } else {
      showExitMessage();
    }
  });
}

/**
 * Display exit message
 */
function showExitMessage() {
  console.log(chalk.green("\n✨ Thank you for using Summarist CLI. Have a great day! ✨"));
  rl.close();
}

showMenu();
