// app/category/[slug]/page.tsx
export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  return (
    <div className="w-full max-w-md mx-auto px-4 py-3 main-content-with-bottom-nav">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-900 capitalize">
          {slug.replace(/-/g, ' ')} Products
        </h1>
        <div className="text-center py-8">
          <p className="text-gray-500">Category page coming soon...</p>
        </div>
      </div>
    </div>
  );
}
