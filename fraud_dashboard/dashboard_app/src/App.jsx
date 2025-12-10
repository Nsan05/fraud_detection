import { useState, useEffect } from 'react';
import { 
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  BarChart, Bar, Legend
} from 'recharts';
import { Activity, ShieldAlert, BadgeCheck, AlertTriangle } from 'lucide-react';

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/analysis_results.json')
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load data", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="dashboard-container">Loading analysis...</div>;
  if (!data) return <div className="dashboard-container">Error loading data. Ensure analysis_results.json is in public folder.</div>;

  const { stats, anomaly_comparison, total_records, total_anomalies, samples } = data;
  const fraudPercentage = ((total_anomalies / total_records) * 100).toFixed(2);
  
  // Prepare Comparison Data for Bar Chart
  const comparisonData = Object.keys(anomaly_comparison).map(key => ({
    feature: key,
    Normal: anomaly_comparison[key]['false'], 
    Fraud: anomaly_comparison[key]['true']
  })).filter(item => ['distance_from_home', 'distance_from_last_transaction', 'ratio_to_median_price'].includes(item.feature));

  return (
    <div className="dashboard-container">
      <header>
        <h1>Fraud Detection Insights</h1>
        <div className="subtitle">AI-Powered Transaction Analysis Dashboard</div>
      </header>

      {/* Metrics Row */}
      <div className="metrics-grid">
        <div className="glass-card metric-item">
          <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
            <Activity size={20} color="var(--accent-primary)" />
            <h3>Total Transactions</h3>
          </div>
          <div className="metric-value">{total_records.toLocaleString()}</div>
        </div>

        <div className="glass-card metric-item">
          <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
            <ShieldAlert size={20} color="var(--accent-danger)" />
            <h3>Detected Anomalies</h3>
          </div>
          <div className="metric-value" style={{color: 'var(--accent-danger)'}}>{total_anomalies.toLocaleString()}</div>
        </div>

        <div className="glass-card metric-item">
          <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
            <AlertTriangle size={20} color="orange" />
            <h3>Fraud Rate</h3>
          </div>
          <div className="metric-value">{fraudPercentage}%</div>
        </div>
        
         <div className="glass-card metric-item">
          <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
            <BadgeCheck size={20} color="var(--accent-success)" />
            <h3>Model Status</h3>
          </div>
          <div className="metric-value" style={{color: 'var(--accent-success)', fontSize: '1.5rem'}}>Optimized</div>
        </div>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '1.5rem', marginBottom: '1.5rem'}}>
        {/* Fraud Drivers / Explanations */}
        <div className="glass-card">
           <h2 className="chart-title">Why are these transactions flagged?</h2>
           <div style={{display: 'flex', gap: '2rem', alignItems: 'center'}}>
               <div style={{flex: 1}}>
                 <p style={{color: 'var(--text-secondary)', marginBottom: '1rem'}}>
                   The model identifies fraud by looking for significant deviations from established behavioral patterns. 
                   Key drivers for the detected anomalies include:
                 </p>
                 <ul style={{listStyle: 'none', padding: 0, color: 'var(--text-primary)'}}>
                   <li style={{marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                     <span style={{width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-danger)'}}></span>
                     <strong>Distance Deviations:</strong> Transactions occurring unusually far from home or previous locations.
                   </li>
                   <li style={{marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                      <span style={{width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-danger)'}}></span>
                     <strong>Price Anomalies:</strong> Purchase amounts that are drastically higher than the median price.
                   </li>
                 </ul>
               </div>
               <div style={{height: 250, flex: 1}}>
                  <ResponsiveContainer>
                    <BarChart
                        data={comparisonData}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                      >
                       <XAxis type="number" hide />
                       <YAxis dataKey="feature" type="category" width={100} tickFormatter={(val) => val.split('_')[0].charAt(0).toUpperCase() + val.split('_')[0].slice(1) + '...'} stroke="var(--text-secondary)" />
                       <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--card-border)' }} />
                       <Legend />
                       <Bar dataKey="Normal" fill="var(--accent-success)" barSize={20} />
                       <Bar dataKey="Fraud" fill="var(--accent-danger)" barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
               </div>
           </div>
        </div>

        {/* Scatter Plot Small */}
        <div className="glass-card">
          <h2 className="chart-title">Anomaly Distribution</h2>
          <div style={{ height: 250, width: '100%' }}>
            <ResponsiveContainer>
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis type="number" dataKey="distance_from_home" name="Dist" unit="km" stroke="var(--text-secondary)" fontSize={12} />
                <YAxis type="number" dataKey="ratio_to_median_price" name="Price Ratio" stroke="var(--text-secondary)" fontSize={12} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--card-border)' }} />
                <Scatter name="Transactions" data={samples} fill="#8884d8">
                  {samples.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.is_anomaly ? 'var(--accent-danger)' : 'var(--accent-success)'} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

       {/* Top Risks Table */}
      <div className="glass-card">
        <h2 className="chart-title">Top High-Risk Transactions (Action Required)</h2>
        <div style={{overflowX: 'auto'}}>
          <table style={{width: '100%', borderCollapse: 'collapse', textAlign: 'left', marginTop: '1rem'}}>
             <thead>
               <tr style={{borderBottom: '1px solid var(--card-border)', color: 'var(--text-secondary)'}}>
                 <th style={{padding: '1rem'}}>Risk Score (Raw)</th>
                 <th style={{padding: '1rem'}}>Global Risk Factors</th>
                 <th style={{padding: '1rem'}}>Distance (Home)</th>
                 <th style={{padding: '1rem'}}>Price Ratio</th>
                 <th style={{padding: '1rem'}}>Status</th>
               </tr>
             </thead>
             <tbody>
               {data.top_risks && data.top_risks.map((tx, idx) => (
                 <tr key={idx} style={{borderBottom: '1px solid rgba(255,255,255,0.05)'}}>
                   <td style={{padding: '1rem', fontFamily: 'monospace'}}>{tx.anomaly_score_raw.toFixed(4)}</td>
                   <td style={{padding: '1rem', color: 'var(--accent-danger)', fontWeight: 500}}>{tx.risk_factors}</td>
                   <td style={{padding: '1rem'}}>{tx.distance_from_home.toFixed(2)} km</td>
                   <td style={{padding: '1rem'}}>{tx.ratio_to_median_price.toFixed(2)}x</td>
                    <td style={{padding: '1rem'}}>
                      <span style={{backgroundColor: 'rgba(255, 107, 107, 0.2)', color: 'var(--accent-danger)', padding: '0.25rem 0.75rem', borderRadius: '2rem', fontSize: '0.85rem'}}>
                        High Risk
                      </span>
                    </td>
                 </tr>
               ))}
             </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default App;
