import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';

export default function CoursePage({ config, loading, error, courseType, onEnroll }) {
  const { icon, title, tagline, desc, tag, accentColor, courses = [], highlights } = config;

  return (
    <Box>
      {/* Hero */}
      <Box sx={{ background: '#DAD7B9', borderBottom: `3px solid ${accentColor}40`, py: { xs: 7, md: 10 }, textAlign: 'center' }}>
        <Container maxWidth="md">
          <Chip
            label={`${icon} ${tag}`}
            sx={{ background: `${accentColor}26`, color: accentColor, fontWeight: 700, mb: 2.5, fontSize: 13, px: 1, height: 32 }}
          />
          <Typography variant="h3" sx={{ fontWeight: 800, color: '#1F3529', mb: 2 }}>{title}</Typography>
          <Typography sx={{ color: 'rgba(42,61,51,0.7)', fontSize: 17, mb: 4, maxWidth: 580, mx: 'auto', lineHeight: 1.75 }}>{tagline}</Typography>
          <Button
            variant="contained"
            size="large"
            sx={{ background: accentColor, '&:hover': { background: accentColor, filter: 'brightness(1.12)', transform: 'translateY(-2px)' }, px: 4, py: 1.5, borderRadius: 3, fontSize: 15, fontWeight: 700, transition: 'all 0.2s' }}
            onClick={() => courses[0] && onEnroll?.({ courseId: courses[0]._id, courseTitle: courses[0].title, price: courses[0].price, courseType })}
          >
            🚀 Enroll Now — It's Free
          </Button>
        </Container>
      </Box>

      {/* About */}
      <Box sx={{ background: '#DAD7B9', py: 3 }}>
        <Container maxWidth="md">
          <Typography sx={{ color: 'rgba(42,61,51,0.75)', textAlign: 'center', lineHeight: 1.8, fontSize: 15 }}>{desc}</Typography>
        </Container>
      </Box>

      {/* Highlights */}
      <Box sx={{ py: 5, background: '#DAD7B9', borderBottom: '1px solid rgba(42,61,51,0.1)' }}>
        <Container maxWidth="lg">
          <Grid container spacing={2} justifyContent="center">
            {highlights.map(h => (
              <Grid item xs={6} sm={3} key={h.label}>
                <Box sx={{ textAlign: 'center', p: 1 }}>
                  <Box sx={{ width: 56, height: 56, background: `${accentColor}26`, borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, mx: 'auto', mb: 1 }}>
                    {h.icon}
                  </Box>
                  <Typography sx={{ fontWeight: 800, fontSize: 24, color: accentColor }}>{h.value}</Typography>
                  <Typography sx={{ fontSize: 13, color: 'rgba(42,61,51,0.65)' }}>{h.label}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Courses */}
      <Box sx={{ py: { xs: 5, md: 8 }, background: '#DAD7B9' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 5 }}>
            <Chip label="Available Courses" sx={{ background: `${accentColor}26`, color: accentColor, fontWeight: 600, mb: 1.5 }} />
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#1F3529', mb: 1 }}>Pick Your Course</Typography>
            <Typography sx={{ color: 'rgba(42,61,51,0.65)', fontSize: 15 }}>All courses include certificate, mentor support & lifetime access.</Typography>
          </Box>

          {loading ? (
            <Box sx={{ textAlign: 'center', py: 10 }}>
              <CircularProgress sx={{ color: accentColor }} size={48} thickness={4} />
              <Typography sx={{ mt: 2.5, color: 'rgba(42,61,51,0.65)' }}>Loading courses...</Typography>
            </Box>
          ) : error ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography sx={{ fontSize: 44, mb: 1.5 }}>⚠️</Typography>
              <Typography sx={{ fontWeight: 700, color: '#EF4444', mb: 0.5 }}>Could not load courses</Typography>
              <Typography sx={{ fontSize: 14, color: 'rgba(42,61,51,0.55)' }}>{error}</Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {courses.map(course => (
                <Grid item xs={12} sm={6} md={4} key={course._id || course.title}>
                  <Card sx={{ borderRadius: 3, border: '1px solid rgba(42,61,51,0.14)', background: 'rgba(42,61,51,0.06)', height: '100%', display: 'flex', flexDirection: 'column', transition: 'all 0.25s', '&:hover': { transform: 'translateY(-6px)', boxShadow: `0 16px 40px ${accentColor}22`, borderColor: `${accentColor}66` } }}>
                    <Box sx={{ background: `${accentColor}26`, p: 3, textAlign: 'center', position: 'relative', minHeight: 170, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography sx={{ fontSize: 72, lineHeight: 1 }}>{course.emoji}</Typography>
                      <Chip label={course.level} size="small" sx={{ position: 'absolute', top: 12, right: 12, background: accentColor, color: '#fff', fontWeight: 700, fontSize: 10 }} />
                    </Box>
                    <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 2.5 }}>
                      <Chip label={tag} size="small" sx={{ background: `${accentColor}26`, color: accentColor, fontWeight: 600, mb: 1.5, alignSelf: 'flex-start', fontSize: 10 }} />
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#1F3529', mb: 0.75, fontSize: 15, lineHeight: 1.4 }}>{course.title}</Typography>
                      <Typography sx={{ fontSize: 13, color: 'rgba(42,61,51,0.65)', mb: 2, lineHeight: 1.6, flexGrow: 1 }}>{course.desc}</Typography>
                      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                        <Typography sx={{ fontSize: 12, color: 'rgba(42,61,51,0.55)' }}>⏱ {course.duration}</Typography>
                        <Typography sx={{ fontSize: 12, color: 'rgba(42,61,51,0.55)' }}>👨‍🎓 {course.students}</Typography>
                        <Typography sx={{ fontSize: 12, color: 'rgba(42,61,51,0.55)' }}>⭐ {course.rating}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 2, borderTop: '1px solid rgba(42,61,51,0.12)' }}>
                        <Box>
                          <Typography sx={{ fontWeight: 800, fontSize: 21, color: accentColor }}>₹{course.price}</Typography>
                          {course.oldPrice && <Typography sx={{ fontSize: 13, color: 'rgba(42,61,51,0.5)', textDecoration: 'line-through' }}>₹{course.oldPrice}</Typography>}
                        </Box>
                        <Button
                          variant="contained"
                          size="small"
                          sx={{ background: accentColor, '&:hover': { background: accentColor, filter: 'brightness(1.1)' }, borderRadius: 2.5, px: 2.5, fontWeight: 700 }}
                          onClick={() => onEnroll?.({ courseId: course._id, courseTitle: course.title, price: course.price, courseType })}
                        >
                          Enroll
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Container>
      </Box>
    </Box>
  );
}
