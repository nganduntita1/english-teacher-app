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

export async function generateLesson(
  level: 'beginner' | 'intermediate' | 'advanced',
  topic?: string
): Promise<GeneratedLesson> {
  const prompt = `
You are an English language teacher. Generate a single comprehensive English lesson in JSON format.

Requirements:
- Level: ${level}
- Topic: ${topic || 'random useful English topic'}
- Output ONLY valid JSON, no markdown, no explanations
- JSON must have exactly these fields: title, description, content, level

The content should be educational, practical, and about 200-300 words.

Example output format:
{
  "title": "Basic Greetings",
  "description": "Learn essential English greetings and how to introduce yourself",
  "content": "In English, we greet people with...",
  "level": "beginner"
}

Generate the lesson now:`;

  try {
    const response = await generateWithGroq(prompt);
    const lesson = JSON.parse(response) as GeneratedLesson;
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
You are an English vocabulary teacher. Generate 8 vocabulary words for this lesson in JSON format.

Lesson: ${lessonTitle}
Level: ${level}

Requirements:
- Output ONLY valid JSON array, no markdown, no explanations
- Each item must have: word, french_meaning, example_en, example_fr
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
You are an English teacher creating quiz questions. Generate 5 multiple-choice quiz questions in JSON format.

Lesson: ${lessonTitle}
Vocabulary to test: ${vocabulary.join(', ')}

Requirements:
- Output ONLY valid JSON array, no markdown, no explanations
- Each question must have: question, options (array of 4), correct_answer, explanation
- The correct_answer must be one of the options exactly as written
- Options should be plausible but not confusing
- Explanations should be brief (1-2 sentences)
- Questions should test understanding, not just memorization

Example output format:
[
  {
    "question": "What does 'hello' mean?",
    "options": ["Goodbye", "Bonjour", "Thank you", "Please"],
    "correct_answer": "Bonjour",
    "explanation": "Hello is a greeting that means Bonjour in French."
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
