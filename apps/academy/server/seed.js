require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Webinar = require('./models/Webinar');
const OnlineCourse = require('./models/OnlineCourse');
const HybridCourse = require('./models/HybridCourse');
const OnlineClass = require('./models/OnlineClass');
const OfflineCourse = require('./models/OfflineCourse');

const webinars = [
  { emoji: '', title: 'AI & Machine Learning Master Class', desc: 'Deep dive into AI, ML algorithms, and real-world applications with top AI researchers.', duration: '3 Hours', students: '5,200 attended', rating: '4.9★', price: '999', oldPrice: '2,999', level: 'All Levels' },
  { emoji: '', title: 'Stock Market & Trading Masterclass', desc: 'Learn technical analysis, fundamental analysis, and live trading strategies from a SEBI-registered advisor.', duration: '4 Hours', students: '8,100 attended', rating: '4.8★', price: '799', oldPrice: '1,999', level: 'Beginner' },
  { emoji: '', title: 'Digital Marketing Strategy Webinar', desc: 'Crack growth hacking, SEO, paid ads, and social media strategy in one power-packed session.', duration: '2.5 Hours', students: '4,800 attended', rating: '4.9★', price: '599', oldPrice: '1,499', level: 'Intermediate' },
  { emoji: '', title: 'Startup Founder Masterclass', desc: 'From idea to funding — learn how to build, pitch, and scale your startup from serial entrepreneurs.', duration: '5 Hours', students: '3,300 attended', rating: '5.0★', price: '1,499', oldPrice: '3,999', level: 'Advanced' },
  { emoji: '', title: 'UI/UX Design Masterclass', desc: 'Figma, design thinking, user research, and portfolio building from a Senior Product Designer at a top startup.', duration: '3 Hours', students: '6,700 attended', rating: '4.9★', price: '699', oldPrice: '1,799', level: 'Beginner' },
  { emoji: '', title: 'Cloud Computing & DevOps Webinar', desc: 'AWS, Docker, Kubernetes, and CI/CD pipelines — all in one live masterclass with hands-on demos.', duration: '4 Hours', students: '4,100 attended', rating: '4.8★', price: '1,199', oldPrice: '2,999', level: 'Intermediate' },
];

const onlineCourses = [
  { emoji: '', title: 'Full Stack Web Development', desc: 'HTML, CSS, JS, React, Node.js, MongoDB — build real-world apps from scratch to deployment.', duration: '6 Months', students: '12,000 enrolled', rating: '4.9★', price: '4,999', oldPrice: '14,999', level: 'Beginner' },
  { emoji: '', title: 'Python for Data Science', desc: 'NumPy, Pandas, Matplotlib, Scikit-learn, and real-world data analysis projects.', duration: '4 Months', students: '9,500 enrolled', rating: '4.8★', price: '3,999', oldPrice: '11,999', level: 'Beginner' },
  { emoji: '', title: 'Business Analytics & Excel', desc: 'Advanced Excel, Power BI, SQL, and data storytelling for business decision-making.', duration: '3 Months', students: '7,200 enrolled', rating: '4.8★', price: '2,999', oldPrice: '7,999', level: 'All Levels' },
  { emoji: '', title: 'Cybersecurity Fundamentals', desc: 'Ethical hacking, network security, cryptography, and CEH exam preparation.', duration: '5 Months', students: '5,800 enrolled', rating: '4.9★', price: '5,999', oldPrice: '15,999', level: 'Intermediate' },
  { emoji: '', title: 'React Native Mobile Development', desc: 'Build cross-platform iOS & Android apps with React Native and Expo.', duration: '3 Months', students: '4,400 enrolled', rating: '4.7★', price: '3,499', oldPrice: '9,999', level: 'Intermediate' },
  { emoji: '', title: 'Video Editing & Production', desc: 'Adobe Premiere Pro, After Effects, color grading, and YouTube content creation mastery.', duration: '2 Months', students: '6,100 enrolled', rating: '4.8★', price: '1,999', oldPrice: '5,999', level: 'Beginner' },
];

const hybridCourses = [
  { emoji: '', title: 'AI Engineering Hybrid Program', desc: 'Online: theory, ML models & coding. Offline: lab sessions, GPU computing, and team projects.', duration: '6 Months', students: '3,200 enrolled', rating: '5.0★', price: '12,999', oldPrice: '29,999', level: 'Advanced' },
  { emoji: '', title: 'Finance & Investment Hybrid', desc: 'Online: financial modelling & CFA prep. Offline: Bloomberg terminal sessions and case studies.', duration: '4 Months', students: '2,400 enrolled', rating: '4.9★', price: '9,999', oldPrice: '22,999', level: 'Intermediate' },
  { emoji: '', title: 'Healthcare Management Hybrid', desc: 'Online: hospital administration theory. Offline: hospital visits, practical training, and case study workshops.', duration: '8 Months', students: '1,800 enrolled', rating: '4.8★', price: '18,999', oldPrice: '45,000', level: 'All Levels' },
  { emoji: '', title: 'Public Speaking & Leadership', desc: 'Online: theory and recorded sessions. Offline: weekly workshops, debates, and presentations.', duration: '3 Months', students: '4,100 enrolled', rating: '4.9★', price: '7,499', oldPrice: '18,000', level: 'All Levels' },
  { emoji: '', title: 'Embedded Systems & IoT', desc: 'Online: programming theory. Offline: hands-on lab with Arduino, Raspberry Pi, and sensor kits.', duration: '5 Months', students: '2,900 enrolled', rating: '4.8★', price: '11,999', oldPrice: '27,000', level: 'Intermediate' },
  { emoji: '', title: 'Graphic Design Hybrid Program', desc: 'Online: design tools and principles. Offline: studio sessions, client projects, and portfolio reviews.', duration: '4 Months', students: '3,700 enrolled', rating: '4.9★', price: '8,999', oldPrice: '19,999', level: 'Beginner' },
];

