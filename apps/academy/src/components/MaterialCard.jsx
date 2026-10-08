import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import CircularProgress from '@mui/material/CircularProgress';
import LinearProgress from '@mui/material/LinearProgress';
import Chip from '@mui/material/Chip';

import {
  apiCheckAccess, apiCreatePurchaseOrder,
  apiGetQuizQuestions, apiSubmitQuiz,
  ENDPOINTS, withIdentity,
} from '../api/endpoints';
import { openRazorpayCheckout } from '../lib/razorpay';

export const GREEN = '#385246';
export const GREEN_DARK = '#2A3D33';

const fieldSx = {
  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#D8E2DC' },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#9BC7AE' },
  '& .Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#385246' },
};

export function formatSize(bytes) {
  if (!bytes) return '';
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

// Polls access until the Razorpay webhook has flipped the purchase to PAID
// (it lands shortly after the checkout's own success callback, not within
// it), or gives up after ~20s so the UI doesn't hang forever.
async function waitForAccess(materialId, { attempts = 10, intervalMs = 2000 } = {}) {
  for (let i = 0; i < attempts; i++) {
    const { purchased } = await apiCheckAccess(materialId).catch(() => ({ purchased: false }));
    if (purchased) return true;
    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }
  return false;
}

// ---------- Payment dialog: details, then a real Razorpay checkout ----------
function PaymentDialog({ open, material, user, onClose, onPaid, showToast }) {
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '', reason: '' });
  const [errors, setErrors] = useState({});
  const [stage, setStage] = useState(null); // null | 'starting' | 'confirming'

  useEffect(() => {
    if (open) {
      setStage(null);
      setForm({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '', reason: '' });
    }
  }, [open, user]);

  const update = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email';
    if (!/^[6-9]\d{9}$/.test(form.phone.trim())) e.phone = 'Enter valid 10-digit phone number';
    if (!form.reason.trim()) e.reason = 'Please tell us why you\'re interested';
    return e;
  };

  const handlePay = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }

    setStage('starting');
    try {
      const { razorpayOrder, keyId } = await apiCreatePurchaseOrder({ materialId: material._id, ...form });

      const paid = await openRazorpayCheckout({
        keyId,
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        description: material.title,
        prefill: { name: form.name, email: form.email, contact: form.phone },
      });
      if (!paid) { setStage(null); return; }

      setStage('confirming');
      const unlocked = await waitForAccess(material._id);
      if (unlocked) {
        showToast('Thanks! You can now download the file.');
        onPaid();
        onClose();
      } else {
        showToast("Payment received — it's still confirming. Refresh in a moment if the download doesn't unlock.", 'info');
        onClose();
      }
    } catch (err) {
      showToast(err.message || 'Could not complete payment', 'error');
    } finally {
      setStage(null);
    }
  };

  if (!material) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
      <DialogTitle sx={{ fontWeight: 800, color: '#1F3529', fontSize: 17 }}>
        Unlock "{material.title}"
        <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Typography sx={{ mb: 2.25, color: 'rgba(42,61,51,0.65)', fontSize: 13.5 }}>
          Fill in your details, then pay <b>₹{material.price}</b> once via Razorpay to unlock the PDF download.
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
          <TextField label="Full Name" value={form.name} onChange={e => update('name', e.target.value)}
            error={!!errors.name} helperText={errors.name} fullWidth sx={fieldSx} disabled={!!stage} />
          <TextField label="Email Address" value={form.email} onChange={e => update('email', e.target.value)}
            error={!!errors.email} helperText={errors.email} fullWidth sx={fieldSx} disabled={!!stage} />
          <TextField label="Phone Number" value={form.phone} onChange={e => update('phone', e.target.value.replace(/\D/g, ''))}
            error={!!errors.phone} helperText={errors.phone} fullWidth sx={fieldSx} inputProps={{ maxLength: 10 }} disabled={!!stage} />
          <TextField label="Why are you interested in this course?" value={form.reason} onChange={e => update('reason', e.target.value)}
            error={!!errors.reason} helperText={errors.reason} fullWidth multiline minRows={2} sx={fieldSx} disabled={!!stage} />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2.5 }}>
        <Button onClick={handlePay} disabled={!!stage} fullWidth variant="contained" size="large"
          sx={{ py: 1.3, borderRadius: 2.5, fontWeight: 700, background: GREEN, '&:hover': { background: GREEN_DARK } }}>
          {stage === 'starting' && 'Opening payment…'}
          {stage === 'confirming' && 'Confirming payment…'}
          {!stage && `Pay ₹${material.price} →`}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ---------- Quiz dialog ----------
