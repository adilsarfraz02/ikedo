import React from 'react';
import { useUser } from '../hooks/useUser';

function ProfilePage() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!user) {
    return <div className="flex justify-center items-center h-screen">No user data available</div>;
  }

  return (
    <div className="container mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold mb-6">{user.username}'s Profile</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <img src={user.image} alt={user.username} className="w-full h-auto rounded-lg" />
        </div>
        <div>
          <p className="mb-2"><strong>Email:</strong> {user.email}</p>
          <p className="mb-2"><strong>Bank Account:</strong> {user.bankAccount}</p>
          <p className="mb-2"><strong>Payment Status:</strong> {user.paymentStatus}</p>
          <p className="mb-2"><strong>Plan:</strong> {user.plan}</p>
          <p className="mb-2"><strong>Referral Count:</strong> {user.tReferralCount}</p>
          <p className="mb-2"><strong>Referral URL:</strong> {user.ReferralUrl}</p>
          <p className="mb-2"><strong>Joined:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;