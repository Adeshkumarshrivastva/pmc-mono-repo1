// Certification quiz question bank for the Online Course PPT/PDF.
//
// ⚠️ PLACEHOLDER CONTENT — these 10 questions are generic samples so the
// full view → pay → download → quiz → certificate flow works end-to-end
// right away. Replace `question` / `options` / `correctIndex` below with
// questions that actually match your uploaded PPT/PDF — nothing else in
// the code needs to change.
//
// correctIndex is 0-based and is NEVER sent to the browser — only
// backend/routes/quiz.js reads it, to grade submitted answers.

const quizQuestions = [
  {
    id: 1,
    question: 'What is the main benefit of taking notes while going through an online course?',
    options: ['It wastes time', 'It improves retention and recall later', 'It is required to unlock the certificate', 'It replaces watching the material'],
    correctIndex: 1,
  },
  {
    id: 2,
    question: 'In this course, what do you get immediately after completing the payment?',
    options: ['Nothing', 'Access to download the course PDF', 'A refund', 'A new course'],
    correctIndex: 1,
  },
  {
    id: 3,
    question: 'How many questions are in this certification quiz?',
    options: ['5', '10', '20', '15'],
    correctIndex: 1,
  },
  {
    id: 4,
    question: 'What is the minimum number of correct answers needed to earn the certificate?',
    options: ['3 out of 10', '5 out of 10', '8 out of 10', '10 out of 10'],
    correctIndex: 1,
  },
  {
    id: 5,
    question: 'Which of these is generally considered a good learning habit?',
    options: ['Skipping practice entirely', 'Revising key concepts regularly', 'Never reviewing mistakes', 'Cramming everything the night before'],
    correctIndex: 1,
  },
  {
    id: 6,
    question: 'What should you do before making the payment for the course material?',
    options: ['Close the browser', 'Review your name, email and phone details', 'Uninstall the app', 'Nothing'],
    correctIndex: 1,
  },
  {
    id: 7,
    question: 'What file format is the downloadable course material provided in?',
    options: ['PDF', 'EXE', 'ZIP of images', 'MP3'],
    correctIndex: 0,
  },
  {
    id: 8,
    question: 'Why might a course use a short quiz before issuing a certificate?',
    options: ['To slow you down for no reason', 'To confirm you engaged with the material', 'To charge extra money', 'It is not related to certification'],
    correctIndex: 1,
  },
  {
    id: 9,
    question: 'If you fail the quiz on your first attempt, what is the sensible next step?',
    options: ['Give up permanently', 'Review the material and try again', 'Ask for a certificate anyway', 'Uninstall the course'],
    correctIndex: 1,
  },
  {
    id: 10,
    question: 'What does a completion certificate typically represent?',
    options: ['That you paid only', 'That you viewed the material and passed the quiz', 'That you registered an account', 'Nothing specific'],
    correctIndex: 1,
  },
];

module.exports = quizQuestions;
