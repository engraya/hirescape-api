// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdfParse = require('pdf-parse');
import { callLLM } from './aiService';
import { resumeParserPrompt, SYSTEM_INSTRUCTION } from './prompts';

export interface ParsedResume {
  firstName: string;
  lastName: string;
  currentTitle: string;
  skills: string[];
  experienceSummary: string;
  education: string;
}

export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  const data = await pdfParse(buffer);
  return data.text;
}

export async function parseResumeText(text: string): Promise<ParsedResume> {
  const raw = await callLLM(resumeParserPrompt(text), SYSTEM_INSTRUCTION);
  return JSON.parse(raw) as ParsedResume;
}
