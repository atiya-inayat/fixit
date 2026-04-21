import { Router, Request, Response } from 'express';
import { Issue } from '../models/Issue';
import { requireAuth, AuthRequest } from '../middleware/auth';
import Groq from 'groq-sdk';

const router = Router();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' });

router.post('/:id/verify', requireAuth, async (req: Request, res: Response) => {
  const issue = await Issue.findById(req.params.id);
  if (!issue) return res.status(404).json({ error: 'Issue not found' });

  if (!issue.photos.length || !issue.afterPhotos.length) {
    return res.status(400).json({ error: 'Both before and after photos are required for verification' });
  }

  try {
    const beforeUrl = issue.photos[0];
    const afterUrl = issue.afterPhotos[0];

    const result = await groq.chat.completions.create({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: beforeUrl },
            },
            {
              type: 'image_url',
              image_url: { url: afterUrl },
            },
            {
              type: 'text',
              text: `You are an AI verifier for a community issue tracker. Your job is to compare BEFORE and AFTER photos to determine if a reported problem was actually fixed.

Image 1 = BEFORE (the reported problem)
Image 2 = AFTER (the claimed fix)

Rules:
- If the images look identical or nearly identical, the problem is NOT fixed. Set verified to false.
- If the after image is unrelated to the before image, set verified to false.
- Only set verified to true if you can clearly see the problem has been addressed in the after image.
- The "verified" field MUST be consistent with your explanation. If your explanation says the problem is not fixed, verified MUST be false.

Respond ONLY with valid JSON:
{"verified": true or false, "confidence": 0 to 100, "explanation": "your brief assessment"}`,
            },
          ],
        },
      ],
      temperature: 0.2,
      max_tokens: 512,
    });

    const responseText = result.choices[0]?.message?.content || '';
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      issue.aiVerification = {
        result: 'uncertain',
        confidence: 0,
        explanation: 'AI could not provide a structured response',
      };
    } else {
      const parsed = JSON.parse(jsonMatch[0]);
      const negativePatterns = /not (been )?(fixed|addressed|resolved|repaired)|identical|same image|no fix|unrelated|cannot determine|unable to/i;
      const isContradiction = parsed.verified && negativePatterns.test(parsed.explanation);
      const actuallyVerified = parsed.verified && !isContradiction;
      issue.aiVerification = {
        result: actuallyVerified ? 'verified' : 'uncertain',
        confidence: parsed.confidence,
        explanation: parsed.explanation,
      };
    }

    await issue.save();
    res.json({ verification: issue.aiVerification });
  } catch (error: any) {
    console.error('AI Verification error:', error.message || error);
    issue.aiVerification = {
      result: 'uncertain',
      confidence: 0,
      explanation: 'AI verification unavailable — pending community confirmation',
    };
    await issue.save();
    res.json({ verification: issue.aiVerification });
  }
});

export default router;
