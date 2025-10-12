"use client";

interface ProductInfo {
  id: string;
  title: string;
  price: string;
  image: string;
  vendor?: string;
}

interface ProductInfoCardProps {
  product: ProductInfo;
  className?: string;
}

export function ProductInfoCard({ product, className = "" }: ProductInfoCardProps) {
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
        {product.image ? (
          <img
            src={product.image}
            alt={product.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                parent.innerHTML = `
                  <div class="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500 text-xs">
                    No Image
                  </div>
                `;
              }
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500 text-xs">
            No Image
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
          {product.title}
        </p>
        <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
          <span className="font-semibold text-gray-700 dark:text-gray-300">${product.price}</span>
          {product.vendor && (
            <>
              <span>•</span>
              <span className="truncate">{product.vendor}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}