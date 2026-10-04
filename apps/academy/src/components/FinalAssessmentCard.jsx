import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import LinearProgress from '@mui/material/LinearProgress';

import { apiGetCourseStatus, apiGetFinalAssessment, apiSubmitFinalAssessment, ENDPOINTS, withIdentity } from '../api/endpoints';
import { GREEN, GREEN_DARK } from './MaterialCard';

// The last step of the "clinical-intake" style sequential course: once every
// part's own quiz has been passed (apiGetCourseStatus().allPassed), all of
// those parts' MCQs come back together as one bundle, plus a required
// long-answer question. Passing the bundle + submitting the long answer
// issues the whole-course certificate (separate from any per-part one).
export default function FinalAssessmentCard({ courseGroup, showToast }) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  const refresh = () => {
    setLoading(true);
    apiGetCourseStatus(courseGroup)
      .then(setStatus)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(refresh, [courseGroup]);

  if (loading) {
    return (
      <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid #E8ECEA', background: '#FFFFFF', textAlign: 'center' }}>
        <CircularProgress size={22} sx={{ color: GREEN }} />
      </Paper>
    );
  }
  if (!status) return null;

  const passedCount = status.parts.filter(p => p.quizPassed).length;

  return (
    <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: `1.5px solid ${status.allPassed ? GREEN : '#E8ECEA'}`, background: '#FFFFFF' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
        <Box sx={{ width: 44, height: 44, borderRadius: 2, background: 'rgba(155,199,174,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
          🎓
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontWeight: 700, color: '#1F3529', fontSize: 15 }}>Final Certification Assessment</Typography>
          <Typography sx={{ fontSize: 12, color: 'rgba(42,61,51,0.55)' }}>
            All parts' questions together, plus one written answer — {passedCount}/{status.parts.length} parts passed so far.
          </Typography>
        </Box>
        {status.certificateEarned && <Chip label="Certified" size="small" sx={{ background: 'rgba(16,185,129,0.15)', color: '#10B981', fontWeight: 700 }} />}
      </Box>

      <LinearProgress
        variant="determinate"
        value={(passedCount / status.parts.length) * 100}
        sx={{ mb: 2, height: 6, borderRadius: 3, background: 'rgba(56,82,70,0.1)', '& .MuiLinearProgress-bar': { background: GREEN, borderRadius: 3 } }}
      />

      {status.certificateEarned ? (
        <Button component="a" href={withIdentity(ENDPOINTS.COURSE_CERTIFICATE(courseGroup))} download
          size="small" variant="contained" sx={{ borderRadius: 2, background: GREEN, '&:hover': { background: GREEN_DARK } }}>
          🎓 Download Certificate
        </Button>
      ) : status.allPassed ? (
        <Button size="small" variant="contained" onClick={() => setDialogOpen(true)}
          sx={{ borderRadius: 2, background: GREEN, '&:hover': { background: GREEN_DARK } }}>
          Start Final Assessment
        </Button>
      ) : (
        <Typography sx={{ fontSize: 13, color: 'rgba(42,61,51,0.6)', fontStyle: 'italic' }}>
          Pass every part's quiz above first to unlock this.
        </Typography>
      )}

      <FinalAssessmentDialog
        open={dialogOpen}
        courseGroup={courseGroup}
        onClose={() => setDialogOpen(false)}
        onDone={refresh}
        showToast={showToast}
      />
    </Paper>
  );
}