const onlineClasses = [
  { emoji: '', title: 'Spoken English & Communication', desc: 'Daily live practice sessions with certified trainers. Fluency-focused, conversation-driven learning.', duration: '45 Days', students: '11,000 enrolled', rating: '4.9★', price: '2,499', oldPrice: '6,999', level: 'All Levels' },
  { emoji: '', title: 'CAT / GMAT Preparation', desc: 'Structured live classes, doubt sessions, and mock tests with IIM alumni faculty.', duration: '6 Months', students: '5,400 enrolled', rating: '4.8★', price: '8,999', oldPrice: '19,999', level: 'Advanced' },
  { emoji: '', title: 'Maths & Reasoning (Govt. Exams)', desc: 'Live classes for SSC, Banking, and Railway exam preparation — Quant, Reasoning, and English.', duration: '4 Months', students: '14,200 enrolled', rating: '4.8★', price: '3,999', oldPrice: '9,999', level: 'Beginner' },
  { emoji: '', title: 'IELTS / TOEFL Coaching', desc: 'Live mock tests, feedback, and targeted practice sessions with Band 8+ certified trainers.', duration: '60 Days', students: '6,800 enrolled', rating: '4.9★', price: '5,499', oldPrice: '12,999', level: 'Intermediate' },
  { emoji: '', title: 'Tally & GST (Accounting)', desc: 'Live accounting classes covering Tally ERP 9, TallyPrime, GST filing, and taxation.', duration: '2 Months', students: '8,900 enrolled', rating: '4.7★', price: '2,999', oldPrice: '6,999', level: 'Beginner' },
  { emoji: '', title: 'Interview Preparation Bootcamp', desc: 'Mock interviews, resume reviews, and live coaching for placements at top tech companies.', duration: '30 Days', students: '7,500 enrolled', rating: '4.9★', price: '3,999', oldPrice: '8,999', level: 'All Levels' },
];

const offlineCourses = [
  { emoji: '', title: 'Civil Engineering Design', desc: 'AutoCAD, structural analysis, site management, and construction project planning — in a fully equipped lab.', duration: '6 Months', students: '2,800 enrolled', rating: '4.9★', price: '14,999', oldPrice: '35,000', level: 'Intermediate' },
  { emoji: '', title: 'Electrical & Automation', desc: 'PLC programming, SCADA, industrial automation, and electrical panel wiring in our simulation lab.', duration: '4 Months', students: '1,900 enrolled', rating: '4.8★', price: '11,999', oldPrice: '25,000', level: 'Advanced' },
  { emoji: '', title: 'Nursing & Healthcare Diploma', desc: 'Practical nursing skills, patient care, medical procedures, and hospital workflow — trained in simulation wards.', duration: '1 Year', students: '1,200 enrolled', rating: '4.9★', price: '24,999', oldPrice: '60,000', level: 'All Levels' },
  { emoji: '', title: 'Professional Culinary Arts', desc: 'Indian, Continental, and Bakery cuisines. Learn under award-winning chefs in a fully equipped kitchen.', duration: '3 Months', students: '3,400 enrolled', rating: '4.9★', price: '9,999', oldPrice: '25,000', level: 'Beginner' },
  { emoji: '', title: 'Fashion Design & Tailoring', desc: 'Pattern making, stitching, fabric science, and fashion illustration in a professional design studio.', duration: '6 Months', students: '2,100 enrolled', rating: '4.8★', price: '12,999', oldPrice: '28,000', level: 'Beginner' },
  { emoji: '', title: 'Automobile Technology', desc: 'Engine overhaul, EV technology, diagnostics, and workshop management in our auto garage center.', duration: '5 Months', students: '1,500 enrolled', rating: '4.7★', price: '13,999', oldPrice: '30,000', level: 'Intermediate' },
];

async function seed() {
  await connectDB();

  await Webinar.deleteMany({});
  await OnlineCourse.deleteMany({});
  await HybridCourse.deleteMany({});
  await OnlineClass.deleteMany({});
  await OfflineCourse.deleteMany({});

  await Webinar.insertMany(webinars);
  await OnlineCourse.insertMany(onlineCourses);
  await HybridCourse.insertMany(hybridCourses);
  await OnlineClass.insertMany(onlineClasses);
  await OfflineCourse.insertMany(offlineCourses);

  console.log(' Seeded:');
  console.log(`   webinars       → ${webinars.length} docs`);
  console.log(`   onlinecourses  → ${onlineCourses.length} docs`);
  console.log(`   hybridcourses  → ${hybridCourses.length} docs`);
  console.log(`   onlineclasses  → ${onlineClasses.length} docs`);
  console.log(`   offlinecourses → ${offlineCourses.length} docs`);

  await mongoose.disconnect();
  console.log('Done. MongoDB disconnected.');
}

seed().catch(err => { console.error(err); process.exit(1); });
