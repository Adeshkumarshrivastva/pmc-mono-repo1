import { useState, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

import { apiGetMaterials, apiUploadMaterial, apiDeleteMaterial, apiGetPaymentStats, apiGetAdminPurchases } from '../api/endpoints';
import { GREEN, GREEN_DARK, formatSize } from '../components/MaterialCard';

const fieldSx = {
  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#D8E2DC' },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#9BC7AE' },
  '& .Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#385246' },
};

function StatCard({ icon, label, value, active, onClick }) {
  return (
    <Paper
      elevation={0}
      onClick={onClick}
      sx={{
        p: 2.25, borderRadius: 3, background: '#FFFFFF', height: '100%',
        border: active ? `1.5px solid ${GREEN}` : '1px solid #E8ECEA',
        ...(onClick && {
          cursor: 'pointer', transition: 'all 0.15s',
          '&:hover': { borderColor: GREEN, boxShadow: '0 6px 20px rgba(56,82,70,0.12)', transform: 'translateY(-2px)' },
        }),
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{ width: 40, height: 40, borderRadius: 2.5, background: active ? GREEN : 'rgba(56,82,70,0.08)', color: active ? '#fff' : 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0, transition: 'all 0.15s' }}>
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

// Admin-only: upload/replace course material, see buyers, and track basic stats.
// Laid out as tabs — Upload / Materials / Buyers — so each section only
// shows what's relevant instead of one long page of everything at once.
export default function AdminDashboard() {
  const [tab, setTab] = useState('materials'); // 'upload' | 'materials' | 'purchases'
  const [materials, setMaterials] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [stats, setStats] = useState(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingPurchases, setLoadingPurchases] = useState(true);
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [courseGroup, setCourseGroup] = useState('');
  const [order, setOrder] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const refreshMaterials = () => {
    setLoadingList(true);
    apiGetMaterials()
      .then(data => setMaterials(data.materials || []))
      .catch(err => setError(err.message))
      .finally(() => setLoadingList(false));
  };

  const refreshStats = () => {
    apiGetPaymentStats().then(setStats).catch(() => {});
  };

  const refreshPurchases = () => {
    setLoadingPurchases(true);
    apiGetAdminPurchases()
      .then(data => setPurchases(data.purchases || []))
      .catch(() => {})
      .finally(() => setLoadingPurchases(false));
  };

  useEffect(() => { refreshMaterials(); refreshStats(); refreshPurchases(); }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!file) { setError('Please choose a file to upload.'); return; }

    setUploading(true);
    try {
      await apiUploadMaterial({
        title: title.trim() || file.name,
        file,
        courseGroup: courseGroup.trim() || undefined,
        order: order ? Number(order) : undefined,
      });
      setSuccess('Uploaded successfully!');
      setTitle('');
      setFile(null);
      setCourseGroup('');
      setOrder('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      refreshMaterials();
      refreshStats();
      setTab('materials');
    } catch (err) {
      setError(err.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this course material? This cannot be undone.')) return;
    try {
      await apiDeleteMaterial(id);
      setMaterials(prev => prev.filter(m => m._id !== id));
      refreshStats();
    } catch (err) {
      setError(err.message || 'Failed to remove material');
    }
  };

  return (
    <>
      {/* Stats — double as tab switches */}
        <Grid container spacing={2} sx={{ mb: 3.5 }}>
          <Grid size={{ xs: 6, sm: 3 }}><StatCard icon="📚" label="Materials" value={stats?.materials ?? '—'} active={tab === 'materials'} onClick={() => setTab('materials')} /></Grid>
          <Grid size={{ xs: 6, sm: 3 }}><StatCard icon="🧾" label="Purchases" value={stats?.purchases ?? '—'} active={tab === 'purchases'} onClick={() => setTab('purchases')} /></Grid>
          <Grid size={{ xs: 6, sm: 3 }}><StatCard icon="💰" label="Revenue" value={stats ? `₹${stats.revenue}` : '—'} active={tab === 'purchases'} onClick={() => setTab('purchases')} /></Grid>
          <Grid size={{ xs: 6, sm: 3 }}><StatCard icon="🎓" label="Certificates" value={stats?.certificates ?? '—'} /></Grid>
        </Grid>

        <Tabs
          value={tab}
          onChange={(e, v) => setTab(v)}
          sx={{
            mb: 3, minHeight: 40, borderBottom: '1px solid rgba(42,61,51,0.12)',
            '& .MuiTab-root': { textTransform: 'none', fontWeight: 700, fontSize: 14, color: 'rgba(42,61,51,0.6)', minHeight: 40 },
            '& .Mui-selected': { color: `${GREEN} !important` },
            '& .MuiTabs-indicator': { background: GREEN, height: 2.5 },
          }}
        >
          <Tab label="⬆ Upload" value="upload" />
          <Tab label={`📚 Materials (${materials.length})`} value="materials" />
          <Tab label={`🧾 Buyers (${purchases.length})`} value="purchases" />
        </Tabs>

        {error && <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2.5, borderRadius: 2 }}>{success}</Alert>}

        {tab === 'upload' && (
          <Paper elevation={0} sx={{ p: 3.5, borderRadius: 3, border: '1px solid #E8ECEA', background: '#FFFFFF' }}>
            <Typography sx={{ fontWeight: 700, color: '#1F3529', mb: 2 }}>Upload New Material</Typography>
            <Box component="form" onSubmit={handleUpload}>
              <TextField
                fullWidth
                label="Title (optional)"
                placeholder="e.g. Week 1 - Introduction slides"
                value={title}
                onChange={e => setTitle(e.target.value)}
                sx={{ ...fieldSx, mb: 2.5 }}
              />
              <Button
                component="label"
                variant="outlined"
                fullWidth
                sx={{ mb: 2.5, py: 1.3, borderRadius: 2.5, borderColor: '#D8E2DC', color: '#385246', textTransform: 'none', justifyContent: 'flex-start', px: 2 }}
              >
                {file ? `📎 ${file.name}` : 'Choose PDF or PPT/PPTX file to upload'}
                <input ref={fileInputRef} type="file" hidden accept=".pdf,.ppt,.pptx" onChange={e => setFile(e.target.files?.[0] || null)} />
              </Button>

              <Typography sx={{ fontSize: 12.5, color: 'rgba(42,61,51,0.6)', mb: 1 }}>
                Optional — only for a sequential course (multiple parts that unlock one after another via quiz):
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 2.5 }}>
                <TextField
                  label="Course Group"
                  placeholder="e.g. clinical-intake"
                  value={courseGroup}
                  onChange={e => setCourseGroup(e.target.value)}
                  sx={{ ...fieldSx, flex: 2 }}
                />
                <TextField
                  label="Part #"
                  placeholder="1"
                  type="number"
                  value={order}
                  onChange={e => setOrder(e.target.value)}
                  sx={{ ...fieldSx, flex: 1 }}
                  slotProps={{ htmlInput: { min: 1 } }}
                />
              </Box>

              <Button type="submit" fullWidth variant="contained" size="large" disabled={uploading}
                sx={{ py: 1.4, borderRadius: 2.5, fontWeight: 700, background: GREEN, color: '#fff', '&:hover': { background: GREEN_DARK } }}>
                {uploading ? 'Uploading…' : 'Save Upload'}
              </Button>
            </Box>
          </Paper>
        )}

        {tab === 'materials' && (
          loadingList ? (
            <Box sx={{ textAlign: 'center', py: 6 }}><CircularProgress sx={{ color: GREEN }} /></Box>
          ) : materials.length === 0 ? (
            <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '2px dashed #D8E2DC', background: '#FFFFFF', textAlign: 'center' }}>
              <Typography sx={{ color: 'rgba(42,61,51,0.6)', fontSize: 14, mb: 2 }}>Nothing uploaded yet.</Typography>
              <Button variant="contained" onClick={() => setTab('upload')}
                sx={{ borderRadius: 2.5, fontWeight: 700, background: GREEN, '&:hover': { background: GREEN_DARK } }}>
                ⬆ Upload your first file
              </Button>
            </Paper>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {materials.map(m => (
                <Paper key={m._id} elevation={0} sx={{ p: 2, borderRadius: 3, border: '1px solid #E8ECEA', background: '#FFFFFF', display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ width: 40, height: 40, borderRadius: 2, background: 'rgba(56,82,70,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                    {m.mimeType === 'application/pdf' ? '📄' : '📊'}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 700, color: '#1F3529', fontSize: 14 }}>{m.title}</Typography>
                    <Typography sx={{ fontSize: 12, color: 'rgba(42,61,51,0.55)' }}>
                      {m.fileName} · {formatSize(m.size)} · ₹{m.price}
                    </Typography>
                  </Box>
                  <IconButton size="small" onClick={() => handleDelete(m._id)} sx={{ color: '#B3261E', '&:hover': { background: 'rgba(179,38,30,0.08)' } }}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Paper>
              ))}
            </Box>
          )
        )}

        {tab === 'purchases' && (
          loadingPurchases ? (
            <Box sx={{ textAlign: 'center', py: 6 }}><CircularProgress sx={{ color: GREEN }} /></Box>
          ) : purchases.length === 0 ? (
            <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '2px dashed #D8E2DC', background: '#FFFFFF', textAlign: 'center' }}>
              <Typography sx={{ color: 'rgba(42,61,51,0.6)', fontSize: 14 }}>No purchases yet.</Typography>
            </Paper>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {purchases.map(p => (
                <Paper key={p._id} elevation={0} sx={{ p: 2.25, borderRadius: 3, border: '1px solid #E8ECEA', background: '#FFFFFF' }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 700, color: '#1F3529', fontSize: 14 }}>{p.name}</Typography>
                      <Typography sx={{ fontSize: 12.5, color: 'rgba(42,61,51,0.6)' }}>{p.email} · +91 {p.phone}</Typography>
                    </Box>
                    <Chip label={`₹${p.amount}`} size="small" sx={{ background: 'rgba(16,185,129,0.15)', color: '#10B981', fontWeight: 700 }} />
                  </Box>
                  <Typography sx={{ fontSize: 12.5, color: 'rgba(42,61,51,0.55)', mt: 1 }}>
                    {p.materialTitle} · {new Date(p.paidAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </Typography>
                  {p.reason && (
                    <Typography sx={{ fontSize: 13, color: '#1F3529', mt: 1, fontStyle: 'italic', background: 'rgba(56,82,70,0.05)', p: 1.25, borderRadius: 2 }}>
                      “{p.reason}”
                    </Typography>
                  )}
                </Paper>
              ))}
            </Box>
          )
        )}
    </>
  );
}
