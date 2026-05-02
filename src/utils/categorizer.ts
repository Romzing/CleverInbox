import { GoogleGenAI } from "@google/genai";
import { GEMINI_API_KEY } from "../config/constants";

type Category =
  | "Interested"
  | "Meeting Booked"
  | "Not Interested"
  | "Spam"
  | "Out of Office"
  | "Uncategorized";

const ALLOWED_CATEGORIES: Category[] = [
  "Interested",
  "Meeting Booked",
  "Not Interested",
  "Spam",
  "Out of Office",
  "Uncategorized",
];

function normalizeCategory(text: string): Category {
  const cleaned = text.trim().replace(/^["'\s]+|["'\s]+$/g, "");

  const directMatch = ALLOWED_CATEGORIES.find(
    (cat) => cat.toLowerCase() === cleaned.toLowerCase()
  );
  if (directMatch) return directMatch;

  const lower = cleaned.toLowerCase();

  if (lower.includes("meeting")) return "Meeting Booked";
  if (lower.includes("interested")) return "Interested";
  if (lower.includes("not interested")) return "Not Interested";
  if (lower.includes("spam")) return "Spam";
  if (lower.includes("out of office") || lower.includes("ooo")) return "Out of Office";

  return "Uncategorized";
}

function ruleBasedCategory(subject: string, body: string): { category: Category } {
  const text = `${subject} ${body}`.toLowerCase();

  if (
    text.includes("interview") ||
    text.includes("opportunity") ||
    text.includes("we are interested") ||
    text.includes("schedule an interview") ||
    text.includes("job opening") ||
    text.includes("shortlisted") ||
    text.includes("next round") ||
    text.includes("application selected")
  ) {
    return { category: "Interested" };
  }

  if (
    text.includes("meeting scheduled") ||
    text.includes("calendar invite") ||
    text.includes("zoom link") ||
    text.includes("google meet") ||
    text.includes("meet link") ||
    text.includes("teams meeting")
  ) {
    return { category: "Meeting Booked" };
  }

  if (
    text.includes("not interested") ||
    text.includes("we regret") ||
    text.includes("unfortunately") ||
    text.includes("rejected") ||
    text.includes("position has been filled")
  ) {
    return { category: "Not Interested" };
  }

  if (
    text.includes("out of office") ||
    text.includes("ooo") ||
    text.includes("on leave") ||
    text.includes("currently away")
  ) {
    return { category: "Out of Office" };
  }

  if (
    text.includes("unsubscribe") ||
    text.includes("sale") ||
    text.includes("offer") ||
    text.includes("discount") ||
    text.includes("buy now") ||
    text.includes("limited time") ||
    text.includes("promotion")
  ) {
    return { category: "Spam" };
  }

  return { category: "Uncategorized" };
}

export async function categorizeEmail(subject: string, body: string) {
  const safeSubject = (subject || "No Subject").trim();
  const safeBody = (body || "").trim().slice(0, 4000);

  console.log("🔑 Gemini key present:", !!GEMINI_API_KEY);
  console.log("📩 Categorizing email subject:", safeSubject);

  if (!GEMINI_API_KEY) {
    console.log("⚠️ No Gemini key found, using rule-based categorizer");
    return ruleBasedCategory(safeSubject, safeBody);
  }

  try {
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

    const prompt = `
Classify this email into exactly one category from this list only:
Interested
Meeting Booked
Not Interested
Spam
Out of Office
Uncategorized

Rules:
- Return only one category name.
- Do not explain.
- Do not return JSON.
- If unsure, return Uncategorized.

Email Subject: ${safeSubject}
Email Body: ${safeBody}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    const rawText = (response.text || "").trim();

    console.log("📥 Gemini raw response:", rawText);

    const category = normalizeCategory(rawText);

    if (category !== "Uncategorized" || rawText.toLowerCase() === "uncategorized") {
      console.log("✅ Gemini category:", category);
      return { category };
    }

    console.log("⚠️ Gemini output unclear, using rule-based fallback");
    return ruleBasedCategory(safeSubject, safeBody);
  } catch (error: any) {
    console.error("❌ Gemini categorization failed, using rules:", error?.message || error);
    return ruleBasedCategory(safeSubject, safeBody);
  }
}