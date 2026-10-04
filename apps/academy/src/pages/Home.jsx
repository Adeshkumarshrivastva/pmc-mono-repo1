import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useEnrollments from '../hooks/useEnrollments';
import { navLinks } from '../navLinks';
import { apiUpdateProgress, apiGetMaterials } from '../api/endpoints';
import { groupMaterials, SequentialCourseSection } from '../components/SequentialCourseSection';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Avatar from '@mui/material/Avatar';
import LinearProgress from '@mui/material/LinearProgress';
import Divider from '@mui/material/Divider';
import pmcLogo from '../assets/logo.svg';

const modules = [
  { icon: '🎤', title: 'Webinar / Master Class', desc: 'Live sessions with industry experts. Interact, ask questions, and learn in real-time from the best mentors.', color: '#6C3CE1', bg: '#EEE9FF', path: '/webinar', tag: 'LIVE' },
  { icon: '💻', title: 'Online Course', desc: 'Self-paced video lessons accessible anytime, anywhere. Learn at your own speed with lifetime access.', color: '#0EA5E9', bg: '#E0F2FE', path: '/online-course', tag: 'SELF-PACED' },
  { icon: '🔄', title: 'Hybrid Course', desc: 'Best of both worlds — combine online flexibility with offline classroom interaction for deeper learning.', color: '#10B981', bg: '#D1FAE5', path: '/hybrid-course', tag: 'HYBRID' },
  { icon: '🖥️', title: 'Online Class', desc: 'Scheduled live virtual classes with a trainer. Get real-time feedback and collaborate with peers online.', color: '#F59E0B', bg: '#FEF3C7', path: '/online-class', tag: 'SCHEDULED' },
  { icon: '🏫', title: 'Offline Course', desc: 'Traditional classroom experience at our state-of-the-art centers. Hands-on training with expert faculty.', color: '#EF4444', bg: '#FEE2E2', path: '/offline-course', tag: 'CLASSROOM' },
];

const testimonials = [
  { name: 'Priya Sharma', role: 'Software Engineer', avatar: '👩‍💻', text: 'Positive Mind Care transformed my life. The hybrid course was exactly what I needed — flexibility plus amazing classroom interaction!', rating: 5 },
  { name: 'Rahul Verma', role: 'Data Analyst', avatar: '👨‍💼', text: 'The Master Class webinar sessions are absolutely world-class. I learned more in 2 hours than months of self-study.', rating: 5 },
  { name: 'Anjali Singh', role: 'Product Manager', avatar: '👩‍🎓', text: 'The offline course at Positive Mind Care gave me hands-on experience. The faculty is incredibly knowledgeable and supportive.', rating: 5 },
];

const courseTypeLabels = {
  'webinar':        { label: 'Webinar',       color: '#6C3CE1', bg: '#EEE9FF', icon: '🎤' },
  'online-course':  { label: 'Online Course', color: '#0EA5E9', bg: '#E0F2FE', icon: '💻' },
  'hybrid-course':  { label: 'Hybrid Course', color: '#10B981', bg: '#D1FAE5', icon: '🔄' },
  'online-class':   { label: 'Online Class',  color: '#D97706', bg: '#FEF3C7', icon: '🖥️' },
  'offline-course': { label: 'Offline Course',color: '#EF4444', bg: '#FEE2E2', icon: '🏫' },
};

const courseTypePaths = {
  'webinar': '/webinar',
  'online-course': '/online-course',
  'hybrid-course': '/hybrid-course',
  'online-class': '/online-class',
  'offline-course': '/offline-course',
};

const features = [
  { icon: '🏆', title: 'Industry Experts',  desc: 'Learn from top professionals with real industry experience.', bg: '#EEE9FF', color: '#6C3CE1' },
  { icon: '📱', title: 'Learn Anywhere',    desc: 'Access courses on any device, anytime, at your own pace.', bg: '#D1FAE5', color: '#10B981' },
  { icon: '📜', title: 'Certificates',      desc: 'Earn recognized certificates to boost your career profile.', bg: '#FEF3C7', color: '#D97706' },
  { icon: '🤝', title: 'Community',         desc: 'Join a thriving community of 50,000+ learners and mentors.', bg: '#FEE2E2', color: '#EF4444' },
  { icon: '💼', title: 'Job Assistance',    desc: '98% placement rate with dedicated career support team.', bg: '#E0F2FE', color: '#0EA5E9' },
  { icon: '🔄', title: 'Lifetime Access',   desc: 'Get lifetime access to all course materials and updates.', bg: '#F3E8FF', color: '#7C3AED' },
];

const heroStats    = [['50K+', 'Students'], ['200+', 'Courses'], ['98%', 'Success Rate'], ['4.9★', 'Rating']];
const statsBarData = [['50,000+', 'Active Learners'], ['200+', 'Expert Courses'], ['150+', 'Industry Mentors'], ['98%', 'Placement Rate']];

