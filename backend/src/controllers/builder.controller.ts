import { Request, Response } from 'express';
import admin from 'firebase-admin';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { db } from '../config/firebase.config';
import logger from '../utils/logger';
import { buildResumeAI } from '../utils/highQuotaAI';
import { GeneratedResume, ResumeInputData } from '../models/generated-resume.model';

// Helper to format input for prompting the AI
const formatInputForPrompt = (data: ResumeInputData): string => {
  let promptData = '';
  promptData += `Personal Information:\nName: ${data.personalInfo.name}\nEmail: ${data.personalInfo.email}${data.personalInfo.phone ? `\nPhone: ${data.personalInfo.phone}` : ''}${data.personalInfo.linkedin ? `\nLinkedIn: ${data.personalInfo.linkedin}` : ''}${data.personalInfo.portfolio ? `\nPortfolio: ${data.personalInfo.portfolio}` : ''}${data.personalInfo.address ? `\nAddress: ${data.personalInfo.address}` : ''}\n\n`;
  if (data.summary) promptData += `Professional Summary:\n${data.summary}\n\n`;
  promptData += `Education:\n${data.education.map(edu => `- ${edu.degree} ${edu.fieldOfStudy ? `in ${edu.fieldOfStudy} ` : ''}at ${edu.institution}${edu.startDate || edu.endDate ? ` (${edu.startDate || ''} - ${edu.endDate || ''})` : ''}${edu.details ? `\n  Details: ${edu.details.join(', ')}` : ''}`).join('\n')}\n\n`;
  promptData += `Experience:\n${data.experience.map(exp => `- ${exp.jobTitle} at ${exp.company}${exp.location ? `, ${exp.location}` : ''} (${exp.startDate} - ${exp.endDate})\n  Responsibilities:\n${exp.responsibilities.map(r => `    * ${r}`).join('\n')}`).join('\n\n')}\n\n`;
  promptData += `Skills:\n${data.skills.map(skillSet => `${skillSet.category ? `${skillSet.category}: ` : ''}${skillSet.items.join(', ')}`).join('\n')}\n\n`;
  if (data.certifications && data.certifications.length > 0) promptData += `Certifications:\n${data.certifications.map(cert => `- ${cert.name}${cert.issuingOrganization ? ` (${cert.issuingOrganization})` : ''}${cert.dateObtained ? `, ${cert.dateObtained}` : ''}`).join('\n')}\n\n`;
  if (data.projects && data.projects.length > 0) promptData += `Projects:\n${data.projects.map(proj => `- ${proj.name}: ${proj.description}${proj.technologies ? ` (Tech: ${proj.technologies.join(', ')})` : ''}${proj.link ? ` [${proj.link}]` : ''}`).join('\n')}\n\n`;
  if (data.targetJobRole) promptData += `Target Job Role: ${data.targetJobRole}\n`;
  if (data.targetJobDescription) promptData += `Target Job Description:\n${data.targetJobDescription}\n`;
  return promptData.trim();
};

// --- Get Single Generated Resume by ID ---
export const getGeneratedResumeById = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized: User not authenticated' });
      return;
    }

    const userId = req.user.uid;
    const { generatedResumeId } = req.params as { generatedResumeId?: string };

    if (!generatedResumeId) {
      res.status(400).json({ message: 'Bad Request: Missing generatedResumeId parameter' });
      return;
    }

    const resumeRef = db.collection('generatedResumes').doc(generatedResumeId);
    const resumeDoc = await resumeRef.get();

    if (!resumeDoc.exists) {
      res.status(404).json({ message: 'Generated resume not found' });
      return;
    }

    const data = resumeDoc.data() as GeneratedResume;
    if (data.userId !== userId) {
      res.status(403).json({ message: 'Forbidden: You do not own this generated resume' });
      return;
    }

    res.status(200).json({ id: resumeDoc.id, ...data });
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error('[getGeneratedResumeById]:', error.message);
      res.status(500).json({ message: 'Internal server error fetching generated resume', error: error.message });
    }
  }
};

// --- Update Generated Resume ---
export const updateGeneratedResume = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized: User not authenticated' });
      return;
    }

    const userId = req.user.uid;
    const { generatedResumeId } = req.params as { generatedResumeId?: string };

    if (!generatedResumeId) {
      res.status(400).json({ message: 'Bad Request: Missing generatedResumeId parameter' });
      return;
    }

    const resumeRef = db.collection('generatedResumes').doc(generatedResumeId);
    const resumeDoc = await resumeRef.get();

    if (!resumeDoc.exists) {
      res.status(404).json({ message: 'Generated resume not found' });
      return;
    }

    const data = resumeDoc.data() as GeneratedResume;
    if (data.userId !== userId) {
      res.status(403).json({ message: 'Forbidden: You do not own this generated resume' });
      return;
    }

    const { inputData, generatedText } = req.body as Partial<GeneratedResume> & { inputData?: ResumeInputData };

    if (!inputData) {
      res.status(400).json({ message: 'Bad Request: Missing inputData in request body' });
      return;
    }

    const newVersion = (data.version || 1) + 1;
    const updatedAt = admin.firestore.FieldValue.serverTimestamp();

    await resumeRef.update({
      inputData,
      generatedText: generatedText ?? data.generatedText,
      version: newVersion,
      updatedAt,
    } as any);

    res.status(200).json({ message: 'Generated resume updated successfully', version: newVersion, updatedAt });
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error('[updateGeneratedResume]:', error.message);
      res.status(500).json({ message: 'Internal server error updating generated resume', error: error.message });
    }
  }
};

