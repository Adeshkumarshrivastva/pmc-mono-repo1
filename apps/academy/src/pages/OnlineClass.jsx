import CoursePage from '../components/CoursePage';
import useCourses from '../hooks/useCourses';

const pageConfig = {
  icon: '🖥️',
  title: 'Online Class',
  tagline: 'Scheduled live virtual classes. Real trainer, real feedback — from the comfort of home.',
  desc: 'Online Classes are live, instructor-led sessions on a fixed schedule. Connect via video call with your trainer and batchmates, get real-time feedback, and learn collaboratively without leaving home.',
  tag: 'LIVE VIRTUAL',
  tagColor: '#F59E0B',
  tagBg: '#FEF3C7',
  accentColor: '#D97706',
  highlights: [
    { icon: '📅', value: 'Fixed', label: 'Schedule Batches' },
    { icon: '👨‍🏫', value: 'Live', label: 'Trainer Sessions' },
    { icon: '👥', value: '15-20', label: 'Batch Size' },
    { icon: '🎥', value: 'Recorded', label: 'Class Playback' },
  ],
};

export default function OnlineClass({ onEnroll }) {
  const { courses, loading, error } = useCourses('online-class');
  return (
    <CoursePage
      config={{ ...pageConfig, courses }}
      loading={loading}
      error={error}
      courseType="online-class"
      onEnroll={onEnroll}
    />
  );
}
