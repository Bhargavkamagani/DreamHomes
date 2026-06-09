import { useState } from 'react'
import { PackagePlus } from 'lucide-react'
import DashboardCard from '../dashboard/DashboardCard.jsx'
import { saveSupplierProduct } from '../../services/gharService.js'

const productCategories = ['Cement', 'Steel', 'Sand', 'Bricks', 'Tiles', 'Paint', 'Electrical', 'Plumbing']

export default function ProductForm({ onProductSaved }) {
  const [productDetails, setProductDetails] = useState({ name: '', category: 'Cement', unit: 'bag', price: '', quantity: '' })

  const submitProduct = async (event) => {
    event.preventDefault()
    await saveSupplierProduct(productDetails)
    setProductDetails({ name: '', category: 'Cement', unit: 'bag', price: '', quantity: '' })
    onProductSaved?.()
  }

  return (
    <DashboardCard title="Add Product" icon={PackagePlus}>
      <form onSubmit={submitProduct} className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <input required value={productDetails.name} onChange={(event) => setProductDetails({ ...productDetails, name: event.target.value })} placeholder="Product name" className="rounded-xl border border-forest-100 px-3 py-2 text-sm" />
        <select value={productDetails.category} onChange={(event) => setProductDetails({ ...productDetails, category: event.target.value })} className="rounded-xl border border-forest-100 px-3 py-2 text-sm">
          {productCategories.map((category) => <option key={category}>{category}</option>)}
        </select>
        <input required value={productDetails.unit} onChange={(event) => setProductDetails({ ...productDetails, unit: event.target.value })} placeholder="Unit" className="rounded-xl border border-forest-100 px-3 py-2 text-sm" />
        <input required type="number" value={productDetails.price} onChange={(event) => setProductDetails({ ...productDetails, price: event.target.value })} placeholder="Price" className="rounded-xl border border-forest-100 px-3 py-2 text-sm" />
        <input required type="number" value={productDetails.quantity} onChange={(event) => setProductDetails({ ...productDetails, quantity: event.target.value })} placeholder="Quantity" className="rounded-xl border border-forest-100 px-3 py-2 text-sm md:col-span-2" />
        <button className="btn-primary h-11 rounded-xl md:col-span-2">Save product</button>
      </form>
    </DashboardCard>
  )
}
