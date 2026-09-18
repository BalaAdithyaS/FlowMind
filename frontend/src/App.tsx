import { useState } from 'react';
import Layout from './components/Layout';
import CommandCenter from './pages/CommandCenter';
import CreateWorkflow from './pages/CreateWorkflow';
import Intelligence from './pages/Intelligence';
import Workflows from './pages/Workflows';
import Executions from './pages/Executions';
import Integrations from './pages/Integrations';
import Settings from './pages/Settings';

function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');

  return (
    <Layout currentTab={currentTab} onTabChange={setCurrentTab}>
      {currentTab === 'dashboard' && <CommandCenter />}
      {currentTab === 'create' && <CreateWorkflow />}
      {currentTab === 'workflows' && <Workflows />}
      {currentTab === 'executions' && <Executions />}
      {currentTab === 'intelligence' && <Intelligence />}
      {currentTab === 'integrations' && <Integrations />}
      {currentTab === 'settings' && <Settings />}
    </Layout>
  );
}

export default App;
