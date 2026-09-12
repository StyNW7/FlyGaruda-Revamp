import { useNavigate } from 'react-router-dom'
import { Button } from '../components/common/Button'
import { EmptyState } from '../components/common/States'

export function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <div className="flex-1 flex flex-col bg-surface-off safe-top">
      <EmptyState mascot="cry" title="This page took a different route" description="The screen you are looking for does not exist in this prototype." action={<Button onClick={() => navigate('/')}>Back to Home</Button>} />
    </div>
  )
}
