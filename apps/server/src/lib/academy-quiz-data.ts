/**
 * Academy certification-quiz question banks.
 *
 * Ported verbatim from the standalone academy-demo backend's
 * `data/quizQuestions.js` (the generic, pay-per-material bank) and
 * `data/courseQuizzes.js` (the real "clinical-intake" curriculum content
 * supplied by PMC) — see academy's git history for the originals. Nothing
 * here is placeholder except where the demo itself said so.
 *
 * `correctIndex` is 0-based and must never reach the client — only
 * quiz.service.ts reads it, to grade a submitted answer.
 */

export type QuizQuestion = {
  id: string | number
  question: string
  options: string[]
  correctIndex: number
  explanation?: string
}

export type LongAnswerPrompt = {
  id: string
  prompt: string
}

// ---------------------------------------------------------------------------
// Legacy bank — used by any CourseMaterial with no `courseGroup` (plain,
// independent pay-per-material downloads). Placeholder content, same as the
// demo shipped: swap the text below for real questions without touching code
// elsewhere.
// ---------------------------------------------------------------------------

export const LEGACY_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: 'What is the main benefit of taking notes while going through an online course?',
    options: [
      'It wastes time',
      'It improves retention and recall later',
      'It is required to unlock the certificate',
      'It replaces watching the material',
    ],
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
]

export const LEGACY_PASS_MARK = 5 // out of 10 — unchanged behaviour for non-grouped materials

// ---------------------------------------------------------------------------
// "clinical-intake" sequential course — 5 PDFs (courseGroup:
// 'clinical-intake', order 1-5, seeded by prisma/seed/academy.ts). Content
// supplied by PMC directly, mapped 1:1 to each PDF's "PART n" section.
// ---------------------------------------------------------------------------

const PART_1: QuizQuestion[] = [
  {
    id: 'q1',
    question: 'What is the primary purpose of conducting a clinical intake assessment?',
    options: [
      'To conduct psychological research in standardized settings',
      'To examine unique challenges, personal history, and establish a therapeutic relationship to formulate a diagnosis and treatment plan',
      'To issue immediate psychiatric medication without gathering background history',
      'To observe the patient solely in a waiting room environment',
    ],
    correctIndex: 1,
    explanation:
      'A clinical intake assessment provides a multidimensional understanding of biopsychosocial elements, helps establish the patient-physician relationship, and creates an individualized treatment plan.',
  },
  {
    id: 'q2',
    question: 'Which type of interview features fixed question wording and order, making it especially useful in research settings?',
    options: ['Unstructured interview', 'Freeform interview', 'Structured (standardised) interview', 'Dynamic interview'],
    correctIndex: 2,
    explanation:
      'Structured interviews (such as the Composite International Diagnostic Interview or CIDI) have fixed content, order, and wording, making them standardized and useful in research.',
  },
]

const PART_2: QuizQuestion[] = [
  {
    id: 'q3',
    question:
      'Establishing a shared understanding between the patient and clinician regarding how the evaluation and treatment will proceed is known as:',
    options: ['Agreement to process', 'Disorder-centered evaluation', 'Objective diagnostic classification', 'Collateral history taking'],
    correctIndex: 0,
    explanation:
      '"Agreement to process" is a core principle that involves building a mutual understanding between patient and clinician about how the interview and care will move forward.',
  },
  {
    id: 'q4',
    question: 'How does a person-centered interview differ from a disorder-centered interview?',
    options: [
      'Person-centered interviews focus on classifying symptoms, while disorder-centered interviews focus on life history.',
      'Person-centered interviews focus on understanding the individual as a whole person, whereas disorder-centered interviews focus on identifying and classifying specific psychiatric symptoms.',
      'Disorder-centered interviews do not aim to reach a diagnosis.',
      'Person-centered interviews are restricted strictly to research studies.',
    ],
    correctIndex: 1,
    explanation:
      'Patient/person-centered approaches prioritize understanding the whole person, including life experiences and emotions, whereas disorder-based approaches focus on symptom classification and diagnosis.',
  },
  {
    id: 'q5',
    question: "What clinical opportunity occurs during the waiting room phase before the formal interview begins?",
    options: [
      'Conducting formal Mental Status Examination scoring',
      'Reviewing standardized DSM diagnostic criteria',
      "Informal observation of the patient's behavior, appearance, and social interactions",
      'Gathering complete family medical histories',
    ],
    correctIndex: 2,
    explanation:
      "The waiting room setting allows clinicians to observe a patient's natural behavior, appearance, and interactions before formal questioning starts.",
  },
]

