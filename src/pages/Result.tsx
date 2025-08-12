import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { CheckCircle, XCircle, Award, Clock, BookOpen, Home, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';

interface ExamResult {
  id: string;
  exam_session_id: string;
  user_id: string;
  exam_id: string;
  score: number;
  total_questions: number;
  correct_answers: number;
  time_taken_minutes: number;
  passed: boolean;
  created_at: string;
  exam_sessions: {
    questions: any[];
    answers: { [key: string]: number };
    exams: {
      title: string;
      description: string;
      passing_score: number;
    };
  };
}

const Result: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [result, setResult] = useState<ExamResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId || !user) return;

    const fetchResult = async () => {
      try {
        const { data, error } = await supabase
          .from('exam_results')
          .select(`
            *,
            exam_sessions (
              questions,
              answers,
              exams (
                title,
                description,
                passing_score
              )
            )
          `)
          .eq('exam_session_id', sessionId)
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        setResult(data);
      } catch (error: any) {
        toast.error('Failed to fetch exam results');
        console.error('Error:', error);
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [sessionId, user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Results Not Found</h2>
          <p className="text-gray-600">Unable to find your exam results.</p>
        </div>
      </div>
    );
  }

  const { exam_sessions: session } = result;
  const exam = session.exams;

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
            result.passed 
              ? 'bg-green-100 text-green-600' 
              : 'bg-red-100 text-red-600'
          }`}>
            {result.passed ? (
              <CheckCircle className="h-8 w-8" />
            ) : (
              <XCircle className="h-8 w-8" />
            )}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {result.passed ? 'Congratulations!' : 'Keep Trying!'}
          </h1>
          <p className="text-gray-600">
            {result.passed 
              ? 'You have successfully passed the exam.' 
              : 'You can retake the exam to improve your score.'}
          </p>
        </div>

        <div className="bg-gray-100 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-lg p-8 mb-8" style={{background: 'linear-gradient(135deg, rgba(243, 244, 246, 0.9) 0%, rgba(229, 231, 235, 0.9) 100%)'}}>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">{exam.title}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="text-center p-4 bg-gray-200 rounded-xl">
              <div className="text-3xl font-bold text-gray-700 mb-2">{result.score}%</div>
              <div className="text-sm text-gray-800 font-medium">Final Score</div>
            </div>
            <div className="text-center p-4 bg-green-100 rounded-xl">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {result.correct_answers}/{result.total_questions}
              </div>
              <div className="text-sm text-green-700 font-medium">Correct Answers</div>
            </div>
            <div className="text-center p-4 bg-gray-200 rounded-xl">
              <div className="text-3xl font-bold text-gray-700 mb-2">{result.time_taken_minutes}</div>
              <div className="text-sm text-gray-800 font-medium">Minutes Used</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-xl">
              <div className="text-3xl font-bold text-orange-600 mb-2">{exam.passing_score}%</div>
              <div className="text-sm text-orange-700 font-medium">Required to Pass</div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Breakdown</h3>
            <div className="space-y-4">
              {session.questions.map((question: any, index: number) => {
                const userAnswer = session.answers[question.id];
                const isCorrect = userAnswer === question.correct_option;
                
                return (
                  <div
                    key={question.id}
                    className={`p-4 rounded-lg border-l-4 ${
                      isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 mb-2">
                          Question {index + 1}: {question.question}
                        </p>
                        <div className="text-sm space-y-1">
                          <p className={`${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                            Your answer: {question.options[userAnswer] || 'Not answered'}
                          </p>
                          {!isCorrect && (
                            <p className="text-green-700">
                              Correct answer: {question.options[question.correct_option]}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className={`ml-4 ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                        {isCorrect ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : (
                          <XCircle className="h-5 w-5" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex justify-center space-x-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Home className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </button>
          <button
            onClick={() => navigate(`/exam/${result.exam_id}`)}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-lg hover:from-gray-800 hover:to-gray-900 transition-all"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Retake Exam</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Result;