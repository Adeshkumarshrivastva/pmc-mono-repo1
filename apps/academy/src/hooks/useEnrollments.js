import { useState, useEffect } from 'react';
import { apiGetMyEnrollments } from '../api/endpoints';

export default function useEnrollments(user) {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('pmc_token');
    if (!token || !user) return;

    setLoading(true);
    setError('');

    apiGetMyEnrollments()
      .then(data => {
        setEnrollments(data.enrollments || []);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [user]);

  return { enrollments, loading, error };
}
