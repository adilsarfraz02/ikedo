"use client";

import React from 'react';
import { 
  Card, 
  CardBody, 
  Button,
  Badge, 
  Progress 
} from "@nextui-org/react";
import { Gift, Users, Clock, ArrowRight, CheckCircle } from "lucide-react";

// Component to display referral stats and card in the dashboard
const ReferralCard = ({ 
  stats = {}, 
  userData = {}, 
  onClaimReferrals = () => {}, 
  claiming = false 
}) => {
  return (
    <Card className="bg-gradient-to-br from-purple-50 to-fuchsia-50 overflow-hidden border border-purple-100">
      <CardBody className="p-0">
        <div className="flex flex-col md:flex-row">
          <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-6 md:w-2/5 text-white">
            <h3 className="text-xl font-bold flex items-center gap-2 mb-3">
              <Users className="w-6 h-6" />
              Referral Rewards
            </h3>
            <p className="text-sm opacity-90 mb-4">
              Earn 12% cashback when users you refer activate a plan
            </p>
            <div className="bg-white/20 backdrop-blur-md rounded-lg p-3 mb-3">
              <div className="text-xs uppercase opacity-75 mb-1">Your Referral Link</div>
              <div className="flex items-center gap-2">
                <div className="bg-white/20 rounded p-2 px-3 text-sm font-mono flex-1 truncate">
                  {window?.location?.origin}/auth/signup?ref={userData?.referralCode || "loading"}
                </div>
                <Button 
                  isIconOnly 
                  size="sm" 
                  variant="flat" 
                  color="default"
                  className="bg-white/30"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `${window?.location?.origin}/auth/signup?ref=${userData?.referralCode}`
                    );
                    // Show toast or notification
                  }}
                >
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5.25H7.5C6.25736 5.25 5.25 6.25736 5.25 7.5V16.5C5.25 17.7426 6.25736 18.75 7.5 18.75H16.5C17.7426 18.75 18.75 17.7426 18.75 16.5V15M9 5.25H16.5C17.7426 5.25 18.75 6.25736 18.75 7.5V15M9 5.25L18.75 15"></path>
                  </svg>
                </Button>
              </div>
            </div>
            <div className="text-xs opacity-75">
              Share your link and earn 12% when your referrals join
            </div>
          </div>

          <div className="p-6 flex-1">
            <div className="flex flex-col h-full justify-between">
              <div>
                <div className="flex justify-between mb-4">
                  <div>
                    <div className="text-sm text-gray-500">Total Referrals</div>
                    <div className="text-2xl font-bold text-purple-600">
                      {stats.totalReferrals || 0}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Total Earned</div>
                    <div className="text-2xl font-bold text-purple-600">
                      PKR {stats.totalReferralEarnings?.toFixed(2) || "0.00"}
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-500">Pending Rewards</span>
                    <span className="text-sm font-medium text-purple-600">
                      PKR {stats.pendingReferralRewards?.toFixed(2) || "0.00"}
                    </span>
                  </div>
                  <Progress 
                    value={50} // This should be calculated based on ready vs pending ratio
                    color="secondary"
                    className="h-2"
                  />
                </div>
              </div>

              <div className="mt-4">
                {stats.referralReadyToClaimCount > 0 ? (
                  <Button
                    color="secondary"
                    className="w-full"
                    startContent={<Gift className="w-4 h-4" />}
                    onClick={onClaimReferrals}
                    isLoading={claiming}
                  >
                    Claim {stats.referralReadyToClaimCount} Rewards (PKR {stats.referralReadyToClaimAmount?.toFixed(2) || "0.00"})
                  </Button>
                ) : (
                  <div className="bg-purple-50 p-3 rounded-lg text-center">
                    <div className="text-purple-600 flex justify-center mb-2">
                      <Clock className="w-5 h-5" />
                    </div>
                    <p className="text-sm text-gray-600">No referral rewards ready to claim yet</p>
                    <a href="/dashboard" className="text-xs text-purple-600 mt-2 inline-block">
                      View your referrals <ArrowRight className="w-3 h-3 inline" />
                    </a>
                  </div>
                )}

                {stats.referralReadyToClaimCount > 0 && (
                  <div className="mt-2 text-xs text-center text-gray-500">
                    <Badge color="success" variant="flat" size="sm" className="mr-1">
                      <CheckCircle className="w-3 h-3 mr-1" /> Ready to claim
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default ReferralCard;