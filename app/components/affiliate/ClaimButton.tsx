"use client";

interface ClaimButtonProps {
  totalClaimable: number;
  canClaim: boolean;
  onClaim?: () => void;
  className?: string;
}

export function ClaimButton({
  totalClaimable,
  canClaim,
  onClaim,
  className = ""
}: ClaimButtonProps) {
  const handleClick = () => {
    if (canClaim && onClaim) {
      onClaim();
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Total Claimable Amount */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Total Available to Claim
        </div>
        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          ${totalClaimable.toFixed(2)}
        </div>
        {!canClaim && totalClaimable > 0 && (
          <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            Pending delivery confirmation
          </div>
        )}
      </div>

      {/* Claim Button */}
      <button
        onClick={handleClick}
        disabled={!canClaim}
        className={`
          w-full py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200
          ${canClaim
            ? 'bg-green-600 hover:bg-green-700 text-white shadow-sm hover:shadow-md'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
          }
        `}
      >
        {canClaim ? (
          <>
            <span className="mr-2">💰</span>
            Claim Commission
          </>
        ) : (
          <>
            <span className="mr-2">⏳</span>
            {totalClaimable > 0
              ? 'Awaiting Settlement Period'
              : 'No Commissions to Claim'
            }
          </>
        )}
      </button>

      {/* Info Text */}
      <div className="text-xs text-gray-500 dark:text-gray-500 text-center">
        {canClaim ? (
          'No minimum payout threshold • Zero transaction fees'
        ) : totalClaimable > 0 ? (
          'Commissions are claimable 20 days after delivery confirmation'
        ) : (
          'Share products to start earning commissions'
        )}
      </div>
    </div>
  );
}