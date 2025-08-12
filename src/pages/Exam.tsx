import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Question, ExamSession } from '../types';
import { Clock, ChevronLeft, ChevronRight, Send, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

const Exam: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [examSession, setExamSession] = useState<ExamSession | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [questionId: string]: number }>({});
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes in seconds
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const submitExam = useCallback(async (autoSubmit = false) => {
    if (!examSession || !user) return;

    setSubmitting(true);
    try {
      // Calculate score
      let correctAnswers = 0;
      examSession.questions.forEach((question) => {
        if (answers[question.id] === question.correct_option) {
          correctAnswers++;
        }
      });

      const score = Math.round((correctAnswers / examSession.questions.length) * 100);
      const timeTaken = Math.round((1800 - timeLeft) / 60); // Convert to minutes

      // Save exam result
      const { error: resultError } = await supabase
        .from('exam_results')
        .insert({
          exam_session_id: examSession.id,
          user_id: user.id,
          exam_id: examSession.exam_id,
          score,
          total_questions: examSession.questions.length,
          correct_answers: correctAnswers,
          time_taken_minutes: timeTaken,
          passed: score >= 70, // Assuming 70% is passing
        });

      if (resultError) throw resultError;

      // Update session as completed
      const { error: sessionError } = await supabase
        .from('exam_sessions')
        .update({
          submitted_at: new Date().toISOString(),
          is_completed: true,
          answers,
          score,
        })
        .eq('id', examSession.id);

      if (sessionError) throw sessionError;

      if (autoSubmit) {
        toast.success('Exam auto-submitted due to time expiry');
      } else {
        toast.success('Exam submitted successfully');
      }

      navigate(`/result/${examSession.id}`);
    } catch (error: any) {
      toast.error('Failed to submit exam');
      console.error('Submit error:', error);
    } finally {
      setSubmitting(false);
    }
  }, [examSession, user, answers, timeLeft, navigate]);

  useEffect(() => {
    if (timeLeft <= 0 && examSession) {
      submitExam(true);
    }
  }, [timeLeft, submitExam, examSession]);

  useEffect(() => {
    if (!examId || !user) return;

    const initializeExam = async () => {
      try {
        // Check if there's an active session
        const { data: existingSession, error: sessionError } = await supabase
          .from('exam_sessions')
          .select('*')
          .eq('exam_id', examId)
          .eq('user_id', user.id)
          .eq('is_completed', false)
          .single();

        if (existingSession && !sessionError) {
          // Resume existing session
          setExamSession(existingSession);
          setAnswers(existingSession.answers || {});
          const timeElapsed = Math.floor(
            (new Date().getTime() - new Date(existingSession.started_at).getTime()) / 1000
          );
          setTimeLeft(Math.max(0, 1800 - timeElapsed));
        } else {
          // Create new session
          const { data: questions, error: questionsError } = await supabase
            .from('questions')
            .select('*')
            .limit(10)

            if (questionsError) {
              console.error('Error fetching questions:', questionsError);
              throw questionsError;
            }
            const shuffled = questions.sort(() => Math.random() - 0.5);
            const limited = shuffled.slice(0, 10);
        
      console.log('Questions fetched:', questions);

          const { data: newSession, error: newSessionError } = await supabase
            .from('exam_sessions')
            .insert({
              exam_id: examId,
              user_id: user.id,
              questions: questions,
              answers: {},
              started_at: new Date().toISOString(),
              is_completed: false,
            })
            .select()
            .single();

          if (newSessionError) throw newSessionError;

          setExamSession(newSession);
          setTimeLeft(1800);
        }
      } catch (error: any) {
        toast.error('Failed to initialize exam');
        console.error('Init error:', error);
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    initializeExam();
  }, [examId, user, navigate]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const handleAnswerSelect = (questionId: string, optionIndex: number) => {
    setAnswers({ ...answers, [questionId]: optionIndex });
  };

  const goToNext = () => {
    if (examSession && currentQuestionIndex < examSession.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const goToPrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing exam...</p>
        </div>
      </div>
    );
  }

  if (!examSession) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Exam Not Found</h2>
          <p className="text-gray-600">The exam you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const currentQuestion = examSession.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / examSession.questions.length) * 100;
  const unansweredCount = examSession.questions.length - Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gray-100 backdrop-blur-sm border-b shadow-sm" style={{background: 'linear-gradient(135deg, rgba(243, 244, 246, 0.9) 0%, rgba(229, 231, 235, 0.9) 100%)'}}>
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Question {currentQuestionIndex + 1} of {examSession.questions.length}
              </div>
              <div className="w-48 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-gray-600 to-gray-700 h-2 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                timeLeft < 300 ? 'bg-red-100 text-red-700' : 'bg-gray-200 text-gray-700'
              }`}>
                <Clock className="h-4 w-4" />
                <span className="font-mono font-medium">{formatTime(timeLeft)}</span>
              </div>
              <button
                onClick={() => setShowSubmitConfirm(true)}
                className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-4 py-2 rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all flex items-center space-x-2"
              >
                <Send className="h-4 w-4" />
                <span>Submit</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-gray-100 backdrop-blur-sm border border-gray-200 rounded-xl shadow-sm p-8" style={{background: 'linear-gradient(135deg, rgba(243, 244, 246, 0.9) 0%, rgba(229, 231, 235, 0.9) 100%)'}}>
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 leading-relaxed">
              {currentQuestion.question}
            </h2>
          </div>

          <div className="space-y-4 mb-8">
            {currentQuestion.options.map((option, index) => (
              <label
                key={index}
                className={`block p-4 rounded-lg border-2 cursor-pointer transition-all hover:bg-gray-200 ${
                  answers[currentQuestion.id] === index
                    ? 'border-gray-500 bg-gray-200'
                    : 'border-gray-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name={`question-${currentQuestion.id}`}
                    value={index}
                    checked={answers[currentQuestion.id] === index}
                    onChange={() => handleAnswerSelect(currentQuestion.id, index)}
                    className="w-4 h-4 text-gray-600 border-gray-300 focus:ring-gray-500"
                  />
                  <span className="text-gray-900">{option}</span>
                </div>
              </label>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={goToPrevious}
              disabled={currentQuestionIndex === 0}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous</span>
            </button>

            <div className="text-sm text-gray-500">
              {unansweredCount > 0 && (
                <span className="text-orange-600">
                  {unansweredCount} question(s) unanswered
                </span>
              )}
            </div>

            <button
              onClick={goToNext}
              disabled={currentQuestionIndex === examSession.questions.length - 1}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span>Next</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-100 backdrop-blur-sm border border-gray-200 rounded-xl max-w-md w-full p-6" style={{background: 'linear-gradient(135deg, rgba(243, 244, 246, 0.9) 0%, rgba(229, 231, 235, 0.9) 100%)'}}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Submit Exam?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to submit your exam? You have {unansweredCount} unanswered questions.
              This action cannot be undone.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowSubmitConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Continue Exam
              </button>
              <button
                onClick={() => submitExam(false)}
                disabled={submitting}
                className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 text-white px-4 py-2 rounded-lg hover:from-gray-700 hover:to-gray-800 disabled:opacity-50 transition-all"
              >
                {submitting ? 'Submitting...' : 'Submit Exam'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Exam;