export default function Home({ user }) {
  const { enrollments: rawEnrollments, loading: enrollLoading } = useEnrollments(user);
  const [enrollments, setEnrollments] = useState([]);
  const [updatingId, setUpdatingId] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [materialsLoading, setMaterialsLoading] = useState(!!user);

  useEffect(() => { setEnrollments(rawEnrollments); }, [rawEnrollments]);

  // Real course progress (Clinical Intake PDFs + quizzes) lives here — the
  // "enrollments" system above is a separate, unused legacy feature that
  // always shows empty, so it can't be the only thing shown on this page.
  useEffect(() => {
    if (!user) return;
    apiGetMaterials()
      .then(data => setMaterials(data.materials || []))
      .catch(() => {})
      .finally(() => setMaterialsLoading(false));
  }, [user]);

  const courseGroups = groupMaterials(materials).groups;
  const hasRealCourses = Object.keys(courseGroups).length > 0;

  const dashStats = {
    total:       enrollments.length,
    completed:   enrollments.filter(e => e.status === 'completed').length,
    inProgress:  enrollments.filter(e => (e.progress || 0) > 0 && e.status !== 'completed').length,
    avgProgress: enrollments.length > 0
      ? Math.round(enrollments.reduce((s, e) => s + (e.progress || 0), 0) / enrollments.length)
      : 0,
  };

  const handleProgress = async (id, progress) => {
    setUpdatingId(id);
    try {
      await apiUpdateProgress(id, progress);
      setEnrollments(prev =>
        prev.map(e => e._id === id
          ? { ...e, progress, status: progress >= 100 ? 'completed' : 'active' }
          : e
        )
      );
    } catch { /* silent */ }
    setUpdatingId(null);
  };

  return (
    <Box>
      {user ? (
        /* ════════════════════════════════════
           LOGGED-IN DASHBOARD VIEW
        ════════════════════════════════════ */
        <>
          {/* ─── Welcome Header ─── */}
          <Box sx={{ background: '#DAD7B9', pt: { xs: 4, md: 6 }, pb: 5, position: 'relative', overflow: 'hidden' }}>
            <Box sx={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 60% at 80% 40%, rgba(155,199,174,0.25) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
              {/* Greeting row */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                <Avatar sx={{ width: 54, height: 54, background: 'linear-gradient(135deg, #46614F, #9BC7AE)', fontSize: 22, fontWeight: 800, border: '2px solid rgba(42,61,51,0.2)' }}>
                  {user.name?.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography sx={{ color: 'rgba(42,61,51,0.55)', fontSize: 13 }}>Hello,</Typography>
                  <Typography sx={{ color: '#1F3529', fontWeight: 800, fontSize: { xs: 20, md: 24 } }}>{user.name}</Typography>
                </Box>
              </Box>

              {/* Stats cards — 4 per row on desktop, 2 per row on mobile */}
              <Grid container spacing={2}>
                {[
                  { label: 'Total Enrolled', value: dashStats.total,       icon: '📚', color: '#A78BFA', border: 'rgba(167,139,250,0.3)' },
                  { label: 'Completed',       value: dashStats.completed,   icon: '✅', color: '#34D399', border: 'rgba(52,211,153,0.3)' },
                  { label: 'In Progress',     value: dashStats.inProgress,  icon: '⚡', color: '#FBBF24', border: 'rgba(251,191,36,0.3)' },
                  { label: 'Avg Progress',    value: `${dashStats.avgProgress}%`, icon: '📈', color: '#60A5FA', border: 'rgba(96,165,250,0.3)' },
                ].map(s => (
                  <Grid size={{ xs: 6, md: 3 }} key={s.label}>
                    <Paper elevation={0} sx={{ background: 'rgba(42,61,51,0.07)', border: `1px solid ${s.border}`, borderRadius: 3, p: { xs: 2, md: 2.5 }, textAlign: 'center', backdropFilter: 'blur(10px)' }}>
                      <Typography sx={{ fontSize: 28, mb: 0.5 }}>{s.icon}</Typography>
                      <Typography sx={{ fontWeight: 900, color: s.color, fontSize: { xs: 24, md: 30 }, lineHeight: 1 }}>{s.value}</Typography>
                      <Typography sx={{ fontSize: 12, color: 'rgba(42,61,51,0.55)', mt: 0.5 }}>{s.label}</Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Container>
          </Box>

          {/* ─── Your Course Progress (real Clinical Intake materials/quizzes) ─── */}
          {(materialsLoading || hasRealCourses) && (
            <Box sx={{ py: { xs: 5, md: 6 }, background: '#DAD7B9' }}>
              <Container maxWidth="lg">
                <Chip label="My Learning" sx={{ background: 'rgba(42,61,51,0.12)', color: '#1F3529', fontWeight: 700, mb: 1 }} />
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#1F3529', mb: 3 }}>
                  Your Course Progress
                </Typography>

                {materialsLoading ? (
                  <Box sx={{ py: 4 }}>
                    <LinearProgress sx={{ borderRadius: 4, height: 6, backgroundColor: 'rgba(42,61,51,0.12)' }} />
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {Object.entries(courseGroups).map(([courseGroup, groupMaterialsList]) => (
                      <SequentialCourseSection key={courseGroup} courseGroup={courseGroup} materials={groupMaterialsList} user={user} showToast={() => {}} />
                    ))}
                  </Box>
                )}
              </Container>
            </Box>
          )}

          {/* ─── My Enrolled Courses (legacy webinar/hybrid-course enrollments) ─── */}
          {(enrollLoading || enrollments.length > 0 || !hasRealCourses) && (
          <Box sx={{ py: { xs: 5, md: 7 }, background: '#DAD7B9' }}>
            <Container maxWidth="lg">
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 4, flexWrap: 'wrap', gap: 2 }}>
                <Box>
                  <Chip label="My Learning" sx={{ background: 'rgba(42,61,51,0.12)', color: '#1F3529', fontWeight: 700, mb: 1 }} />
                  <Typography variant="h5" sx={{ fontWeight: 800, color: '#1F3529' }}>
                    {enrollments.length > 0 ? 'Continue Learning' : 'Other Courses'}
                  </Typography>
                  {enrollments.length > 0 && (
                    <Typography sx={{ color: 'rgba(42,61,51,0.65)', fontSize: 13, mt: 0.5 }}>
                      {dashStats.completed} completed · {dashStats.inProgress} in progress
                    </Typography>
                  )}
                </Box>
                <Button component={Link} to="/online-course" variant="outlined" sx={{ borderRadius: 2.5, fontWeight: 700, borderWidth: 2, color: '#1F3529', borderColor: 'rgba(42,61,51,0.4)', '&:hover': { borderWidth: 2, borderColor: '#1F3529', background: 'rgba(42,61,51,0.08)' } }}>
                  + Explore Courses
                </Button>
              </Box>

              {enrollLoading ? (
                <Box sx={{ py: 4 }}>
                  <LinearProgress sx={{ borderRadius: 4, height: 6, backgroundColor: 'rgba(42,61,51,0.12)' }} />
                  <Typography sx={{ color: 'rgba(42,61,51,0.55)', fontSize: 13, mt: 2, textAlign: 'center' }}>Loading your courses...</Typography>
                </Box>
              ) : enrollments.length === 0 ? (
                hasRealCourses ? null : (
                <Paper elevation={0} sx={{ border: '2px dashed rgba(42,61,51,0.25)', borderRadius: 4, p: { xs: 5, md: 7 }, textAlign: 'center', background: 'rgba(42,61,51,0.05)' }}>
                  <Typography sx={{ fontSize: 60, mb: 2 }}>📚</Typography>
                  <Typography sx={{ fontWeight: 800, color: '#1F3529', fontSize: 20, mb: 1 }}>No courses enrolled yet</Typography>
                  <Typography sx={{ color: 'rgba(42,61,51,0.55)', fontSize: 14, mb: 3.5 }}>Explore our courses and start your learning journey today.</Typography>
                  <Button component={Link} to="/online-course" variant="contained" size="large" sx={{ borderRadius: 3, px: 4, py: 1.3, background: '#9BC7AE', color: '#1F3529', fontWeight: 700, '&:hover': { background: '#8ECFB0' } }}>
                    Browse Courses →
                  </Button>
                </Paper>
                )
              ) : (
                <Grid container spacing={3}>
                  {enrollments.map(e => {
                    const meta = courseTypeLabels[e.courseType] || { label: e.courseType, color: '#6C3CE1', bg: '#EEE9FF', icon: '📖' };
                    const coursePath = courseTypePaths[e.courseType] || '/webinar';
                    const prog = e.progress || 0;
                    const isDone = e.status === 'completed';
                    const isUpdating = updatingId === e._id;

                    return (
                      <Grid size={{ xs: 12, sm: 6 }} key={e._id}>
                        <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${isDone ? 'rgba(155,199,174,0.35)' : 'rgba(42,61,51,0.14)'}`, height: '100%', display: 'flex', flexDirection: 'column', background: 'rgba(42,61,51,0.06)', transition: 'all 0.22s', '&:hover': { boxShadow: `0 12px 40px ${meta.color}22`, transform: 'translateY(-4px)', borderColor: `${meta.color}66` } }}>
                          {/* Top strip */}
                          <Box sx={{ background: `${meta.color}22`, p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(42,61,51,0.08)' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Box sx={{ width: 46, height: 46, background: 'rgba(42,61,51,0.18)', borderRadius: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
                                {meta.icon}
                              </Box>
                              <Box>
                                <Typography sx={{ fontSize: 11, color: meta.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>{meta.label}</Typography>
                                {e.price && <Typography sx={{ fontSize: 14, fontWeight: 800, color: '#1F3529' }}>₹{e.price}</Typography>}
                              </Box>
                            </Box>
                            <Chip
                              label={isDone ? '✅ Done' : prog > 0 ? '⚡ Active' : '🕐 New'}
                              size="small"
                              sx={{
                                background: isDone ? 'rgba(52,211,153,0.18)' : prog > 0 ? 'rgba(251,191,36,0.18)' : 'rgba(42,61,51,0.12)',
                                color: isDone ? '#6EE7B7' : prog > 0 ? '#FCD34D' : 'rgba(42,61,51,0.7)',
                                fontWeight: 700, fontSize: 11,
                              }}
                            />
                          </Box>

                          <CardContent sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {/* Title */}
                            <Typography sx={{ fontWeight: 700, color: '#1F3529', fontSize: 15, lineHeight: 1.45 }}>{e.courseTitle}</Typography>

                            {/* Progress bar */}
                            <Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
                                <Typography sx={{ fontSize: 12, color: 'rgba(42,61,51,0.65)', fontWeight: 500 }}>Progress</Typography>
                                <Typography sx={{ fontSize: 13, fontWeight: 800, color: isDone ? '#6EE7B7' : meta.color }}>{prog}%</Typography>
                              </Box>
                              <LinearProgress
                                variant="determinate"
                                value={prog}
                                sx={{
                                  height: 8, borderRadius: 4,
                                  backgroundColor: 'rgba(42,61,51,0.12)',
                                  '& .MuiLinearProgress-bar': {
                                    background: isDone
                                      ? 'linear-gradient(90deg, #10B981, #34D399)'
                                      : `linear-gradient(90deg, ${meta.color}, ${meta.color}BB)`,
                                    borderRadius: 4,
                                  },
                                }}
                              />
                            </Box>

                            {/* Enrolled date */}
                            <Typography sx={{ fontSize: 12, color: 'rgba(42,61,51,0.5)' }}>
                              📅 Enrolled {new Date(e.enrolledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </Typography>

                            {/* Progress buttons */}
                            {!isDone && (
                              <Box>
                                <Typography sx={{ fontSize: 11, color: 'rgba(42,61,51,0.6)', mb: 0.75, fontWeight: 600 }}>Mark Progress:</Typography>
                                <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                                  {[25, 50, 75].map(pct => (
                                    <Button
                                      key={pct}
                                      size="small"
                                      variant={prog >= pct ? 'contained' : 'outlined'}
                                      disabled={isUpdating}
                                      onClick={() => handleProgress(e._id, pct)}
                                      sx={{
                                        minWidth: 48, fontSize: 11, py: 0.4, px: 1.2, borderRadius: 1.5,
                                        ...(prog >= pct
                                          ? { background: meta.color, borderColor: meta.color, '&:hover': { background: meta.color } }
                                          : { borderColor: `${meta.color}88`, color: meta.color }
                                        ),
                                      }}
                                    >
                                      {pct}%
                                    </Button>
                                  ))}
                                  <Button
                                    size="small"
                                    variant="contained"
                                    disabled={isUpdating}
                                    onClick={() => handleProgress(e._id, 100)}
                                    sx={{ fontSize: 11, py: 0.4, px: 1.2, borderRadius: 1.5, background: '#10B981', '&:hover': { background: '#059669' } }}
                                  >
                                    ✓ Done
                                  </Button>
                                </Box>
                              </Box>
                            )}

                            {/* Continue / Review button */}
                            <Button
                              component={Link}
                              to={coursePath}
                              variant="contained"
                              fullWidth
                              sx={{
                                mt: 'auto', borderRadius: 2, fontWeight: 700, fontSize: 13,
                                background: isDone ? 'transparent' : meta.color,
                                color: isDone ? meta.color : '#1F3529',
                                border: isDone ? `2px solid ${meta.color}` : 'none',
                                '&:hover': { background: isDone ? `${meta.color}12` : `${meta.color}DD`, transform: 'none' },
                              }}
                            >
                              {isDone ? '📖 Review Course' : prog > 0 ? '▶ Continue Learning' : '🚀 Start Learning'}
                            </Button>
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              )}
            </Container>
          </Box>
          )}

          {/* ─── Explore More Courses ─── */}
          <Box sx={{ py: { xs: 5, md: 7 }, background: '#DAD7B9' }}>
            <Container maxWidth="lg">
              <Box sx={{ mb: 4 }}>
                <Chip label="Browse All" sx={{ background: 'rgba(42,61,51,0.12)', color: '#1F3529', fontWeight: 700, mb: 1 }} />
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#1F3529' }}>Explore Learning Modes</Typography>
                <Typography sx={{ color: 'rgba(42,61,51,0.65)', fontSize: 14, mt: 0.5 }}>Choose the format that suits your learning style.</Typography>
              </Box>
              <Grid container spacing={2.5}>
                {modules.map(mod => (
                  <Grid size={{ xs: 12, sm: 6 }} key={mod.path}>
                    <Card component={Link} to={mod.path} sx={{ borderRadius: 3, border: '1px solid rgba(42,61,51,0.14)', background: 'rgba(42,61,51,0.06)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 2, p: 2.5, transition: 'all 0.22s', '&:hover': { transform: 'translateY(-3px)', boxShadow: `0 8px 24px ${mod.color}22`, borderColor: `${mod.color}66` } }}>
                      <Box sx={{ width: 52, height: 52, background: `${mod.color}26`, borderRadius: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>
                        {mod.icon}
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.3 }}>
                          <Typography sx={{ fontWeight: 700, color: mod.color, fontSize: 14 }}>{mod.title}</Typography>
                          <Chip label={mod.tag} size="small" sx={{ background: mod.color, color: '#fff', fontWeight: 700, fontSize: 10, height: 18 }} />
                        </Box>
                        <Typography sx={{ fontSize: 12, color: 'rgba(42,61,51,0.65)', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{mod.desc}</Typography>
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Container>
          </Box>
        </>
      ) : (
        /* ════════════════════════════════════
           PUBLIC / NOT LOGGED IN VIEW
        ════════════════════════════════════ */
        <>
          {/* ─── Hero ─── */}
          <Box sx={{ background: '#DAD7B9', position: 'relative', overflow: 'hidden', py: { xs: 9, md: 11 } }}>
            <div className="hero-bg-shapes">
              <div className="shape shape-1" /><div className="shape shape-2" /><div className="shape shape-3" />
            </div>
            <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
              <Grid container spacing={4} alignItems="center">
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, background: 'rgba(42,61,51,0.1)', border: '1px solid rgba(42,61,51,0.2)', borderRadius: 10, px: 2, py: 0.75, mb: 3 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981', boxShadow: '0 0 0 3px rgba(16,185,129,0.3)', flexShrink: 0 }} />
                    <Typography sx={{ color: 'rgba(42,61,51,0.9)', fontSize: 13, fontWeight: 600 }}>India's #1 Mental Wellness Learning Platform</Typography>
                  </Box>
                  <Typography variant="h2" sx={{ color: '#1F3529', fontSize: { xs: '2rem', md: '3rem' }, mb: 0.5, fontWeight: 800 }}>Welcome to the</Typography>
                  <Typography variant="h2" sx={{ fontSize: { xs: '2rem', md: '3rem' }, mb: 2.5, fontWeight: 800, background: 'linear-gradient(135deg, #385246 0%, #1F3529 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                    Positive Mind Care
                  </Typography>
                  <Typography sx={{ color: 'rgba(42,61,51,0.70)', fontSize: { xs: 15, md: 17 }, mb: 4, lineHeight: 1.75, maxWidth: 490 }}>
                    From live webinars to offline classrooms — choose the learning style that fits your life. Join over 50,000 learners building real skills with Positive Mind Care.
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 5 }}>
                    <Button variant="contained" size="large" component={Link} to="/register" sx={{ background: '#9BC7AE', color: '#1F3529', '&:hover': { background: '#8ECFB0', transform: 'translateY(-2px)' }, px: 3.5, py: 1.5, borderRadius: 2.5, fontSize: 15, fontWeight: 700, transition: 'all 0.2s' }}>
                      🚀 Get Started Free
                    </Button>
                    <Button variant="outlined" size="large" component={Link} to="/login" sx={{ borderColor: 'rgba(42,61,51,0.4)', color: '#1F3529', '&:hover': { borderColor: '#1F3529', background: 'rgba(42,61,51,0.1)' }, px: 3.5, py: 1.5, borderRadius: 2.5, fontSize: 15 }}>
                      Sign In →
                    </Button>
                  </Box>
                  <Box sx={{ display: 'flex' }}>
                    {heroStats.map(([val, label], i) => (
                      <Box key={label} sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ textAlign: 'center', px: 2, pl: i === 0 ? 0 : 2 }}>
                          <Typography sx={{ fontWeight: 800, color: '#1F3529', fontSize: 20 }}>{val}</Typography>
                          <Typography sx={{ fontSize: 12, color: 'rgba(42,61,51,0.52)' }}>{label}</Typography>
                        </Box>
                        {i < heroStats.length - 1 && <Box sx={{ width: 1, height: 32, background: 'rgba(42,61,51,0.18)' }} />}
                      </Box>
                    ))}
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }} sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'center', alignItems: 'center', position: 'relative', minHeight: 400 }}>
                  <Box className="hero-float-1" sx={{ position: 'absolute', top: '5%', left: '2%', background: 'rgba(42,61,51,0.1)', backdropFilter: 'blur(14px)', border: '1px solid rgba(42,61,51,0.2)', borderRadius: 3, p: 2, display: 'flex', alignItems: 'center', gap: 1.5, zIndex: 2 }}>
                    <Typography sx={{ fontSize: 28 }}>🎤</Typography>
                    <Box>
                      <Typography sx={{ color: '#1F3529', fontWeight: 700, fontSize: 13, lineHeight: 1.2 }}>Live Webinar</Typography>
                      <Typography sx={{ color: 'rgba(42,61,51,0.65)', fontSize: 12 }}>2,400 students live</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ width: 200, height: 200, background: 'linear-gradient(135deg, rgba(155,199,174,0.4), rgba(200,230,210,0.2))', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 100, border: '2px solid rgba(42,61,51,0.1)', zIndex: 1 }}>
                    🎓
                  </Box>
                  <Box className="hero-float-2" sx={{ position: 'absolute', bottom: '12%', right: '2%', background: 'rgba(42,61,51,0.1)', backdropFilter: 'blur(14px)', border: '1px solid rgba(42,61,51,0.2)', borderRadius: 3, p: 2, display: 'flex', alignItems: 'center', gap: 1.5, zIndex: 2 }}>
                    <Typography sx={{ fontSize: 28 }}>✅</Typography>
                    <Box>
                      <Typography sx={{ color: '#1F3529', fontWeight: 700, fontSize: 13, lineHeight: 1.2 }}>Course Completed!</Typography>
                      <Typography sx={{ color: 'rgba(42,61,51,0.65)', fontSize: 12 }}>Certificate earned</Typography>
                    </Box>
                  </Box>
                  <Box className="hero-float-3" sx={{ position: 'absolute', top: '55%', left: '3%', background: 'rgba(42,61,51,0.1)', backdropFilter: 'blur(14px)', border: '1px solid rgba(42,61,51,0.2)', borderRadius: 3, p: 2, display: 'flex', alignItems: 'center', gap: 1.5, zIndex: 2 }}>
                    <Typography sx={{ fontSize: 28 }}>⭐</Typography>
                    <Box>
                      <Typography sx={{ color: '#1F3529', fontWeight: 700, fontSize: 13, lineHeight: 1.2 }}>4.9 / 5.0</Typography>
                      <Typography sx={{ color: 'rgba(42,61,51,0.65)', fontSize: 12 }}>Student Rating</Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Container>
          </Box>

          {/* ─── Learning Modules (public) ─── */}
          <Box sx={{ py: { xs: 6, md: 9 }, background: '#DAD7B9' }}>
            <Container maxWidth="lg">
              <Box sx={{ textAlign: 'center', mb: 6 }}>
                <Chip label="Our Learning Modes" sx={{ background: 'rgba(42,61,51,0.12)', color: '#1F3529', fontWeight: 700, mb: 1.5 }} />
                <Typography variant="h3" sx={{ fontWeight: 800, color: '#1F3529', mb: 1.5 }}>5 Ways to Learn with Us</Typography>
                <Typography sx={{ color: 'rgba(42,61,51,0.65)', maxWidth: 520, mx: 'auto', fontSize: 16 }}>Pick the format that works best for you. Every mode is designed to deliver results.</Typography>
              </Box>
              <Grid container spacing={3}>
                {modules.map(mod => (
                  <Grid size={{ xs: 12, sm: 6 }} key={mod.path}>
                    <Card component={Link} to={mod.path} sx={{ borderRadius: 3, border: '1px solid rgba(42,61,51,0.14)', background: 'rgba(42,61,51,0.06)', textDecoration: 'none', display: 'block', height: '100%', transition: 'all 0.25s', '&:hover': { transform: 'translateY(-6px)', boxShadow: `0 16px 40px ${mod.color}22`, borderColor: `${mod.color}66` } }}>
                      <Box sx={{ background: `${mod.color}26`, p: 3, position: 'relative', textAlign: 'center', minHeight: 140, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Chip label={mod.tag} size="small" sx={{ position: 'absolute', top: 12, right: 12, background: mod.color, color: '#fff', fontWeight: 700, fontSize: 10 }} />
                        <Typography sx={{ fontSize: 60 }}>{mod.icon}</Typography>
                      </Box>
                      <CardContent sx={{ p: 2.5 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: mod.color, mb: 0.75, fontSize: 16 }}>{mod.title}</Typography>
                        <Typography sx={{ fontSize: 14, color: 'rgba(42,61,51,0.65)', lineHeight: 1.6, mb: 1.5 }}>{mod.desc}</Typography>
                        <Typography sx={{ fontSize: 14, fontWeight: 600, color: mod.color }}>Explore Courses →</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Container>
          </Box>

          {/* ─── Testimonials ─── */}
          <Box sx={{ py: { xs: 6, md: 8 }, background: '#DAD7B9' }}>
            <Container maxWidth="lg">
              <Box sx={{ textAlign: 'center', mb: 6 }}>
                <Chip label="Student Stories" sx={{ background: 'rgba(42,61,51,0.12)', color: '#1F3529', fontWeight: 700, mb: 1.5 }} />
                <Typography variant="h3" sx={{ fontWeight: 800, color: '#1F3529' }}>What Our Learners Say</Typography>
              </Box>
              <Grid container spacing={3}>
                {testimonials.map(t => (
                  <Grid size={{ xs: 12, md: 4 }} key={t.name}>
                    <Paper elevation={0} sx={{ p: 3.5, borderRadius: 3, border: '1px solid rgba(42,61,51,0.14)', height: '100%', background: 'rgba(42,61,51,0.06)' }}>
                      <Typography sx={{ color: '#F59E0B', fontSize: 20, mb: 2, letterSpacing: 2 }}>{'★'.repeat(t.rating)}</Typography>
                      <Typography sx={{ color: 'rgba(42,61,51,0.85)', fontSize: 14, lineHeight: 1.75, mb: 3, fontStyle: 'italic' }}>"{t.text}"</Typography>
                      <Divider sx={{ mb: 2, borderColor: 'rgba(42,61,51,0.12)' }} />
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ width: 44, height: 44, background: 'rgba(42,61,51,0.12)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{t.avatar}</Box>
                        <Box>
                          <Typography sx={{ fontWeight: 700, color: '#1F3529', fontSize: 14 }}>{t.name}</Typography>
                          <Typography sx={{ fontSize: 12, color: 'rgba(42,61,51,0.55)' }}>{t.role}</Typography>
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Container>
          </Box>

          {/* ─── CTA Banner ─── */}
          <Box sx={{ background: '#DAD7B9', py: { xs: 7, md: 10 }, textAlign: 'center' }}>
            <Container maxWidth="md">
              <Typography variant="h3" sx={{ fontWeight: 800, color: '#1F3529', mb: 1.5 }}>Ready to Transform Your Career?</Typography>
              <Typography sx={{ color: 'rgba(42,61,51,0.75)', fontSize: 17, mb: 4.5, maxWidth: 480, mx: 'auto' }}>
                Join 50,000+ learners who have already taken the first step towards their dream career.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button component={Link} to="/register" variant="contained" size="large" sx={{ background: 'white', color: '#385246', '&:hover': { background: '#E6F0EA', transform: 'translateY(-2px)' }, px: 4, py: 1.5, borderRadius: 3, fontSize: 15, fontWeight: 700, transition: 'all 0.2s' }}>
                  🚀 Get Started Free
                </Button>
                <Button component={Link} to="/login" variant="outlined" size="large" sx={{ borderColor: 'rgba(42,61,51,0.5)', color: '#1F3529', '&:hover': { borderColor: '#1F3529', background: 'rgba(42,61,51,0.1)' }, px: 4, py: 1.5, borderRadius: 3, fontSize: 15 }}>
                  Sign In →
                </Button>
              </Box>
            </Container>
          </Box>
        </>
      )}

      {/* ─── Stats Bar — always shown ─── */}
      <Box sx={{ background: '#DAD7B9', py: 4.5 }}>
        <Container maxWidth="lg">
          <Grid container spacing={2}>
            {statsBarData.map(([val, label]) => (
              <Grid size={{ xs: 6, md: 3 }} key={label} sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 900, color: '#1F3529', mb: 0.5 }}>{val}</Typography>
                <Typography sx={{ fontSize: 14, color: 'rgba(42,61,51,0.70)' }}>{label}</Typography>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ─── Features — always shown ─── */}
      <Box sx={{ py: { xs: 6, md: 9 }, background: '#DAD7B9' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Chip label="Why Positive Mind Care?" sx={{ background: 'rgba(42,61,51,0.12)', color: '#1F3529', fontWeight: 700, mb: 1.5 }} />
            <Typography variant="h3" sx={{ fontWeight: 800, color: '#1F3529', mb: 1.5 }}>Everything You Need to Succeed</Typography>
            <Typography sx={{ color: 'rgba(42,61,51,0.65)', maxWidth: 520, mx: 'auto', fontSize: 16 }}>We don't just teach — we transform. Built for real-world outcomes.</Typography>
          </Box>
          <Grid container spacing={3}>
            {features.map(f => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={f.title}>
                <Paper elevation={0} sx={{ p: 3.5, borderRadius: 3, border: '1px solid rgba(42,61,51,0.14)', textAlign: 'center', height: '100%', background: 'rgba(42,61,51,0.06)', transition: 'all 0.25s', '&:hover': { borderColor: f.color, boxShadow: `0 8px 30px ${f.color}22`, transform: 'translateY(-4px)' } }}>
                  <Box sx={{ width: 64, height: 64, background: `${f.color}26`, borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, mx: 'auto', mb: 2 }}>
                    {f.icon}
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#1F3529', mb: 0.75, fontSize: 16 }}>{f.title}</Typography>
                  <Typography sx={{ fontSize: 14, color: 'rgba(42,61,51,0.65)', lineHeight: 1.6 }}>{f.desc}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ─── Footer ─── */}
      <Box sx={{ background: '#DAD7B9', position: 'relative', pt: { xs: 6, md: 8 }, pb: { xs: 4, md: 5 } }}>
        {/* top accent line, matches header */}
        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, transparent, #9BC7AE, transparent)', opacity: 0.5 }} />

        <Container maxWidth="lg">
          <Grid container spacing={5} sx={{ mb: 5 }}>
            {/* Brand + Address + Contact */}
            <Grid size={{ xs: 12, sm: 6, md: 3.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                <Box component="img" src={pmcLogo} alt="PMC Global Academy" sx={{ width: 56, height: 56, borderRadius: '50%' }} />
                <Box>
                  <Typography sx={{ fontWeight: 800, color: '#1F3529', fontSize: 18, lineHeight: 1.2 }}>PMC</Typography>
                  <Typography sx={{ fontSize: 12, color: 'rgba(42,61,51,0.65)', letterSpacing: 1.2, textTransform: 'uppercase', fontWeight: 600 }}>Global Academy</Typography>
                </Box>
              </Box>

              <Typography sx={{ fontWeight: 700, color: '#1F3529', fontSize: 13, mb: 0.75 }}>Address:</Typography>
              <Typography sx={{ fontSize: 13, color: 'rgba(42,61,51,0.65)', lineHeight: 1.8, mb: 2.5 }}>
                804 (A), Arcadia, South City II,<br />Sector 49, Gurugram, Fatehpur,<br />Haryana 122018
              </Typography>

              <Typography sx={{ fontWeight: 700, color: '#1F3529', fontSize: 13, mb: 0.75 }}>Contact:</Typography>
              <Typography component="a" href="tel:08920530832" sx={{ fontSize: 13, color: 'rgba(42,61,51,0.65)', textDecoration: 'none', '&:hover': { color: '#1F3529' } }}>
                089205 30832
              </Typography>
            </Grid>

            {/* About */}
            <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
              <Typography sx={{ fontWeight: 700, color: '#1F3529', mb: 2, fontSize: 13, letterSpacing: 0.5, textTransform: 'uppercase' }}>About Us</Typography>
              <Typography sx={{ fontSize: 13, color: 'rgba(42,61,51,0.65)', lineHeight: 1.8 }}>
                PMC Global Academy empowers learners across India with expert-led webinars, online, hybrid and offline courses — built for real-world outcomes.
              </Typography>
            </Grid>

            {/* Site Map */}
            <Grid size={{ xs: 6, sm: 4, md: 2 }}>
              <Typography sx={{ fontWeight: 700, color: '#1F3529', mb: 2, fontSize: 13, letterSpacing: 0.5, textTransform: 'uppercase' }}>Site Map</Typography>
              {navLinks.map(link => (
                <Typography key={link.path} component={Link} to={link.path} sx={{ display: 'block', color: 'rgba(42,61,51,0.65)', fontSize: 13, mb: 1, textDecoration: 'none', '&:hover': { color: '#1F3529' } }}>{link.label}</Typography>
              ))}
            </Grid>

            {/* Company */}
            <Grid size={{ xs: 6, sm: 4, md: 2 }}>
              <Typography sx={{ fontWeight: 700, color: '#1F3529', mb: 2, fontSize: 13, letterSpacing: 0.5, textTransform: 'uppercase' }}>Company</Typography>
              {['About Us', 'Careers', 'Blog', 'Contact'].map(item => (
                <Typography key={item} component="a" href="#" sx={{ display: 'block', color: 'rgba(42,61,51,0.65)', fontSize: 13, mb: 1, textDecoration: 'none', '&:hover': { color: '#1F3529' } }}>{item}</Typography>
              ))}
            </Grid>

            {/* Support */}
            <Grid size={{ xs: 12, sm: 4, md: 2 }}>
              <Typography sx={{ fontWeight: 700, color: '#1F3529', mb: 2, fontSize: 13, letterSpacing: 0.5, textTransform: 'uppercase' }}>Support</Typography>
              {['Help Center', 'Privacy Policy', 'Terms of Service', 'Refund Policy'].map(item => (
                <Typography key={item} component="a" href="#" sx={{ display: 'block', color: 'rgba(42,61,51,0.65)', fontSize: 13, mb: 1, textDecoration: 'none', '&:hover': { color: '#1F3529' } }}>{item}</Typography>
              ))}
            </Grid>
          </Grid>

          <Box sx={{ borderTop: '1px solid rgba(42,61,51,0.12)', pt: 3, textAlign: 'center' }}>
            <Typography sx={{ fontSize: 12, color: 'rgba(42,61,51,0.5)' }}>© 2026 PMC Global Academy. All rights reserved. Made with ❤️ in India.</Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
