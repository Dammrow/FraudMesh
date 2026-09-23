import { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import GuidedDemoBar from './components/GuidedDemoBar.jsx';
import AlertToast from './components/AlertToast.jsx';
import OverviewDashboard from './views/OverviewDashboard.jsx';
import ReturnInvestigation from './views/ReturnInvestigation.jsx';
import NetworkGraphView from './views/NetworkGraphView.jsx';
import CaseFileView from './views/CaseFileView.jsx';
import HumanReviewPanel from './views/HumanReviewPanel.jsx';
import AuditTrailView from './views/AuditTrailView.jsx';
import {
  getCurrentDemoStepData, subscribeDemoStep, setDemoStep, getDemoSteps, advanceDemoStep,
} from './services/caseState.js';

const HERO_CASE_ID = 'PX-2047';

function AppInner() {
  const navigate = useNavigate();
  const location = useLocation();
  const [toastVisible, setToastVisible] = useState(false);
  const [demoStep, setDemoStepState] = useState(0);
  const [activeCaseId, setActiveCaseId] = useState(HERO_CASE_ID);
  const [investigationPhase, setInvestigationPhase] = useState('individual'); // 'individual' | 'running' | 'network'

  // Show alert toast after 2.5s on first load
  useEffect(() => {
    const timer = setTimeout(() => setToastVisible(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  // Subscribe to demo step changes
  useEffect(() => {
    const unsub = subscribeDemoStep(step => setDemoStepState(step));
    return unsub;
  }, []);

  // Navigate based on demo step
  const handleDemoNav = (step) => {
    const steps = getDemoSteps();
    const s = steps[step];
    if (!s) return;
    setDemoStep(step);
    if (s.view === 'dashboard') navigate('/');
    else if (s.view === 'investigation') {
      navigate('/investigation');
      if (s.phase === 'running') setInvestigationPhase('running');
      else setInvestigationPhase('individual');
    }
    else if (s.view === 'network') navigate('/network');
    else if (s.view === 'casefile') navigate('/case');
    else if (s.view === 'review') navigate('/review');
    else if (s.view === 'audit') navigate('/audit');
  };

  const handleDemoNext = () => {
    const next = advanceDemoStep();
    handleDemoNav(next);
  };

  const handleDemoPrev = () => {
    const prev = Math.max(0, demoStep - 1);
    setDemoStep(prev);
    handleDemoNav(prev);
  };

  const handleInvestigateDemoClick = () => {
    setActiveCaseId(HERO_CASE_ID);
    navigate('/investigation');
    setInvestigationPhase('individual');
    setDemoStep(1);
  };

  const currentPath = location.pathname;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
      <Navbar
        activePath={currentPath}
        onNavigate={(path) => navigate(path)}
        onDemoClick={handleInvestigateDemoClick}
      />

      <div className="main-content" style={{ paddingBottom: '72px' }}>
        <Routes>
          <Route path="/" element={
            <OverviewDashboard
              onCaseSelect={(id) => { setActiveCaseId(id); navigate('/investigation'); }}
              onDemoClick={handleInvestigateDemoClick}
            />
          } />
          <Route path="/investigation" element={
            <ReturnInvestigation
              caseId={activeCaseId}
              initialPhase={investigationPhase}
              onPhaseChange={setInvestigationPhase}
              onViewNetwork={() => navigate('/network')}
              onViewCase={() => navigate('/case')}
              onViewReview={() => navigate('/review')}
            />
          } />
          <Route path="/network" element={
            <NetworkGraphView
              caseId={activeCaseId}
              onViewCase={() => navigate('/case')}
            />
          } />
          <Route path="/case" element={
            <CaseFileView
              caseId={activeCaseId}
              onViewReview={() => navigate('/review')}
              onViewNetwork={() => navigate('/network')}
              onViewAudit={() => navigate('/audit')}
            />
          } />
          <Route path="/review" element={
            <HumanReviewPanel
              caseId={activeCaseId}
              onDecisionMade={() => navigate('/audit')}
            />
          } />
          <Route path="/audit" element={
            <AuditTrailView caseId={activeCaseId} />
          } />
        </Routes>
      </div>

      {toastVisible && (
        <AlertToast
          caseId="PX-2047"
          risk={91}
          onDismiss={() => setToastVisible(false)}
          onInvestigate={handleInvestigateDemoClick}
        />
      )}

      <GuidedDemoBar
        currentStep={demoStep}
        steps={getDemoSteps()}
        onStep={handleDemoNav}
        onNext={handleDemoNext}
        onPrev={handleDemoPrev}
      />
    </div>
  );
}

export default function App() {
  return (
    <HashRouter>
      <AppInner />
    </HashRouter>
  );
}
