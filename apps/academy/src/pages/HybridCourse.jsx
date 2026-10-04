import CoursePage from '../components/CoursePage';
import useCourses from '../hooks/useCourses';

const pageConfig = {
  icon: '🔄',
  title: 'Hybrid Course',
  tagline: 'Online flexibility meets offline depth. The ultimate learning experience.',
  desc: 'Hybrid courses combine the best of online and offline learning. Study theory online at your own pace, then reinforce with in-person weekend workshops, labs, and mentor sessions at our centers.',
  tag: 'HYBRID',
  tagColor: '#10B981',
  tagBg: '#D1FAE5',
  accentColor: '#10B981',
  highlights: [
    { icon: '🏫', value: '15+', label: 'Centers Across India' },
    { icon: '📅', value: 'Weekend', label: 'Offline Sessions' },
    { icon: '💻', value: 'Online', label: 'Theory Classes' },
    { icon: '🤝', value: '1-on-1', label: 'Mentor Sessions' },
  ],
};

export default function HybridCourse({ onEnroll }) {
  const { courses, loading, error } = useCourses('hybrid-course');
  return (
    <CoursePage
      config={{ ...pageConfig, courses }}
      loading={loading}
      error={error}
      courseType="hybrid-course"
      onEnroll={onEnroll}
    />
  );
}
