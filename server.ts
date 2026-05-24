import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini API client
  const apiKey = process.env.GEMINI_API_KEY;
  const ai = apiKey ? new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  }) : null;

  // Endpoint: generate exam item
  app.post("/api/generate-item", async (req, res) => {
    try {
      if (!ai) {
        return res.status(400).json({ 
          error: "Gemini API key is not configured on the server. Please add your GEMINI_API_KEY in the Secrets / Settings menu." 
        });
      }
      const { topic, class_level, difficulty, num_tasks } = req.body;

      if (!topic || !class_level || !difficulty || !num_tasks) {
        return res.status(400).json({ error: "Missing required fields: topic, class_level, difficulty, num_tasks" });
      }

      const prompt = `Generate a scenario-based Biology item for:
- Topic: ${topic}
- Class level: ${class_level}
- Difficulty: ${difficulty}
- Number of tasks: ${num_tasks}
- Uganda-specific context: yes`;

      const systemInstruction = `You are an expert Biology teacher and curriculum specialist for Ugandan secondary schools under the NCDC Competence-Based Curriculum (CBC). You generate scenario-based examination items for Biology in the format used by UNEB. A scenario-based item has two parts:
1. SCENARIO: A 150–300 word narrative set in a real-life Ugandan context (farms near districts like Mukono, hospitals near Mulago, Lake Victoria, local markets like Nakasero, schools, small villages, or national parks like Queen Elizabeth). The narrative must naturally embed the target Biology concept without being a textbook definition. Use local names, local organisms (e.g. Nile perch, tilapia, matoke/bananas, cassava, sweet potatoes, Anopheles mosquito, tsetse fly, water hyacinth, maize, coffee, beans), and relatable Ugandan situations.
2. TASKS: ${num_tasks} tasks that follow the scenario, progressing from lower- to higher-order thinking (Bloom's Taxonomy, representing CBC standards). Each task must:
- Be clearly answerable using the scenario as context.
- Be tagged to a CBC competency: [Critical thinking | Problem solving | Communication | Creativity and innovation | Cooperation | Lifelong learning].
- Carry a mark allocation (e.g., 5 to 10 marks per task).
- Have a model answer and a mark scheme (rubric detailing exactly how to award marks).

Format your output strictly to match the requested JSON schema. Make sure the narrative language is level-appropriate (simpler for S1-S2, more academic for S5-S6).`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              topic: { type: Type.STRING },
              class_level: { type: Type.STRING },
              difficulty: { type: Type.STRING },
              scenario: { type: Type.STRING, description: "The 150-300 word narrative set in Uganda embedding Biology principles." },
              tasks: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    task_number: { type: Type.INTEGER },
                    task_text: { type: Type.STRING },
                    marks: { type: Type.INTEGER },
                    competency: { type: Type.STRING },
                    bloom_level: { type: Type.STRING },
                    model_answer: { type: Type.STRING },
                    mark_scheme: { type: Type.STRING }
                  },
                  required: ["task_number", "task_text", "marks", "competency", "bloom_level", "model_answer", "mark_scheme"]
                }
              }
            },
            required: ["topic", "class_level", "difficulty", "scenario", "tasks"]
          }
        }
      });

      const responseText = response.text || "{}";
      const item = JSON.parse(responseText);
      res.json(item);
    } catch (error: any) {
      console.error("Item generation failed:", error);
      res.status(500).json({ error: error.message || "Failed to generate exam item" });
    }
  });

  // Endpoint: evaluate response
  app.post("/api/evaluate-response", async (req, res) => {
    try {
      if (!ai) {
        return res.status(400).json({ 
          error: "Gemini API key is not configured on the server. Please add your GEMINI_API_KEY in the Secrets / Settings menu." 
        });
      }
      const { scenario, task_text, marks, competency, mark_scheme, student_answer } = req.body;

      if (!scenario || !task_text || !marks || !competency || !mark_scheme || student_answer === undefined) {
        return res.status(400).json({ error: "Missing required fields for evaluation" });
      }

      const userPrompt = `Scenario: ${scenario}
Task: ${task_text}
Marks available: ${marks}
CBC Competency: ${competency}
Mark scheme: ${mark_scheme}
Student's answer: ${student_answer}`;

      const systemInstruction = `You are a Biology teacher marking a student's response to a scenario-based task under Uganda's CBC. Evaluate the student's answer against the mark scheme/rubric. Give:
1. A score out of the total marks available.
2. Competency-linked feedback (2–3 sentences): what the student did well, what is missing, and a tip for improvement. Reference the scenario context in your feedback and be constructive, guiding them on generic skills.
3. The model answer.

Be encouraging, specific, objective, and link feedback directly to the CBC competency for that task. Format your output strictly as JSON following the schema.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: userPrompt,
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.INTEGER },
              feedback: { type: Type.STRING },
              model_answer: { type: Type.STRING }
            },
            required: ["score", "feedback", "model_answer"]
          }
        }
      });

      const responseText = response.text || "{}";
      const eval_res = JSON.parse(responseText);
      res.json(eval_res);
    } catch (error: any) {
      console.error("Evaluation failed:", error);
      res.status(500).json({ error: error.message || "Failed to evaluate student's response" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
