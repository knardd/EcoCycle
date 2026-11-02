import { useNavigate } from 'react-router-dom'
import { StudentDashboard } from '../components/StudentDashboard'
import { useData } from '../contexts/DataContext'

export function StudentPage() {
  const { transactions, claimedVouchers, syncData } = useData()
  const navigate = useNavigate()

  return (
    <StudentDashboard
      onOpenRewardTab={() => navigate('/rewards')}
      transactions={transactions}
      claimedVouchers={claimedVouchers}
      onRefresh={syncData}
    />
  )
}
