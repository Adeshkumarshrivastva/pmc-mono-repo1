import { useState, useEffect } from 'react';
import { apiGetCourses } from '../api/endpoints';

export default function useCourses(type) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!type) return;
    setLoading(true);
    setError('');
    apiGetCourses(type)
      .then(data => {
        setCourses(data.courses || []);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [type]);

  return { courses, loading, error };
}
