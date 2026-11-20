import ShopPage from '../customer/ShopPage'

// Dealers use the same shop/cart flow but may see dealer pricing in the future
export default function DealerOrders() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Bulk Orders</h1>
      <p className="text-gray-500 text-sm">Add items to cart and checkout to place a bulk order.</p>
      <ShopPage />
    </div>
  )
}