// --- Generate Resume ---
export const generateResume = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized: User not authenticated' });
      return;
    }

    const userId = req.user.uid;
    const inputData = req.body as (ResumeInputData & { skipAI?: boolean });

    // Basic validation
    if (!inputData || !inputData.personalInfo || !inputData.experience || !inputData.education || !inputData.skills) {
      res.status(400).json({ message: 'Bad Request: Missing essential resume input data (personalInfo, experience, education, skills)' });
      return;
    }

    // Mock/skip AI support
    const isMock = inputData.personalInfo.email === 'alex.johnson@example.com' || inputData.skipAI === true;

    let generatedText = '';
    if (isMock) {
      generatedText = `RESUME\n\nName: ${inputData.personalInfo.name}\nEmail: ${inputData.personalInfo.email}\nPhone: ${inputData.personalInfo.phone || ''}\nLinkedIn: ${inputData.personalInfo.linkedin || ''}\nPortfolio: ${inputData.personalInfo.portfolio || ''}\nAddress: ${inputData.personalInfo.address || ''}\n\nSummary: ${inputData.summary || ''}\n\nEducation:\n${inputData.education.map(edu => `- ${edu.degree} ${edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''} at ${edu.institution} (${edu.startDate || ''} - ${edu.endDate || ''})`).join('\n')}\n\nExperience:\n${inputData.experience.map(exp => `- ${exp.jobTitle} at ${exp.company} (${exp.startDate} - ${exp.endDate})\n  Responsibilities: ${exp.responsibilities.join('; ')}`).join('\n')}\n\nSkills:\n${inputData.skills.map(skillSet => `${skillSet.category ? skillSet.category + ': ' : ''}${skillSet.items.join(', ')}`).join('\n')}\n\nProjects:\n${inputData.projects?.map(proj => `- ${proj.name}: ${proj.description}`).join('\n') || ''}\n\nCertifications:\n${inputData.certifications?.map(cert => `- ${cert.name} (${cert.issuingOrganization || ''}, ${cert.dateObtained || ''})`).join('\n') || ''}\n\nTarget Job Role: ${inputData.targetJobRole || ''}\nTarget Job Description: ${inputData.targetJobDescription || ''}`;
    } else {
      const formattedInput = formatInputForPrompt(inputData);
      const prompt = `Generate a professional resume based on the following information.\nFormat the output clearly with standard resume sections (Summary/Objective, Education, Experience, Skills, Projects, Certifications, etc. as applicable based on the provided data).\nUse bullet points for responsibilities and achievements under Experience.\nTailor the resume towards the 'Target Job Role' if provided.\nEnsure the tone is professional and concise.\n\nResume Information:\n--- START INFO ---\n${formattedInput}\n--- END INFO ---\n\nGenerated Resume Text:`;

      logger.info(`[builder]: Sending prompt to AI for user: ${userId}`);
      const result = await buildResumeAI(prompt);
      generatedText = result.response;
      logger.info(`[builder]: Received generated text from ${result.model} for user: ${userId}`);
    }

    const generatedResumeData: Omit<GeneratedResume, 'id' | 'createdAt'> & { createdAt: admin.firestore.Timestamp | admin.firestore.FieldValue } = {
      userId,
      inputData,
      generatedText,
      version: 1,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection('generatedResumes').add(generatedResumeData as any);
    logger.info(`[builder]: Saved generated resume to Firestore with ID: ${docRef.id} for user: ${userId}`);

    res.status(201).json({ message: 'Resume generated successfully', generatedResumeId: docRef.id, generatedText });
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error('[builder]: Resume generation error:', error.message);
      const err = error as { status?: number; message: string };
      if (err.status === 429) {
        res.status(429).json({ message: 'AI service is currently rate limited. Please try again in a few moments.' });
      } else if (error.message.includes('GOOGLE_API_KEY_INVALID')) {
        res.status(500).json({ message: 'Internal Server Error: Invalid Gemini API Key configured.' });
      } else {
        res.status(500).json({ message: 'Internal server error during resume generation', error: error.message });
      }
    } else {
      logger.error('[builder]: Unknown error during resume generation');
      res.status(500).json({ message: 'Internal server error during resume generation' });
    }
  }
};

