export default function StatsCards({ data }) {
  const pct = data.goalKm ? ((data.totalKm / data.goalKm) * 100).toFixed(1) : 0

  const cards = [
    { label: 'Km cumulés', value: data.totalKm?.toLocaleString(), sub: `sur ${data.goalKm?.toLocaleString()} km`, accent: '#1e3a8a' },
    { label: 'Progression', value: `${pct}%`, sub: 'du tour du monde', accent: '#3730a3' },
    { label: 'Membres actifs', value: `${data.activeMembers} / ${data.totalMembers}`, sub: 'cette semaine', accent: '#0369a1' },
    { label: 'Jours restants', value: data.daysLeft, sub: 'objectif 90 jours', accent: '#0f766e' },
  ]

  return (
    <div className="columns mb-5">
      {cards.map(card => (
        <div key={card.label} className="column">
          <div className="box" style={{ borderTop: `3px solid ${card.accent}`, padding: '1.25rem 1.5rem' }}>
            <p className="heading">{card.label}</p>
            <p style={{ fontFamily: 'Poppins, serif', fontSize: '36px', fontWeight: 600, color: '#1e2a4a', lineHeight: 1.1 }}>
              {card.value}
            </p>
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>{card.sub}</p>
          </div>
        </div>
      ))}
    </div>
  )
}