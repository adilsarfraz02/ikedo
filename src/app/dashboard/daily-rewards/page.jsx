"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Image,
  Chip,
  Skeleton,
  Progress,
  Tabs,
  Tab,
} from "@nextui-org/react";
import { toast } from "react-hot-toast";
import { Clock, Gift, TrendingUp, CheckCircle2, Timer } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import UserSession from "@/lib/UserSession";
import Link from "next/link";

const DailyRewardsPage = () => {
  const { loading: userLoading, data: userData, error: userError } = UserSession();
  const [rewardsData, setRewardsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [selectedTab, setSelectedTab] = useState("ready");
  const [nextRewardTime, setNextRewardTime] = useState(null);
  const [timeUntilNextReward, setTimeUntilNextReward] = useState(null);

  // Calculate next reward unlock time
  const calculateNextRewardTime = (rewards) => {
    if (!rewards || rewards.length === 0) return null;

    // Find the earliest time when next reward unlocks
    const sortedRewards = [...rewards].sort((a, b) => a.timeRemaining - b.timeRemaining);
    const nextReward = sortedRewards[0];
    
    if (nextReward && nextReward.timeRemaining > 0) {
      const unlockTime = new Date(Date.now() + nextReward.timeRemaining * 1000);
      return unlockTime;
    }
    return null;
  };

  // Fetch rewards data
  const fetchRewards = async () => {
    try {
      const response = await fetch("/api/daily-rewards");
      const result = await response.json();

      if (result.success) {
        setRewardsData(result.data);
        
        // Calculate next reward time from pending rewards
        const nextTime = calculateNextRewardTime(result.data.notReadyToClaim);
        setNextRewardTime(nextTime);
      } else {
        toast.error(result.error || "Failed to fetch rewards");
      }
    } catch (error) {
      console.error("Error fetching rewards:", error);
      toast.error("Failed to load rewards data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userLoading && userData) {
      fetchRewards();
    }
  }, [userLoading, userData]);

  // Real-time countdown timer (updates every second)
  useEffect(() => {
    if (!nextRewardTime) return;

    const updateTimer = () => {
      const now = new Date();
      const diff = nextRewardTime - now;
      
      if (diff <= 0) {
        setTimeUntilNextReward(null);
        fetchRewards(); // Refresh when timer reaches 0
      } else {
        setTimeUntilNextReward(diff);
      }
    };

    // Update immediately
    updateTimer();

    // Then update every second
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [nextRewardTime]);

  // Auto-refresh every minute to update timers
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading && !claiming) {
        fetchRewards();
      }
    }, 60000); // Refresh every minute

    return () => clearInterval(interval);
  }, [loading, claiming]);

  // Claim individual reward
  const handleClaimReward = async (commissionId) => {
    setClaiming(true);
    try {
      const response = await fetch("/api/daily-rewards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ commissionId }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(
          `Successfully claimed PKR${result.data.claimedAmount.toFixed(2)}!`
        );
        await fetchRewards(); // Refresh data
      } else {
        toast.error(result.error || "Failed to claim reward");
      }
    } catch (error) {
      console.error("Error claiming reward:", error);
      toast.error("Failed to claim reward");
    } finally {
      setClaiming(false);
    }
  };

  // Claim all ready rewards
  const handleClaimAll = async () => {
    setClaiming(true);
    try {
      const response = await fetch("/api/daily-rewards", {
        method: "PUT",
      });

      const result = await response.json();

      if (result.success) {
        toast.success(
          `Successfully claimed ${result.data.claimedCount} rewards totaling PKR${result.data.totalAmount.toFixed(2)}!`
        );
        await fetchRewards(); // Refresh data
      } else {
        toast.error(result.error || "Failed to claim rewards");
      }
    } catch (error) {
      console.error("Error claiming all rewards:", error);
      toast.error("Failed to claim rewards");
    } finally {
      setClaiming(false);
    }
  };

  // Format time remaining in detailed format
  const formatDetailedTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return {
      hours: hours.toString().padStart(2, '0'),
      minutes: minutes.toString().padStart(2, '0'),
      seconds: seconds.toString().padStart(2, '0'),
    };
  };

  // Format time remaining
  const formatTimeRemaining = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (userLoading || loading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200">
            <div className="container mx-auto px-6 py-20">
              <Skeleton className="h-12 w-64 mb-6" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
              </div>
              <Skeleton className="h-96" />
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (userError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-3xl mb-4">{userError}</p>
          <Link href="/auth/login" className="text-blue-500 hover:underline">
            Login again
          </Link>
        </div>
      </div>
    );
  }

  const stats = rewardsData?.stats || {};

  return (
    <div className="flex h-screen bg-gray-100">
      <title>Daily Rewards - Dashboard</title>
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200">
          <div className="container mx-auto px-6 py-20">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                <Gift className="text-primary" />
                Daily Rewards
              </h1>
              <p className="text-gray-600 mt-2">
                Claim your referral commissions every 24 hours
              </p>
            </div>

            {/* Big Countdown Timer - Game Style */}
            {timeUntilNextReward && timeUntilNextReward > 0 && (
              <Card className="mb-6 bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 text-white">
                <CardBody className="p-8">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
                      <Clock className="w-8 h-8 animate-pulse" />
                      Next Reward Unlocks In
                    </h2>
                    <p className="text-sm opacity-90 mb-6">
                      Come back at {nextRewardTime.toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit',
                        hour12: true 
                      })} on {nextRewardTime.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                    
                    {/* Countdown Display */}
                    <div className="flex justify-center gap-4 mb-4">
                      {(() => {
                        const time = formatDetailedTime(timeUntilNextReward);
                        return (
                          <>
                            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 min-w-[100px]">
                              <div className="text-5xl font-bold mb-1">{time.hours}</div>
                              <div className="text-sm uppercase tracking-wide opacity-90">Hours</div>
                            </div>
                            <div className="text-4xl font-bold flex items-center">:</div>
                            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 min-w-[100px]">
                              <div className="text-5xl font-bold mb-1">{time.minutes}</div>
                              <div className="text-sm uppercase tracking-wide opacity-90">Minutes</div>
                            </div>
                            <div className="text-4xl font-bold flex items-center">:</div>
                            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 min-w-[100px]">
                              <div className="text-5xl font-bold mb-1">{time.seconds}</div>
                              <div className="text-sm uppercase tracking-wide opacity-90">Seconds</div>
                            </div>
                          </>
                        );
                      })()}
                    </div>

                    {/* Progress Bar */}
                    <div className="max-w-md mx-auto">
                      <Progress
                        value={100 - (timeUntilNextReward / (24 * 60 * 60 * 1000)) * 100}
                        className="h-3"
                        classNames={{
                          indicator: "bg-white",
                          track: "bg-white/20"
                        }}
                      />
                      <p className="text-xs opacity-75 mt-2">
                        {Math.round(100 - (timeUntilNextReward / (24 * 60 * 60 * 1000)) * 100)}% of 24-hour wait time completed
                      </p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Reward Ready Alert */}
            {stats.readyToClaimCount > 0 && (
              <Card className="mb-6 bg-gradient-to-r from-green-400 to-emerald-500 text-white">
                <CardBody className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                        <Gift className="w-8 h-8 animate-bounce" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold mb-1">
                          🎉 Rewards Ready to Claim!
                        </h3>
                        <p className="text-sm opacity-90">
                          You have {stats.readyToClaimCount} reward{stats.readyToClaimCount > 1 ? 's' : ''} worth PKR {stats.totalReadyToClaimAmount?.toFixed(2)} waiting for you
                        </p>
                      </div>
                    </div>
                    <Button
                      color="default"
                      size="lg"
                      className="bg-white text-green-600 font-bold"
                      onClick={handleClaimAll}
                      isLoading={claiming}
                      startContent={<Gift />}
                    >
                      Claim Now
                    </Button>
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardBody className="text-center">
                  <div className="text-sm text-gray-500 mb-1">Ready to Claim</div>
                  <div className="text-2xl font-bold text-green-600">
                    PKR {stats.totalReadyToClaimAmount?.toFixed(2) || "0.00"}
                  </div>
                  <div className="text-xs text-gray-400">
                    {stats.readyToClaimCount || 0} rewards
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardBody className="text-center">
                  <div className="text-sm text-gray-500 mb-1">Pending</div>
                  <div className="text-2xl font-bold text-orange-600">
                    PKR {(stats.totalPendingAmount - stats.totalReadyToClaimAmount)?.toFixed(2) || "0.00"}
                  </div>
                  <div className="text-xs text-gray-400">
                    {(stats.pendingCount - stats.readyToClaimCount) || 0} rewards
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardBody className="text-center">
                  <div className="text-sm text-gray-500 mb-1">Total Claimed</div>
                  <div className="text-2xl font-bold text-blue-600">
                    PKR {stats.totalClaimedAmount?.toFixed(2) || "0.00"}
                  </div>
                  <div className="text-xs text-gray-400">
                    {stats.claimedCount || 0} rewards
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardBody className="text-center">
                  <div className="text-sm text-gray-500 mb-1">Wallet Balance</div>
                  <div className="text-2xl font-bold text-purple-600">
                    PKR {rewardsData?.walletBalance?.toFixed(2) || "0.00"}
                  </div>
                  <Link href="/dashboard" className="text-xs text-blue-500 hover:underline">
                    View Dashboard
                  </Link>
                </CardBody>
              </Card>
            </div>

            {/* Tabs for different reward states */}
            <Card>
              <CardBody>
                <Tabs
                  selectedKey={selectedTab}
                  onSelectionChange={setSelectedTab}
                  color="primary"
                  variant="underlined"
                >
                  <Tab
                    key="ready"
                    title={
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Ready to Claim ({stats.readyToClaimCount || 0})</span>
                      </div>
                    }
                  >
                    <RewardsList
                      rewards={rewardsData?.readyToClaim || []}
                      type="ready"
                      onClaim={handleClaimReward}
                      claiming={claiming}
                      formatDate={formatDate}
                    />
                  </Tab>

                  <Tab
                    key="pending"
                    title={
                      <div className="flex items-center gap-2">
                        <Timer className="w-4 h-4" />
                        <span>
                          Pending ({(stats.pendingCount - stats.readyToClaimCount) || 0})
                        </span>
                      </div>
                    }
                  >
                    <RewardsList
                      rewards={rewardsData?.notReadyToClaim || []}
                      type="pending"
                      formatTimeRemaining={formatTimeRemaining}
                      formatDate={formatDate}
                    />
                  </Tab>

                  <Tab
                    key="claimed"
                    title={
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        <span>Claimed History ({stats.claimedCount || 0})</span>
                      </div>
                    }
                  >
                    <RewardsList
                      rewards={rewardsData?.claimedRewards || []}
                      type="claimed"
                      formatDate={formatDate}
                    />
                  </Tab>
                </Tabs>
              </CardBody>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

// Rewards List Component
const RewardsList = ({
  rewards,
  type,
  onClaim,
  claiming,
  formatTimeRemaining,
  formatDate,
}) => {
  if (!rewards || rewards.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Gift className="w-16 h-16 mx-auto mb-4 opacity-30" />
        <p className="text-lg">No rewards {type === "claimed" ? "claimed yet" : "available"}</p>
        {type === "ready" && (
          <p className="text-sm mt-2">
            Rewards will appear here 24 hours after your referrals purchase plans
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-4">
      {rewards.map((reward) => (
        <Card key={reward._id} className="hover:shadow-lg transition-shadow">
          <CardBody>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* User Info */}
              <div className="flex items-center gap-4 flex-1">
                <Image
                  src={reward.referredUserId?.image || "/profile.png"}
                  alt={reward.referredUserId?.username}
                  className="w-14 h-14 rounded-full object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-bold text-lg">
                    {reward.referredUserId?.username || "Unknown User"}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {reward.referredUserId?.email}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Chip size="sm" color="primary" variant="flat">
                      {reward.planName || "Plan Purchase"}
                    </Chip>
                    <Chip size="sm" variant="flat">
                      {reward.commissionType === "plan_purchase"
                        ? "Plan Commission"
                        : "Referral Bonus"}
                    </Chip>
                  </div>
                </div>
              </div>

              {/* Amount and Action */}
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">
                    PKR {reward.amount?.toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-500">
                    14% Commission
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Created: {formatDate(reward.createdAt)}
                  </div>
                  {type === "claimed" && reward.claimedAt && (
                    <div className="text-xs text-green-600 mt-1">
                      Claimed: {formatDate(reward.claimedAt)}
                    </div>
                  )}
                </div>

                {/* Action Button or Timer */}
                <div className="min-w-[140px]">
                  {type === "ready" && (
                    <Button
                      color="success"
                      className="font-bold w-full"
                      onClick={() => onClaim(reward._id)}
                      isLoading={claiming}
                      startContent={<Gift className="w-4 h-4" />}
                    >
                      Claim Now
                    </Button>
                  )}
                  {type === "pending" && (
                    <div className="text-center p-2 bg-orange-50 rounded-lg">
                      <Clock className="w-5 h-5 mx-auto mb-1 text-orange-600" />
                      <div className="text-sm font-semibold text-orange-600">
                        {formatTimeRemaining(reward.timeRemaining)}
                      </div>
                      <div className="text-xs text-gray-500">remaining</div>
                    </div>
                  )}
                  {type === "claimed" && (
                    <Chip color="success" variant="flat" startContent={<CheckCircle2 className="w-4 h-4" />}>
                      Claimed
                    </Chip>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            {reward.description && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-sm text-gray-600">{reward.description}</p>
              </div>
            )}
          </CardBody>
        </Card>
      ))}
    </div>
  );
};

export default DailyRewardsPage;
