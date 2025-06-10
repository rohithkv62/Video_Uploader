
import React from 'react';
import { Plan, PlanDetails } from '../types';
import { PLAN_DETAILS } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import { CloseIcon } from './IconComponents';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose }) => {
  const { upgradePlan, user, isLoadingAuth } = useAuth();

  if (!isOpen) return null;

  const handleUpgrade = (plan: Plan) => {
    upgradePlan(plan);
    // Modal can remain open to show loading state or user can close it.
    // onClose(); 
  };

  // Define which plans are shown in the modal for selection
  const plansToShowDetails: PlanDetails[] = [
    PLAN_DETAILS[Plan.DEMO],
    PLAN_DETAILS[Plan.BRONZE],
    PLAN_DETAILS[Plan.SILVER],
    PLAN_DETAILS[Plan.GOLD],
  ];

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75 flex items-center justify-center z-[90] p-4">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-3xl relative"> {/* Max width increased for 4 cards */}
        <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            aria-label="Close subscription modal"
          >
            <CloseIcon />
        </button>
        <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800 dark:text-white">Choose Your Plan</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {plansToShowDetails.map((planDetail: PlanDetails) => {
            const isCurrentPlan = user?.currentPlan === planDetail.name;
            let buttonText = 'Select Plan';

            if (!isCurrentPlan) {
                if (planDetail.name === Plan.DEMO) {
                    buttonText = 'Switch to Demo';
                } else if (user && PLAN_DETAILS[user.currentPlan].cost < planDetail.cost) {
                    buttonText = `Upgrade`;
                } else {
                    buttonText = `Switch Plan`;
                }
            }
            
            return (
              <div key={planDetail.name} className={`border p-4 rounded-lg shadow-md flex flex-col justify-between dark:border-gray-700 ${
                  isCurrentPlan ? 'border-primary-500 ring-2 ring-primary-500 dark:border-primary-400' : 'border-gray-300'
                } bg-gray-50 dark:bg-gray-700`}
              >
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-primary-600 dark:text-primary-400 truncate" title={planDetail.displayName}>{planDetail.displayName}</h3>
                  <p className="text-gray-700 dark:text-gray-300 mt-1 text-xs sm:text-sm">
                    {planDetail.maxWatchTime === Infinity
                      ? 'Unlimited watch time'
                      : `${planDetail.maxWatchTime / 60} mins watch time`}
                  </p>
                  <p className="text-xl sm:text-2xl font-semibold my-2 sm:my-3 text-gray-800 dark:text-white">
                    ₹{planDetail.cost}
                    {planDetail.cost > 0 && <span className="text-xs sm:text-sm font-normal text-gray-500 dark:text-gray-400">/month</span>}
                    {planDetail.cost === 0 && <span className="text-xs sm:text-sm font-normal text-gray-500 dark:text-gray-400"> (Free)</span>}
                  </p>
                </div>
                {isCurrentPlan ? (
                   <p className="mt-4 text-center text-green-600 dark:text-green-400 font-semibold py-2">Current Plan</p>
                ) : (
                  <button
                    onClick={() => handleUpgrade(planDetail.name)}
                    disabled={isLoadingAuth}
                    className="mt-4 w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors disabled:opacity-50"
                  >
                    {isLoadingAuth ? 'Processing...' : buttonText}
                  </button>
                )}
              </div>
            );
          })}
        </div>
         <p className="mt-6 text-xs text-center text-gray-500 dark:text-gray-400">
            Current Plan: {user ? PLAN_DETAILS[user.currentPlan].displayName : 'N/A'}. 
            {PLAN_DETAILS[Plan.BRONZE].cost > 0 && " Payments are simulated."}
          </p>
      </div>
    </div>
  );
};

export default SubscriptionModal;