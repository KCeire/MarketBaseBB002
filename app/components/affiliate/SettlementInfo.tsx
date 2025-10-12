"use client";

type CommissionStatus = 'pending' | 'earned_pending_settlement' | 'earned';

interface SettlementInfoProps {
  status: CommissionStatus;
  commissionEarnedAt?: string | null;
  commissionAmount?: number | null;
  className?: string;
}

export function SettlementInfo({
  status,
  commissionEarnedAt,
  commissionAmount,
  className = ""
}: SettlementInfoProps) {
  const getStatusInfo = () => {
    switch (status) {
      case 'pending':
        return {
          title: 'Awaiting Purchase',
          description: 'Commission will be earned when someone purchases through your link',
          amount: null
        };
      case 'earned_pending_settlement':
        return {
          title: 'Awaiting Delivery Notification',
          description: 'Commission earned! 20-day countdown will start when item is delivered',
          amount: commissionAmount
        };
      case 'earned':
        return {
          title: 'Ready to Claim',
          description: 'Item delivered and 20-day period completed',
          amount: commissionAmount
        };
      default:
        return {
          title: 'Unknown Status',
          description: 'Status information unavailable',
          amount: null
        };
    }
  };

  const info = getStatusInfo();

  return (
    <div className={`text-xs ${className}`}>
      <div className="font-medium text-gray-900 dark:text-gray-100">
        {info.title}
      </div>
      <div className="text-gray-600 dark:text-gray-400 mt-1">
        {info.description}
      </div>
      {info.amount && (
        <div className="text-gray-700 dark:text-gray-300 font-semibold mt-1">
          ${info.amount.toFixed(2)}
        </div>
      )}
      {commissionEarnedAt && (
        <div className="text-gray-500 dark:text-gray-500 mt-1">
          Earned: {new Date(commissionEarnedAt).toLocaleDateString()}
        </div>
      )}
    </div>
  );
}