import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/shop/ProductCard";
import { useQuery } from "@tanstack/react-query";

export default function Shop() {
  const { data: products = [] } = useQuery({
    queryKey: ["/api/products/featured"],
  });

  const { data: cartItems = [] } = useQuery({
    queryKey: ["/api/cart"],
  });

  const categories = [
    { name: "All", active: true },
    { name: "Merchandise", active: false },
    { name: "Vinyl Records", active: false },
    { name: "Digital", active: false },
    { name: "Accessories", active: false },
  ];

  return (
    <main className="flex-1 overflow-y-auto custom-scrollbar px-6 pb-24">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-poppins font-bold text-white">Creator Shop</h1>
        
        <Button
          variant="outline"
          className="flex items-center space-x-2 border-spotify-green text-spotify-green hover:bg-spotify-green hover:text-black"
        >
          <ShoppingCart className="w-5 h-5" />
          <span>Cart ({cartItems.length})</span>
        </Button>
      </div>

      {/* Categories */}
      <div className="flex space-x-4 mb-8 overflow-x-auto">
        {categories.map((category) => (
          <Button
            key={category.name}
            variant={category.active ? "default" : "outline"}
            className={`whitespace-nowrap ${
              category.active 
                ? "bg-spotify-green text-black hover:bg-spotify-light-green" 
                : "border-gray-600 text-gray-300 hover:text-white hover:border-gray-400"
            }`}
          >
            {category.name}
          </Button>
        ))}
      </div>

      {/* Featured Products */}
      <section className="mb-8">
        <h2 className="text-2xl font-poppins font-bold text-white mb-6">Featured Items</h2>
        
        {products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No products available</p>
            <p className="text-gray-500 mt-2">Check back later for new items</p>
          </div>
        )}
      </section>

      {/* Creator Spotlight */}
      <section>
        <h2 className="text-2xl font-poppins font-bold text-white mb-6">Creator Spotlight</h2>
        
        <div className="bg-gradient-to-r from-spotify-green to-creator-orange p-8 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">Support Your Favorite Artists</h3>
              <p className="text-white/90 mb-4">
                Every purchase directly supports independent creators and helps them continue making amazing music.
              </p>
              <Button className="bg-white text-black px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors">
                Learn More
              </Button>
            </div>
            <div className="hidden md:block">
              <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-16 h-16 text-white" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
