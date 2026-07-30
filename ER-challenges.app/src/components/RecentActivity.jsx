export default function RecentActivity({ runs }) {
  const timeAgo = (date) => {
    const diff = Math.floor((new Date() - new Date(date)) / 60000)
    if (diff < 60) return `il y a ${diff} min`
    if (diff < 1440) return `il y a ${Math.floor(diff / 60)}h`
    return `il y a ${Math.floor(diff / 1440)}j`
  }

  const COLORS = ['#dbeafe', '#e0e7ff', '#fce7f3', '#dcfce7', '#fef3c7']
  const TEXT = ['#1e3a8a', '#3730a3', '#9d174d', '#14532d', '#92400e']

  return (
    <div className="box">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <p style={{ fontFamily: 'Poppins, serif', fontSize: '20px', fontWeight: 600, color: '#1e2a4a' }}>Activité récente</p>
        <span style={{ fontSize: '12px', color: '#64748b' }}>Derniers runs</span>
      </div>
      {runs?.map((run, i) => (
        <div key={run._id} style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          padding: '12px 0',
          borderBottom: i < runs.length - 1 ? '1px solid #f1f5f9' : 'none',
        }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
            background: COLORS[i % 5], color: TEXT[i % 5],
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '11px', fontWeight: 600,
          }}>
            {run.member?.name?.split(' ').map(n => n[0]).join('')}
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '14px', fontWeight: 500, color: '#1e2a4a' }}>{run.member?.name}</p>
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '1px' }}>
              {run.note || 'Run'} · {timeAgo(run.date)}
            </p>
          </div>
          <span style={{
            padding: '4px 10px', borderRadius: '6px',
            background: '#dcfce7', color: '#14532d',
            fontSize: '13px', fontWeight: 600,
          }}>
            + {run.km} km
          </span>
        </div>
      ))}
    </div>
  )
}