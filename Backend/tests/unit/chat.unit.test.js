import { chatStartSchema, chatMessageSchema } from "../../utils/validation.js";
import { isPriceQuestion, PRICE_ANSWER } from "../../services/chatFaq.js";

test("chatStartSchema: valid start passes", () => {
  const result = chatStartSchema.safeParse({ name: "John", phone: "+1 555 123 4567" });
  expect(result.success).toBe(true);
  expect(result.data.pageUrl).toBe("/chat");
});

test("chatStartSchema: rejects missing phone", () => {
  const result = chatStartSchema.safeParse({ name: "John" });
  expect(result.success).toBe(false);
});

test("chatStartSchema: rejects too-short name", () => {
  const result = chatStartSchema.safeParse({ name: "J", phone: "+1 555 123 4567" });
  expect(result.success).toBe(false);
  expect(result.error.issues[0].message).toMatch(/Name is required/i);
});

test("chatMessageSchema: valid message passes", () => {
  const result = chatMessageSchema.safeParse({ body: "Best time to visit Rajasthan?" });
  expect(result.success).toBe(true);
});

test("chatMessageSchema: rejects empty message", () => {
  const result = chatMessageSchema.safeParse({ body: "   " });
  expect(result.success).toBe(false);
});

test("isPriceQuestion: detects pricing words", () => {
  for (const text of [
    "how much does it cost",
    "what is the price",
    "price of the tour",
    "kitna kharcha aayega",
    "can you share the rates",
    "rate for 2 people",
  ]) {
    expect(isPriceQuestion(text)).toBe(true);
  }
});

test("isPriceQuestion: ignores non-pricing text", () => {
  for (const text of [
    "best time to visit",
    "visa process",
    "do you have airport pickup",
    "is it safe for families",
    "do you have budget hotels",
  ]) {
    expect(isPriceQuestion(text)).toBe(false);
  }
});

test("PRICE_ANSWER never contains a number or currency", () => {
  expect(PRICE_ANSWER.length).toBeGreaterThan(0);
  expect(/\$\s*\d/.test(PRICE_ANSWER)).toBe(false);
  expect(/[₹]\s*\d/.test(PRICE_ANSWER)).toBe(false);
  expect(/custom quote/i.test(PRICE_ANSWER)).toBe(true);
});