const PART_3: QuizQuestion[] = [
  {
    id: 'q6',
    question: 'How is a psychiatric case history defined in clinical evaluation?',
    options: [
      'A brief checklist of current physical complaints only',
      "The chronological story of the patient's life from birth to present",
      'A single snapshot of cognitive functioning taken at one point in time',
      'An informal conversation without structured clinical components',
    ],
    correctIndex: 1,
    explanation:
      "Case history is a comprehensive account providing the chronological narrative of a patient's life from birth to the present across personal, medical, psychological, and social domains.",
  },
  {
    id: 'q7',
    question: 'Why does case formulation go "beyond diagnosis"?',
    options: [
      'It replaces the need to collect medical or personal history.',
      'It simply names a psychiatric disorder using diagnostic manuals.',
      'It explains why the problem has occurred and how it is currently maintained.',
      'It remains completely static and never changes as new information is gathered.',
    ],
    correctIndex: 2,
    explanation:
      'Case formulation goes beyond naming a disorder by providing an explanatory, biopsychosocial framework for why the issue developed and what maintains it.',
  },
  {
    id: 'q8',
    question: 'Which of the following is categorized as a biological factor in case formulation?',
    options: [
      'Living situation and community stressors',
      'Thought patterns and fear responses',
      'Family history of mental illness, chronic physical illness, or substance use',
      'Marital dynamics and workplace satisfaction',
    ],
    correctIndex: 2,
    explanation:
      'Biological factors encompass physical and medical influences, including genetic/family history of mental illness, neurological issues, non-psychiatric drugs, and substance use.',
  },
  {
    id: 'q9',
    question:
      'Work pressure, educational performance, financial condition, and living environment represent which component of case formulation?',
    options: ['Biological factors', 'Social factors', 'Premorbid cognitive traits', 'Diagnostic manual criteria'],
    correctIndex: 1,
    explanation:
      'Social factors include environmental influences such as family dynamics, employment, finances, living situations, and community stressors.',
  },
  {
    id: 'q10',
    question: 'Young children frequently express psychological distress through which primary clinical manifestation?',
    options: [
      'Detailed verbal self-reports of internal conflicts',
      'Behavioral problems such as tantrums, aggression, fears, or bedwetting',
      'Direct requests for specific psychiatric medications',
      'Independent completion of self-report questionnaires',
    ],
    correctIndex: 1,
    explanation:
      'Because young children often cannot fully articulate internal emotional states, distress is commonly expressed through behavioral disruptions like tantrums, fears, aggression, or school refusal.',
  },
  {
    id: 'q11',
    question: 'Why is ensuring privacy and confidentiality especially critical when taking a history from an adolescent?',
    options: [
      'Parents are legally excluded from receiving any clinical information.',
      'Adolescents value autonomy and independence, so establishing trust creates a safe space to explore sensitive risk behaviors.',
      'Adolescents are incapable of providing accurate self-reports without privacy.',
      'Confidentiality eliminates the need to evaluate peer relationships.',
    ],
    correctIndex: 1,
    explanation:
      'Adolescents prioritize independence and privacy; securing trust allows clinicians to sensitively explore peer dynamics, mood conflicts, and risk behaviors.',
  },
  {
    id: 'q12',
    question: 'When evaluating an adult patient, history taking focuses heavily on functioning in which central life domain?',
    options: [
      'Achievement of early motor and speech milestones',
      'Major adult roles and responsibilities, such as work, marriage, and family life',
      'Primary reliance on caregiver collateral reports',
      'School refusal and childhood peer acceptance',
    ],
    correctIndex: 1,
    explanation:
      'Adult case history emphasizes how an individual functions across key adult life roles—including employment, marital relationships, and parenting—and how life stressors impact these roles.',
  },
  {
    id: 'q13',
    question: 'Why is obtaining a collateral history from family members or caregivers particularly important in geriatric assessments?',
    options: [
      'Older adults are legally not permitted to provide their own history.',
      'Possible cognitive impairment (such as memory decline) may limit the accuracy of self-report.',
      'Physical illnesses never influence psychiatric symptoms in older adults.',
      'Diagnostic manuals are invalid for geriatric populations.',
    ],
    correctIndex: 1,
    explanation:
      'Due to potential cognitive impairment, dementia, or delirium, gathering information from caregivers or family members is vital to ensure an accurate evaluation in geriatric care.',
  },
]

