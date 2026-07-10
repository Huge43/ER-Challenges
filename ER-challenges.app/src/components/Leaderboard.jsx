export default function Leaderboard({ members }) {
  const medals = ['🥇', '🥈', '🥉']
  const COLORS = ['#dbeafe', '#e0e7ff', '#fce7f3', '#dcfce7', '#fef3c7', '#fee2e2', '#f3e8ff', '#e0f2fe', '#f0fdf4', '#fdf4ff']
  const TEXT = ['#1e3a8a', '#3730a3', '#9d174d', '#14532d', '#92400e', '#991b1b', '#581c87', '#0c4a6e', '#14532d', '#581c87']

  return (
    <div className="box">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <p style={{ fontFamily: 'EB Garamond, serif', fontSize: '20px', fontWeight: 600, color: '#1e2a4a' }}>Classement</p>
        <span style={{ fontSize: '12px', color: '#64748b' }}>{members?.length} membres</span>
      </div>
      <table className="table is-fullwidth is-hoverable">
        <thead>
          <tr>
            <th>#</th>
            <th>Membre</th>
            <th className="has-text-right">Total km</th>
          </tr>
        </thead>
        <tbody>
          {members?.map((m, i) => (
            <tr key={m._id}>
              <td style={{ width: '40px' }}>
                <span style={{ fontSize: i < 3 ? '16px' : '13px', color: '#64748b' }}>
                  {medals[i] || i + 1}
                </span>
              </td>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    background: COLORS[i] || '#f1f5f9',
                    color: TEXT[i] || '#475569',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '11px', fontWeight: 600, flexShrink: 0,
                  }}>
                    {m.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: 500, color: '#1e2a4a' }}>{m.name}</span>
                </div>
              </td>
              <td className="has-text-right">
                <span style={{
                  display: 'inline-block', padding: '3px 10px', borderRadius: '6px',
                  background: '#eff6ff', color: '#1e3a8a',
                  fontSize: '13px', fontWeight: 600,
                }}>
                  {m.totalKm} km
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}