import { Layout } from '@/ui/components/layout';
import { ViewNotFound } from '@/ui/components/view-not-found/view-not-found';
import { useNavigate } from 'react-router-dom';

export function NotFoundView() {
  const navigate = useNavigate();

  return (
    <Layout wrapped={false}>
      <ViewNotFound
        onBack={() =>
          navigate('/overview', { replace: true, state: { direction: 'back' } })
        }
        backText="Back to Home"
      />
    </Layout>
  );
}
