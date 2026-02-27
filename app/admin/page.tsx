import { kv } from '@vercel/kv';

interface ToolStatus {
  status: string;
  version?: string;
  error?: string;
}

interface ProgressError {
  tool: string;
  error: string;
  suggestedFix: string;
}

interface SessionData {
  sessionId: string;
  complete: boolean;
  currentAction: string;
  timestamp: string;
  phase: string;
  toolStatus?: Record<string, ToolStatus>;
  errors?: ProgressError[];
}

interface SessionSummary {
  sessionId: string;
  complete: boolean;
  currentAction: string;
  timestamp: string;
  phase: string;
  toolCount: number;
  successCount: number;
  errorCount: number;
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getSessions(): Promise<{ sessions: SessionSummary[]; error?: string }> {
  try {
    const keys = await kv.keys('progress:*');
    const sessionKeys = (keys as string[])
      .filter((k: string) => !k.includes(':log'))
      .slice(0, 50);

    if (sessionKeys.length === 0) return { sessions: [] };

    const raw = await Promise.all(
      sessionKeys.map((key: string) => kv.get<SessionData>(key))
    );

    const sessions: SessionSummary[] = raw
      .filter((d): d is SessionData => !!d)
      .map((d) => ({
        sessionId: d.sessionId,
        complete: d.complete,
        currentAction: d.currentAction,
        timestamp: d.timestamp,
        phase: d.phase,
        toolCount: Object.keys(d.toolStatus || {}).length,
        successCount: Object.values(d.toolStatus || {}).filter(t => t.status === 'success').length,
        errorCount: (d.errors || []).length,
      }))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return { sessions };
  } catch (err) {
    return { sessions: [], error: String(err) };
  }
}

export default async function AdminPage() {
  const { sessions, error } = await getSessions();

  const completed = sessions.filter(s => s.complete).length;
  const inProgress = sessions.filter(s => !s.complete).length;
  const totalErrors = sessions.reduce((sum, s) => sum + s.errorCount, 0);

  return (
    <html lang="en">
      <body style={{
        fontFamily: "'SF Mono', 'Cascadia Code', monospace",
        background: '#050508',
        color: '#f1f5f9',
        minHeight: '100vh',
        padding: '32px',
        margin: 0,
      }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '6px',
              background: '#c97c4b', display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '13px',
            }}>SF</div>
            <h1 style={{ color: '#c97c4b', margin: 0, fontSize: '20px', fontWeight: '700' }}>
              Support Forge Admin
            </h1>
          </div>
          <p style={{ color: '#475569', fontSize: '12px', margin: 0 }}>
            Setup session activity — last 50 sessions from Vercel KV
          </p>
        </div>

        {/* KV Error */}
        {error && (
          <div style={{
            background: '#450a0a', border: '1px solid #991b1b',
            borderRadius: '8px', padding: '16px', marginBottom: '24px', fontSize: '13px',
          }}>
            KV Error: {error}
            <br /><small style={{ color: '#9ca3af' }}>Check VERCEL_KV environment variables</small>
          </div>
        )}

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '32px' }}>
          {[
            { label: 'Total Sessions', value: sessions.length, color: '#f1f5f9' },
            { label: 'Completed', value: completed, color: '#4ade80' },
            { label: 'In Progress', value: inProgress, color: '#c97c4b' },
            { label: 'Total Errors', value: totalErrors, color: totalErrors > 0 ? '#f87171' : '#4ade80' },
          ].map(stat => (
            <div key={stat.label} style={{
              background: '#0f0f14', border: '1px solid #1f2937',
              borderRadius: '8px', padding: '16px', textAlign: 'center',
            }}>
              <div style={{ fontSize: '26px', fontWeight: 'bold', color: stat.color }}>{stat.value}</div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Sessions List */}
        <h2 style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>
          Recent Sessions
        </h2>

        {sessions.length === 0 && !error && (
          <p style={{ color: '#475569', fontSize: '13px' }}>No sessions found in KV store.</p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {sessions.map(s => (
            <div key={s.sessionId} style={{
              background: '#0f0f14',
              border: `1px solid ${s.complete ? '#14532d' : s.errorCount > 0 ? '#7f1d1d' : '#1f2937'}`,
              borderRadius: '8px', padding: '10px 14px',
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 80px 80px 140px',
              gap: '12px', alignItems: 'center', fontSize: '12px',
            }}>
              <div>
                <div style={{ color: '#64748b', fontSize: '10px', marginBottom: '2px' }}>{s.sessionId}</div>
                <div style={{ color: '#cbd5e1', fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {s.currentAction}
                </div>
              </div>
              <div style={{ color: '#94a3b8', fontSize: '11px' }}>{s.phase}</div>
              <div style={{
                color: s.complete ? '#4ade80' : '#c97c4b', fontSize: '11px', textAlign: 'center',
                background: s.complete ? 'rgba(74,222,128,0.1)' : 'rgba(201,124,75,0.1)',
                borderRadius: '4px', padding: '2px 6px',
              }}>
                {s.complete ? 'Done' : 'Live'}
              </div>
              <div style={{ color: s.errorCount > 0 ? '#f87171' : '#4ade80', fontSize: '11px', textAlign: 'center' }}>
                {s.successCount}/{s.toolCount} tools
                {s.errorCount > 0 && <span style={{ display: 'block', fontSize: '10px' }}>{s.errorCount} errors</span>}
              </div>
              <div style={{ color: '#475569', fontSize: '10px', textAlign: 'right' }}>
                {new Date(s.timestamp).toLocaleString('en-US', {
                  month: 'short', day: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                })}
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '32px', borderTop: '1px solid #1f2937', paddingTop: '16px', fontSize: '11px', color: '#374151' }}>
          Support Forge Admin · Sessions expire after 1 hour · <a href="/setup" style={{ color: '#c97c4b' }}>Back to Setup Dashboard</a>
        </div>
      </body>
    </html>
  );
}
