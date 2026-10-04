import CoursePage from '../components/CoursePage';
import useCourses from '../hooks/useCourses';

const pageConfig = {
  icon: '🏫',
  title: 'Offline Course',
  tagline: 'Traditional classroom excellence at our state-of-the-art learning centers across India.',
  desc: 'Our Offline Courses bring the power of face-to-face learning. Attend in-person classes at any of our 15+ centers, get hands-on training, network with peers, and benefit from direct faculty interaction.',
  tag: 'CLASSROOM',
  tagColor: '#EF4444',
  tagBg: '#FEE2E2',
  accentColor: '#EF4444',
  highlights: [
    { icon: '📍', value: '15+', label: 'City Centers' },
    { icon: '🖨️', value: 'Free', label: 'Study Material' },
    { icon: '🤝', value: 'Direct', label: 'Faculty Access' },
    { icon: '💼', value: '100%', label: 'Placement Support' },
  ],
};

export default function OfflineCourse({ onEnroll }) {
  const { courses, loading, error } = useCourses('offline-course');
  return (
    <CoursePage
      config={{ ...pageConfig, courses }}
      loading={loading}
      error={error}
      courseType="offline-course"
      onEnroll={onEnroll}
    />
  );
}
