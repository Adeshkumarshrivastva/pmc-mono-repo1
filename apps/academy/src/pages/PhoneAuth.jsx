import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import pmcLogo from '../assets/logo.svg';
import { apiSendOtp, apiVerifyOtp } from '../api/endpoints';

const lightFieldSx = {
  '& .MuiInputBase-input': { color: '#1a2e25' },
  '& .MuiInputLabel-root': { color: '#6B7A72' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#385246' },
  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#D8E2DC' },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#9BC7AE' },
  '& .Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#385246' },
  '& .MuiFormHelperText-root': { color: '#8A968E' },
};

const RESEND_SECONDS = 30;

// Phone + OTP login — same mechanism for the regular user flow (/login) and
// the admin flow (/admin/login); `variant="admin"` just enforces role
// afterwards and redirects somewhere different on success.
//
// Send/verify are two independent async actions with their own pending state
// (mirrors the sendOtpMutation/verifyOtpMutation split used by the portal
// app's OTP login), plus a resend cooldown timer so a user can't hammer the
// SMS gateway — same UX as apps/portal/src/routes/_auth/login.tsx.
export default function PhoneAuth({ variant = 'user', onLogin }) {
  const navigate = useNavigate();
  const isAdmin = variant === 'admin';

  const [step, setStep] = useState('phone'); // 'phone' | 'otp'
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => () => clearInterval(timerRef.current), []);

  const startResendTimer = () => {
    clearInterval(timerRef.current);
    setSecondsLeft(RESEND_SECONDS);
    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) { clearInterval(timerRef.current); return 0; }
        return s - 1;
      });
    }, 1000);
  };

  const validatePhone = () => /^[6-9]\d{9}$/.test(phone.trim());

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    if (!validatePhone()) { setError('Enter a valid 10-digit phone number'); return; }

    setSending(true);
    try {
      await apiSendOtp(phone.trim());
      setInfo('OTP sent successfully');
      setStep('otp');
      startResendTimer();
    } catch (err) {
      setError(err.message || 'Could not send OTP');
    } finally {
      setSending(false);
    }
  };

  const handleResendOtp = async () => {
    if (secondsLeft > 0 || resending) return;
    setError('');
    setResending(true);
    try {
      await apiSendOtp(phone.trim());
      setOtp('');
      setInfo('OTP sent successfully');
      startResendTimer();
    } catch (err) {
      setError(err.message || 'Could not send OTP');
    } finally {
      setResending(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    if (otp.trim().length !== 6) { setError('Enter the 6-digit OTP'); return; }

    setVerifying(true);
    try {
      const data = await apiVerifyOtp({ phone: phone.trim(), otp: otp.trim() });
      if (isAdmin && data.user.role !== 'admin') {
        setError('This number is not registered as an admin.');
        return;
      }
      localStorage.setItem('pmc_token', data.token);
      onLogin(data.user);
      // Everything lives on Online Course now — it shows admin tools or the
      // user's own purchases/certificates depending on the account's role.
      navigate('/online-course');
    } catch (err) {
      setError(err.message || 'OTP verification failed');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#DAD7B9', p: 2 }}>
      <Paper elevation={0} sx={{ width: '100%', maxWidth: 440, borderRadius: 4, p: { xs: 3, sm: 4.5 }, border: '1px solid #E8ECEA', background: '#FFFFFF', boxShadow: '0 20px 60px rgba(56,82,70,0.12)' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3.5 }}>
          <Box component="img" src={pmcLogo} alt="PMC Global Academy" sx={{ width: 52, height: 52, borderRadius: '50%', mb: 1.5 }} />
          <Typography sx={{ fontWeight: 800, fontSize: 15, color: '#1a2e25' }}>
            {isAdmin ? 'PMC Global Academy — Admin' : 'PMC Global Academy'}
          </Typography>
        </Box>

        <Typography variant="h5" sx={{ fontWeight: 800, color: '#1a2e25', mb: 0.5, textAlign: 'center' }}>
          {step === 'phone' ? 'Sign in with your phone' : 'Verify OTP'}
        </Typography>
        <Typography sx={{ color: '#6B7A72', fontSize: 14, mb: 3, textAlign: 'center' }}>
          {step === 'phone'
            ? (isAdmin ? 'Admin sign-in for the course dashboard.' : "We'll text you a one-time code — no password needed.")
            : `Enter the 6-digit code sent to ${phone}`}
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>{error}</Alert>}
        {!error && info && step === 'otp' && <Alert severity="success" sx={{ mb: 2.5, borderRadius: 2 }}>{info}</Alert>}

        {step === 'phone' ? (
          <Box component="form" onSubmit={handleSendOtp} noValidate>
            <TextField
              fullWidth
              label="Phone Number"
              placeholder="9876543210"
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
              sx={{ ...lightFieldSx, mb: 2.5 }}
              slotProps={{ htmlInput: { maxLength: 10, autoComplete: 'off' } }}
            />
            <Button type="submit" fullWidth variant="contained" disabled={sending} size="large"
              sx={{ py: 1.5, fontSize: 15, borderRadius: 2.5, background: '#385246', color: '#ffffff', fontWeight: 700, '&:hover': { background: '#2A3D33' } }}>
              {sending ? 'Sending OTP…' : 'Send OTP'}
            </Button>
          </Box>
        ) : (
          <Box component="form" onSubmit={handleVerifyOtp} noValidate>
            <TextField
              fullWidth
              label="OTP"
              placeholder="6-digit code"
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
              sx={{ ...lightFieldSx, mb: 1.5 }}
              slotProps={{ htmlInput: { maxLength: 6, autoComplete: 'one-time-code' } }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2, minHeight: 24 }}>
              {secondsLeft > 0 ? (
                <Typography sx={{ fontSize: 12.5, color: '#8A968E' }}>
                  Resend OTP in <b>{secondsLeft}s</b>
                </Typography>
              ) : (
                <Typography
                  component="button"
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resending}
                  sx={{ fontSize: 12.5, color: '#385246', fontWeight: 700, background: 'none', border: 'none', p: 0, cursor: resending ? 'default' : 'pointer', textDecoration: 'underline' }}
                >
                  {resending ? 'Resending…' : 'Resend OTP'}
                </Typography>
              )}
            </Box>
            <Button type="submit" fullWidth variant="contained" disabled={verifying} size="large"
              sx={{ py: 1.5, fontSize: 15, borderRadius: 2.5, background: '#385246', color: '#ffffff', fontWeight: 700, '&:hover': { background: '#2A3D33' }, mb: 1.5 }}>
              {verifying ? 'Verifying…' : 'Verify & Continue'}
            </Button>
            <Button fullWidth variant="text" onClick={() => { setStep('phone'); setOtp(''); setError(''); setInfo(''); clearInterval(timerRef.current); setSecondsLeft(0); }}
              sx={{ color: '#385246', fontWeight: 600 }}>
              ← Change phone number
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
