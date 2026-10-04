import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';

import { apiGetMaterials } from '../api/endpoints';
import { GREEN } from '../components/MaterialCard';
import { groupMaterials, SequentialCourseSection } from '../components/SequentialCourseSection';
import AdminDashboard from './AdminDashboard';
import UserDashboard from './UserDashboard';

const SUBTITLES = {
  admin: 'Upload material, track buyers, and see certificates issued.',
  user: 'Unlock materials, download, and earn your certificate.',
  guest: 'Pay ₹99 to unlock the course PDF download, then pass a short quiz to earn your certificate.',
};

// One page for everyone — what you see depends on your role. No login
// needed to browse/buy; logging in (via phone OTP) just adds an account
// behind your purchases, and an admin account gets upload/management tools
// right here instead of a separate dashboard page.
export default function OnlineCourse({ user }) {
  const isAdmin = user?.role === 'admin';
  const mode = isAdmin ? 'admin' : user ? 'user' : 'guest';

  return (
    <Box sx={{ minHeight: '80vh', background: '#DAD7B9', py: { xs: 5, md: 8 } }}>
      <Container maxWidth="md">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#1F3529' }}>Online Course</Typography>
          {mode === 'admin' && <Chip label="🛡️ Admin" sx={{ background: GREEN, color: '#fff', fontWeight: 700 }} />}
          {mode === 'user' && <Chip label="👤 User" sx={{ background: 'rgba(56,82,70,0.1)', color: GREEN, fontWeight: 700 }} />}
        </Box>
        <Typography sx={{ color: 'rgba(42,61,51,0.7)', mb: 4 }}>{SUBTITLES[mode]}</Typography>

        {mode === 'admin' ? (
          <AdminDashboard />
        ) : mode === 'user' ? (
          <UserDashboard user={user} />
        ) : (
          <GuestView user={user} />
        )}
      </Container>
    </Box>
  );
}

// Not logged in — free browsing, pay-per-material via guest checkout.
function GuestView({ user }) {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ msg: '', type: 'success' });

  useEffect(() => {
    apiGetMaterials()
      .then(data => setMaterials(data.materials || []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: 'success' }), 4000);
  };

  return (
    <>
      {toast.msg && <Alert severity={toast.type} sx={{ mb: 2.5, borderRadius: 2 }}>{toast.msg}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ textAlign: 'center', py: 8 }}><CircularProgress sx={{ color: GREEN }} /></Box>
      ) : materials.length === 0 ? (
        <Paper elevation={0} sx={{ p: 5, borderRadius: 3, border: '2px dashed #D8E2DC', background: '#FFFFFF', textAlign: 'center' }}>
          <Typography sx={{ fontSize: 44, mb: 1.5 }}>📭</Typography>
          <Typography sx={{ fontWeight: 700, color: '#1F3529', mb: 0.5 }}>No course material yet</Typography>
          <Typography sx={{ color: 'rgba(42,61,51,0.6)', fontSize: 14 }}>Check back soon.</Typography>
        </Paper>
      ) : (() => {
        // Only sequential courses (added via seed/admin with a courseGroup)
        // show here — standalone one-off materials are managed separately.
        const { groups } = groupMaterials(materials);
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {Object.entries(groups).map(([courseGroup, groupMaterialsList]) => (
              <SequentialCourseSection key={courseGroup} courseGroup={courseGroup} materials={groupMaterialsList} user={user} showToast={showToast} />
            ))}
          </Box>
        );
      })()}
    </>
  );
}
