import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';

import { apiGetMaterials, apiGetMyPurchases, apiGetMyCertificates, ENDPOINTS, withIdentity } from '../api/endpoints';
import { GREEN } from '../components/MaterialCard';
import { groupMaterials, SequentialCourseSection } from '../components/SequentialCourseSection';

function StatCard({ icon, label, value }) {
  return (
    <Paper elevation={0} sx={{ p: 2.25, borderRadius: 3, border: '1px solid #E8ECEA', background: '#FFFFFF', height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{ width: 40, height: 40, borderRadius: 2.5, background: 'rgba(56,82,70,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
          {icon}
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontWeight: 800, fontSize: 21, color: '#1F3529', lineHeight: 1.2 }}>{value}</Typography>
          <Typography sx={{ fontSize: 12, color: 'rgba(42,61,51,0.6)' }}>{label}</Typography>
        </Box>
      </Box>
    </Paper>
  );
}

// Logged-in user's own dashboard — unlock status, certificates earned, and
// the same view/pay/download/quiz flow as the public Online Course page,
// tied to the account instead of a guest id.
export default function UserDashboard({ user }) {
  const [materials, setMaterials] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ msg: '', type: 'success' });

  useEffect(() => {
    Promise.all([apiGetMaterials(), apiGetMyPurchases(), apiGetMyCertificates()])
      .then(([m, p, c]) => {
        setMaterials(m.materials || []);
        setPurchases(p.purchases || []);
        setCertificates(c.certificates || []);
      })
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
        ) : (
          <>
            <Grid container spacing={2} sx={{ mb: 4 }}>
              <Grid size={{ xs: 6, sm: 4 }}><StatCard icon="📚" label="Available" value={materials.length} /></Grid>
              <Grid size={{ xs: 6, sm: 4 }}><StatCard icon="🔓" label="Unlocked" value={purchases.length} /></Grid>
              <Grid size={{ xs: 12, sm: 4 }}><StatCard icon="🎓" label="Certificates" value={certificates.length} /></Grid>
            </Grid>

            {certificates.length > 0 && (
              <Box sx={{ mb: 4 }}>
                <Typography sx={{ fontWeight: 700, color: '#1F3529', mb: 2 }}>My Certificates</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {certificates.map(c => (
                    <Paper key={c.materialId} elevation={0} sx={{ p: 2, borderRadius: 3, border: '1px solid #E8ECEA', background: '#FFFFFF', display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                      <Box sx={{ width: 40, height: 40, borderRadius: 2, background: 'rgba(155,199,174,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>🎓</Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 700, color: '#1F3529', fontSize: 14 }}>{c.materialTitle}</Typography>
                        <Typography sx={{ fontSize: 12, color: 'rgba(42,61,51,0.55)' }}>
                          Scored {c.score}/{c.total} · {new Date(c.attemptedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </Typography>
                      </Box>
                      <Button component="a" href={withIdentity(ENDPOINTS.QUIZ_CERTIFICATE(c.materialId))} download
                        size="small" variant="outlined" sx={{ borderRadius: 2, borderColor: GREEN, color: GREEN, flexShrink: 0 }}>
                        Download
                      </Button>
                    </Paper>
                  ))}
                </Box>
              </Box>
            )}

            <Typography sx={{ fontWeight: 700, color: '#1F3529', mb: 2 }}>Course Material</Typography>
            {materials.length === 0 ? (
              <Paper elevation={0} sx={{ p: 5, borderRadius: 3, border: '2px dashed #D8E2DC', background: '#FFFFFF', textAlign: 'center' }}>
                <Typography sx={{ fontSize: 44, mb: 1.5 }}>📭</Typography>
                <Typography sx={{ fontWeight: 700, color: '#1F3529', mb: 0.5 }}>No course material yet</Typography>
                <Typography sx={{ color: 'rgba(42,61,51,0.6)', fontSize: 14 }}>Check back soon.</Typography>
              </Paper>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {Object.entries(groupMaterials(materials).groups).map(([courseGroup, groupMaterialsList]) => (
                  <SequentialCourseSection key={courseGroup} courseGroup={courseGroup} materials={groupMaterialsList} user={user} showToast={showToast} />
                ))}
              </Box>
            )}
          </>
        )}
    </>
  );
}