const PART_4: QuizQuestion[] = [
  {
    id: 'q14',
    question: 'What is the core definition and objective of rapport building?',
    options: [
      'Rapidly questioning the patient to minimize session duration',
      'Establishing a trusting, comfortable, and empathetic relationship that facilitates open communication',
      'Filling out standardized research questionnaires strictly without deviation',
      'Maintaining an interrogative posture to test patient reliability',
    ],
    correctIndex: 1,
    explanation:
      'Rapport building creates a non-judgmental, empathetic foundation that helps patients feel comfortable sharing personal experiences and emotional struggles.',
  },
  {
    id: 'q15',
    question: 'What characterizes the "Funnel approach" in clinical questioning?',
    options: [
      'Using only closed-ended questions throughout the entire interview',
      'Starting with broad, open-ended exploration and gradually shifting to focused, closed-ended questions',
      'Asking about diagnostic criteria before allowing the patient to speak',
      'Allowing the patient to speak indefinitely without clinician guidance',
    ],
    correctIndex: 1,
    explanation:
      'The funnel approach begins with open-ended questions to encourage narrative expression, then transitions to specific, closed-ended questions to clarify symptom duration, severity, and frequency.',
  },
  {
    id: 'q16',
    question: 'According to clinical principles, how should diagnostic manuals (e.g., DSM, ICD) be used in clinical practice?',
    options: [
      'As a complete replacement for clinical judgment and personal history taking',
      'Solely to classify disorders without considering functional impairment',
      'Alongside clinical judgment and individualized case formulation',
      'Strictly in research settings, with no application to clinical intake',
    ],
    correctIndex: 2,
    explanation:
      'Standardized manuals (DSM/ICD) provide essential criteria for consistency, but must be paired with clinical judgment and holistic case formulation to understand each unique patient.',
  },
]

const PART_5: QuizQuestion[] = [
  {
    id: 'q17',
    question: "How does the Mental Status Examination (MSE) fundamentally differ from a patient's case history?",
    options: [
      'The MSE focuses on past life events, whereas case history records current symptoms.',
      'The MSE is based on direct clinician observation during the interview, whereas history relies on reported information.',
      'The MSE is conducted only with collateral informants.',
      'Case history provides an immediate snapshot, while the MSE provides a lifelong narrative.',
    ],
    correctIndex: 1,
    explanation:
      'Case history relies on subjective reports of background and events, while the MSE provides an objective "snapshot" of current functioning observed directly by the clinician.',
  },
  {
    id: 'q18',
    question: "Which specific component of the MSE evaluates a patient's awareness and understanding of their own mental illness?",
    options: ['Perception', 'Thought Content', 'Insight', 'Mood and Affect'],
    correctIndex: 2,
    explanation: 'Insight measures the degree to which a patient recognizes and understands that they have a mental illness and require care.',
  },
]

