interface Product {
  id: string;
  name: string;
  price: string;
  imageUrl?: string;
  category: string;
}

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="bg-spotify-light-gray rounded-lg overflow-hidden hover:bg-gray-700 transition-colors cursor-pointer group">
      <img
        src={product.imageUrl || "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300"}
        alt={product.name}
        className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
      />
      <div className="p-4">
        <h3 className="font-semibold text-white mb-1 truncate">{product.name}</h3>
        <p className="text-gray-400 text-sm mb-2 capitalize">{product.category}</p>
        <p className="text-spotify-green font-bold">${product.price}</p>
      </div>
    </div>
  );
}
