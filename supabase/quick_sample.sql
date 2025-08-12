/*
  # Complete Exam Taking Application Schema

  1. New Tables
    - `exams` - Store exam configurations
    - `questions` - Store question bank with MCQ options
    - `exam_sessions` - Track user exam attempts
    - `exam_results` - Store final exam results

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
    - Questions are readable by all authenticated users
    - Exams are readable by all authenticated users
    - Sessions and results are private to each user

  3. Sample Data
    - Insert sample exams and questions for testing
*/

-- Create exams table
CREATE TABLE IF NOT EXISTS exams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  duration_minutes integer NOT NULL DEFAULT 30,
  total_questions integer NOT NULL DEFAULT 10,
  passing_score integer NOT NULL DEFAULT 70,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create questions table
CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  options jsonb NOT NULL,
  correct_option integer NOT NULL,
  category text DEFAULT 'general',
  difficulty text DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create exam sessions table
CREATE TABLE IF NOT EXISTS exam_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id uuid REFERENCES exams(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  questions jsonb NOT NULL,
  answers jsonb DEFAULT '{}',
  started_at timestamptz DEFAULT now(),
  submitted_at timestamptz,
  score integer,
  is_completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create exam results table
CREATE TABLE IF NOT EXISTS exam_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_session_id uuid REFERENCES exam_sessions(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  exam_id uuid REFERENCES exams(id) ON DELETE CASCADE,
  score integer NOT NULL,
  total_questions integer NOT NULL,
  correct_answers integer NOT NULL,
  time_taken_minutes integer NOT NULL,
  passed boolean NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Exams are viewable by authenticated users"
  ON exams
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Questions are viewable by authenticated users"
  ON questions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can view their own exam sessions"
  ON exam_sessions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own exam sessions"
  ON exam_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own exam sessions"
  ON exam_sessions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own exam results"
  ON exam_results
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own exam results"
  ON exam_results
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Sample data
INSERT INTO exams (title, description, duration_minutes, total_questions, passing_score) VALUES
('JavaScript Fundamentals', 'Test your knowledge of JavaScript basics including variables, functions, and control structures.', 30, 10, 70),
('React.js Essentials', 'Comprehensive test covering React components, hooks, state management, and best practices.', 45, 15, 75),
('Web Development Basics', 'General web development knowledge including HTML, CSS, and JavaScript fundamentals.', 25, 8, 65);

INSERT INTO questions (question, options, correct_option, category, difficulty) VALUES
-- JavaScript Questions
('What is the correct way to declare a variable in JavaScript?', '["var x = 5;", "variable x = 5;", "v x = 5;", "declare x = 5;"]', 0, 'javascript', 'easy'),
('Which of the following is NOT a JavaScript data type?', '["String", "Boolean", "Float", "Number"]', 2, 'javascript', 'medium'),
('What does the "typeof" operator return for an array?', '["array", "object", "list", "undefined"]', 1, 'javascript', 'medium'),
('How do you create a function in JavaScript?', '["function myFunction() {}", "create myFunction() {}", "def myFunction() {}", "function: myFunction() {}"]', 0, 'javascript', 'easy'),
('What is the result of 2 + "2" in JavaScript?', '["4", "22", "NaN", "Error"]', 1, 'javascript', 'medium'),

-- React Questions  
('What is JSX?', '["A JavaScript library", "A syntax extension for JavaScript", "A CSS framework", "A database query language"]', 1, 'react', 'easy'),
('Which hook is used for state management in functional components?', '["useEffect", "useState", "useContext", "useReducer"]', 1, 'react', 'easy'),
('What is the virtual DOM?', '["A real DOM element", "A JavaScript representation of the real DOM", "A CSS property", "A React component"]', 1, 'react', 'medium'),
('How do you pass data from parent to child component?', '["Using state", "Using props", "Using context", "Using refs"]', 1, 'react', 'easy'),
('What is the purpose of useEffect hook?', '["To manage state", "To handle side effects", "To create components", "To style components"]', 1, 'react', 'medium'),

-- Web Development Questions
('What does HTML stand for?', '["Home Tool Markup Language", "Hyperlinks and Text Markup Language", "HyperText Markup Language", "Hyperlinking Text Markup Language"]', 2, 'html', 'easy'),
('Which CSS property is used to change the background color?', '["color", "bgcolor", "background-color", "background"]', 2, 'css', 'easy'),
('What is the correct HTML element for the largest heading?', '["<heading>", "<h6>", "<h1>", "<head>"]', 2, 'html', 'easy'),
('Which property is used to change the font size in CSS?', '["font-style", "text-size", "font-size", "text-style"]', 2, 'css', 'easy'),
('What does CSS stand for?', '["Creative Style Sheets", "Computer Style Sheets", "Cascading Style Sheets", "Colorful Style Sheets"]', 2, 'css', 'easy'),

-- Additional questions for variety
('What is the difference between "==" and "===" in JavaScript?', '["No difference", "=== compares type and value, == only compares value", "== compares type and value, === only compares value", "=== is used for assignment"]', 1, 'javascript', 'medium'),
('Which method is used to add an element to the end of an array?', '["push()", "pop()", "shift()", "unshift()"]', 0, 'javascript', 'easy'),
('What is a closure in JavaScript?', '["A loop structure", "A function that has access to outer scope", "A conditional statement", "An object property"]', 1, 'javascript', 'hard'),
('Which HTML tag is used to link an external CSS file?', '["<css>", "<link>", "<style>", "<stylesheet>"]', 1, 'html', 'easy'),
('What is the box model in CSS?', '["A container element", "The structure of margin, border, padding, and content", "A layout technique", "A CSS framework"]', 1, 'css', 'medium');