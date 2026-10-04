import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
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

const lightFieldSx = {
  '& .MuiInputBase-input': { color: '#1a2e25' },
  '& .MuiInputLabel-root': { color: '#6B7A72' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#385246' },
  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#D8E2DC' },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#9BC7AE' },
  '& .Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#385246' },
  '& .MuiFormHelperText-root': { color: '#8A968E' },
};

export default function Login({ onLogin }) {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const update = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    if (loginError) setLoginError('');
  };

  const validate = () => {
    const e = {};
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email address';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true);
    const result = await login({ email: form.email.trim(), password: form.password });
    setLoading(false);
    if (!result.success) { setLoginError(result.message); return; }
    onLogin(result.user);
    navigate('/');
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#DAD7B9', p: 2 }}>
      <Paper elevation={0} sx={{ width: '100%', maxWidth: 440, borderRadius: 4, p: { xs: 3, sm: 4.5 }, border: '1px solid #E8ECEA', background: '#FFFFFF', boxShadow: '0 20px 60px rgba(56,82,70,0.12)' }}>
        {/* Logo */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3.5 }}>
          <Box component="img" src={pmcLogo} alt="PMC Global Academy" sx={{ width: 52, height: 52, borderRadius: '50%', mb: 1.5 }} />
          <Typography sx={{ fontWeight: 800, fontSize: 15, color: '#1a2e25' }}>PMC Global Academy</Typography>
        </Box>

        <Typography variant="h5" sx={{ fontWeight: 800, color: '#1a2e25', mb: 0.5, textAlign: 'center' }}>Welcome Back!</Typography>
        <Typography sx={{ color: '#6B7A72', fontSize: 14, mb: 3, textAlign: 'center' }}>Sign in to continue your learning journey.</Typography>

        {loginError && (
          <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>{loginError}</Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            fullWidth
            label="Email Address"
            placeholder="you@example.com"
            value={form.email}
            onChange={e => update('email', e.target.value)}
            error={!!errors.email}
            helperText={errors.email}
            sx={{ ...lightFieldSx, mb: 2.5 }}
            slotProps={{ htmlInput: { autoComplete: 'off', type: 'email' } }}
          />
          <TextField
            fullWidth
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            value={form.password}
            onChange={e => update('password', e.target.value)}
            error={!!errors.password}
            helperText={errors.password}
            sx={{ ...lightFieldSx, mb: 1 }}
            slotProps={{
              htmlInput: { autoComplete: 'new-password' },
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(p => !p)} edge="end" size="small" sx={{ color: '#6B7A72' }}>
                      {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
          <Typography sx={{ textAlign: 'right', mb: 2.5 }}>
            <Box component={Link} to="/forgot-password" sx={{ color: '#385246', fontSize: 13, fontWeight: 600, '&:hover': { textDecoration: 'underline' } }}>
              Forgot password?
            </Box>
          </Typography>
          <Button type="submit" fullWidth variant="contained" disabled={loading} size="large" sx={{ py: 1.5, fontSize: 15, borderRadius: 2.5, background: '#385246', color: '#ffffff', fontWeight: 700, '&:hover': { background: '#2A3D33' } }}>
            {loading ? 'Signing In...' : ' Sign In'}
          </Button>
        </Box>

        <Typography sx={{ textAlign: 'center', mt: 3, fontSize: 14, color: '#6B7A72' }}>
          Don't have an account?{' '}
          <Box component={Link} to="/register" sx={{ color: '#385246', fontWeight: 700, '&:hover': { textDecoration: 'underline' } }}>
            Register Free
          </Box>
        </Typography>
      </Paper>
    </Box>
  );
}
