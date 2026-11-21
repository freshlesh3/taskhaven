import type { Metadata } from 'next';
import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { ProfileForm } from '@/components/forms/profile-form';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';

export const metadata: Metadata = { title: 'Edit profile' };

export default async function ProfilePage() {
  const user = await requireUser('/dashboard/profile');
  const withSkills = await db.user.findUnique({
    where: { id: user.id },
    include: { skills: { include: { skill: true } } },
  });

  return (
    <div className="container-page py-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight">Your profile</h1>
        <p className="mt-2 text-sm text-ink-500">This is what clients and collaborators see at /talent/{user.handle}.</p>

        <Card className="mt-8">
          <CardHeader className="flex items-center gap-3">
            <Avatar name={user.name} hue={user.avatarHue} size={48} />
            <div>
              <p className="text-sm font-semibold">{user.name}</p>
              <p className="text-xs text-ink-500">{user.email}</p>
            </div>
          </CardHeader>
          <CardBody>
            <ProfileForm
              initial={{
                name: user.name,
                headline: user.headline ?? '',
                bio: user.bio ?? '',
                country: user.country ?? '',
                hourlyRate: user.hourlyRate ?? null,
                isAvailable: user.isAvailable,
                skills: withSkills?.skills.map((entry) => entry.skill.name).join(', ') ?? '',
              }}
            />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
