// controllers/quiz.controller.js
const Quiz = require('../models/quiz.model');
const Category = require('../models/category.model');
const QuizResult = require('../models/quizResult.model');
const mongoose = require('mongoose');

// Create a new quiz
exports.createQuiz = async (req, res) => {
  try {
    const { name, description, duration, totalQuestions, categoryId, questions, price, tags } = req.body;

    if (!name || !duration || !totalQuestions || !categoryId) {
      return res.status(400).json({ 
        success: false, 
        message: "Name, duration, totalQuestions, and categoryId are required." 
      });
    }

    // Check if category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    const quiz = await Quiz.create({
      name,
      description,
      duration,
      totalQuestions,
      categoryId,
      questions: questions || [],
      price: price || 0,
      isLocked: price > 0,
      tags: tags || [],
      createdBy: req.user?.id // Optional, if user auth is implemented
    });

    res.status(201).json({ success: true, data: quiz });
  } catch (error) {
    console.error("Error creating quiz:", error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

// Get quizzes by category
exports.getQuizzesByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    
    // Check if category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    const quizzes = await Quiz.find({ 
      categoryId, 
      isActive: true 
    }).select('name description duration totalQuestions price isLocked tags rating');

    res.json({ success: true, data: quizzes });
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

// Get quizzes by category (alias for backward compatibility)
exports.getQuizzesByCategoryId = exports.getQuizzesByCategory;

// Get quiz by id
exports.getQuizById = async (req, res) => {
  try {
    const { quizId } = req.params;
    
    // If includeAnswers query param is false, exclude correctOptionId from questions
    const includeAnswers = req.query.includeAnswers === 'true';
    
    const quiz = await Quiz.findById(quizId);
    
    if (!quiz) {
      return res.status(404).json({ success: false, message: "Quiz not found" });
    }
    
    // If we shouldn't include answers, modify the response
    if (!includeAnswers) {
      const quizWithoutAnswers = quiz.toObject();
      
      // Remove correct answers from questions
      if (quizWithoutAnswers.questions && quizWithoutAnswers.questions.length > 0) {
        quizWithoutAnswers.questions = quizWithoutAnswers.questions.map(q => ({
          ...q,
          correctOptionId: undefined,
          explanation: undefined
        }));
      }
      
      return res.json({ success: true, data: quizWithoutAnswers });
    }
    
    res.json({ success: true, data: quiz });
  } catch (error) {
    console.error("Error fetching quiz:", error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

// Add a question to a quiz
exports.addQuestion = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { text, nativeText, options, correctOptionId, explanation, difficulty } = req.body;
    
    if (!text || !options || !correctOptionId) {
      return res.status(400).json({ 
        success: false, 
        message: "Text, options, and correctOptionId are required." 
      });
    }
    
    // Verify that the correctOptionId exists in the options
    const optionExists = options.some(option => option.id === correctOptionId);
    if (!optionExists) {
      return res.status(400).json({ 
        success: false, 
        message: "correctOptionId must match one of the option ids" 
      });
    }
    
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ success: false, message: "Quiz not found" });
    }
    
    // Calculate the next order number
    const order = quiz.questions.length > 0 
      ? Math.max(...quiz.questions.map(q => q.order)) + 1 
      : 0;
    
    // Add the new question
    quiz.questions.push({
      text,
      nativeText,
      options,
      correctOptionId,
      explanation,
      difficulty: difficulty || 'medium',
      order
    });
    
    // Update the totalQuestions count
    quiz.totalQuestions = quiz.questions.length;
    
    await quiz.save();
    
    res.status(201).json({ 
      success: true, 
      data: quiz.questions[quiz.questions.length - 1],
      message: "Question added successfully"
    });
  } catch (error) {
    console.error("Error adding question:", error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

// Submit quiz answers
exports.submitQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { 
      userId, 
      answers, 
      timeTaken, 
      score,
      totalQuestions,
      correctAnswers,
      incorrectAnswers,
      notAttempted
    } = req.body;
    
    if (!userId || !quizId) {
      return res.status(400).json({ 
        success: false, 
        message: "UserId and quizId are required." 
      });
    }
    
    // Calculate percentage
    const percentage = totalQuestions > 0 
      ? Math.round((correctAnswers / totalQuestions) * 100) 
      : 0;
    
    // Calculate points (example logic - customize as needed)
    const points = correctAnswers * 100 - incorrectAnswers * 20;
    
    // Create the quiz result
    const quizResult = await QuizResult.create({
      userId,
      quizId,
      score,
      totalQuestions,
      correctAnswers,
      incorrectAnswers,
      notAttempted,
      timeTaken,
      answers,
      percentage,
      points,
      completed: true,
      completedAt: new Date()
    });
    
    // Get the rank (position in leaderboard)
    const betterScores = await QuizResult.countDocuments({
      quizId,
      score: { $gt: score }
    });
    
    // Total number of quiz takers
    const totalTakers = await QuizResult.countDocuments({ quizId });
    
    // Update the result with rank
    quizResult.rank = `${betterScores + 1}/${totalTakers}`;
    await quizResult.save();
    
    res.status(201).json({ 
      success: true, 
      data: quizResult,
      message: "Quiz result submitted successfully"
    });
  } catch (error) {
    console.error("Error submitting quiz result:", error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

// Get quiz results for a user
exports.getUserQuizResults = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const results = await QuizResult.find({ userId })
      .populate('quizId', 'name description')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, data: results });
  } catch (error) {
    console.error("Error fetching user quiz results:", error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

// Get a specific quiz result
exports.getQuizResult = async (req, res) => {
  try {
    const { resultId } = req.params;
    
    const result = await QuizResult.findById(resultId)
      .populate('quizId', 'name description questions');
    
    if (!result) {
      return res.status(404).json({ success: false, message: "Quiz result not found" });
    }
    
    res.json({ success: true, data: result });
  } catch (error) {
    console.error("Error fetching quiz result:", error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
}; 