// Scenario-based final assessment bank — deliberately worded differently
// from PART_1..PART_5 above (same concepts, case-vignette framing) so the
// final certification test isn't just a rehash of the per-part quizzes.
const FINAL_QUIZ: QuizQuestion[] = [
  {
    id: 'f1',
    question:
      "Scenario: A 28-year-old woman presents to an outpatient mental health clinic for her first appointment. During the intake, the clinician evaluates her reasons for seeking help, personal history, and life goals to establish a rapport and outline a collaborative care plan. What is the primary purpose of conducting this clinical intake assessment?",
    options: [
      'To issue an immediate prescription without taking a history',
      "To understand the client's reasons for seeking help, assess history, establish a therapeutic relationship, and formulate a diagnosis and treatment plan",
      'To gather data exclusively for research databases without providing clinical care',
      'To evaluate the patient solely using laboratory blood tests',
    ],
    correctIndex: 1,
    explanation:
      "A clinical intake assessment provides a multidimensional understanding of the disorder's biopsychosocial elements, helps establish the therapeutic alliance, and creates a tailored treatment plan.",
  },
  {
    id: 'f2',
    question:
      'Scenario: A research team is conducting a multi-center study comparing depression prevalence. They use an interview tool where every question, its exact wording, and order are strictly fixed (e.g., Composite International Diagnostic Interview - CIDI). Which type of psychiatric interview is being utilized in this study?',
    options: ['Unstructured interview', 'Freeform interview', 'Structured (standardised) interview', 'Dynamic interview'],
    correctIndex: 2,
    explanation:
      'Structured (standardised) interviews have fixed content, wording, and order, making them standardized and particularly useful in research settings.',
  },
  {
    id: 'f3',
    question:
      'Scenario: At the beginning of an initial interview, Dr. Sharma introduces himself, states that the session will last about 50 minutes, outlines what topics will be covered, and asks the patient if she has any questions about how they will proceed. Which core general principle of clinical interviewing is Dr. Sharma demonstrating?',
    options: ['Disorder-centered evaluation', 'Agreement to process', 'Collateral history taking', 'Secondary gain assessment'],
    correctIndex: 1,
    explanation:
      '"Agreement to process" involves establishing a shared, mutual understanding between patient and clinician regarding how the interview and treatment will proceed.',
  },
  {
    id: 'f4',
    question:
      "Scenario: Clinician A focuses strictly on checking off whether a patient meets 5 out of 9 criteria for Major Depressive Disorder. Clinician B explores the patient's personal life story, personal strengths, work environment, and what personal goals the patient hopes to achieve in care. How does Clinician B's approach differ from Clinician A's?",
    options: [
      'Clinician B uses a disorder-centered approach, while Clinician A uses a person-centered approach',
      'Clinician B uses a person-centered approach focused on the whole individual, whereas Clinician A uses a disorder-centered approach focused on classifying symptoms',
      'Clinician B is violating standard confidentiality guidelines',
      'Clinician A is conducting a forensic evaluation, while Clinician B is conducting a laboratory evaluation',
    ],
    correctIndex: 1,
    explanation:
      'Patient/person-centered interviews focus on understanding the individual as a whole person, whereas disorder-based approaches focus on identifying and classifying specific symptoms.',
  },
  {
    id: 'f5',
    question:
      "Scenario: Before inviting a new patient into the office, the intake clinician discreetly observes through the waiting room doorway that the patient is pacing back and forth, wringing his hands nervously, and avoiding eye contact with others. What phase of the assessment process does this observation represent?",
    options: [
      'Formal Mental Status Examination scoring',
      'Waiting room observational process',
      'Structured diagnostic screening',
      'Formal collateral history gathering',
    ],
    correctIndex: 1,
    explanation:
      'The waiting room phase is part of the observational process where clinicians note natural behavior, appearance, and social interactions before formal questioning starts.',
  },
  {
    id: 'f6',
    question:
      'Scenario: A clinician interviews a 42-year-old patient to construct a structured narrative detailing his birth, early childhood milestones, school performance, occupational history, past medical/psychiatric conditions, and presenting complaints. What fundamental clinical document is the clinician constructing?',
    options: [
      'A single-point Mental Status Examination',
      'A psychiatric case history providing a chronological story from birth to present',
      'A standardized toxicology report',
      'A legal waiver form',
    ],
    correctIndex: 1,
    explanation:
      "Case history is a comprehensive account providing a chronological narrative of a patient's background and life from birth to the present.",
  },
  {
    id: 'f7',
    question:
      'Scenario: After diagnosing a patient with Panic Disorder, the psychiatrist writes a summary explaining that the attacks were triggered by a recent job loss, maintained by catastrophic misinterpretations of bodily sensations, and exacerbated by a family history of anxiety. Why is this case formulation described as going "beyond diagnosis"?',
    options: [
      'Because it eliminates the need for diagnostic coding',
      'Because it provides an explanatory, integrative framework for why the problem occurred and how it is maintained',
      'Because it relies exclusively on physical blood test results',
      'Because it remains fixed and can never be updated in future sessions',
    ],
    correctIndex: 1,
    explanation:
      'Case formulation goes beyond naming a disorder by providing an explanatory framework for why the issue developed and what maintains it.',
  },
  {
    id: 'f8',
    question:
      "Scenario: During a team conference, clinicians review a patient's history of hypothyroidism, maternal history of bipolar disorder, and a 10-year history of daily alcohol misuse. Which component of the biopsychosocial case formulation do these items represent?",
    options: ['Social factors', 'Psychological factors', 'Biological factors', 'Environmental stressors'],
    correctIndex: 2,
    explanation:
      'Biological factors encompass physical/medical influences, genetic/family psychiatric history, medical conditions, and substance use.',
  },
  {
    id: 'f9',
    question:
      'Scenario: An intake summary highlights that a patient struggles with perfectionistic personality traits, maladaptive automatic thoughts ("I am a failure"), severe financial debt, and recent marital strain. How are these items correctly categorized in the case formulation?',
    options: [
      'Personality traits and thoughts are psychological factors; financial debt and marital strain are social factors',
      'All four items are strictly biological factors',
      'Personality traits are social factors; marital strain is a biological factor',
      'These factors are relevant only in pediatric cases',
    ],
    correctIndex: 0,
    explanation:
      'Psychological factors involve internal mental processing, beliefs, and traits, while social factors include living situations, finances, and family/marital relationships.',
  },
  {
    id: 'f10',
    question:
      "Scenario: A mother brings her 4-year-old son to the clinic. The clinician asks the mother about the age at which the boy started walking and speaking in full sentences, while also gathering behavioral observations from his preschool teacher. Why are collateral informants and developmental milestone tracking essential in child evaluations?",
    options: [
      'Children always misrepresent their history, so their input is ignored',
      'Children may not clearly express thoughts or symptoms verbally, and milestone delays help identify neurodevelopmental disorders',
      'Teachers are legally required to diagnose children before a doctor can see them',
      "Milestone tracking is used only to test adult intelligence",
    ],
    correctIndex: 1,
    explanation:
      'Young children often cannot articulate internal symptoms, making parent/teacher reports and milestone tracking crucial for detecting developmental issues.',
  },
  {
    id: 'f11',
    question:
      "Scenario: A 6-year-old girl is referred for severe temper tantrums, bedwetting, and aggressive outbursts at school. During intake, the clinician also inquires about maternal pregnancy complications and birth oxygen deprivation. How should the girl's presenting symptoms and prenatal history be interpreted?",
    options: [
      'Behavioral problems (tantrums, bedwetting) are primary indicators of distress in young children, and early birth factors can influence later behavioral outcomes',
      'Temper tantrums in a 6-year-old are always a sign of adult schizophrenia',
      'Bedwetting indicates that the child requires immediate adult personality testing',
      'Prenatal history is irrelevant once a child reaches school age',
    ],
    correctIndex: 0,
    explanation:
      'Young children express psychological distress primarily through behavioral symptoms, and early biological/prenatal factors shape later behavioral outcomes.',
  },
  {
    id: 'f12',
    question:
      'Scenario: A 15-year-old teenager is brought in by his parents due to falling grades. The clinician speaks with the teenager privately, reassuring him about confidentiality limits, before exploring peer pressure, mood swings, and potential substance experimentation. Why is providing individual privacy and exploring risk behaviors vital when evaluating adolescents?',
    options: [
      'Adolescents value autonomy, and establishing a safe, confidential space encourages open reporting of sensitive risk behaviors',
      'Parents are legally forbidden from participating in adolescent intakes',
      'Risk behaviors never occur in teenagers, so questioning is purely routine',
      'Confidentiality means the clinician can never inform parents even if the teenager is actively suicidal',
    ],
    correctIndex: 0,
    explanation:
      'Teenagers prioritize independence and privacy; securing trust enables clinicians to sensitively explore risk behaviors while maintaining safety boundaries.',
  },
  {
    id: 'f13',
    question:
      'Scenario: A 35-year-old software manager presents with insomnia and exhaustion. The intake history focuses heavily on his job performance, marital satisfaction, parenting responsibilities, and his baseline coping mechanisms under stress. What is the primary focus of history taking in adult psychiatric assessments?',
    options: [
      'Early motor milestone acquisition like crawling',
      'Evaluating functioning in key adult roles (work, marriage, family) and identifying major life stressors',
      'Exclusive reliance on teacher reports',
      'Assessing retirement plans and cognitive decline',
    ],
    correctIndex: 1,
    explanation:
      'Adult history taking centers on how symptoms impact major adult life roles, societal responsibilities, and current life stressors.',
  },
  {
    id: 'f14',
    question:
      'Scenario: A 78-year-old woman is brought by her daughter because she has been misplacing objects, missing medication doses, and struggling with daily finances. The clinician tests her memory and orientation while interviewing the daughter. Why is gathering a collateral history and evaluating daily living skills particularly critical in geriatric assessments?',
    options: [
      'Older adults cannot legally answer questions for themselves',
      'Possible cognitive impairment (e.g., dementia) may limit self-report accuracy, making collateral input and functional ADL assessment essential',
      'Physical health has no impact on mental status in older adults',
      'Memory decline is always intentional in older patients',
    ],
    correctIndex: 1,
    explanation:
      'Cognitive decline in older adults necessitates collateral history from caregivers and assessment of daily living skills (ADLs/IADLs).',
  },
  {
    id: 'f15',
    question:
      'Scenario: During an intake interview, a patient begins crying while sharing a painful loss. The clinician nods attentively, leans slightly forward, sets down her pen, and responds with a calm, empathetic tone. What is the main objective of these rapport-building interventions?',
    options: [
      'To rapidly complete the session in under 5 minutes',
      'To build a trusting, comfortable, and empathetic relationship that facilitates open communication',
      'To interrogate the patient to catch inconsistencies',
      "To absorb the patient's emotions so deeply that the clinician loses objectivity",
    ],
    correctIndex: 1,
    explanation:
      'Rapport building creates a safe, empathetic, and trusting alliance that helps patients feel comfortable disclosing private emotional distress.',
  },
  {
    id: 'f16',
    question:
      'Scenario: A psychiatrist starts an interview by asking, "What has led to your visit today?" After the patient talks freely for 5 minutes, the clinician asks, "How many days a week do you experience trouble sleeping?" What questioning strategy is the psychiatrist demonstrating?',
    options: [
      'The Funnel approach (moving from broad open-ended exploration to focused closed-ended clarification)',
      'Leading questioning technique',
      'Double-barreled compound questioning',
      'Premature psychodynamic interpretation',
    ],
    correctIndex: 0,
    explanation:
      'The Funnel approach starts with broad open-ended questions to foster narrative flow, then shifts to focused closed-ended questions for specific details.',
  },
  {
    id: 'f17',
    question:
      'Scenario: A patient states, "I just feel so weird every morning." The interviewer responds, "When you say \'weird\', can you describe what physical or emotional sensations you feel in the morning?" Which key clinical questioning skill is being performed here?',
    options: [
      'Asking a compound question',
      'Seeking clarification of vague or ambiguous statements',
      'Offering premature advice',
      'Conducting a projective inkblot test',
    ],
    correctIndex: 1,
    explanation:
      'Clarification is an active questioning skill used when patients describe complaints vaguely, ensuring precise symptom delineation.',
  },
  {
    id: 'f18',
    question:
      "Scenario: A clinical team uses the DSM-5 and ICD-11 to assign standardized diagnostic codes to a patient, while also writing an individualized biopsychosocial formulation to guide her therapy. How should standardized diagnostic manuals be used in clinical practice?",
    options: [
      'As a total replacement for personal history taking and clinical judgment',
      'To provide standardized diagnostic criteria, balanced alongside clinical judgment and individualized case formulation',
      'Exclusively for billing without any clinical relevance',
      'Only in child assessments, as manuals are invalid for adults',
    ],
    correctIndex: 1,
    explanation:
      'Diagnostic manuals supply standardized classification criteria, but must be paired with clinical judgment and holistic case formulation.',
  },
  {
    id: 'f19',
    question:
      'Scenario: While writing a psychiatric note, a resident records that the patient is cooperative, speaks with reduced volume, exhibits a depressed affect, and shows no motor agitation during the appointment. How does the Mental Status Examination (MSE) fundamentally differ from the case history?',
    options: [
      'MSE relies on reported past events, while history relies on direct observation',
      'MSE is an objective snapshot based on direct clinician observation during the interview, whereas history is based on reported information',
      'MSE is collected only from teachers and parents',
      "MSE provides a lifelong narrative of the patient's past",
    ],
    correctIndex: 1,
    explanation:
      "Unlike case history (reported narrative of background/events), the MSE is an objective snapshot directly observed by the clinician during the encounter.",
  },
  {
    id: 'f20',
    question:
      'Scenario: A patient reports feeling "miserable and hopeless" (subjective state). On observation, the clinician notes he speaks in a slow, low pitch, sits slumped, and displays a tearful, restricted emotional expression. In MSE terminology, how are "Mood" and "Affect" distinguished in this scenario?',
    options: [
      "Mood is the clinician's objective observation; Affect is the patient's reported feeling",
      "Mood is the patient's subjective emotional state (\"miserable\"); Affect is the objective outward expression observed by the clinician",
      'Mood and Affect are identical terms and can be used interchangeably',
      'Mood refers only to speech rate; Affect refers only to physical age',
    ],
    correctIndex: 1,
    explanation:
      "Mood is the patient's internal subjective emotional state reported in their own words, whereas affect is the objective expression of emotion observed by the clinician.",
  },
  {
    id: 'f21',
    question:
      'Scenario: During an MSE, a patient hears voices calling his name when no one is present (hallucination). However, he states, "I know these voices are caused by my mental illness and I need my medication." He also makes safe, sound decisions regarding his daily living. What does this patient demonstrate regarding his Perception, Insight, and Judgment?',
    options: [
      'Impaired perception (auditory hallucination), but intact insight (awareness of illness) and good judgment',
      'Normal perception, zero insight, and severely impaired judgment',
      'Complete absence of thought content abnormalities',
      'Severe cognitive disorientation to person and place',
    ],
    correctIndex: 0,
    explanation:
      'The patient exhibits a perceptual disturbance (hallucination), intact insight (recognizes he has a mental illness needing care), and intact judgment (makes sound, safe decisions).',
  },
]

