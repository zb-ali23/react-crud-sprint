
import { useEffect, useState } from 'react'

function App() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [price, setPrice] = useState('')
  const [editingId, setEditingId] = useState(null)

  // GET: Fetch products
  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch('https://dummyjson.com/products')
        if (!res.ok) throw new Error('Failed to fetch products')
        const data = await res.json()
        setProducts(data.products)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  // POST: Add a product
  async function addProduct(e) {
    e.preventDefault()

    if (!title.trim() || price === '' || Number(price) <= 0) {
      alert('Enter a product name and a valid price.')
      return
    }

    try {
      const res = await fetch('https://dummyjson.com/products/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), price: Number(price) }),
      })

      if (!res.ok) throw new Error('Failed to add product')

      const data = await res.json()

      // Use a local ID so the simulated product can be edited and deleted.
      setProducts((current) => [
        { ...data, id: Date.now() },
        ...current,
      ])

      setTitle('')
      setPrice('')
    } catch (error) {
      console.error(error)
      alert('Could not add product.')
    }
  }

  // Select a product for editing
  function startEdit(product) {
    setEditingId(product.id)
    setTitle(product.title)
    setPrice(String(product.price))
  }

  // PATCH: Update a product
  async function updateProduct(e) {
    e.preventDefault()

    if (!title.trim() || price === '' || Number(price) <= 0) {
      alert('Enter a product name and a valid price.')
      return
    }

    try {
      const res = await fetch(
        `https://dummyjson.com/products/${editingId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: title.trim(),
            price: Number(price),
          }),
        }
      )

      if (!res.ok) throw new Error('Failed to update product')

      const data = await res.json()

      setProducts((current) =>
        current.map((product) =>
          product.id === editingId
            ? { ...product, ...data, id: editingId }
            : product
        )
      )

      setEditingId(null)
      setTitle('')
      setPrice('')
    } catch (error) {
      console.error(error)
      alert('Could not update product.')
    }
  }

  // DELETE: Delete a product
  async function deleteProduct(id) {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return
    }

    try {
      const res = await fetch(`https://dummyjson.com/products/${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Failed to delete product')

      setProducts((current) =>
        current.filter((product) => product.id !== id)
      )

      if (editingId === id) {
        setEditingId(null)
        setTitle('')
        setPrice('')
      }
    } catch (error) {
      console.error(error)
      alert('Could not delete product.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="mb-6 text-3xl font-bold text-blue-600">
        Product Management
      </h1>

      <form
        onSubmit={editingId !== null ? updateProduct : addProduct}
        className="mb-8 flex flex-wrap gap-3 rounded-lg bg-white p-5 shadow"
      >
        <input
          className="rounded border p-2"
          placeholder="Product name"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <input
          className="rounded border p-2"
          type="number"
          min="0.01"
          step="0.01"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />

        <button
          className="rounded bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
          type="submit"
        >
          {editingId !== null ? 'Save Update' : 'Add Product'}
        </button>

        {editingId !== null && (
          <button
            className="rounded bg-gray-500 px-5 py-2 text-white"
            type="button"
            onClick={() => {
              setEditingId(null)
              setTitle('')
              setPrice('')
            }}
          >
            Cancel
          </button>
        )}
      </form>

      {loading ? (
        <p>Loading products...</p>
      ) : products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {products.map((product) => (
            <div
              key={product.id}
              className="rounded-lg bg-white p-5 shadow"
            >
              <h2 className="text-lg font-semibold">{product.title}</h2>

              <p className="mt-2 text-gray-600">
                Price: ${product.price}
              </p>

              <button
                className="mt-4 rounded bg-orange-500 px-4 py-2 text-white"
                onClick={() => startEdit(product)}
              >
                Edit
              </button>

              <button
                className="ml-2 mt-4 rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                onClick={() => deleteProduct(product.id)}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default App
