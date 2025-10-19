import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const { user, userRole, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/auth');
      } else if (userRole === 'teacher') {
        navigate('/teacher');
      } else if (userRole === 'student') {
        navigate('/student');
      }
    }
  }, [user, userRole, loading, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-hero">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary-foreground" />
        <p className="mt-4 text-lg text-primary-foreground">Loading...</p>
      </div>
    </div>
  );
};

export default Index;