const CLINICAL_INTAKE_LONG_ANSWER: LongAnswerPrompt = {
  id: 'long1',
  prompt: `Patient Profile: Rohan, a 34-year-old software project manager, presents to a mental health clinic accompanied by his spouse.

Clinical Scenario: Rohan reports feeling "overwhelmed and constantly on edge" for the past 4 months following a promotion at work. He mentions having trouble falling asleep, severe fatigue, loss of interest in hobbies, and frequent emotional outbursts at home. His spouse notes that Rohan has become increasingly socially withdrawn, frequently checks his work email throughout the night, and expressed feeling like "a complete failure who can't provide for his family." Rohan has no prior psychiatric hospitalizations, but mentions that his father suffered from recurrent depression. During the waiting room wait, the intake clinician notices Rohan pacing nervously, repeatedly wringing his hands, and avoiding eye contact with others.

Task: As the clinical interviewer conducting Rohan's intake assessment, answer how you would conduct the following in detail:
1. Assessment Setup & Intake Process
2. Case History Design
3. Mental Status Examination (MSE)
4. Biopsychosocial Case Formulation & Diagnosis`,
}

// courseGroup -> order -> question array
const PER_MATERIAL_QUIZZES: Record<string, Record<number, QuizQuestion[]>> = {
  'clinical-intake': {
    1: PART_1,
    2: PART_2,
    3: PART_3,
    4: PART_4,
    5: PART_5,
  },
}

// courseGroup -> final bundle (the 21-question scenario-based FINAL_QUIZ
// bank + one long-answer question), unlocked once every part's quiz above
// has been passed.
const FINAL_ASSESSMENTS: Record<string, { mcq: QuizQuestion[]; longAnswer: LongAnswerPrompt }> = {
  'clinical-intake': {
    mcq: FINAL_QUIZ,
    longAnswer: CLINICAL_INTAKE_LONG_ANSWER,
  },
}

export function getPartQuestions(courseGroup: string, order: number): QuizQuestion[] | null {
  return PER_MATERIAL_QUIZZES[courseGroup]?.[order] ?? null
}

export function getFinalAssessment(courseGroup: string) {
  return FINAL_ASSESSMENTS[courseGroup] ?? null
}
