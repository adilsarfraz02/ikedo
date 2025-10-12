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
  Divider,
  Badge,
} from "@nextui-org/react";
import { toast } from "react-hot-toast";
import { Clock, Gift, TrendingUp, CheckCircle2, Timer, Coins, Star, Sparkles } from "lucide-react";
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

            {/* Floating Sticky Timer */}
            {timeUntilNextReward && timeUntilNextReward > 0 && (
              <div className="sticky top-16 z-40 mb-6 animate-in fade-in slide-in-from-top duration-500">
                <Card className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white shadow-2xl">
                  <CardBody className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                          <Clock className="w-6 h-6 animate-pulse" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold opacity-90">Next Reward Unlocks In</div>
                          <div className="text-xs opacity-75">
                            {nextRewardTime.toLocaleTimeString('en-US', { 
                              hour: '2-digit', 
                              minute: '2-digit',
                              hour12: true 
                            })}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {(() => {
                          const time = formatDetailedTime(timeUntilNextReward);
                          return (
                            <>
                              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 text-center">
                                <div className="text-2xl font-bold">{time.hours}</div>
                                <div className="text-[10px] uppercase opacity-90">Hours</div>
                              </div>
                              <div className="text-2xl font-bold">:</div>
                              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 text-center">
                                <div className="text-2xl font-bold">{time.minutes}</div>
                                <div className="text-[10px] uppercase opacity-90">Min</div>
                              </div>
                              <div className="text-2xl font-bold">:</div>
                              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 text-center">
                                <div className="text-2xl font-bold">{time.seconds}</div>
                                <div className="text-[10px] uppercase opacity-90">Sec</div>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                    <Progress
                      value={100 - (timeUntilNextReward / (24 * 60 * 60 * 1000)) * 100}
                      size="sm"
                      className="mt-3"
                      classNames={{
                        indicator: "bg-white",
                        track: "bg-white/20"
                      }}
                    />
                  </CardBody>
                </Card>
              </div>
            )}

            {/* Big Countdown Timer - Game Style */}
            {timeUntilNextReward && timeUntilNextReward > 0 && (
              <Card className="mb-6 bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 text-white shadow-xl">
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
                            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 min-w-[100px] hover:scale-105 transition-transform">
                              <div className="text-5xl font-bold mb-1">{time.hours}</div>
                              <div className="text-sm uppercase tracking-wide opacity-90">Hours</div>
                            </div>
                            <div className="text-4xl font-bold flex items-center animate-pulse">:</div>
                            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 min-w-[100px] hover:scale-105 transition-transform">
                              <div className="text-5xl font-bold mb-1">{time.minutes}</div>
                              <div className="text-sm uppercase tracking-wide opacity-90">Minutes</div>
                            </div>
                            <div className="text-4xl font-bold flex items-center animate-pulse">:</div>
                            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 min-w-[100px] hover:scale-105 transition-transform">
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

            {/* Plan Daily Reward Section - Show for all users with a plan */}
            {userData && userData.plan && userData.plan !== "Free" && (
              <Card className="mb-6 overflow-hidden">
                <CardBody className="p-0">
                  <div className="flex flex-col md:flex-row">
                    {/* Left side: Plan Details */}
                    <div className="p-6 flex-1 bg-gradient-to-br from-indigo-600 to-blue-700 text-white">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                          <Sparkles className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold">Daily Plan Rewards</h3>
                      </div>
                      
                      <div className="mb-4">
                        <Badge color="warning" variant="flat" className="mb-2">
                          {userData?.plan} Plan
                        </Badge>
                        <div className="text-3xl font-bold mb-1">
                          PKR {(userData?.planDetails?.price * 0.12).toFixed(2)}
                        </div>
                        <div className="text-sm opacity-80">
                          12% daily return on your investment
                        </div>
                      </div>
                      
                      <div className="text-sm opacity-80">
                        <div className="flex justify-between mb-1">
                          <span>Plan Price:</span>
                          <span className="font-semibold">PKR {userData?.planDetails?.price?.toFixed(2) || "0.00"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Earned:</span>
                          <span className="font-semibold">PKR {stats.totalPlanClaimedAmount?.toFixed(2) || "0.00"}</span>
                        </div>
                        <div className="flex justify-between mt-1">
                          <span>Monthly Potential:</span>
                          <span className="font-semibold">PKR {(userData?.planDetails?.price * 0.12 * 30).toFixed(2) || "0.00"}</span>
                        </div>
                      </div>
                      
                      <div className="mt-4 p-3 bg-white/10 backdrop-blur-sm rounded-lg">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-yellow-300" />
                          <span className="text-sm font-medium">Get 12% of your plan price every 24 hours!</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Right side: Claim Button or Timer */}
                    <div className="p-6 flex-1 bg-white flex flex-col items-center justify-center">
                      {stats.planReadyToClaimCount > 0 ? (
                        <div className="text-center">
                          <div className="bg-green-100 text-green-600 rounded-full p-4 mx-auto mb-4">
                            <Coins className="w-10 h-10" />
                          </div>
                          <h3 className="text-xl font-bold mb-2">Your Reward is Ready!</h3>
                          <p className="text-sm text-gray-600 mb-4">
                            Claim your 12% daily return on your {userData?.plan} plan
                          </p>
                          <Button 
                            color="success" 
                            size="lg"
                            className="font-bold"
                            startContent={<Gift />}
                            onClick={handleClaimAll}
                            isLoading={claiming}
                          >
                            Claim PKR {stats.totalPlanReadyToClaimAmount?.toFixed(2) || (userData?.planDetails?.price * 0.12).toFixed(2)}
                          </Button>
                        </div>
                      ) : (
                        <div className="text-center">
                          <h3 className="text-lg font-bold mb-4">Next Plan Reward In</h3>
                          
                          {rewardsData?.planNotReadyToClaim && rewardsData.planNotReadyToClaim[0] ? (
                            <>
                              <RewardTimer 
                                timeRemaining={rewardsData.planNotReadyToClaim[0].timeRemaining} 
                                color="primary"
                                size="large"
                              />
                              <p className="text-sm text-gray-500 mt-3">
                                You'll receive PKR {(userData?.planDetails?.price * 0.12).toFixed(2)} (12% of your plan price)
                              </p>
                            </>
                          ) : (
                            <>
                              {/* Default timer showing 24-hour countdown if no timer data available */}
                              <div className="bg-blue-50 rounded-lg p-4">
                                <div className="flex items-center justify-center gap-2">
                                  <div className="bg-white rounded-lg px-3 py-2">
                                    <div className="text-4xl font-bold text-blue-600">24</div>
                                    <div className="text-xs text-gray-500 text-center">Hours</div>
                                  </div>
                                  <div className="text-4xl font-bold text-blue-600">:</div>
                                  <div className="bg-white rounded-lg px-3 py-2">
                                    <div className="text-4xl font-bold text-blue-600">00</div>
                                    <div className="text-xs text-gray-500 text-center">Minutes</div>
                                  </div>
                                </div>
                                <Progress
                                  aria-label="Timer progress"
                                  value={0}
                                  className="mt-4 h-2"
                                  color="primary"
                                />
                              </div>
                              <p className="text-sm text-gray-500 mt-3">
                                You'll receive PKR {(userData?.planDetails?.price * 0.12).toFixed(2)} (12% of your plan price)
                              </p>
                            </>
                          )}
                          
                          <Badge color="primary" variant="flat" className="mt-3">
                            Daily Reward
                          </Badge>
                        </div>
                      )}
                    </div>
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
                  {/* Plan Rewards Tab - Show for all users with a plan */}
                  {userData && userData.plan && userData.plan !== "Free" && (
                    <Tab
                      key="plan"
                      title={
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4" />
                          <span>Plan Rewards</span>
                          {stats.planReadyToClaimCount > 0 && (
                            <Badge color="success" size="sm" content={stats.planReadyToClaimCount} shape="circle" />
                          )}
                        </div>
                      }
                    >
                      <div className="p-4 mb-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                        <h3 className="text-lg font-bold text-blue-700 flex items-center gap-2 mb-2">
                          <Coins className="w-5 h-5" />
                          {userData?.plan} Plan Daily Rewards
                        </h3>
                        <p className="text-sm text-gray-700">
                          Get 12% of your plan price (PKR {(userData?.planDetails?.price * 0.12).toFixed(2)}) every 24 hours
                        </p>
                        <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                          <span>Your plan price: PKR {userData?.planDetails?.price?.toFixed(2) || "0.00"}</span>
                          <span>Monthly potential: PKR {(userData?.planDetails?.price * 0.12 * 30).toFixed(2) || "0.00"}</span>
                        </div>
                      </div>
                      
                      <Tabs aria-label="Plan rewards subtabs">
                        <Tab
                          key="plan-ready"
                          title={
                            <div className="flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Ready ({stats.planReadyToClaimCount || 0})</span>
                            </div>
                          }
                        >
                          <RewardsList
                            rewards={rewardsData?.planReadyToClaim || []}
                            type="ready"
                            onClaim={handleClaimReward}
                            claiming={claiming}
                            formatDate={formatDate}
                          />
                        </Tab>
                        <Tab
                          key="plan-pending"
                          title={
                            <div className="flex items-center gap-1">
                              <Timer className="w-3 h-3" />
                              <span>Pending ({stats.planPendingCount || 0})</span>
                            </div>
                          }
                        >
                          <RewardsList
                            rewards={rewardsData?.planNotReadyToClaim || []}
                            type="pending"
                            formatTimeRemaining={formatTimeRemaining}
                            formatDate={formatDate}
                          />
                        </Tab>
                        <Tab
                          key="plan-claimed"
                          title={
                            <div className="flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" />
                              <span>History ({stats.planClaimedCount || 0})</span>
                            </div>
                          }
                        >
                          <RewardsList
                            rewards={rewardsData?.planClaimedRewards || []}
                            type="claimed"
                            formatDate={formatDate}
                          />
                        </Tab>
                      </Tabs>
                    </Tab>
                  )}
                  
                  {/* Regular Referral Rewards Tabs */}
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

// Individual Reward Timer Component
const RewardTimer = ({ timeRemaining, color = "warning", size = "normal" }) => {
  const [time, setTime] = React.useState(timeRemaining);

  React.useEffect(() => {
    setTime(timeRemaining);
  }, [timeRemaining]);

  React.useEffect(() => {
    if (time <= 0) return;

    const interval = setInterval(() => {
      setTime((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [time]);

  const hours = Math.floor(time / 3600);
  const minutes = Math.floor((time % 3600) / 60);
  const seconds = time % 60;
  
  // Set styles based on color
  const colorStyles = {
    warning: {
      bg: "bg-orange-50",
      text: "text-orange-600",
      progressColor: "warning"
    },
    primary: {
      bg: "bg-blue-50",
      text: "text-blue-600",
      progressColor: "primary"
    },
    success: {
      bg: "bg-green-50",
      text: "text-green-600",
      progressColor: "success"
    }
  };
  
  // Size styles
  const sizeStyles = {
    normal: {
      textSize: "text-2xl",
      containerSize: "px-2 py-1"
    },
    large: {
      textSize: "text-4xl",
      containerSize: "px-3 py-2"
    }
  };
  
  const style = colorStyles[color] || colorStyles.primary;
  const sizeStyle = sizeStyles[size] || sizeStyles.normal;

  // Calculate progress percentage (from 0% at 24 hours to 100% at 0 hours)
  const progressPercentage = ((24 * 3600 - time) / (24 * 3600)) * 100;

  return (
    <div className={`text-center ${style.bg} rounded-lg p-4`}>
      <div className="flex items-center justify-center gap-2">
        <div className="bg-white rounded-lg px-3 py-2">
          <div className={`${sizeStyle.textSize} font-bold ${style.text}`}>{hours.toString().padStart(2, '0')}</div>
          <div className="text-xs text-center text-gray-500">Hours</div>
        </div>
        <div className={`${sizeStyle.textSize} font-bold ${style.text}`}>:</div>
        <div className="bg-white rounded-lg px-3 py-2">
          <div className={`${sizeStyle.textSize} font-bold ${style.text}`}>{minutes.toString().padStart(2, '0')}</div>
          <div className="text-xs text-center text-gray-500">Minutes</div>
        </div>
      </div>
      
      <Progress
        aria-label="Timer progress"
        value={progressPercentage}
        color={style.progressColor}
        className="mt-4 h-2"
      />
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
      {rewards.map((reward) => {
        const isDailyBonus = reward.commissionType === "daily_bonus";
        const isSelfReferral = reward.userId && reward.referredUserId && 
                              reward.userId.toString() === reward.referredUserId.toString();
        
        return (
          <Card 
            key={reward._id} 
            className={`hover:shadow-lg transition-shadow ${
              isDailyBonus ? "border-l-4 border-l-blue-500" : ""
            }`}
          >
            <CardBody>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* User Info */}
                <div className="flex items-center gap-4 flex-1">
                  {isDailyBonus ? (
                    <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
                      <Coins className="w-8 h-8 text-blue-600" />
                    </div>
                  ) : (
                    <Image
                      src={reward.referredUserId?.image || "/profile.png"}
                      alt={reward.referredUserId?.username}
                      className="w-14 h-14 rounded-full object-cover"
                    />
                  )}
                  
                  <div className="flex-1">
                    {isDailyBonus ? (
                      <>
                        <h3 className="font-bold text-lg">
                          Daily Plan Reward
                        </h3>
                        <p className="text-sm text-gray-600">
                          {reward.planName} Plan Daily Return
                        </p>
                      </>
                    ) : (
                      <>
                        <h3 className="font-bold text-lg">
                          {reward.referredUserId?.username || "Unknown User"}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {reward.referredUserId?.email}
                        </p>
                      </>
                    )}
                    
                    <div className="flex items-center gap-2 mt-1">
                      <Chip 
                        size="sm" 
                        color={isDailyBonus ? "primary" : "default"} 
                        variant="flat"
                      >
                        {reward.planName || "Plan Purchase"}
                      </Chip>
                      <Chip 
                        size="sm" 
                        color={isDailyBonus ? "success" : "default"} 
                        variant="flat"
                      >
                        {reward.commissionType === "daily_bonus" 
                          ? "Daily Bonus" 
                          : reward.commissionType === "plan_purchase"
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
                      {isDailyBonus 
                        ? `${(reward.commissionRate * 100) || 12}% Daily Return` 
                        : `${(reward.commissionRate * 100) || 14}% Commission`}
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
                        color={isDailyBonus ? "primary" : "success"}
                        className="font-bold w-full"
                        onClick={() => onClaim(reward._id)}
                        isLoading={claiming}
                        startContent={isDailyBonus ? <Coins className="w-4 h-4" /> : <Gift className="w-4 h-4" />}
                      >
                        Claim Now
                      </Button>
                    )}
                    {type === "pending" && reward.timeRemaining > 0 && (
                      <RewardTimer 
                        timeRemaining={reward.timeRemaining} 
                        color={isDailyBonus ? "primary" : "warning"}
                        size="normal"
                      />
                    )}
                    {type === "claimed" && (
                      <Chip 
                        color={isDailyBonus ? "primary" : "success"} 
                        variant="flat" 
                        startContent={<CheckCircle2 className="w-4 h-4" />}
                      >
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
        );
      })}
    </div>
  );
};

export default DailyRewardsPage;
