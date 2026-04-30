import { validateChatMessage, redactMessageForTelemetry } from "../server.js";

describe("Input validation and telemetry helpers", () => {
  it("rejects non-string messages", () => {
    expect(validateChatMessage(null)).toBe("Message must be a string");
    expect(validateChatMessage(123)).toBe("Message must be a string");
  });

  it("rejects blank or whitespace-only messages", () => {
    expect(validateChatMessage("")).toBe("Message is required");
    expect(validateChatMessage("   ")).toBe("Message is required");
  });

  it("rejects message exceeding max limit", () => {
    const result = validateChatMessage("x".repeat(1201));
    expect(result).toMatch(/Message too long/);
  });

  it("accepts valid messages", () => {
    expect(validateChatMessage("How to register to vote?")).toBeNull();
  });

  it("redacts telemetry payload to 140 chars", () => {
    const longMessage = "a".repeat(500);
    const preview = redactMessageForTelemetry(longMessage);
    expect(preview).toHaveLength(140);
  });
});
