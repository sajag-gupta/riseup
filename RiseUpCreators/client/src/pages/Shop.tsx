
import { useState } from "react";
import { ShoppingCart, Search, Filter, Star, Heart, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
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

const SAMPLE_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Premium Audio Interface",
    description: "Professional 24-bit/192kHz audio interface for studio recording",
    price: 299.99,
    imageUrl: "",
    category: "Audio Equipment",
    rating: 4.8,
    reviews: 156,
    inStock: true,
    featured: true,
  },
  {
    id: "2",
    name: "Studio Monitor Headphones",
    description: "High-fidelity headphones for critical listening and mixing",
    price: 199.99,
    imageUrl: "",
    category: "Headphones",
    rating: 4.6,
    reviews: 89,
    inStock: true,
  },
  {
    id: "3",
    name: "Condenser Microphone",
    description: "Professional large-diaphragm condenser mic for vocals",
    price: 249.99,
    imageUrl: "",
    category: "Microphones",
    rating: 4.9,
    reviews: 203,
    inStock: false,
  },
  {
    id: "4",
    name: "MIDI Controller Keyboard",
    description: "49-key MIDI controller with velocity-sensitive keys",
    price: 149.99,
    imageUrl: "",
    category: "MIDI Controllers",
    rating: 4.5,
    reviews: 67,
    inStock: true,
    featured: true,
  },
  {
    id: "5",
    name: "Acoustic Treatment Panels",
    description: "High-density foam panels for acoustic treatment",
    price: 79.99,
    imageUrl: "",
    category: "Studio Accessories",
    rating: 4.3,
    reviews: 34,
    inStock: true,
  },
  {
    id: "6",
    name: "Digital Audio Workstation",
    description: "Professional music production software suite",
    price: 399.99,
    imageUrl: "",
    category: "Software",
    rating: 4.7,
    reviews: 412,
    inStock: true,
  },
];

export default function Shop() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("featured");

  // Using sample data for now
  const products = SAMPLE_PRODUCTS;

  const handleAddToCart = (product: Product) => {
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

  // Filter and sort products
  const filteredProducts = products
    .filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "rating":
          return b.rating - a.rating;
        case "featured":
        default:
          return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      }
    });

  // Get unique categories
  const categories = ["all", ...Array.from(new Set(products.map(p => p.category)))];

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar pb-20 sm:pb-24">
      {/* Header */}
      <div className="bg-gradient-to-b from-creator-orange/20 to-spotify-black px-4 md:px-6 py-6 md:py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold text-white mb-2 md:mb-4">Music Shop</h1>
          <p className="text-white/80 text-sm md:text-base mb-4 md:mb-6">
            Professional music equipment and software • {filteredProducts.length} products
          </p>
          
          {/* Search and Filter Controls */}
          <div className="flex flex-col gap-3 md:gap-4">
            <div className="relative max-w-full sm:max-w-md">
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 md:py-3 bg-white/95 border-0 rounded-full text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-creator-orange text-sm md:text-base"
              />
              <Search className="w-4 h-4 md:w-5 md:h-5 text-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-48 bg-white/95 border-0 text-black rounded-full text-sm md:text-base">
                  <Filter className="w-4 h-4 mr-2 flex-shrink-0" />
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category === "all" ? "All Categories" : category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-40 bg-white/95 border-0 text-black rounded-full text-sm md:text-base">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="px-4 md:px-6 py-4 md:py-6 max-w-6xl mx-auto">
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="bg-spotify-light-gray/50 border-gray-700/50 hover:bg-gray-700/50 transition-colors group">
                <CardContent className="p-4 md:p-6">
                  {/* Product Image */}
                  <div className="relative mb-4">
                    <div className="w-full aspect-square bg-gradient-to-br from-creator-orange to-spotify-green rounded-lg overflow-hidden mb-4">
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
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-white p-2"
                        >
                          <Heart className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleAddToCart(product)}
                          disabled={!product.inStock}
                          size="sm"
                          className="bg-creator-orange hover:bg-creator-orange/90 text-black px-3 py-2 text-xs md:text-sm"
                        >
                          <ShoppingCart className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                          Add
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 md:py-16">
            <Package className="w-16 h-16 md:w-20 md:h-20 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl md:text-2xl font-semibold text-white mb-2">
              {searchQuery.trim() || selectedCategory !== "all" ? "No products found" : "No products available"}
            </h3>
            <p className="text-gray-400 mb-6 text-sm md:text-base">
              {searchQuery.trim() || selectedCategory !== "all" 
                ? "Try adjusting your search or filter criteria" 
                : "Check back later for new products"
              }
            </p>
            {(searchQuery.trim() || selectedCategory !== "all") && (
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={() => setSearchQuery("")}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700"
                >
                  Clear Search
                </Button>
                <Button
                  onClick={() => setSelectedCategory("all")}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700"
                >
                  Show All Categories
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
