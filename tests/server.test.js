import { jest } from "@jest/globals";
import dotenv from "dotenv";

// Load environment variables for real API calls
dotenv.config();

const request = (await import("supertest")).default;
const { app } = await import("../server.js");

// Set long timeout for real AI responses
jest.setTimeout(90000); 

describe("VoteMitra API (REAL-TIME DATA VERIFICATION)", () => {
  
  describe("GET /api/health", () => {
    it("should return healthy status", async () => {
      const res = await request(app).get("/api/health");
      expect(res.status).toBe(200);
      expect(res.body.status).toBe("healthy");
    });
  });

  describe("GET /api/ready", () => {
    it("should return readiness checks", async () => {
      const res = await request(app).get("/api/ready");
      expect(res.status).toBe(200);
      expect(res.body.status).toBe("ready");
      expect(res.body.checks).toHaveProperty("webServer", true);
      expect(res.body.checks).toHaveProperty("aiConfigured");
      expect(res.body.checks).toHaveProperty("bigQueryConfigured");
    });
  });

  describe("POST /api/chat (REAL AI CALL)", () => {
    it("should return a chat reply from gemini or fallback", async () => {
      const res = await request(app)
        .post("/api/chat")
        .send({ message: "What is the role of the Election Commission of India?" });
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("reply");
      expect(["gemini", "fallback", "safety-fallback"]).toContain(res.body.source);
      expect(res.body.reply.length).toBeGreaterThan(20);
    });

    it("should handle error for empty message", async () => {
      const res = await request(app).post("/api/chat").send({ message: "" });
      expect(res.status).toBe(400);
    });

    it("should reject oversized input", async () => {
      const res = await request(app)
        .post("/api/chat")
        .send({ message: "x".repeat(1300) });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/Message too long/i);
    });
  });

  describe("POST /api/quiz (REAL AI GENERATION)", () => {
    it("should generate a REAL dynamic quiz using AI", async () => {
      const res = await request(app)
        .post("/api/quiz")
        .send({ difficulty: "easy", topic: "voter-id" });
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("questions");
      expect(res.body.questions.length).toBeGreaterThanOrEqual(1);
      // Verify AI structured the JSON correctly
      const q = res.body.questions[0];
      expect(q).toHaveProperty("question");
      expect(q.options.length).toBe(4);
      expect(typeof q.correct).toBe("number");
      expect(q.correct).toBeGreaterThanOrEqual(0);
      expect(q.correct).toBeLessThan(4);
    });
  });

  describe("POST /api/flashcards (REAL AI GENERATION)", () => {
    it("should generate REAL dynamic flashcards using AI", async () => {
      const res = await request(app)
        .post("/api/flashcards")
        .send({ topic: "EVM security" });
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("flashcards");
      expect(res.body.flashcards.length).toBeGreaterThanOrEqual(1);
      expect(res.body.flashcards[0]).toHaveProperty("term");
      expect(res.body.flashcards[0]).toHaveProperty("definition");
    });
  });

  describe("GET /", () => {
    it("should serve the live HTML frontend", async () => {
      const res = await request(app).get("/");
      expect(res.status).toBe(200);
      expect(res.headers["content-type"]).toMatch(/html/);
    });
  });
});
