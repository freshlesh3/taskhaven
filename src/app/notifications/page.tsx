import Link from 'next/link';
import type { Metadata } from 'next';
import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { Card, EmptyState } from '@/components/ui/card';
import { Badge } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { markAllNotificationsReadAction, markNotificationReadAction } from '@/server/actions/notifications';
import { timeAgo } from '@/lib/utils';

export const metadata: Metadata = { title: 'Notifications' };

const KIND_TONES: Record<string, 'green' | 'blue' | 'amber' | 'neutral'> = {
  PROPOSAL: 'blue',
  CONTRACT: 'green',
  PAYMENT: 'green',
  MILESTONE: 'amber',
  MESSAGE: 'neutral',
};

export default async function NotificationsPage() {
  const user = await requireUser('/notifications');
  const notifications = await db.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
  const unread = notifications.filter((notification) => !notification.readAt).length;

  return (
    <div className="container-page py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Notifications</h1>
          <p className="mt-2 text-sm text-ink-500">
            {unread === 0 ? 'You are all caught up.' : `${unread} unread`}
          </p>
        </div>
        {unread > 0 ? (
          <form action={markAllNotificationsReadAction}>
            <Button type="submit" variant="outline">
              Mark all read
            </Button>
          </form>
        ) : null}
      </div>

      <div className="mt-8 space-y-2">
        {notifications.length === 0 ? (
          <EmptyState
            title="Nothing yet"
            description="Proposals, contract updates and payments will show up here."
          />
        ) : (
          notifications.map((notification) => (
            <Card
              key={notification.id}
              className={notification.readAt ? 'p-4' : 'border-brand-200 bg-brand-50/40 p-4'}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge tone={KIND_TONES[notification.kind] ?? 'neutral'}>{notification.kind.toLowerCase()}</Badge>
                    <span className="text-xs text-ink-500">{timeAgo(notification.createdAt)}</span>
                    {!notification.readAt ? <span className="h-2 w-2 rounded-full bg-brand-600" /> : null}
                  </div>
                  <p className="mt-2 text-sm text-ink-900">{notification.body}</p>
                  {notification.href ? (
                    <Link
                      href={notification.href}
                      className="mt-1 inline-block text-xs font-medium text-brand-700 hover:underline"
                    >
                      Open
                    </Link>
                  ) : null}
                </div>
                {!notification.readAt ? (
                  <form action={markNotificationReadAction}>
                    <input type="hidden" name="id" value={notification.id} />
                    <Button type="submit" size="sm" variant="ghost">
                      Mark read
                    </Button>
                  </form>
                ) : null}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
