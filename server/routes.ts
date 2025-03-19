import express, { Router, Request, Response } from "express";
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import * as openai from "./openai";
import {
  insertUserSchema,
  insertSubjectSchema,
  insertTopicSchema,
  insertUserProgressSchema,
  insertTestSchema,
  insertUserTestResultSchema,
  insertBadgeSchema,
  insertUserBadgeSchema,
  insertStudyStreakSchema,
  insertStudyPlanTaskSchema,
  insertAiChatHistorySchema
} from "@shared/schema";
import { ZodError } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const router = Router();

  // Auth routes
  router.post("/auth/register", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      
      // Return user without password
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.flatten().formErrors.join(", ") });
      }
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  router.post("/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = z.object({
        username: z.string(),
        password: z.string()
      }).parse(req.body);
      
      const user = await storage.authenticateUser(username, password);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.flatten().formErrors.join(", ") });
      }
      res.status(500).json({ message: "Login failed" });
    }
  });

  // User routes
  router.get("/users/:id", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Return user without password
      const { password, ...userWithoutPassword } = user;
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Subjects routes
  router.get("/subjects", async (_req: Request, res: Response) => {
    try {
      const subjects = await storage.getAllSubjects();
      res.status(200).json(subjects);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch subjects" });
    }
  });

  router.get("/subjects/:id", async (req: Request, res: Response) => {
    try {
      const subjectId = parseInt(req.params.id);
      const subject = await storage.getSubject(subjectId);
      
      if (!subject) {
        return res.status(404).json({ message: "Subject not found" });
      }
      
      res.status(200).json(subject);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch subject" });
    }
  });

  // Topics routes
  router.get("/subjects/:subjectId/topics", async (req: Request, res: Response) => {
    try {
      const subjectId = parseInt(req.params.subjectId);
      const topics = await storage.getTopicsBySubject(subjectId);
      res.status(200).json(topics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch topics" });
    }
  });

  // User progress routes
  router.get("/users/:userId/progress", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const progress = await storage.getUserProgress(userId);
      res.status(200).json(progress);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user progress" });
    }
  });

  router.post("/users/:userId/progress", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const progressData = insertUserProgressSchema.parse({
        ...req.body,
        userId
      });
      
      const progress = await storage.updateUserProgress(progressData);
      res.status(200).json(progress);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.flatten().formErrors.join(", ") });
      }
      res.status(500).json({ message: "Failed to update progress" });
    }
  });

  // Tests routes
  router.get("/tests", async (req: Request, res: Response) => {
    try {
      const subjectId = req.query.subjectId ? parseInt(req.query.subjectId as string) : undefined;
      const tests = subjectId ? 
        await storage.getTestsBySubject(subjectId) : 
        await storage.getAllTests();
      res.status(200).json(tests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tests" });
    }
  });

  router.get("/users/:userId/test-results", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const results = await storage.getUserTestResults(userId);
      res.status(200).json(results);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch test results" });
    }
  });

  router.post("/users/:userId/test-results", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const resultData = insertUserTestResultSchema.parse({
        ...req.body,
        userId
      });
      
      const result = await storage.saveUserTestResult(resultData);
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.flatten().formErrors.join(", ") });
      }
      res.status(500).json({ message: "Failed to save test result" });
    }
  });

  // Badges routes
  router.get("/users/:userId/badges", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const badges = await storage.getUserBadges(userId);
      res.status(200).json(badges);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch badges" });
    }
  });

  // Study streaks routes
  router.get("/users/:userId/study-streaks", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const streaks = await storage.getUserStudyStreaks(userId);
      res.status(200).json(streaks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch study streaks" });
    }
  });

  router.post("/users/:userId/study-streaks", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const streakData = insertStudyStreakSchema.parse({
        ...req.body,
        userId
      });
      
      const streak = await storage.addStudyStreak(streakData);
      res.status(201).json(streak);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.flatten().formErrors.join(", ") });
      }
      res.status(500).json({ message: "Failed to add study streak" });
    }
  });

  // Study plan routes
  router.get("/users/:userId/study-plan", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const tasks = await storage.getUserStudyPlan(userId);
      res.status(200).json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch study plan" });
    }
  });

  router.post("/users/:userId/study-plan", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const taskData = insertStudyPlanTaskSchema.parse({
        ...req.body,
        userId
      });
      
      const task = await storage.addStudyPlanTask(taskData);
      res.status(201).json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.flatten().formErrors.join(", ") });
      }
      res.status(500).json({ message: "Failed to add study plan task" });
    }
  });

  router.patch("/users/:userId/study-plan/:taskId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const taskId = parseInt(req.params.taskId);
      const { completed } = z.object({
        completed: z.boolean()
      }).parse(req.body);
      
      const updatedTask = await storage.updateStudyPlanTaskCompletion(userId, taskId, completed);
      res.status(200).json(updatedTask);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.flatten().formErrors.join(", ") });
      }
      res.status(500).json({ message: "Failed to update task" });
    }
  });

  // AI-powered endpoints
  router.post("/ai/generate-questions", async (req: Request, res: Response) => {
    try {
      const { subject, topic, difficulty, count } = z.object({
        subject: z.string(),
        topic: z.string(),
        difficulty: z.string().optional(),
        count: z.number().optional()
      }).parse(req.body);
      
      const questions = await openai.generateQuestions(subject, topic, difficulty, count);
      res.status(200).json(questions);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.flatten().formErrors.join(", ") });
      }
      res.status(500).json({ message: "Failed to generate questions" });
    }
  });

  router.post("/ai/generate-explanation", async (req: Request, res: Response) => {
    try {
      const { subject, concept } = z.object({
        subject: z.string(),
        concept: z.string()
      }).parse(req.body);
      
      const explanation = await openai.generateExplanation(subject, concept);
      res.status(200).json({ explanation });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Failed to generate explanation" });
    }
  });

  router.post("/ai/analyze-answer", async (req: Request, res: Response) => {
    try {
      const { question, answer, subject } = z.object({
        question: z.string(),
        answer: z.string(),
        subject: z.string()
      }).parse(req.body);
      
      const analysis = await openai.analyzeAnswer(question, answer, subject);
      res.status(200).json(analysis);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Failed to analyze answer" });
    }
  });

  router.post("/ai/generate-study-plan", async (req: Request, res: Response) => {
    try {
      const { userId, performance } = z.object({
        userId: z.number(),
        performance: z.any()
      }).parse(req.body);
      
      const plan = await openai.generateStudyPlan(userId, performance);
      res.status(200).json(plan);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Failed to generate study plan" });
    }
  });

  router.post("/ai/chat", async (req: Request, res: Response) => {
    try {
      const { userId, messages } = z.object({
        userId: z.number(),
        messages: z.array(z.object({
          content: z.string(),
          isUser: z.boolean()
        }))
      }).parse(req.body);
      
      const response = await openai.processAiChat(messages);
      
      // Save the chat history
      await storage.saveAiChatHistory({
        userId,
        messages: [...messages, { content: response, isUser: false }]
      });
      
      res.status(200).json({ response });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.flatten().formErrors.join(", ") });
      }
      res.status(500).json({ message: "Failed to process chat" });
    }
  });

  router.get("/users/:userId/chat-history", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const history = await storage.getAiChatHistory(userId);
      res.status(200).json(history);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch chat history" });
    }
  });

  // Initialize test data for demo
  router.post("/init-demo-data", async (_req: Request, res: Response) => {
    try {
      await storage.initializeDemoData();
      res.status(200).json({ message: "Demo data initialized successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to initialize demo data" });
    }
  });

  // Add the router to the app
  app.use("/api", router);

  const httpServer = createServer(app);
  return httpServer;
}
