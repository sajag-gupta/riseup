
import { useState } from "react";
import { ShoppingCart, Heart, Star, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  category: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  featured?: boolean;
}

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { toast } = useToast();
  const [isLiked, setIsLiked] = useState(false);

  const handleAddToCart = () => {
    if (!product.inStock) {
      toast({
        title: "Out of Stock",
        description: "This item is currently out of stock.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const handleToggleLike = () => {
    setIsLiked(!isLiked);
    toast({
      title: isLiked ? "Removed from Wishlist" : "Added to Wishlist",
      description: `${product.name} has been ${isLiked ? "removed from" : "added to"} your wishlist.`,
    });
  };

  return (
    <Card className="bg-spotify-light-gray/50 border-gray-700/50 hover:bg-gray-700/50 transition-colors group">
      <CardContent className="p-4 md:p-6">
        {/* Product Image */}
        <div className="relative mb-4">
          <div className="w-full aspect-square bg-gradient-to-br from-creator-orange to-spotify-green rounded-lg overflow-hidden">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="w-12 h-12 md:w-16 md:h-16 text-white" />
              </div>
            )}
          </div>
          
          {/* Featured Badge */}
          {product.featured && (
            <Badge className="absolute top-2 left-2 bg-creator-orange text-black text-xs">
              Featured
            </Badge>
          )}
          
          {/* Stock Status */}
          {!product.inStock && (
            <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
              <Badge variant="destructive" className="text-sm">
                Out of Stock
              </Badge>
            </div>
          )}
        </div>
        
        {/* Product Info */}
        <div className="space-y-2 md:space-y-3">
          <div>
            <h3 className="font-semibold text-white text-sm md:text-base line-clamp-1">{product.name}</h3>
            <p className="text-gray-400 text-xs md:text-sm line-clamp-2">{product.description}</p>
          </div>
          
          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 md:w-4 md:h-4 ${
                    i < Math.floor(product.rating)
                      ? "text-yellow-400 fill-current"
                      : "text-gray-600"
                  }`}
                />
              ))}
            </div>
            <span className="text-white text-xs md:text-sm">{product.rating}</span>
            <span className="text-gray-400 text-xs">({product.reviews})</span>
          </div>
          
          {/* Category */}
          <Badge variant="secondary" className="text-xs">
            {product.category}
          </Badge>
          
          {/* Price and Actions */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xl md:text-2xl font-bold text-creator-orange">
              ${product.price}
            </span>
            <div className="flex gap-2">
              <Button
                onClick={handleToggleLike}
                variant="ghost"
                size="sm"
                className={`p-2 ${isLiked ? "text-red-500" : "text-gray-400 hover:text-white"}`}
              >
                <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
              </Button>
              <Button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                size="sm"
                className="bg-creator-orange hover:bg-creator-orange/90 text-black px-3 py-2 text-xs md:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                Add
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
