

'use client';

import UserProfilePage from './[userId]/page';

// This page now acts as a wrapper that renders the dynamic route page
// for the currently logged-in user.
export default function ProfilePage() {
  return <UserProfilePage />;
}