function FinalAssessmentDialog({ open, courseGroup, onClose, onDone, showToast }) {
  const [assessment, setAssessment] = useState(null);
  const [answers, setAnswers] = useState({});
  const [longAnswerText, setLongAnswerText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0); // -1 = long-answer step
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setResult(null);
    setAnswers({});
    setLongAnswerText('');
    setCurrentIndex(0);
    setLoading(true);
    apiGetFinalAssessment(courseGroup)
      .then(setAssessment)
      .catch(err => showToast(err.message, 'error'))
      .finally(() => setLoading(false));
  }, [open, courseGroup]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const data = await apiSubmitFinalAssessment(courseGroup, { answers, longAnswerText });
      setResult(data);
      if (data.passed) onDone();
    } catch (err) {
      showToast(err.message || 'Could not submit final assessment', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const retry = () => { setResult(null); setAnswers({}); setLongAnswerText(''); setCurrentIndex(0); };

  if (!assessment && !loading) return null;
  const mcq = assessment?.mcq || [];
  const onLongAnswerStep = currentIndex === mcq.length;
  const current = onLongAnswerStep ? null : mcq[currentIndex];
  const currentAnswered = current ? answers[current.id] !== undefined : longAnswerText.trim().length > 0;
  const isLastStep = currentIndex === mcq.length; // long-answer is the final step

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 800, color: '#1F3529' }}>
        Final Certification Assessment
        <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress sx={{ color: GREEN }} /></Box>
        ) : result ? (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Typography sx={{ fontSize: 44, mb: 1 }}>{result.passed ? '🎉' : '😕'}</Typography>
            <Typography sx={{ fontWeight: 800, fontSize: 22, color: result.passed ? '#10B981' : '#EF4444', mb: 1 }}>
              You scored {result.score} / {result.total}
            </Typography>
            <Typography sx={{ color: 'rgba(42,61,51,0.7)', mb: 3 }}>
              {result.requiresLongAnswer
                ? 'Please write an answer for the case-study question — it is required for certification.'
                : result.passed
                  ? `You passed! (${result.passMark}+ correct needed) Your certificate is ready.`
                  : `You need at least ${result.passMark} correct answers to earn the certificate.`}
            </Typography>
            <Button onClick={retry} variant="outlined" size="large"
              sx={{ borderRadius: 2.5, fontWeight: 700, borderColor: GREEN, color: GREEN }}>
              {result.passed ? 'Close' : 'Try Again'}
            </Button>
          </Box>
        ) : onLongAnswerStep ? (
          <Box>
            <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: GREEN, mb: 1 }}>Case-Study Question</Typography>
            <Typography sx={{ fontWeight: 600, color: '#1F3529', mb: 2, fontSize: 13.5, whiteSpace: 'pre-line' }}>
              {assessment.longAnswer.prompt}
            </Typography>
            <TextField
              fullWidth multiline minRows={6}
              placeholder="Write your answer here…"
              value={longAnswerText}
              onChange={e => setLongAnswerText(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#D8E2DC' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#9BC7AE' },
                '& .Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: GREEN },
              }}
            />
          </Box>
        ) : current ? (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: GREEN }}>
                Question {currentIndex + 1} of {mcq.length + 1}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={((currentIndex + 1) / (mcq.length + 1)) * 100}
              sx={{ mb: 3, height: 6, borderRadius: 3, background: 'rgba(56,82,70,0.1)', '& .MuiLinearProgress-bar': { background: GREEN, borderRadius: 3 } }}
            />
            <Typography sx={{ fontWeight: 700, color: '#1F3529', mb: 1.5, fontSize: 15 }}>
              {current.question}
            </Typography>
            <RadioGroup value={answers[current.id] ?? ''} onChange={e => setAnswers(prev => ({ ...prev, [current.id]: Number(e.target.value) }))}>
              {current.options.map((opt, i) => (
                <FormControlLabel key={i} value={i} control={<Radio size="small" sx={{ color: '#9BC7AE', '&.Mui-checked': { color: GREEN } }} />}
                  label={<Typography sx={{ fontSize: 13.5 }}>{opt}</Typography>} />
              ))}
            </RadioGroup>
          </Box>
        ) : null}
      </DialogContent>
      {!result && !loading && (
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button onClick={() => setCurrentIndex(i => i - 1)} disabled={currentIndex === 0}
            variant="outlined" size="large"
            sx={{ borderRadius: 2.5, fontWeight: 700, borderColor: GREEN, color: GREEN }}>
            ← Back
          </Button>
          {isLastStep ? (
            <Button onClick={handleSubmit} disabled={!currentAnswered || submitting} fullWidth variant="contained" size="large"
              sx={{ py: 1.2, borderRadius: 2.5, fontWeight: 700, background: GREEN, '&:hover': { background: GREEN_DARK } }}>
              {submitting ? 'Submitting…' : 'Submit Final Assessment'}
            </Button>
          ) : (
            <Button onClick={() => setCurrentIndex(i => i + 1)} disabled={!currentAnswered} fullWidth variant="contained" size="large"
              sx={{ py: 1.2, borderRadius: 2.5, fontWeight: 700, background: GREEN, '&:hover': { background: GREEN_DARK } }}>
              Next →
            </Button>
          )}
        </DialogActions>
      )}
    </Dialog>
  );
}
