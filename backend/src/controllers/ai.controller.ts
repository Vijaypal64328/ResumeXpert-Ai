// AI fix for any single string field (generic)
export const fixFieldGrammar = async (req: Request, res: Response): Promise<void> => {
  const { field, value } = req.body;
  if (!field || !value) {
    res.status(400).json({ message: 'Field name and value are required.' });
    return;
  }
  const prompt = `Correct the grammar and syntax of the following ${field}. Only return the improved text.\n\nInput: ${value}`;
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let aiText = response.text();
    // Remove Markdown code block if present
    aiText = aiText.replace(/^```[a-z]*\s*/i, '').replace(/```$/g, '').trim();
    res.json({ fixed: aiText });
  } catch (error) {
    logger.error('[AI][fixFieldGrammar] Error:', error);
    res.status(500).json({ message: 'AI field fix failed.' });
  }
};
// AI fix for professional summary
export const fixSummaryGrammar = async (req: Request, res: Response): Promise<void> => {
  const { summary } = req.body;
  if (!summary) {
    res.status(400).json({ message: 'Summary is required.' });
    return;
  }
  const prompt = `Improve the following professional summary for grammar, clarity, and impact. Return only the improved summary.\n\nInput: ${summary}`;
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    res.json({ fixedSummary: response.text().trim() });
  } catch (error) {
    res.status(500).json({ message: 'AI summary fix failed.' });
  }
};

// AI fix for experience fields
export const fixExperienceGrammar = async (req: Request, res: Response): Promise<void> => {
  const { jobTitle, company, location, responsibilities } = req.body;
  if (!jobTitle && !company && !location && !responsibilities) {
    res.status(400).json({ message: 'Experience fields required.' });
    return;
  }
  const prompt = `Correct the grammar and syntax for the following experience section fields. Return a JSON with the same keys.\n\nInput: ${JSON.stringify({ jobTitle, company, location, responsibilities })}`;
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let aiText = response.text();
  logger.debug('[AI][fixExperienceGrammar] Raw AI response:', aiText);
    // Remove Markdown code block if present
    aiText = aiText.replace(/^```json\s*/i, '').replace(/^```/, '').replace(/```$/g, '').trim();
    try {
      const fixed = JSON.parse(aiText);
      res.json({ fixed });
    } catch (parseErr) {
  logger.error('[AI][fixExperienceGrammar] JSON parse error:', parseErr, 'AI response:', aiText);
      res.status(500).json({ message: 'AI experience fix failed (invalid AI response)', aiResponse: aiText });
    }
  } catch (error) {
    logger.error('[AI][fixExperienceGrammar] Error:', error);
    res.status(500).json({ message: 'AI experience fix failed.' });
  }
};

// AI fix for education
export const fixEducationGrammar = async (req: Request, res: Response): Promise<void> => {
  const { institution, degree, fieldOfStudy, details } = req.body;
  if (!institution && !degree && !fieldOfStudy && !details) {
    res.status(400).json({ message: 'Education fields required.' });
    return;
  }
  const prompt = `Correct the grammar and syntax for the following education section fields. Return a JSON with the same keys.\n\nInput: ${JSON.stringify({ institution, degree, fieldOfStudy, details })}`;
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const fixed = JSON.parse(response.text());
    res.json({ fixed });
  } catch (error) {
    res.status(500).json({ message: 'AI education fix failed.' });
  }
};

// AI fix for skills
export const fixSkillsGrammar = async (req: Request, res: Response): Promise<void> => {
  const { skills } = req.body;
  if (!skills) {
    res.status(400).json({ message: 'Skills are required.' });
    return;
  }
  const prompt = `Correct the grammar and syntax for the following list of skills. Return only the improved list as a JSON array.\n\nInput: ${JSON.stringify(skills)}`;
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const fixedSkills = JSON.parse(response.text());
    res.json({ fixedSkills });
  } catch (error) {
    res.status(500).json({ message: 'AI skills fix failed.' });
  }
};

// AI fix for projects
export const fixProjectsGrammar = async (req: Request, res: Response): Promise<void> => {
  const { name, description, technologies } = req.body;
  if (!name && !description && !technologies) {
    res.status(400).json({ message: 'Project fields required.' });
    return;
  }
  const prompt = `Correct the grammar and syntax for the following project section fields. Return a JSON with the same keys.\n\nInput: ${JSON.stringify({ name, description, technologies })}`;
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const fixed = JSON.parse(response.text());
    res.json({ fixed });
  } catch (error) {
    res.status(500).json({ message: 'AI project fix failed.' });
  }
};

// AI fix for certifications
export const fixCertificationsGrammar = async (req: Request, res: Response): Promise<void> => {
  const { name, issuingOrganization } = req.body;
  if (!name && !issuingOrganization) {
    res.status(400).json({ message: 'Certification fields required.' });
    return;
  }
  const prompt = `Correct the grammar and syntax for the following certification section fields. Return a JSON with the same keys.\n\nInput: ${JSON.stringify({ name, issuingOrganization })}`;
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const fixed = JSON.parse(response.text());
    res.json({ fixed });
  } catch (error) {
    res.status(500).json({ message: 'AI certification fix failed.' });
  }
};
import { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import logger from '../utils/logger';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

export const fixLocationGrammar = async (req: Request, res: Response): Promise<void> => {
  const { location } = req.body;
  if (!location) {
    res.status(400).json({ message: 'Location is required.' });
    return;
  }
  const prompt = `Correct the grammar and syntax of this location string for a job search. Only return the fixed location, nothing else.\n\nInput: ${location}`;
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
  res.json({ fixedLocation: response.text().trim() });
  } catch (error) {
  res.status(500).json({ message: 'AI location fix failed.' });
  }
};

export const suggestJobTypeDescription = async (req: Request, res: Response): Promise<void> => {
  const { base } = req.body;
  if (!base) {
    res.status(400).json({ message: 'Base description is required.' });
    return;
  }
  const prompt = `Given this job search context, suggest a concise, clear job type or extra description to help filter jobs.\n\nContext: ${base}\n\nRespond with only the suggested description.`;
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
  res.json({ suggestion: response.text().trim() });
  } catch (error) {
  res.status(500).json({ message: 'AI job type suggestion failed.' });
  }
};
