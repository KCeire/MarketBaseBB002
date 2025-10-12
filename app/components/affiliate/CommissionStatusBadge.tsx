"use client";

type CommissionStatus = 'pending' | 'earned_pending_settlement' | 'earned';

interface CommissionStatusBadgeProps {
  status: CommissionStatus;
  className?: string;
}

export function CommissionStatusBadge({ status, className = "" }: CommissionStatusBadgeProps) {
  const getStatusConfig = (status: CommissionStatus) => {
    switch (status) {
      case 'pending':
        return {
          label: 'Pending',
          icon: '⏳',
          bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
          textColor: 'text-yellow-700 dark:text-yellow-400',
          borderColor: 'border-yellow-200 dark:border-yellow-800'
        };
      case 'earned_pending_settlement':
        return {
          label: 'Earned (Pending Settlement)',
          icon: '💰',
          bgColor: 'bg-blue-100 dark:bg-blue-900/20',
          textColor: 'text-blue-700 dark:text-blue-400',
          borderColor: 'border-blue-200 dark:border-blue-800'
        };
      case 'earned':
        return {
          label: 'Ready to Claim',
          icon: '✅',
          bgColor: 'bg-green-100 dark:bg-green-900/20',
          textColor: 'text-green-700 dark:text-green-400',
          borderColor: 'border-green-200 dark:border-green-800'
        };
      default:
        return {
          label: 'Unknown',
          icon: '❓',
          bgColor: 'bg-gray-100 dark:bg-gray-800',
          textColor: 'text-gray-700 dark:text-gray-400',
          borderColor: 'border-gray-200 dark:border-gray-700'
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span
      className={`
        inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border
        ${config.bgColor} ${config.textColor} ${config.borderColor} ${className}
      `}
    >
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </span>
  );
}