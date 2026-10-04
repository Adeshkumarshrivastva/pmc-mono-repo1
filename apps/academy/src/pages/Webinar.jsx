import CoursePage from '../components/CoursePage';
import useCourses from '../hooks/useCourses';

const pageConfig = {
  icon: '🎤',
  title: 'Webinar / Master Class',
  tagline: "Learn live from India's top industry experts. Ask questions, get answers — in real time.",
  desc: 'Our Webinars and Master Classes are high-impact live sessions led by industry veterans. Each session is interactive, packed with insights, and designed to give you maximum learning in minimum time.',
  tag: 'LIVE SESSION',
  tagColor: '#6C3CE1',
  tagBg: '#EEE9FF',
  accentColor: '#6C3CE1',
  highlights: [
    { icon: '🎙️', value: '50+', label: 'Live Sessions/Month' },
    { icon: '👥', value: '2,400+', label: 'Avg. Attendees' },
    { icon: '🎥', value: '500+', label: 'Recorded Sessions' },
    { icon: '🏆', value: '150+', label: 'Expert Mentors' },
  ],
};

export default function Webinar({ onEnroll }) {
  const { courses, loading, error } = useCourses('webinar');
  return (
    <CoursePage
      config={{ ...pageConfig, courses }}
      loading={loading}
      error={error}
      courseType="webinar"
      onEnroll={onEnroll}
    />
  );
}
