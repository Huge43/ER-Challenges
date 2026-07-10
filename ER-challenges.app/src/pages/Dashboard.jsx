import { useEffect, useState } from 'react'
import { getDashboard } from '../api/index.js'
import StatsCards from '../components/StatsCards'
import ProgressSection from '../components/ProgressSection'
import Leaderboard from '../components/Leaderboard'
import RecentActivity from '../components/RecentActivity'

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDashboard()
      .then(res => setData(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="is-flex is-align-items-center is-justify-content-center" style={{ height: '60vh' }}>
      <p style={{ fontFamily: 'DM Sans, sans-serif', color: '#64748b', fontSize: '14px' }}>Chargement...</p>
    </div>
  )

  if (!data) return (
    <div className="is-flex is-align-items-center is-justify-content-center" style={{ height: '60vh' }}>
      <p style={{ fontFamily: 'DM Sans, sans-serif', color: '#ef4444', fontSize: '14px' }}>Erreur de chargement</p>
    </div>
  )

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'EB Garamond, serif', fontSize: '32px', fontWeight: 600, color: '#1e3a8a' }}>
          Dashboard
        </h1>
        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
          Challenge : {data.challengeName}
        </p>
      </div>
      <StatsCards data={data} />
      <ProgressSection totalKm={data.totalKm} goalKm={data.goalKm} />
      <div className="columns">
        <div className="column">
          <Leaderboard members={data.members} />
        </div>
        <div className="column">
          <RecentActivity runs={data.recentRuns} />
        </div>
      </div>
    </div>
  )
}