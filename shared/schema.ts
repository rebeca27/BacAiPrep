import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name").notNull(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  displayName: true,
  email: true,
});

// Subjects table
export const subjects = pgTable("subjects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  totalTopics: integer("total_topics").notNull(),
  icon: text("icon").notNull(),
});

export const insertSubjectSchema = createInsertSchema(subjects).pick({
  name: true,
  description: true,
  totalTopics: true,
  icon: true,
});

// Topics table
export const topics = pgTable("topics", {
  id: serial("id").primaryKey(),
  subjectId: integer("subject_id").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  content: json("content").notNull(),
  order: integer("order").notNull(),
  difficulty: text("difficulty"),
});

export const insertTopicSchema = createInsertSchema(topics).pick({
  subjectId: true,
  name: true,
  description: true,
  content: true,
  order: true,
  difficulty: true,
});

// User progress table
export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  subjectId: integer("subject_id").notNull(),
  topicsCompleted: integer("topics_completed").notNull().default(0),
  lastStudied: timestamp("last_studied").defaultNow().notNull(),
  percentComplete: integer("percent_complete").notNull().default(0),
});

export const insertUserProgressSchema = createInsertSchema(userProgress).pick({
  userId: true,
  subjectId: true,
  topicsCompleted: true,
  lastStudied: true,
  percentComplete: true,
});

// Tests table
export const tests = pgTable("tests", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  subjectId: integer("subject_id").notNull(),
  description: text("description").notNull(),
  questions: json("questions").notNull(),
  timeLimit: integer("time_limit").notNull(), // in minutes
  difficulty: text("difficulty").notNull(),
});

export const insertTestSchema = createInsertSchema(tests).pick({
  name: true,
  subjectId: true,
  description: true,
  questions: true,
  timeLimit: true,
  difficulty: true,
});

// User test results table
export const userTestResults = pgTable("user_test_results", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  testId: integer("test_id").notNull(),
  score: integer("score").notNull(),
  percentCorrect: integer("percent_correct").notNull(),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
  answers: json("answers").notNull(),
});

export const insertUserTestResultSchema = createInsertSchema(userTestResults).pick({
  userId: true,
  testId: true,
  score: true,
  percentCorrect: true,
  answers: true,
});

// Badges table
export const badges = pgTable("badges", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  criteria: text("criteria").notNull(),
});

export const insertBadgeSchema = createInsertSchema(badges).pick({
  name: true,
  description: true,
  icon: true,
  criteria: true,
});

// User badges table
export const userBadges = pgTable("user_badges", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  badgeId: integer("badge_id").notNull(),
  earnedAt: timestamp("earned_at").defaultNow().notNull(),
});

export const insertUserBadgeSchema = createInsertSchema(userBadges).pick({
  userId: true,
  badgeId: true,
});

// Study streaks table
export const studyStreaks = pgTable("study_streaks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  date: timestamp("date").defaultNow().notNull(),
  minutesStudied: integer("minutes_studied").notNull().default(0),
});

export const insertStudyStreakSchema = createInsertSchema(studyStreaks).pick({
  userId: true,
  minutesStudied: true,
});

// Study plan tasks table
export const studyPlanTasks = pgTable("study_plan_tasks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  duration: integer("duration").notNull(), // in minutes
  priority: boolean("priority").notNull().default(false),
  recommended: boolean("recommended").notNull().default(false),
  completed: boolean("completed").notNull().default(false),
  dueDate: timestamp("due_date").notNull().defaultNow(),
});

export const insertStudyPlanTaskSchema = createInsertSchema(studyPlanTasks).pick({
  userId: true,
  title: true,
  description: true,
  duration: true,
  priority: true,
  recommended: true,
  dueDate: true,
});

// AI chat history table
export const aiChatHistory = pgTable("ai_chat_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  messages: json("messages").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertAiChatHistorySchema = createInsertSchema(aiChatHistory).pick({
  userId: true,
  messages: true,
});

// Export types for all schemas
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Subject = typeof subjects.$inferSelect;
export type InsertSubject = z.infer<typeof insertSubjectSchema>;

export type Topic = typeof topics.$inferSelect & { difficulty: string | null };
export type InsertTopic = z.infer<typeof insertTopicSchema>;

export type UserProgress = typeof userProgress.$inferSelect;
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;

export type Test = typeof tests.$inferSelect;
export type InsertTest = z.infer<typeof insertTestSchema>;

export type UserTestResult = typeof userTestResults.$inferSelect;
export type InsertUserTestResult = z.infer<typeof insertUserTestResultSchema>;

export type Badge = typeof badges.$inferSelect;
export type InsertBadge = z.infer<typeof insertBadgeSchema>;

export type UserBadge = typeof userBadges.$inferSelect;
export type InsertUserBadge = z.infer<typeof insertUserBadgeSchema>;

export type StudyStreak = typeof studyStreaks.$inferSelect;
export type InsertStudyStreak = z.infer<typeof insertStudyStreakSchema>;

export type StudyPlanTask = typeof studyPlanTasks.$inferSelect;
export type InsertStudyPlanTask = z.infer<typeof insertStudyPlanTaskSchema>;

export type AiChatHistory = typeof aiChatHistory.$inferSelect;
export type InsertAiChatHistory = z.infer<typeof insertAiChatHistorySchema>;
