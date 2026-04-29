import { jest } from "@jest/globals";
import dotenv from "dotenv";

// Load environment variables for real API calls
dotenv.config();

// We only mock Google Cloud Logging to prevent credential errors in test environments.
// The Gemini AI calls will be 100% REAL.
jest.unstable_mockModule("@google-cloud/logging", () => ({
  Logging: jest.fn().mockImplementation(() => ({
    log: jest.fn().mockReturnValue({
      entry: jest.fn(),
      write: jest.fn().mockResolvedValue()
    })
  }))
}));

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

  describe("POST /api/chat (REAL AI CALL)", () => {
    it("should return a REAL Gemini AI reply", async () => {
      const res = await request(app)
        .post("/api/chat")
        .send({ message: "What is the role of the Election Commission of India?" });
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("reply");
      expect(res.body.source).toBe("gemini");
      expect(res.body.reply.length).toBeGreaterThan(100);
      console.log("Real AI Response Received:", res.body.reply.substring(0, 50) + "...");
    });

    it("should handle error for empty message", async () => {
      const res = await request(app).post("/api/chat").send({ message: "" });
      expect(res.status).toBe(400);
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
