import type { Metadata } from 'next';
import { requireUser } from '@/lib/auth';
import { updateRoleAction } from '@/server/actions/profile';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Field, Select } from '@/components/ui/input';
import { PasswordForm } from '@/components/forms/password-form';

export const metadata: Metadata = { title: 'Settings' };

export default async function SettingsPage() {
  const user = await requireUser('/dashboard/settings');

  return (
    <div className="container-page py-10">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>

        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold">Account</h2>
          </CardHeader>
          <CardBody className="space-y-2 text-sm text-ink-700">
            <p>
              <span className="text-ink-500">Email:</span> {user.email}
            </p>
            <p>
              <span className="text-ink-500">Handle:</span> /talent/{user.handle}
            </p>
            <p>
              <span className="text-ink-500">Member since:</span>{' '}
              {new Date(user.createdAt).toLocaleDateString('en-US', { dateStyle: 'medium' })}
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold">Default role</h2>
          </CardHeader>
          <CardBody>
            <form action={updateRoleAction} className="flex flex-wrap items-end gap-3">
              <div className="min-w-48">
                <Field label="I mainly" htmlFor="role">
                  <Select id="role" name="role" defaultValue={user.role}>
                    <option value="FREELANCER">Work on projects</option>
                    <option value="CLIENT">Hire people</option>
                  </Select>
                </Field>
              </div>
              <Button type="submit">Save</Button>
            </form>
            <p className="mt-3 text-xs text-ink-500">
              One account can do both. This only changes the dashboard it opens on.
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold">Password</h2>
          </CardHeader>
          <CardBody>
            <PasswordForm />
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold">Payments</h2>
          </CardHeader>
          <CardBody className="text-sm leading-6 text-ink-700">
            Payments in Taskhaven are tracked in a local ledger and are simulated — no card is charged and no money
            moves. To connect a real provider, implement the adapter described in <code>docs/payments.md</code>.
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
