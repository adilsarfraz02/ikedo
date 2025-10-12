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
  const [showClaimAnimation, setShowClaimAnimation] = useState(false);
  
  // Add shimmer animation keyframes
  React.useEffect(() => {
    // Create style element for animations
    const styleEl = document.createElement('style');
    styleEl.innerHTML = `
      @keyframes shimmer {
        100% { transform: translateX(100%); }
      }
      
      @keyframes text-glow {
        0% { text-shadow: 0 0 5px rgba(255,255,255,0.5); }
        50% { text-shadow: 0 0 15px rgba(255,255,255,0.8); }
        100% { text-shadow: 0 0 5px rgba(255,255,255,0.5); }
      }
      
      @keyframes scale-bounce {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
      }
      
      .animate-shimmer {
        animation: shimmer 2s infinite;
      }
      
      .text-glow {
        animation: text-glow 2s infinite;
      }
      
      .animate-scale-bounce {
        animation: scale-bounce 2s infinite;
      }
    `;
    document.head.appendChild(styleEl);
    
    return () => {
      document.head.removeChild(styleEl);
    };
  }, []);

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
      setLoading(true);
      const response = await fetch("/api/daily-rewards");
      const result = await response.json();

      if (result.success) {
        setRewardsData(result.data);
        
        // Calculate next reward time from pending rewards
        const nextTime = calculateNextRewardTime(result.data.notReadyToClaim);
        setNextRewardTime(nextTime);
        
        // Update timer immediately
        if (nextTime) {
          const now = new Date();
          const diff = nextTime - now;
          setTimeUntilNextReward(diff > 0 ? diff : 0);
        } else {
          // Check if there are ready-to-claim rewards
          const hasReadyRewards = result.data.readyToClaim && result.data.readyToClaim.length > 0;
          setTimeUntilNextReward(hasReadyRewards ? 0 : null);
        }
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

  // Enhanced real-time countdown timer (updates every second)
  useEffect(() => {
    if (!nextRewardTime && nextRewardTime !== null) return;

    const updateTimer = () => {
      const now = new Date();
      
      // If we have a specific next reward time
      if (nextRewardTime) {
        const diff = nextRewardTime - now;
        
        if (diff <= 0) {
          setTimeUntilNextReward(0); // Set to 0 to show ready state
          fetchRewards(); // Refresh when timer reaches 0
        } else {
          setTimeUntilNextReward(diff);
        }
      } 
      // If nextRewardTime is explicitly null, it means we have no pending rewards
      // but might have ready-to-claim rewards
      else if (nextRewardTime === null) {
        // Check if we need to validate with the server
        const lastFetch = localStorage.getItem('lastRewardFetch');
        const now = Date.now();
        
        if (!lastFetch || (now - parseInt(lastFetch)) > 60000) { // Check every minute
          localStorage.setItem('lastRewardFetch', now.toString());
          fetchRewards(); // Validate with server
        }
      }
    };

    // Update immediately
    updateTimer();

    // Then update every second
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [nextRewardTime]);

  // Enhanced auto-refresh with localStorage to prevent timer reset issues
  useEffect(() => {
    // Set up interval for regular updates
    const interval = setInterval(() => {
      if (!loading && !claiming) {
        // Track last fetch in localStorage
        localStorage.setItem('lastRewardFetch', Date.now().toString());
        fetchRewards();
      }
    }, 60000); // Refresh every minute
    
    // Load last state from localStorage if available
    const loadLastState = () => {
      try {
        const savedState = localStorage.getItem('rewardsPageState');
        if (savedState) {
          const { time, nextTime } = JSON.parse(savedState);
          
          // Only use saved state if it's relatively recent (within last hour)
          if (time && Date.now() - time < 3600000) {
            if (nextTime) {
              // Calculate current time remaining
              const savedDate = new Date(nextTime);
              const now = new Date();
              const diff = savedDate - now;
              
              if (diff > 0) {
                // Use saved state to avoid timer reset
                setNextRewardTime(savedDate);
                setTimeUntilNextReward(diff);
              }
            }
          }
        }
      } catch (error) {
        console.error("Error loading saved state:", error);
      }
    };
    
    // Try to load last state
    loadLastState();
    
    return () => clearInterval(interval);
  }, [loading, claiming]);
  
  // Save state to localStorage when it changes
  useEffect(() => {
    if (nextRewardTime) {
      const stateToSave = {
        time: Date.now(),
        nextTime: nextRewardTime.toISOString()
      };
      localStorage.setItem('rewardsPageState', JSON.stringify(stateToSave));
    }
  }, [nextRewardTime]);

  // Claim individual reward with gamification
  const handleClaimReward = async (commissionId) => {
    setClaiming(true);
    setShowClaimAnimation(true);
    
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
        // Success celebration
        const amount = result.data.claimedAmount.toFixed(2);
        
        // Create custom toast with animation
        toast.custom(
          (t) => (
            <div className={`${
              t.visible ? 'animate-enter' : 'animate-leave'
            } max-w-md w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg rounded-lg pointer-events-auto flex`}>
              <div className="flex-1 w-0 p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0 pt-0.5">
                    <Gift className="h-10 w-10 text-white bg-green-700 p-1 rounded-full" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium">
                      Reward Claimed! 🎉
                    </p>
                    <p className="mt-1 text-lg font-bold animate-pulse">
                      PKR {amount} Added to Wallet
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex">
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-white bg-green-700 hover:bg-green-800"
                >
                  Close
                </button>
              </div>
            </div>
          ),
          { duration: 5000 }
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
      setTimeout(() => {
        setShowClaimAnimation(false);
      }, 3000);
    }
  };

  // Claim all ready rewards with enhanced gamification
  const handleClaimAll = async () => {
    setClaiming(true);
    setShowClaimAnimation(true);
    
    try {
      const response = await fetch("/api/daily-rewards", {
        method: "PUT",
      });

      const result = await response.json();

      if (result.success) {
        // Enhanced success celebration
        const rewardCount = result.data.claimedCount;
        const totalAmount = result.data.totalAmount.toFixed(2);
        
        // Custom animated toast
        toast.custom(
          (t) => (
            <div className={`${
              t.visible ? 'animate-enter' : 'animate-leave'
            } max-w-md w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-2xl rounded-lg pointer-events-auto`}>
              <div className="p-4 text-center">
                <div className="flex justify-center mb-2">
                  <div className="flex-shrink-0 pt-0.5">
                    <div className="bg-indigo-800 rounded-full p-2">
                      <Gift className="h-12 w-12 text-white animate-pulse" />
                    </div>
                  </div>
                </div>
                <p className="text-lg font-bold mb-1">
                  {rewardCount} Rewards Claimed! 🎉
                </p>
                <div className="mt-2 bg-white/20 backdrop-blur-sm rounded-lg p-3">
                  <p className="text-2xl font-bold animate-scale-bounce">
                    PKR {totalAmount}
                  </p>
                  <p className="text-sm mt-1">Added to your wallet</p>
                </div>
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="mt-4 px-4 py-2 bg-white text-indigo-700 rounded-md font-medium hover:bg-indigo-100 transition-colors"
                >
                  Awesome!
                </button>
              </div>
            </div>
          ),
          { duration: 6000 }
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
      setTimeout(() => {
        setShowClaimAnimation(false);
      }, 3000);
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
                Claim your plan rewards and referral commissions every 24 hours
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

            {/* Enhanced Game-Style Countdown Timer */}
            {(timeUntilNextReward !== null) && (
              <Card className="mb-6 bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 text-white shadow-xl border-4 border-white/20 overflow-hidden">
                <CardBody className="p-8">
                  <div className="text-center relative">
                    {/* Floating particles for game effect */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                      {Array.from({ length: 12 }).map((_, i) => {
                        const size = Math.random() * 6 + 3;
                        const left = Math.random() * 100;
                        const top = Math.random() * 100;
                        const delay = Math.random() * 10;
                        const duration = Math.random() * 20 + 10;
                        return (
                          <div 
                            key={i} 
                            className="absolute bg-white/30 rounded-full animate-ping"
                            style={{
                              width: `${size}px`,
                              height: `${size}px`,
                              left: `${left}%`,
                              top: `${top}%`,
                              animationDelay: `${delay}s`,
                              animationDuration: `${duration}s`
                            }}
                          />
                        );
                      })}
                    </div>

                    <div className="relative z-1">
                      <h2 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
                        <Clock className="w-8 h-8 animate-pulse" />
                        <span className="bg-gradient-to-r from-white to-yellow-300 bg-clip-text text-transparent">
                          Next Reward Unlocks In
                        </span>
                      </h2>
                      {timeUntilNextReward && timeUntilNextReward > 0 && nextRewardTime && (
                        <p className="text-sm opacity-90 mb-6 bg-white/10 backdrop-blur-sm py-2 px-4 rounded-full inline-block">
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
                      )}
                      
                      {/* Countdown Display */}
                      {timeUntilNextReward && timeUntilNextReward > 0 ? (
                        <div className="flex justify-center gap-4 mb-6">
                          {(() => {
                            const time = formatDetailedTime(timeUntilNextReward);
                            return (
                              <>
                                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 min-w-[100px] hover:scale-105 transition-transform border border-white/30 shadow-lg">
                                  <div className="text-5xl font-bold mb-1 text-glow">{time.hours}</div>
                                  <div className="text-sm uppercase tracking-wide opacity-90">Hours</div>
                                </div>
                                <div className="text-4xl font-bold flex items-center animate-pulse">:</div>
                                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 min-w-[100px] hover:scale-105 transition-transform border border-white/30 shadow-lg">
                                  <div className="text-5xl font-bold mb-1 text-glow">{time.minutes}</div>
                                  <div className="text-sm uppercase tracking-wide opacity-90">Minutes</div>
                                </div>
                                <div className="text-4xl font-bold flex items-center animate-pulse">:</div>
                                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 min-w-[100px] hover:scale-105 transition-transform border border-white/30 shadow-lg">
                                  <div className="text-5xl font-bold mb-1 text-glow">{time.seconds}</div>
                                  <div className="text-sm uppercase tracking-wide opacity-90">Seconds</div>
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      ) : (
                        <div className="my-6">
                          <div className="bg-green-400/30 text-white rounded-xl p-6 mb-4">
                            <div className="flex items-center justify-center">
                              <Gift className="w-16 h-16 animate-bounce text-yellow-300" />
                            </div>
                            <h3 className="text-2xl font-bold mt-3">Your Reward is Ready!</h3>
                            <p className="mt-2">Claim your rewards now to earn PKR</p>
                          </div>
                          <Button 
                            color="warning" 
                            size="lg" 
                            className="font-bold px-8 py-6 text-lg shadow-lg" 
                            onClick={handleClaimAll}
                            isLoading={claiming}
                            startContent={<Gift className="w-6 h-6" />}
                          >
                            CLAIM NOW
                          </Button>
                        </div>
                      )}

                      {/* Enhanced Progress Bar */}
                      {timeUntilNextReward && timeUntilNextReward > 0 && (
                        <div className="max-w-md mx-auto relative">
                          <div className="h-5 bg-white/10 rounded-full overflow-hidden relative shadow-inner border border-white/20">
                            <div 
                              className="h-full bg-gradient-to-r from-yellow-300 to-white absolute left-0 top-0 transition-all duration-500"
                              style={{ width: `${Math.round(100 - (timeUntilNextReward / (24 * 60 * 60 * 1000)) * 100)}%` }}
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/30 animate-pulse"></div>
                            </div>
                          </div>
                          <div className="flex justify-between mt-2 text-xs">
                            <span className="opacity-75">0%</span>
                            <span className="font-bold">{Math.round(100 - (timeUntilNextReward / (24 * 60 * 60 * 1000)) * 100)}% Complete</span>
                            <span className="opacity-75">100%</span>
                          </div>
                        </div>
                      )}
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
                              {/* Enhanced default timer showing 24-hour countdown if no timer data available */}
                              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-6 shadow-lg">
                                <div className="flex items-center justify-center gap-2">
                                  <div className="bg-white rounded-lg px-3 py-2 shadow-md">
                                    <div className="text-4xl font-bold text-blue-600 text-glow">24</div>
                                    <div className="text-xs text-gray-500 text-center">Hours</div>
                                  </div>
                                  <div className="text-4xl font-bold text-blue-600 animate-pulse">:</div>
                                  <div className="bg-white rounded-lg px-3 py-2 shadow-md">
                                    <div className="text-4xl font-bold text-blue-600 text-glow">00</div>
                                    <div className="text-xs text-gray-500 text-center">Minutes</div>
                                  </div>
                                  <div className="text-4xl font-bold text-blue-600 animate-pulse">:</div>
                                  <div className="bg-white rounded-lg px-3 py-2 shadow-md">
                                    <div className="text-4xl font-bold text-blue-600 text-glow">00</div>
                                    <div className="text-xs text-gray-500 text-center">Seconds</div>
                                  </div>
                                </div>
                                <div className="mt-4 h-3 bg-blue-200 rounded-full overflow-hidden relative shadow-inner">
                                  <div 
                                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 absolute left-0 top-0"
                                    style={{ width: `0%` }}
                                  >
                                    <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                                  </div>
                                </div>
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
                          Earn 12% of your plan price (PKR {(userData?.planDetails?.price * 0.12).toFixed(2)}) every 24 hours as passive income from your own plan
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
                            isPlanReward={true}
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
                            isPlanReward={true}
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
                            isPlanReward={true}
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

// Gamified Reward Timer Component
const RewardTimer = ({ timeRemaining, color = "warning", size = "normal" }) => {
  // Ensure we have a valid timeRemaining that is greater than 0
  const validTimeRemaining = typeof timeRemaining === 'number' && timeRemaining > 0 ? timeRemaining : 24 * 3600;
  const [time, setTime] = React.useState(validTimeRemaining);
  const [isAnimating, setIsAnimating] = React.useState(false);
  const [showConfetti, setShowConfetti] = React.useState(false);
  
  // Fix for first claim always ready - validate timeRemaining properly
  React.useEffect(() => {
    if (timeRemaining !== undefined) {
      if (timeRemaining <= 0) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
        setTime(0);
      } else {
        setTime(timeRemaining);
        setShowConfetti(false);
      }
    }
  }, [timeRemaining]);

  // Update the timer every second
  React.useEffect(() => {
    if (time <= 0) return;

    const interval = setInterval(() => {
      setTime((prev) => {
        const newTime = Math.max(0, prev - 1);
        if (newTime === 0) {
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 3000);
        }
        return newTime;
      });
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 500); // Pulse animation duration
    }, 1000);

    return () => clearInterval(interval);
  }, [time]);

  const hours = Math.floor(time / 3600);
  const minutes = Math.floor((time % 3600) / 60);
  const seconds = time % 60;
  
  // Enhanced color styles for game-like appearance
  const colorStyles = {
    warning: {
      bg: "bg-gradient-to-br from-orange-100 to-orange-200",
      text: "text-orange-600",
      progressColor: "warning",
      shadow: "shadow-orange-200"
    },
    primary: {
      bg: "bg-gradient-to-br from-blue-100 to-blue-200",
      text: "text-blue-600",
      progressColor: "primary",
      shadow: "shadow-blue-200"
    },
    success: {
      bg: "bg-gradient-to-br from-green-100 to-green-200",
      text: "text-green-600",
      progressColor: "success",
      shadow: "shadow-green-200"
    }
  };
  
  // Enhanced size styles for more game-like appearance
  const sizeStyles = {
    normal: {
      textSize: "text-xl",
      secondsSize: "text-lg",
      containerSize: "px-2 py-1"
    },
    large: {
      textSize: "text-4xl",
      secondsSize: "text-2xl",
      containerSize: "px-3 py-2"
    }
  };
  
  const style = colorStyles[color] || colorStyles.primary;
  const sizeStyle = sizeStyles[size] || sizeStyles.normal;

  // Calculate progress percentage (from 0% at 24 hours to 100% at 0 hours)
  const progressPercentage = ((24 * 3600 - time) / (24 * 3600)) * 100;

  // Confetti effect for when timer completes
  const renderConfetti = () => {
    if (!showConfetti) return null;
    
    return (
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
        {Array.from({ length: 50 }).map((_, i) => {
          const size = Math.random() * 8 + 5;
          const left = Math.random() * 100;
          const animationDuration = Math.random() * 3 + 2;
          const delay = Math.random() * 0.5;
          const color = ['bg-red-500', 'bg-blue-500', 'bg-yellow-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500'][Math.floor(Math.random() * 6)];
          
          return (
            <div 
              key={i}
              className={`absolute ${color} rounded-full`}
              style={{
                width: `${size}px`,
                height: `${size}px`,
                left: `${left}%`,
                top: '-20px',
                animation: `fall ${animationDuration}s ease-in ${delay}s forwards`
              }}
            />
          );
        })}
        <style jsx>{`
          @keyframes fall {
            0% { transform: translateY(0) rotate(0deg); opacity: 1; }
            100% { transform: translateY(400px) rotate(360deg); opacity: 0; }
          }
        `}</style>
      </div>
    );
  };

  return (
    <div className={`text-center ${style.bg} rounded-xl p-4 relative overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300`}>
      {renderConfetti()}
      
      <div className="flex items-center justify-center gap-2 relative z-1">
        <div className={`bg-white/80 backdrop-blur-sm rounded-lg ${sizeStyle.containerSize} transition-transform shadow-lg ${isAnimating ? 'scale-110' : ''}`}>
          <div className={`${sizeStyle.textSize} font-bold ${style.text}`}>{hours.toString().padStart(2, '0')}</div>
          <div className="text-xs text-center text-gray-500">Hours</div>
        </div>
        <div className={`${sizeStyle.textSize} font-bold ${style.text}`}>:</div>
        <div className={`bg-white/80 backdrop-blur-sm rounded-lg ${sizeStyle.containerSize} transition-transform shadow-lg ${isAnimating ? 'scale-110' : ''}`}>
          <div className={`${sizeStyle.textSize} font-bold ${style.text}`}>{minutes.toString().padStart(2, '0')}</div>
          <div className="text-xs text-center text-gray-500">Minutes</div>
        </div>
        <div className={`${sizeStyle.textSize} font-bold ${style.text}`}>:</div>
        <div className={`bg-white/80 backdrop-blur-sm rounded-lg ${sizeStyle.containerSize} transition-transform shadow-lg ${isAnimating ? 'scale-110' : ''}`}>
          <div className={`${sizeStyle.secondsSize} font-bold ${style.text} ${seconds < 10 ? 'animate-pulse' : ''}`}>{seconds.toString().padStart(2, '0')}</div>
          <div className="text-xs text-center text-gray-500">Seconds</div>
        </div>
      </div>
      
      <Progress
        aria-label="Timer progress"
        value={progressPercentage}
        color={style.progressColor}
        className="mt-4 h-3 rounded-full overflow-hidden"
        classNames={{
          indicator: "transition-all duration-500"
        }}
      />
      
      {time === 0 && (
        <div className="mt-3 animate-bounce text-sm font-semibold text-green-600">
          Reward Ready to Claim! 🎉
        </div>
      )}
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
  isPlanReward = false,
}) => {
  if (!rewards || rewards.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Gift className="w-16 h-16 mx-auto mb-4 opacity-30" />
        <p className="text-lg">No rewards {type === "claimed" ? "claimed yet" : "available"}</p>
        {type === "ready" && !isPlanReward && (
          <p className="text-sm mt-2">
            Rewards will appear here 24 hours after your referrals purchase plans
          </p>
        )}
        {type === "ready" && isPlanReward && (
          <p className="text-sm mt-2">
            Plan rewards become available every 24 hours after purchasing a plan
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
                          {reward.planName} Plan Daily Return (Your Own Plan)
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
                        ? `${(reward.commissionRate * 100) || 12}% Daily Return on Your Plan` 
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
                        className="font-bold w-full relative overflow-hidden group"
                        onClick={() => onClaim(reward._id)}
                        isLoading={claiming}
                        startContent={isDailyBonus ? <Coins className="w-4 h-4" /> : <Gift className="w-4 h-4" />}
                      >
                        <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-white/0 via-white/30 to-white/0 -translate-x-full animate-shimmer pointer-events-none"></span>
                        Claim Now
                      </Button>
                    )}
                    {type === "pending" && reward.timeRemaining > 0 && (
                      <div className="transform hover:scale-105 transition-all duration-300">
                        <RewardTimer 
                          timeRemaining={reward.timeRemaining} 
                          color={isDailyBonus ? "primary" : "warning"}
                          size="normal"
                        />
                      </div>
                    )}
                    {type === "claimed" && (
                      <div className="bg-gradient-to-r from-green-100 to-emerald-100 p-2 rounded-lg shadow-md">
                        <Chip 
                          color={isDailyBonus ? "primary" : "success"} 
                          variant="flat" 
                          startContent={<CheckCircle2 className="w-4 h-4" />}
                          className="font-medium"
                        >
                          Claimed
                        </Chip>
                      </div>
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
