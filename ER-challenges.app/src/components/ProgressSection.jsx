const STAGES = [
  { name: 'Amériques', km: 15000 },
  { name: 'Atlantique', km: 6500 },
  { name: 'Europe', km: 4000 },
  { name: 'Asie', km: 9000 },
  { name: 'Pacifique', km: 4000 },
  { name: 'Arrivée', km: 1575 },
]

export default function ProgressSection({ totalKm, goalKm }) {
  const pct = Math.min(100, ((totalKm / goalKm) * 100).toFixed(1))
  let cumulative = 0

  return (
    <div className="box mb-5">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <p style={{ fontFamily: 'Poppins, serif', fontSize: '20px', fontWeight: 600, color: '#1e2a4a' }}>
          Tour du monde — progression
        </p>
        <span style={{ fontSize: '13px', color: '#64748b' }}>
          {totalKm?.toLocaleString()} / {goalKm?.toLocaleString()} km
        </span>
      </div>

      <progress className="progress is-success mb-5" value={pct} max="100">{pct}%</progress>

      <div className="columns is-multiline">
        {STAGES.map(stage => {
          cumulative += stage.km
          const done = totalKm >= cumulative
          const active = !done && totalKm >= cumulative - stage.km
          return (
            <div key={stage.name} className="column is-4">
              <div style={{
                padding: '1rem',
                borderRadius: '10px',
                border: `1px solid ${done ? '#bfdbfe' : active ? '#c7d2fe' : '#e8edf5'}`,
                background: done ? '#eff6ff' : active ? '#eef2ff' : '#f8f9fb',
              }}>
                <p style={{ fontSize: '13px', fontWeight: 600, color: '#1e2a4a' }}>{stage.name}</p>
                <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{stage.km.toLocaleString()} km</p>
                <span style={{
                  display: 'inline-block', marginTop: '8px',
                  padding: '2px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: 600,
                  background: done ? '#1e3a8a' : active ? '#3730a3' : '#e8edf5',
                  color: done ? '#fff' : active ? '#fff' : '#64748b',
                }}>
                  {done ? 'Franchi ✓' : active ? 'En cours' : 'À venir'}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}