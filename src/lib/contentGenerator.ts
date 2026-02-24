import { generateWithGroq } from './groq';

interface GeneratedLesson {
  title: string;
  description: string;
  content: string;
  level: 'beginner' | 'intermediate' | 'advanced';
}

interface GeneratedVocabulary {
  word: string;
  french_meaning: string;
  example_en: string;
  example_fr: string;
}

interface GeneratedQuizQuestion {
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
}

const frenchStopwords = new Set([
  'le', 'la', 'les', 'un', 'une', 'des', 'de', 'du', 'au', 'aux', 'pour', 'avec',
  'sans', 'et', 'ou', 'est', 'sont', 'dans', 'sur', 'par', 'que', 'qui', 'ce',
  'cette', 'ces', 'vous', 'nous', 'votre', 'notre', 'apprenez', 'apprendre',
  'maitriser', 'maitrisez', 'anglais', 'niveau', 'lecon', 'lecons', 'vocabulaire',
]);

const englishStopwords = new Set([
  'the', 'and', 'with', 'in', 'we', 'you', 'your', 'our', 'this', 'that', 'is',
  'are', 'to', 'of', 'for', 'on', 'from', 'learn', 'learning', 'lesson', 'lessons',
  'english', 'level', 'vocabulary',
]);

const looksLikeFrench = (text: string) => {
  const lower = text.toLowerCase();
  const tokens = lower.match(/[a-zàâçéèêëîïôûùüÿœ]+/g) || [];
  let frenchHits = 0;
  let englishHits = 0;

  for (const token of tokens) {
    if (frenchStopwords.has(token)) frenchHits++;
    if (englishStopwords.has(token)) englishHits++;
  }

  const hasAccents = /[àâçéèêëîïôûùüÿœ]/i.test(text);
  if (hasAccents) frenchHits += 2;

  if (frenchHits >= 2) return true;
  if (englishHits >= 2) return false;
  return frenchHits > englishHits;
};

const translateTitleDescriptionToFrench = async (title: string, description: string) => {
  const prompt = `
You are a translator. Convert the following JSON fields to French.
Return ONLY valid JSON with fields: title, description.

Input:
{"title": "${title.replace(/"/g, '\\"')}", "description": "${description.replace(/"/g, '\\"')}"}
`;

  const response = await generateWithGroq(prompt);
  const translated = JSON.parse(response) as { title: string; description: string };
  return translated;
};

export async function generateLesson(
  level: 'beginner' | 'intermediate' | 'advanced',
  topic?: string
): Promise<GeneratedLesson> {
  const prompt = `
You are an English language teacher for French-speaking students. Generate a single comprehensive English lesson in JSON format.

Requirements:
- Level: ${level}
- Topic: ${topic || 'random useful English topic'}
- Output ONLY valid JSON, no markdown, no explanations
- JSON must have exactly these fields: title, description, content, level
- title and description must be in French
- content must be in English

The content should be educational, practical, and about 200-300 words.

Example output format:
{
  "title": "Salutations de base",
  "description": "Apprenez les salutations essentielles en anglais",
  "content": "In English, we greet people with...",
  "level": "beginner"
}

Generate the lesson now:`;

  try {
    const response = await generateWithGroq(prompt);
    const lesson = JSON.parse(response) as GeneratedLesson;

    if (!looksLikeFrench(lesson.title) || !looksLikeFrench(lesson.description)) {
      const translated = await translateTitleDescriptionToFrench(lesson.title, lesson.description);
      lesson.title = translated.title;
      lesson.description = translated.description;
    }

    lesson.level = level;
    return lesson;
  } catch (error) {
    console.error('Error generating lesson:', error);
    throw error;
  }
}

export async function generateVocabularyForLesson(
  lessonTitle: string,
  level: 'beginner' | 'intermediate' | 'advanced'
): Promise<GeneratedVocabulary[]> {
  const prompt = `
You are an English vocabulary teacher for French-speaking students. Generate vocabulary words for this lesson in JSON format.

Lesson: ${lessonTitle}
Level: ${level}

Requirements:
- Output ONLY valid JSON array, no markdown, no explanations
- Each item must have: word, french_meaning, example_en, example_fr
- french_meaning and example_fr must be in French
- example_en must be in English
- Examples should be simple sentences (10-15 words max)
- All words should be relevant to the lesson topic

Example output format:
[
  {
    "word": "Hello",
    "french_meaning": "Bonjour",
    "example_en": "Hello, how are you?",
    "example_fr": "Bonjour, comment allez-vous?"
  },
  ...
]

Generate ${level === 'beginner' ? 8 : level === 'intermediate' ? 10 : 12} vocabulary words:`;

  try {
    const response = await generateWithGroq(prompt);
    const vocabulary = JSON.parse(response) as GeneratedVocabulary[];
    return vocabulary;
  } catch (error) {
    console.error('Error generating vocabulary:', error);
    throw error;
  }
}

