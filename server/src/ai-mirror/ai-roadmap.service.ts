import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';

export type RoadmapDifficulty = 'easy' | 'medium' | 'hard';
export type RoadmapLevel =
  | 'absolute_beginner'
  | 'beginner'
  | 'intermediate'
  | 'advanced';

export interface AssessmentRoadmapInput {
  assessmentId?: string;
  score: number;
  detectedLevel: RoadmapLevel | string;
  strongSkills: string[];
  weakSkills: string[];
  details?: Array<{
    questionOrder?: number;
    status?: string;
    category?: string;
    level?: string;
    input?: string;
    expected?: string;
    actual?: string;
  }>;
}

export interface AiRoadmapPlan {
  skillOrder: string[];
  difficulties: RoadmapDifficulty[];
  targetNodeCount: number;
  pacePreference: 'slow' | 'medium' | 'fast';
  reason: string;
}

@Injectable()
export class AiRoadmapService {
  private readonly logger = new Logger(AiRoadmapService.name);
  private readonly ai: GoogleGenAI | null;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');

    this.ai = apiKey
      ? new GoogleGenAI({
          apiKey,
        })
      : null;

    if (!apiKey) {
      this.logger.warn(
        'GEMINI_API_KEY is missing. Roadmap generation will use fallback rules.',
      );
    }
  }

  async generatePlan(input: AssessmentRoadmapInput): Promise<AiRoadmapPlan> {
    const fallbackPlan = this.buildFallbackPlan(input);

    if (!this.ai) {
      return fallbackPlan;
    }

    try {
      const response = await this.ai.models.generateContent({
        model:
          this.configService.get<string>('GEMINI_MODEL') || 'gemini-2.5-flash',
        contents: this.buildPrompt(input),
        config: {
          temperature: 0.2,
          responseMimeType: 'application/json',
        },
      });

      const rawText = response.text?.trim();

      if (!rawText) {
        this.logger.warn('Gemini returned empty roadmap plan. Using fallback.');
        return fallbackPlan;
      }

      const parsed = this.parseJson(rawText);
      const normalized = this.normalizePlan(parsed, input);

      return normalized;
    } catch (error) {
      this.logger.error(
        'Failed to generate AI roadmap plan. Using fallback.',
        error,
      );
      return fallbackPlan;
    }
  }

  private buildPrompt(input: AssessmentRoadmapInput): string {
    return `
You are an AI learning roadmap planner for a programming education platform.

Your task:
Analyze the user's assessment result and return a personalized roadmap planning JSON.

Important:
- Return ONLY valid JSON.
- Do NOT wrap JSON in markdown.
- Do NOT invent challenge IDs.
- You only decide skill order, difficulty range, node count, pace, and reason.
- Backend will query real challenges from MongoDB by skill and difficulty.

Assessment result:
${JSON.stringify(
  {
    assessmentId: input.assessmentId,
    score: input.score,
    detectedLevel: input.detectedLevel,
    strongSkills: input.strongSkills,
    weakSkills: input.weakSkills,
    details: input.details,
  },
  null,
  2,
)}

Return JSON with exactly this shape:
{
  "skillOrder": ["string"],
  "difficulties": ["easy"],
  "targetNodeCount": 8,
  "pacePreference": "medium",
  "reason": "short explanation"
}

Rules:
1. Prioritize weakSkills first.
2. Add strongSkills later as review or reinforcement.
3. If detectedLevel is "absolute_beginner", use mostly easy tasks.
4. If detectedLevel is "beginner", use easy tasks and a few medium tasks.
5. If detectedLevel is "intermediate", use easy and medium tasks.
6. If detectedLevel is "advanced", use medium and hard tasks.
7. If score is below 40, targetNodeCount should be 8 to 12.
8. If score is from 40 to 79, targetNodeCount should be 6 to 10.
9. If score is 80 or above, targetNodeCount should be 4 to 8.
10. pacePreference must be one of: "slow", "medium", "fast".
11. difficulties must only contain: "easy", "medium", "hard".
12. skillOrder must be unique and must not contain empty strings.
13. Use details to understand exactly which categories and levels the user failed.
14. If a weak skill appears multiple times in failed questions, rank it earlier.
15. Do not output a skill that is unrelated to strongSkills, weakSkills, or details.category.
16. reason should explain the learning strategy in user-friendly language.
`;
  }

  private parseJson(rawText: string): unknown {
    const cleaned = rawText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```$/i, '')
      .trim();

    return JSON.parse(cleaned);
  }

  private normalizePlan(
    value: any,
    input: AssessmentRoadmapInput,
  ): AiRoadmapPlan {
    const fallbackPlan = this.buildFallbackPlan(input);

    const skillOrder = this.uniqueStrings(value?.skillOrder);

    const difficulties = this.normalizeDifficulties(value?.difficulties);

    const targetNodeCount = this.clampNumber(
      Number(value?.targetNodeCount),
      4,
      12,
      fallbackPlan.targetNodeCount,
    );

    const pacePreference = this.normalizePacePreference(
      value?.pacePreference,
      fallbackPlan.pacePreference,
    );

    const reason =
      typeof value?.reason === 'string' && value.reason.trim()
        ? value.reason.trim()
        : fallbackPlan.reason;

    return {
      skillOrder: skillOrder.length > 0 ? skillOrder : fallbackPlan.skillOrder,
      difficulties:
        difficulties.length > 0 ? difficulties : fallbackPlan.difficulties,
      targetNodeCount,
      pacePreference,
      reason,
    };
  }

  private buildFallbackPlan(input: AssessmentRoadmapInput): AiRoadmapPlan {
    const weakSkills = this.uniqueStrings(input.weakSkills);
    const strongSkills = this.uniqueStrings(input.strongSkills);

    const skillOrder = this.uniqueStrings([...weakSkills, ...strongSkills]);

    const detectedLevel = String(input.detectedLevel || 'beginner');

    let difficulties: RoadmapDifficulty[] = ['easy'];
    let pacePreference: 'slow' | 'medium' | 'fast' = 'medium';

    if (detectedLevel === 'absolute_beginner') {
      difficulties = ['easy'];
      pacePreference = 'slow';
    } else if (detectedLevel === 'beginner') {
      difficulties = ['easy', 'medium'];
      pacePreference = input.score >= 70 ? 'medium' : 'slow';
    } else if (detectedLevel === 'intermediate') {
      difficulties = ['easy', 'medium'];
      pacePreference = input.score >= 70 ? 'fast' : 'medium';
    } else if (detectedLevel === 'advanced') {
      difficulties = ['medium', 'hard'];
      pacePreference = input.score >= 80 ? 'fast' : 'medium';
    }

    let targetNodeCount = 8;

    if (input.score < 40) {
      targetNodeCount = 10;
    } else if (input.score >= 80) {
      targetNodeCount = 6;
    }

    return {
      skillOrder:
        skillOrder.length > 0
          ? skillOrder
          : ['array', 'loop', 'string', 'function'],
      difficulties,
      targetNodeCount,
      pacePreference,
      reason:
        'Fallback roadmap generated from assessment level, score, weak skills, and strong skills.',
    };
  }

  private uniqueStrings(values: unknown): string[] {
    if (!Array.isArray(values)) {
      return [];
    }

    return Array.from(
      new Set(
        values
          .filter((item): item is string => typeof item === 'string')
          .map((item) => item.trim())
          .filter(Boolean),
      ),
    );
  }

  private normalizeDifficulties(values: unknown): RoadmapDifficulty[] {
    const allowed: RoadmapDifficulty[] = ['easy', 'medium', 'hard'];

    if (!Array.isArray(values)) {
      return [];
    }

    return Array.from(
      new Set(
        values.filter((item): item is RoadmapDifficulty =>
          allowed.includes(item),
        ),
      ),
    );
  }

  private normalizePacePreference(
    value: unknown,
    fallback: 'slow' | 'medium' | 'fast',
  ): 'slow' | 'medium' | 'fast' {
    if (value === 'slow' || value === 'medium' || value === 'fast') {
      return value;
    }

    return fallback;
  }

  private clampNumber(
    value: number,
    min: number,
    max: number,
    fallback: number,
  ): number {
    if (!Number.isFinite(value)) {
      return fallback;
    }

    return Math.min(Math.max(Math.round(value), min), max);
  }
}
