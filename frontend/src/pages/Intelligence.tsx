import { useState, useEffect } from 'react';
import { Brain, Activity, Target, Zap, Clock, ShieldAlert, Cpu } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

export default function Intelligence() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8000/ml/metrics')
      .then(res => res.json())
      .then(data => {
        setMetrics(data);
        setLoading(false);
      })
      .catch(e => {
        console.error(e);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="p-8 text-slate-400">Loading Intelligence Models...</div>;
  }

  const accuracy = metrics ? metrics.accuracy * 100 : 0;
  const precision = metrics ? metrics.precision * 100 : 0;
  const recall = metrics ? metrics.recall * 100 : 0;
  const f1 = metrics ? metrics.f1_score * 100 : 0;
  
  const featureImportances = metrics ? [
    { subject: 'Steps', A: metrics.feature_importances.num_steps * 100, fullMark: 100 },
    { subject: 'Tools', A: metrics.feature_importances.num_tools * 100, fullMark: 100 },
    { subject: 'External', A: metrics.feature_importances.external_services * 100, fullMark: 100 },
    { subject: 'History', A: metrics.feature_importances.historical_failure * 100, fullMark: 100 }
  ] : [];

  return (
    <div className="p-8 pb-32">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">ML Intelligence</h1>
          <p className="text-slate-400 mt-2">Scikit-Learn Intent Classification & Success Prediction Pipeline</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="glass-panel rounded-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Target size={64} />
          </div>
          <p className="text-slate-400 text-sm font-medium mb-1">Model Accuracy</p>
          <div className="flex items-end gap-3">
            <h3 className="text-3xl font-bold text-slate-200">{accuracy.toFixed(1)}%</h3>
            <span className="text-emerald-400 text-sm mb-1 font-medium">RandomForest</span>
          </div>
        </div>

        <div className="glass-panel rounded-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Activity size={64} />
          </div>
          <p className="text-slate-400 text-sm font-medium mb-1">Precision</p>
          <div className="flex items-end gap-3">
            <h3 className="text-3xl font-bold text-slate-200">{precision.toFixed(1)}%</h3>
          </div>
        </div>
        
        <div className="glass-panel rounded-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Activity size={64} />
          </div>
          <p className="text-slate-400 text-sm font-medium mb-1">Recall</p>
          <div className="flex items-end gap-3">
            <h3 className="text-3xl font-bold text-slate-200">{recall.toFixed(1)}%</h3>
          </div>
        </div>

        <div className="glass-panel rounded-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Brain size={64} />
          </div>
          <p className="text-slate-400 text-sm font-medium mb-1">F1 Score</p>
          <div className="flex items-end gap-3">
            <h3 className="text-3xl font-bold text-slate-200">{f1.toFixed(1)}%</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-panel rounded-xl p-6">
          <h3 className="text-lg font-semibold text-slate-200 mb-6 flex items-center gap-2">
            <Zap size={20} className="text-purple-400" />
            Feature Importance (RandomForest)
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={featureImportances}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="subject" tick={{fill: '#94a3b8', fontSize: 12}} />
                <Radar name="Importance" dataKey="A" stroke="#a855f7" fill="#a855f7" fillOpacity={0.3} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
