import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';

import MaterialCard, { GREEN } from './MaterialCard';
import FinalAssessmentCard from './FinalAssessmentCard';

const COURSE_LABELS = {
  'clinical-intake': {
    title: 'Clinical Intake Assessment',
    desc: '5 parts, each with its own quiz — pass one to unlock the next. Finish all 5 to unlock the final certification assessment.',
  },
};

// Groups a flat materials array into { standalone: [...], groups: { [courseGroup]: [...ordered materials] } }
// so a sequential course (5 parts that unlock one after another) never gets
// visually mixed in with unrelated one-off materials.
export function groupMaterials(materials) {
  const standalone = [];
  const groups = {};
  for (const m of materials) {
    if (m.courseGroup) {
      (groups[m.courseGroup] ||= []).push(m);
    } else {
      standalone.push(m);
    }
  }
  Object.values(groups).forEach(list => list.sort((a, b) => (a.order || 0) - (b.order || 0)));
  return { standalone, groups };
}

export function SequentialCourseSection({ courseGroup, materials, user, showToast }) {
  const meta = COURSE_LABELS[courseGroup] || { title: courseGroup, desc: 'Complete each part in order to earn your certificate.' };

  return (
    <Paper elevation={0} sx={{ p: { xs: 1.75, sm: 2.25 }, borderRadius: 3, border: '1.5px solid rgba(56,82,70,0.18)', background: 'rgba(56,82,70,0.03)', overflow: 'hidden' }}>
      <Box sx={{ mb: 1.75, px: 0.5 }}>
        <Typography sx={{ fontWeight: 800, color: '#1F3529', fontSize: 16, display: 'flex', alignItems: 'center', gap: 1 }}>
          🎓 {meta.title}
        </Typography>
        <Typography sx={{ fontSize: 13, color: 'rgba(42,61,51,0.6)', mt: 0.25 }}>{meta.desc}</Typography>
      </Box>

      {/* Plain CSS grid — MUI's Grid uses negative margins for its gutters,
          which spill past a bordered parent's edge at some widths. */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
        {materials.map(m => <MaterialCard key={m._id} material={m} user={user} showToast={showToast} />)}
      </Box>
      <Box sx={{ mt: 1.5 }}>
        <FinalAssessmentCard courseGroup={courseGroup} showToast={showToast} />
      </Box>
    </Paper>
  );
}

export { GREEN };
