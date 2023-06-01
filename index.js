import express from "express";
import { extract } from "@extractus/article-extractor";
import { OpenAIApi, Configuration } from "openai";
import dotenv from "dotenv";
dotenv.config();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);
const model = "gpt-3.5-turbo";
const prompt =
  "You are a helpful assistant.\nYou should summarize this content in KOREAN.\nSummary: ";

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  console.log("Hello World!");
  res.send("Hello World!");
});

app.post("/extract", async (req, res) => {
  const { url } = req.body;
  try {
    const article = await extract(url);
    console.log(article);
    res.send(article);
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message);
  }
});

app.post("/summary", async (req, res) => {
  const { content } = req.body;
  console.log(content);
  try {
    const completion = await openai.createChatCompletion({
      model: model,
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: content },
      ],
      temperature: 0.9,
    });
    console.log(completion.data.choices[0].message.content);
    const summary = { summary: completion.data.choices[0].message.content };
    res.send(summary);
  } catch (error) {
    if (error.response) {
      res.send(error.response.data);
    } else {
      res.send(error.message);
    }
  }
});

app.listen(3000, () => {
  console.log("Example app listening on port 3000!");
});