export async function generateQuizForLesson(
  lessonTitle: string,
  vocabulary: string[]
): Promise<GeneratedQuizQuestion[]> {
  const prompt = `
You are an English teacher creating quiz questions for French-speaking students. Generate 5 multiple-choice quiz questions in JSON format.

Lesson: ${lessonTitle}
Vocabulary to test: ${vocabulary.join(', ')}

Requirements:
- Output ONLY valid JSON array, no markdown, no explanations
- Each question must have: question, options (array of 4), correct_answer, explanation
- question and explanation must be in French
- correct_answer must match one of the options exactly
- Options should be plausible but not confusing
- Explanations should be brief (1-2 sentences)
- Questions should test understanding, not just memorization

Example output format:
[
  {
    "question": "Que signifie 'hello' ?",
    "options": ["Goodbye", "Bonjour", "Thank you", "Please"],
    "correct_answer": "Bonjour",
    "explanation": "Hello est une salutation qui signifie Bonjour en francais."
  },
  ...
]

Generate 5 quiz questions:`;

  try {
    const response = await generateWithGroq(prompt);
    const questions = JSON.parse(response) as GeneratedQuizQuestion[];
    return questions;
  } catch (error) {
    console.error('Error generating quiz:', error);
    throw error;
  }
}

export async function generateCompleteLesson(
  level: 'beginner' | 'intermediate' | 'advanced',
  topic?: string,
  supabaseClient?: any
) {
  const supabase = supabaseClient || (await import('./supabase')).supabase;
  console.log(`Generating lesson at ${level} level for topic: ${topic || 'random'}`);

  // Step 1: Generate lesson
  const lesson = await generateLesson(level, topic);
  console.log('Generated lesson:', lesson.title);

  // Get the next order_index
  const { data: maxOrderData } = await supabase
    .from('lessons')
    .select('order_index')
    .order('order_index', { ascending: false })
    .limit(1)
    .single();

  const nextOrderIndex = (maxOrderData?.order_index ?? 0) + 1;

  // Step 2: Insert lesson into database
  const { data: lessonData, error: lessonError } = await supabase
    .from('lessons')
    .insert([
      {
        title: lesson.title,
        description: lesson.description,
        content: lesson.content,
        level: lesson.level,
        order_index: nextOrderIndex,
      },
    ])
    .select('id')
    .single();

  if (lessonError) {
    throw new Error(`Failed to insert lesson: ${lessonError.message}`);
  }

  const lessonId = lessonData.id;
  console.log('Inserted lesson with ID:', lessonId);

  // Step 3: Generate vocabulary
  const vocabulary = await generateVocabularyForLesson(lesson.title, level);
  console.log(`Generated ${vocabulary.length} vocabulary words`);

  // Step 4: Insert vocabulary into database
  const vocabToInsert = vocabulary.map((v) => ({
    lesson_id: lessonId,
    word: v.word,
    french_meaning: v.french_meaning,
    example_en: v.example_en,
    example_fr: v.example_fr,
  }));

  const { error: vocabError } = await supabase
    .from('vocabulary')
    .insert(vocabToInsert);

  if (vocabError) {
    throw new Error(`Failed to insert vocabulary: ${vocabError.message}`);
  }

  console.log('Inserted vocabulary');

  // Step 5: Generate quiz questions
  const vocabWords = vocabulary.map((v) => v.word);
  const quizQuestions = await generateQuizForLesson(lesson.title, vocabWords);
  console.log(`Generated ${quizQuestions.length} quiz questions`);

  // Step 6: Insert quiz questions into database
  const quizToInsert = quizQuestions.map((q) => ({
    lesson_id: lessonId,
    question: q.question,
    options: JSON.stringify(q.options),
    correct_answer: q.correct_answer,
    explanation: q.explanation,
  }));

  const { error: quizError } = await supabase
    .from('quiz_questions')
    .insert(quizToInsert);

  if (quizError) {
    throw new Error(`Failed to insert quiz questions: ${quizError.message}`);
  }

  console.log('Inserted quiz questions');

  return {
    success: true,
    lessonId,
    lesson: lesson.title,
    vocabularyCount: vocabulary.length,
    quizCount: quizQuestions.length,
  };
}
