import { useState } from 'react';
import { Link } from 'react-router-dom';
import { apiForgotPassword } from '../api/endpoints';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import pmcLogo from '../assets/logo.svg';

const darkFieldSx = {
  '& .MuiInputBase-input': { color: '#1F3529' },
  '& .MuiInputLabel-root': { color: 'rgba(42,61,51,0.6)' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#9BC7AE' },
  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(42,61,51,0.25)' },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(42,61,51,0.4)' },
  '& .Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#9BC7AE' },
  '& .MuiFormHelperText-root': { color: 'rgba(42,61,51,0.55)' },
};

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState('');

  const update = (value) => {
    setEmail(value);
    if (emailError) setEmailError('');
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) { setEmailError('Email is required'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setEmailError('Enter a valid email address'); return; }

    setLoading(true);
    setError('');
    try {
      const data = await apiForgotPassword({ email: email.trim() });
      setResetToken(data.resetToken);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#DAD7B9', p: 2 }}>
      <Paper elevation={0} sx={{ width: '100%', maxWidth: 440, borderRadius: 4, p: { xs: 3, sm: 4.5 }, border: '1px solid #E8ECEA', background: '#FFFFFF', boxShadow: '0 20px 60px rgba(56,82,70,0.12)' }}>
        {/* Logo */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3.5 }}>
          <Box component="img" src={pmcLogo} alt="PMC Global Academy" sx={{ width: 52, height: 52, borderRadius: '50%', mb: 1.5 }} />
          <Typography sx={{ fontWeight: 800, fontSize: 15, color: '#1F3529' }}>PMC Global Academy</Typography>
        </Box>

        <Typography variant="h5" sx={{ fontWeight: 800, color: '#1F3529', mb: 0.5, textAlign: 'center' }}>Forgot Password?</Typography>
        <Typography sx={{ color: 'rgba(42,61,51,0.65)', fontSize: 14, mb: 3, textAlign: 'center' }}>
          Enter your account email and we'll get you a reset link.
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>{error}</Alert>}

        {resetToken ? (
          <Box>
            <Alert severity="success" sx={{ mb: 2.5, borderRadius: 2 }}>
              Reset token generated. No email service is configured on this demo, so continue directly below.
            </Alert>
            <Button
              fullWidth variant="contained" size="large"
              component={Link} to={`/reset-password?token=${resetToken}`}
              sx={{ py: 1.5, fontSize: 15, borderRadius: 2.5, background: '#9BC7AE', color: '#1F3529', fontWeight: 700, '&:hover': { background: '#8ECFB0' } }}
            >
              Continue to Reset Password
            </Button>
          </Box>
        ) : (
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              fullWidth
              label="Email Address"
              placeholder="you@example.com"
              value={email}
              onChange={e => update(e.target.value)}
              error={!!emailError}
              helperText={emailError}
              sx={{ ...darkFieldSx, mb: 3 }}
              slotProps={{ htmlInput: { autoComplete: 'off', type: 'email' } }}
            />
            <Button type="submit" fullWidth variant="contained" disabled={loading} size="large" sx={{ py: 1.5, fontSize: 15, borderRadius: 2.5, background: '#9BC7AE', color: '#1F3529', fontWeight: 700, '&:hover': { background: '#8ECFB0' } }}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </Box>
        )}

        <Typography sx={{ textAlign: 'center', mt: 3, fontSize: 14, color: 'rgba(42,61,51,0.6)' }}>
          Remembered your password?{' '}
          <Box component={Link} to="/login" sx={{ color: '#9BC7AE', fontWeight: 700, '&:hover': { textDecoration: 'underline' } }}>
            Sign In
          </Box>
        </Typography>
      </Paper>
    </Box>
  );
}
