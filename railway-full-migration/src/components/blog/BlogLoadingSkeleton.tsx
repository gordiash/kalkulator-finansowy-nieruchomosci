export default function BlogLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 animate-pulse">
      <div className="container mx-auto px-4 py-8">
        {/* Header skeleton */}
        <div className="text-center mb-12">
          <div className="h-10 bg-gray-300 rounded w-64 mx-auto mb-4"></div>
          <div className="h-6 bg-gray-300 rounded w-96 mx-auto"></div>
        </div>

        {/* Filter skeleton */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-6">
            <div className="flex-1 max-w-md">
              <div className="h-10 bg-gray-300 rounded-lg w-full"></div>
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="h-8 bg-gray-300 rounded-full w-20"></div>
              <div className="h-8 bg-gray-300 rounded-full w-24"></div>
              <div className="h-8 bg-gray-300 rounded-full w-28"></div>
              <div className="h-8 bg-gray-300 rounded-full w-22"></div>
            </div>
          </div>
        </div>

        {/* Cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Image skeleton */}
              <div className="h-48 bg-gray-300"></div>
              
              {/* Content skeleton */}
              <div className="p-6">
                {/* Meta info skeleton */}
                <div className="flex items-center mb-3">
                  <div className="h-4 bg-gray-300 rounded w-20"></div>
                  <div className="mx-2 w-1 h-1 bg-gray-300 rounded-full"></div>
                  <div className="h-4 bg-gray-300 rounded w-24"></div>
                </div>
                
                {/* Title skeleton */}
                <div className="space-y-2 mb-3">
                  <div className="h-6 bg-gray-300 rounded w-full"></div>
                  <div className="h-6 bg-gray-300 rounded w-3/4"></div>
                </div>
                
                {/* Excerpt skeleton */}
                <div className="space-y-2 mb-4">
                  <div className="h-4 bg-gray-300 rounded w-full"></div>
                  <div className="h-4 bg-gray-300 rounded w-full"></div>
                  <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                </div>
                
                {/* Tags skeleton */}
                <div className="flex gap-2 mb-4">
                  <div className="h-6 bg-gray-300 rounded w-16"></div>
                  <div className="h-6 bg-gray-300 rounded w-20"></div>
                  <div className="h-6 bg-gray-300 rounded w-14"></div>
                </div>
                
                {/* Read more skeleton */}
                <div className="h-5 bg-gray-300 rounded w-24"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination skeleton */}
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <div className="h-5 bg-gray-300 rounded w-48"></div>
          <div className="flex space-x-1">
            <div className="h-10 w-24 bg-gray-300 rounded"></div>
            <div className="h-10 w-10 bg-gray-300 rounded"></div>
            <div className="h-10 w-10 bg-gray-300 rounded"></div>
            <div className="h-10 w-10 bg-gray-300 rounded"></div>
            <div className="h-10 w-24 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
} 