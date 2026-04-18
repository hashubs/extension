import { Route, Routes } from 'react-router-dom';
import { ActionFiltersView } from './ActionFilters';
import { ActionsView } from './Actions';

export function ActionsRoutes() {
  return (
    <Routes>
      <Route path="/" element={<ActionsView />} />
      <Route path="/filters" element={<ActionFiltersView />} />
    </Routes>
  );
}