// Standalone material: passing unlocks a certificate straight away.
// Sequential-course part (material.courseGroup set): passing just unlocks
// the next part — no per-part certificate, the real one comes from the
// final bundle assessment (see FinalAssessmentCard) once every part is done.
function QuizDialog({ open, material, onClose, showToast }) {
  const isSequential = !!(material?.courseGroup && material?.order);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // { score, total, passed }
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open || !material) return;
    setResult(null);
    setAnswers({});
    setCurrentIndex(0);
    setLoading(true);
    apiGetQuizQuestions(material._id)
      .then(data => setQuestions(data.questions))
      .catch(err => showToast(err.message, 'error'))
      .finally(() => setLoading(false));
  }, [open, material]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const data = await apiSubmitQuiz(material._id, answers);
      setResult(data);
    } catch (err) {
      showToast(err.message || 'Could not submit quiz', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const retry = () => { setResult(null); setAnswers({}); setCurrentIndex(0); };

  if (!material) return null;
  const current = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;
  const currentAnswered = current && answers[current.id] !== undefined;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 800, color: '#1F3529' }}>
        {isSequential ? `Part Quiz — ${material.title}` : `Certification Quiz — ${material.title}`}
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
              {result.passed
                ? isSequential
                  ? `You passed! (${result.passMark}+ correct needed) The next part is now unlocked.`
                  : `You passed! (${result.passMark}+ correct needed) Your certificate is ready.`
                : `You need at least ${result.passMark} correct answers to pass.`}
            </Typography>
            {result.passed ? (
              isSequential ? (
                <Button onClick={() => window.location.reload()} variant="contained" size="large"
                  sx={{ borderRadius: 2.5, fontWeight: 700, background: GREEN, '&:hover': { background: GREEN_DARK } }}>
                  Continue →
                </Button>
              ) : (
                <Button component="a" href={withIdentity(ENDPOINTS.QUIZ_CERTIFICATE(material._id))} download
                  variant="contained" size="large"
                  sx={{ borderRadius: 2.5, fontWeight: 700, background: GREEN, '&:hover': { background: GREEN_DARK } }}>
                  🎓 Download Certificate
                </Button>
              )
            ) : (
              <Button onClick={retry} variant="outlined" size="large"
                sx={{ borderRadius: 2.5, fontWeight: 700, borderColor: GREEN, color: GREEN }}>
                Try Again
              </Button>
            )}
          </Box>
        ) : current ? (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: GREEN }}>
                Question {currentIndex + 1} of {questions.length}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={((currentIndex + 1) / questions.length) * 100}
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
      {!result && !loading && current && (
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button onClick={() => setCurrentIndex(i => i - 1)} disabled={currentIndex === 0}
            variant="outlined" size="large"
            sx={{ borderRadius: 2.5, fontWeight: 700, borderColor: GREEN, color: GREEN }}>
            ← Back
          </Button>
          {isLast ? (
            <Button onClick={handleSubmit} disabled={!currentAnswered || submitting} fullWidth variant="contained" size="large"
              sx={{ py: 1.2, borderRadius: 2.5, fontWeight: 700, background: GREEN, '&:hover': { background: GREEN_DARK } }}>
              {submitting ? 'Submitting…' : 'Submit Quiz'}
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

// ---------- Material card: view → pay → download → quiz → certificate ----------
// Shared by the public Online Course page and the logged-in User Dashboard.
export default function MaterialCard({ material, user, showToast }) {
  const [purchased, setPurchased] = useState(false);
  const [locked, setLocked] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [payOpen, setPayOpen] = useState(false);
  const [quizOpen, setQuizOpen] = useState(false);

  const isPdf = material.mimeType === 'application/pdf';
  const isSequential = !!(material.courseGroup && material.order);
  // Order 0 — a free intro/preview ahead of the paid Part 1. It's always
  // open (see utils/access.js), and has no quiz of its own, so it skips the
  // "take the quiz next" affordance below entirely.
  const isFreeIntro = !!(material.courseGroup && material.order === 0);

  useEffect(() => {
    apiCheckAccess(material._id)
      .then(data => { setPurchased(data.purchased); setLocked(!!data.locked); })
      .catch(() => {})
      .finally(() => setCheckingAccess(false));
  }, [material._id]);

  return (
    <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid #E8ECEA', background: locked ? '#F7F7F5' : '#FFFFFF', opacity: locked ? 0.75 : 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Box sx={{ width: 44, height: 44, borderRadius: 2, background: 'rgba(56,82,70,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
          {locked ? '🔒' : isPdf ? '📄' : '📊'}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontWeight: 700, color: '#1F3529', fontSize: 15 }}>
            {material.title}
          </Typography>
          <Typography sx={{ fontSize: 12, color: 'rgba(42,61,51,0.55)' }}>
            {material.fileName} · {formatSize(material.size)}
          </Typography>
        </Box>
        {isFreeIntro && <Chip label="Free" size="small" sx={{ background: 'rgba(56,82,70,0.12)', color: GREEN, fontWeight: 700 }} />}
        {!isFreeIntro && purchased && <Chip label="Unlocked" size="small" sx={{ background: 'rgba(16,185,129,0.15)', color: '#10B981', fontWeight: 700 }} />}
        {locked && <Chip label="Locked" size="small" sx={{ background: 'rgba(120,120,120,0.15)', color: '#6B6B6B', fontWeight: 700 }} />}
      </Box>

      <Box sx={{ display: 'flex', gap: 1.25, flexWrap: 'wrap' }}>
        {checkingAccess ? (
          <Button size="small" variant="outlined" disabled sx={{ borderRadius: 2 }}>Checking…</Button>
        ) : locked ? (
          <Typography sx={{ fontSize: 13, color: 'rgba(42,61,51,0.6)', fontStyle: 'italic' }}>
            Complete Part {material.order - 1}'s quiz first to unlock this part.
          </Typography>
        ) : purchased ? (
          <>
            <Button component="a" href={withIdentity(ENDPOINTS.MATERIAL_DOWNLOAD(material._id))} download={material.fileName}
              size="small" variant="contained" sx={{ borderRadius: 2, background: GREEN, '&:hover': { background: GREEN_DARK } }}>
              ⬇ Download PDF
            </Button>
            {isFreeIntro ? null : (
              <Button size="small" variant="contained" onClick={() => setQuizOpen(true)}
                sx={{ borderRadius: 2, background: '#9BC7AE', color: GREEN_DARK, fontWeight: 700, '&:hover': { background: '#8ECFB0' } }}>
                {isSequential ? 'Go to Next →' : '🎓 Take Certificate Quiz'}
              </Button>
            )}
          </>
        ) : (
          <Button size="small" variant="contained" onClick={() => setPayOpen(true)}
            sx={{ borderRadius: 2, background: GREEN, '&:hover': { background: GREEN_DARK } }}>
            🔒 Unlock & Download — ₹{material.price}
          </Button>
        )}
      </Box>

      <PaymentDialog open={payOpen} material={material} user={user} onClose={() => setPayOpen(false)}
        onPaid={() => setPurchased(true)} showToast={showToast} />
      <QuizDialog open={quizOpen} material={material} onClose={() => setQuizOpen(false)} showToast={showToast} />
    </Paper>
  );
}
