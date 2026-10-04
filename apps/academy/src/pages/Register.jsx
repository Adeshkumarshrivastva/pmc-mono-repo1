import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Alert from '@mui/material/Alert';
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

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', phone: '', email: '', password: '', confirmPassword: '' });
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
    if (!form.name.trim()) e.name = 'Name is required';
    else if (form.name.trim().length < 2) e.name = 'At least 2 characters required';
    if (!form.phone.trim()) e.phone = 'Phone is required';
    else if (!/^[6-9]\d{9}$/.test(form.phone.trim())) e.phone = 'Enter valid 10-digit number';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = 'Enter a valid email';
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
    const result = await register({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      password: form.password,
    });
    setLoading(false);
    if (!result.success) { setApiError(result.message); return; }
    setSuccess(true);
    setTimeout(() => navigate('/login'), 1800);
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#DAD7B9', p: { xs: 2, md: 3 } }}>
      <Paper
        elevation={0}
        sx={{ width: '100%', maxWidth: 560, borderRadius: 4, border: '1px solid #E8ECEA', background: '#FFFFFF', boxShadow: '0 20px 60px rgba(56,82,70,0.12)', overflow: 'hidden' }}
      >
        {/* Form panel */}
        <Box sx={{ p: { xs: 3, sm: 4, md: 5 }, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {/* Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
            <Box component="img" src={pmcLogo} alt="PMC Global Academy" sx={{ width: 40, height: 40, borderRadius: '50%' }} />
            <Typography sx={{ fontWeight: 800, fontSize: 14, color: '#1a2e25' }}>PMC Global Academy</Typography>
          </Box>

          <Typography variant="h5" sx={{ fontWeight: 800, color: '#1a2e25', mb: 0.5 }}>Create Account</Typography>
          <Typography sx={{ color: '#6B7A72', fontSize: 13, mb: 2.5 }}>Fill in your details to get started.</Typography>

          {success ? (
            <Box sx={{ textAlign: 'center', py: 5 }}>
              <Typography sx={{ fontSize: 60, mb: 2 }}>✅</Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a2e25', mb: 1 }}>Registration Successful!</Typography>
              <Typography sx={{ color: '#6B7A72', fontSize: 14 }}>Redirecting to Sign In...</Typography>
            </Box>
          ) : (
            <Box component="form" onSubmit={handleSubmit} noValidate autoComplete="off">
              {apiError && (
                <Alert severity="error" sx={{ mb: 2, borderRadius: 2, py: 0.5 }}>{apiError}</Alert>
              )}

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth size="small" label="Full Name" placeholder="Your full name"
                    value={form.name} onChange={e => update('name', e.target.value)}
                    error={!!errors.name} helperText={errors.name}
                    sx={lightFieldSx}
                    slotProps={{ htmlInput: { autoComplete: 'off' } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth size="small" label="Phone Number" placeholder="9876543210" type="tel"
                    value={form.phone} onChange={e => update('phone', e.target.value)}
                    error={!!errors.phone} helperText={errors.phone}
                    sx={lightFieldSx}
                    slotProps={{ htmlInput: { maxLength: 10, autoComplete: 'off' } }}
                  />
                </Grid>
                <Grid size={12}>
                  <TextField
                    fullWidth size="small" label="Email Address" placeholder="you@example.com"
                    value={form.email} onChange={e => update('email', e.target.value)}
                    error={!!errors.email} helperText={errors.email}
                    sx={lightFieldSx}
                    slotProps={{ htmlInput: { autoComplete: 'off', type: 'email' } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth size="small" label="Password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min 6 characters"
                    value={form.password} onChange={e => update('password', e.target.value)}
                    error={!!errors.password} helperText={errors.password}
                    sx={lightFieldSx}
                    slotProps={{
                      htmlInput: { autoComplete: 'new-password' },
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowPassword(p => !p)} size="small" edge="end" sx={{ color: '#6B7A72' }}>
                              {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth size="small" label="Confirm Password"
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Re-enter password"
                    value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)}
                    error={!!errors.confirmPassword} helperText={errors.confirmPassword}
                    sx={lightFieldSx}
                    slotProps={{
                      htmlInput: { autoComplete: 'new-password' },
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowConfirm(p => !p)} size="small" edge="end" sx={{ color: '#6B7A72' }}>
                              {showConfirm ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                </Grid>
              </Grid>

              <Button
                type="submit" fullWidth variant="contained"
                disabled={loading} size="large"
                sx={{ mt: 3, py: 1.4, fontSize: 14, borderRadius: 2.5, background: '#385246', color: '#ffffff', fontWeight: 700, '&:hover': { background: '#2A3D33' } }}
              >
                {loading ? 'Creating Account...' : ' Create Account'}
              </Button>
            </Box>
          )}

          <Typography sx={{ textAlign: 'center', mt: 2.5, fontSize: 13, color: '#6B7A72' }}>
            Already have an account?{' '}
            <Box component={Link} to="/login" sx={{ color: '#385246', fontWeight: 700, '&:hover': { textDecoration: 'underline' } }}>
              Sign In
            </Box>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}
