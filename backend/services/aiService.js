const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generate event details from an event name using Gemini AI
 */
exports.generateEventDetails = async (eventName) => {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompt = `You are an event planning assistant. Given the event name below, generate realistic event details in JSON format. 
  
Event Name: "${eventName}"

Return ONLY a valid JSON object with these fields:
- "description": A compelling 2-3 sentence description for the event
- "type": One of exactly these values: "Tech", "Fun", "Business", "Educational", "Sports", "Other"
- "duration": Duration in minutes (number, e.g. 60, 90, 120)
- "maxParticipants": A reasonable max participant count (number)
- "locations": An array of 1-2 suggested location names (strings, e.g. ["Main Auditorium", "Conference Room A"])

Return ONLY the JSON object, no markdown, no code fences, no explanation.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();

  // Strip markdown code fences if present
  const cleaned = text.replace(/```json\s*/i, '').replace(/```\s*$/, '').trim();
  const parsed = JSON.parse(cleaned);

  // Validate the type field
  const validTypes = ['Tech', 'Fun', 'Business', 'Educational', 'Sports', 'Other'];
  if (!validTypes.includes(parsed.type)) {
    parsed.type = 'Other';
  }

  // Ensure duration is a number
  parsed.duration = parseInt(parsed.duration) || 120;
  parsed.maxParticipants = parseInt(parsed.maxParticipants) || 50;

  // Ensure locations is an array of strings
  if (!Array.isArray(parsed.locations)) {
    parsed.locations = [];
  }

  return parsed;
};
