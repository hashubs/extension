import { useNavigate } from 'react-router-dom';
import { Header } from '../components/header';

export function TestView() {
  const navigate = useNavigate();

  return (
    <div className="w-full h-full overflow-y-auto no-scrollbar">
      <Header title="Test View" onBack={() => navigate(-1)} />
      <h1>Test View</h1>
    </div>
  );
}
