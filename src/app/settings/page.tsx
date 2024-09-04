'use client';

import React, { useState, useEffect } from 'react';
import UserSession from "@/lib/UserSession";
import { Skeleton, Button, Input, Card, Avatar, Chip } from "@nextui-org/react";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";

interface User {
  username: string;
  email: string;
  bankAccount: string;
  image: string;
  isVerified: boolean;
  isAdmin: boolean;
  plan: string;
  createdAt: string;
  lastLoggedIn?: string;
}

export default function SettingsPage() {
  const { loading, data: user, error } = UserSession<User>();
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [bankAccount, setBankAccount] = useState<string>('');
  const [image, setImage] = useState<string>('');

  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setEmail(user.email);
      setBankAccount(user.bankAccount);
      setImage(user.image);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, bankAccount, image }),
      });

      if (!response.ok) {
        throw new Error('Failed to update settings');
      }

      // Refresh user data (you might need to implement this in UserSession)
      // UserSession.mutate();
      alert('Settings updated successfully');
    } catch (error) {
      console.error('Failed to update settings:', error);
      alert('Failed to update settings');
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-3xl mb-4">{error}</p>
          <Link href="/auth/login" className="text-blue-500 hover:underline">Login again</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200">
          <div className="container mx-auto px-6 py-8">
            <h3 className="text-gray-700 text-3xl font-medium mb-4">Profile Settings</h3>
            {loading ? (
              <div className="flex flex-col space-y-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-64 w-full" />
              </div>
            ) : (
              <Card className="p-6">
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="md:w-1/3">
                    <div className="text-center mb-4">
                      <Avatar src={image} size="lg" className="mx-auto mb-4" />
                      <h2 className="text-2xl font-bold">{username}</h2>
                      <p className="text-gray-600">{email}</p>
                    </div>
                    <div className="mb-4">
                      <h4 className="text-lg font-semibold mb-2">Account Status</h4>
                      <div className="flex justify-center space-x-2">
                        <Chip color={user.isVerified ? 'success' : 'danger'}>{user.isVerified ? 'Verified' : 'Not Verified'}</Chip>
                        <Chip color={user.isAdmin ? 'warning' : 'default'}>{user.isAdmin ? 'Admin' : 'User'}</Chip>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold mb-2">Account Details</h4>
                      <p><strong>Plan:</strong> <Chip color="primary">{user.plan}</Chip></p>
                      <p><strong>Joined:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
                      <p><strong>Last Login:</strong> {user.lastLoggedIn ? new Date(user.lastLoggedIn).toLocaleString() : 'N/A'}</p>
                    </div>
                  </div>
                  <div className="md:w-2/3">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <Input
                        label="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        fullWidth
                      />
                      <Input
                        label="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        fullWidth
                      />
                      <Input
                        label="Bank Account"
                        value={bankAccount}
                        onChange={(e) => setBankAccount(e.target.value)}
                        fullWidth
                      />
                      <Input
                        label="Profile Image URL"
                        value={image}
                        onChange={(e) => setImage(e.target.value)}
                        fullWidth
                      />
                      <Button
                        type="submit"
                        color="primary"
                      >
                        Save Changes
                      </Button>
                    </form>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}