// --- Download Generated Resume as PDF ---
export const downloadGeneratedResume = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized: User not authenticated' });
      return;
    }

    const userId = req.user.uid;
    const { generatedResumeId } = req.params as { generatedResumeId?: string };

    if (!generatedResumeId) {
      res.status(400).json({ message: 'Bad Request: Missing generatedResumeId parameter' });
      return;
    }

    const resumeRef = db.collection('generatedResumes').doc(generatedResumeId);
    const resumeDoc = await resumeRef.get();

    if (!resumeDoc.exists) {
      res.status(404).json({ message: 'Generated resume not found' });
      return;
    }

    const resumeData = resumeDoc.data() as GeneratedResume;

    if (resumeData.userId !== userId) {
      res.status(403).json({ message: 'Forbidden: You do not own this generated resume' });
      return;
    }

    if (!resumeData.generatedText || resumeData.generatedText.trim() === '') {
      res.status(400).json({ message: 'Cannot download: Generated resume text is missing or empty' });
      return;
    }

    // Generate a simple PDF with word-wrapped text
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontSize = 11;
    const margin = 50;
    const textWidth = width - 2 * margin;
    const lineHeight = fontSize * 1.2;
    let y = height - margin;

    const lines = resumeData.generatedText.split('\n');
    for (const line of lines) {
      let currentLine = '';
      const words = line.split(' ');
      for (const word of words) {
        const testLine = currentLine + (currentLine ? ' ' : '') + word;
        const testWidth = font.widthOfTextAtSize(testLine, fontSize);
        if (testWidth < textWidth) {
          currentLine = testLine;
        } else {
          page.drawText(currentLine, { x: margin, y, font, size: fontSize, color: rgb(0, 0, 0) });
          y -= lineHeight;
          currentLine = word;
          if (y < margin) {
            logger.info(`[download]: PDF content might be truncated for resume ${generatedResumeId}`);
            break;
          }
        }
      }
      page.drawText(currentLine, { x: margin, y, font, size: fontSize, color: rgb(0, 0, 0) });
      y -= lineHeight;
      if (y < margin) {
        logger.info(`[download]: PDF content might be truncated for resume ${generatedResumeId}`);
        break;
      }
    }

    const pdfBytes = await pdfDoc.save();

    res.setHeader('Content-Disposition', `attachment; filename="generated_resume_${generatedResumeId}.pdf"`);
    res.setHeader('Content-Type', 'application/pdf');
    res.send(Buffer.from(pdfBytes));
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error(`[download]: Error generating or downloading PDF for resume ${req.params.generatedResumeId}: ${error.message}`);
      if (!res.headersSent) {
        if (error.message.includes('GOOGLE_API_KEY_INVALID')) {
          res.status(500).json({ message: 'Internal Server Error: Invalid Gemini API Key configured.' });
        } else {
          res.status(500).json({ message: 'Internal server error during PDF download', error: error.message });
        }
      }
    }
  }
};

// --- Get list of Generated Resumes for a user ---
export const getGeneratedResumes = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized: User not authenticated' });
      return;
    }

    const userId = req.user.uid;

    const resumesSnapshot = await db
      .collection('generatedResumes')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    if (resumesSnapshot.empty) {
      res.status(200).json({ generatedResumes: [] });
      return;
    }

    const generatedResumes = resumesSnapshot.docs.map(doc => {
      const data = doc.data() as GeneratedResume;
      return {
        id: doc.id,
        createdAt: data.createdAt,
        inputName: data.inputData?.personalInfo?.name,
        inputTargetRole: data.inputData?.targetJobRole,
        version: data.version,
      };
    });

    res.status(200).json({ generatedResumes });
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error(`[getGenerated]: Error fetching generated resumes for user ${req.user?.uid}: ${error.message}`);
      const err = error as { code?: string; status?: string; message: string };
      if (err.code === 'permission-denied' || err.status === 'PERMISSION_DENIED') {
        res.status(500).json({ message: 'Internal Server Error: Firebase permission issue.' });
      } else {
        res.status(500).json({ message: 'Internal server error fetching generated resumes', error: error.message });
      }
    }
  }
};

// --- Delete a Generated Resume ---
export const deleteGeneratedResume = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized: User not authenticated' });
      return;
    }

    const userId = req.user.uid;
    const { generatedResumeId } = req.params as { generatedResumeId?: string };

    if (!generatedResumeId) {
      res.status(400).json({ message: 'Bad Request: Missing generatedResumeId parameter' });
      return;
    }

    const resumeRef = db.collection('generatedResumes').doc(generatedResumeId);
    const resumeDoc = await resumeRef.get();

    if (!resumeDoc.exists) {
      res.status(404).json({ message: 'Generated resume not found' });
      return;
    }

    const data = resumeDoc.data() as GeneratedResume;
    if (data.userId !== userId) {
      res.status(403).json({ message: 'Forbidden: You do not own this generated resume' });
      return;
    }

    await resumeRef.delete();
    res.status(200).json({ message: 'Generated resume deleted successfully' });
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error('[deleteGenerated]:', error.message);
      res.status(500).json({ message: 'Internal server error deleting generated resume', error: error.message });
    }
  }
};