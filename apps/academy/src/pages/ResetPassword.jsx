import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { apiResetPassword } from '../api/endpoints';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
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

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const update = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    if (apiError) setApiError('');
  };

  const validate = () => {
    const e = {};
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Minimum 6 characters';
    if (!form.confirmPassword) e.confirmPassword = 'Confirm your password';
    else if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true);
    try {
      await apiResetPassword({ token, password: form.password });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 1800);
    } catch (err) {
      setApiError(err.message);
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

        <Typography variant="h5" sx={{ fontWeight: 800, color: '#1F3529', mb: 0.5, textAlign: 'center' }}>Reset Password</Typography>
        <Typography sx={{ color: 'rgba(42,61,51,0.65)', fontSize: 14, mb: 3, textAlign: 'center' }}>Choose a new password for your account.</Typography>

        {!token ? (
          <Alert severity="error" sx={{ borderRadius: 2 }}>
            Reset link is missing or invalid. Please request a new one from the{' '}
            <Box component={Link} to="/forgot-password" sx={{ color: 'inherit', fontWeight: 700 }}>Forgot Password</Box> page.
          </Alert>
        ) : success ? (
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Typography sx={{ fontSize: 50, mb: 2 }}></Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1F3529', mb: 1 }}>Password Reset Successful!</Typography>
            <Typography sx={{ color: 'rgba(42,61,51,0.65)', fontSize: 14 }}>Redirecting to Sign In...</Typography>
          </Box>
        ) : (
          <Box component="form" onSubmit={handleSubmit} noValidate>
            {apiError && <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>{apiError}</Alert>}

            <TextField
              fullWidth
              label="New Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Min 6 characters"
              value={form.password}
              onChange={e => update('password', e.target.value)}
              error={!!errors.password}
              helperText={errors.password}
              sx={{ ...darkFieldSx, mb: 2.5 }}
              slotProps={{
                htmlInput: { autoComplete: 'new-password' },
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(p => !p)} edge="end" size="small" sx={{ color: 'rgba(42,61,51,0.6)' }}>
                        {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
            <TextField
              fullWidth
              label="Confirm New Password"
              type={showConfirm ? 'text' : 'password'}
              placeholder="Re-enter password"
              value={form.confirmPassword}
              onChange={e => update('confirmPassword', e.target.value)}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
              sx={{ ...darkFieldSx, mb: 3.5 }}
              slotProps={{
                htmlInput: { autoComplete: 'new-password' },
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowConfirm(p => !p)} edge="end" size="small" sx={{ color: 'rgba(42,61,51,0.6)' }}>
                        {showConfirm ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
            <Button type="submit" fullWidth variant="contained" disabled={loading} size="large" sx={{ py: 1.5, fontSize: 15, borderRadius: 2.5, background: '#9BC7AE', color: '#1F3529', fontWeight: 700, '&:hover': { background: '#8ECFB0' } }}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </Button>
          </Box>
        )}

        <Typography sx={{ textAlign: 'center', mt: 3, fontSize: 14, color: 'rgba(42,61,51,0.6)' }}>
          Back to{' '}
          <Box component={Link} to="/login" sx={{ color: '#9BC7AE', fontWeight: 700, '&:hover': { textDecoration: 'underline' } }}>
            Sign In
          </Box>
        </Typography>
      </Paper>
    </Box>
  );
}
