import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCheck, Settings2 } from 'lucide-react'
import { AppHeader } from '../components/common/AppHeader'
import { PageContainer } from '../components/common/Layout'
import { Button } from '../components/common/Button'
import { UnderlineTabs } from '../components/common/Tabs'
import { EmptyState } from '../components/common/States'
import { useApp } from '../store/AppContext'
import type { NotificationCategory } from '../types'
import { cn } from '../utils/cn'

type Tab = 'all' | NotificationCategory

export function NotificationsPage() {
  const { notifications, unreadCount, dispatch, isMember } = useApp()
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('all')
  const list = notifications.filter((n) => tab === 'all' || n.category === tab)
  const count = (c: NotificationCategory) => notifications.filter((n) => n.category === c && !n.read).length

  return (
    <div className="flex-1 flex flex-col bg-surface-off">
      <AppHeader
        back="/"
        title="Notifications"
        subtitle={unreadCount ? `${unreadCount} unread` : 'You’re all caught up'}
        right={
          <>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" leftIcon={<CheckCheck className="h-4 w-4" />} onClick={() => dispatch({ type: 'MARK_ALL_READ' })}>
                Mark all read
              </Button>
            )}
            <button type="button" onClick={() => navigate('/more/notifications')} aria-label="Notification settings" className="h-10 w-10 rounded-full hover:bg-surface-soft flex items-center justify-center text-brand-navy">
              <Settings2 className="h-5 w-5" />
            </button>
          </>
        }
      />
      <div className="bg-white px-4">
        <UnderlineTabs
          value={tab}
          onChange={setTab}
          items={[
            { id: 'all', label: 'All', count: unreadCount },
            { id: 'travel', label: 'Travel', count: count('travel') },
            { id: 'miles', label: 'Miles', count: count('miles') },
            { id: 'promo', label: 'Promotions', count: count('promo') },
          ]}
        />
      </div>
      <PageContainer className="py-4">
        {!isMember ? (
          <EmptyState mascot="think" title="Sign in for journey alerts" description="Check-in reminders, gate changes and miles updates appear here." action={<Button onClick={() => navigate('/login')}>Sign in</Button>} />
        ) : list.length === 0 ? (
          <EmptyState mascot="chill" title="You’re all caught up." description="New journey updates, miles and offers will appear here." />
        ) : (
          <ul className="space-y-2.5 animate-fade-up">
            {list.map((n) => (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() => {
                    dispatch({ type: 'MARK_READ', id: n.id })
                    if (n.to) navigate(n.to)
                  }}
                  className={cn('w-full card p-3.5 flex items-start gap-3 text-left press', !n.read && 'border-brand-blue/30 bg-white')}
                >
                  <span className={cn('h-10 w-10 rounded-xl flex items-center justify-center shrink-0', n.category === 'travel' ? 'bg-brand-turquoise-soft text-brand-turquoise' : n.category === 'miles' ? 'bg-brand-gold-soft text-[#8A6A1F]' : 'bg-brand-blue-light text-brand-blue')}>
                    <n.icon className="h-5 w-5" strokeWidth={1.9} />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="flex items-start gap-2">
                      <span className={cn('text-[14px] leading-snug flex-1', n.read ? 'font-semibold text-ink-soft' : 'font-bold text-ink')}>{n.title}</span>
                      {!n.read && <span className="mt-1.5 h-2 w-2 rounded-full bg-brand-turquoise shrink-0" aria-label="Unread" />}
                    </span>
                    <span className="block text-[12.5px] text-ink-muted mt-0.5 leading-snug">{n.body}</span>
                    <span className="block text-[11px] text-ink-faint mt-1.5">{n.time}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
        {isMember && list.length > 0 && (
          <button type="button" onClick={() => dispatch({ type: 'DISMISS_ALL' })} className="mt-5 w-full text-center text-[12px] font-semibold text-ink-muted hover:text-ink">
            Clear all notifications
          </button>
        )}
      </PageContainer>
    </div>
  )
}
