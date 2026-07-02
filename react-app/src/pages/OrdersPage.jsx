import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedOrderId, setExpandedOrderId] = useState(null)

  useEffect(() => {
    async function fetchOrders() {
      try {
        const response = await fetch('/api/orders', {
          credentials: 'include'
        })

        if (!response.ok) {
          throw new Error('Failed to fetch orders')
        }

        const data = await response.json()
        setOrders(data.orders || [])
      } catch (error) {
        console.error(error)
        toast.error('Could not load orders: ' + (error.message || error))
        setOrders([])
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'activated':
        return '#4CAF50'
      case 'draft':
        return '#2196F3'
      case 'cancelled':
        return '#f44336'
      default:
        return '#999'
    }
  }

  const toggleExpand = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId)
  }

  if (loading) {
    return (
      <section className="page-card">
        <h1>Your Orders</h1>
        <p>Loading orders...</p>
      </section>
    )
  }

  return (
    <section className="page-card">
      <h1>Your Orders</h1>

      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>
          <p>No orders yet. Start shopping to place your first order!</p>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order.Id} className="order-accordion">
              <div
                className="order-header"
                onClick={() => toggleExpand(order.Id)}
                style={{
                  cursor: 'pointer',
                  padding: '1rem',
                  backgroundColor: '#f5f5f5',
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: expandedOrderId === order.Id ? '0' : '1rem',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#efefef')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f5f5f5')}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                    <div>
                      <strong>Order #{order.OrderNumber}</strong>
                      <div style={{ fontSize: '0.9rem', color: '#666' }}>
                        {order.formattedDate} at {order.formattedTime}
                      </div>
                    </div>
                    <div>
                      <div
                        style={{
                          display: 'inline-block',
                          padding: '0.25rem 0.75rem',
                          backgroundColor: getStatusColor(order.Status),
                          color: 'white',
                          borderRadius: '4px',
                          fontSize: '0.85rem',
                          fontWeight: 'bold'
                        }}
                      >
                        {order.Status || 'Draft'}
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right', marginLeft: '1rem' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                    {(order.subtotal || 0).toLocaleString('hu-HU')} Ft
                  </div>
                  <div
                    style={{
                      fontSize: '1.5rem',
                      transition: 'transform 0.2s',
                      transform:
                        expandedOrderId === order.Id ? 'rotate(180deg)' : 'rotate(0deg)'
                    }}
                  >
                    ▼
                  </div>
                </div>
              </div>

              {expandedOrderId === order.Id && (
                <div
                  className="order-details"
                  style={{
                    backgroundColor: '#fafafa',
                    border: '1px solid #e0e0e0',
                    borderTop: 'none',
                    borderRadius: '0 0 4px 4px',
                    padding: '1rem',
                    marginBottom: '1rem'
                  }}
                >
                  <div style={{ marginBottom: '1rem' }}>
                    <strong>Order Details:</strong>
                    <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.5rem' }}>
                      <div>Order ID: {order.Id}</div>
                      {order.External_Id__c && (
                        <div>External ID: {order.External_Id__c}</div>
                      )}
                      <div>Status: {order.Status || 'Draft'}</div>
                    </div>
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <strong>Products ({order.items.length}):</strong>
                    <div style={{ marginTop: '0.5rem' }}>
                      {order.items.length > 0 ? (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid #ddd' }}>
                              <th style={{ textAlign: 'left', padding: '0.5rem' }}>Product</th>
                              <th style={{ textAlign: 'center', padding: '0.5rem', width: '80px' }}>Qty</th>
                              <th style={{ textAlign: 'right', padding: '0.5rem', width: '100px' }}>Unit Price</th>
                              <th style={{ textAlign: 'right', padding: '0.5rem', width: '100px' }}>Subtotal</th>
                            </tr>
                          </thead>
                          <tbody>
                            {order.items.map((item) => (
                              <tr key={item.Id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                <td style={{ padding: '0.5rem' }}>
                                  {item['Product2.Name'] || item.Product2Id || 'Product'}
                                </td>
                                <td style={{ textAlign: 'center', padding: '0.5rem' }}>
                                  {item.Quantity}
                                </td>
                                <td style={{ textAlign: 'right', padding: '0.5rem' }}>
                                  {(item.UnitPrice || 0).toLocaleString('hu-HU')} Ft
                                </td>
                                <td style={{ textAlign: 'right', padding: '0.5rem' }}>
                                  {((item.UnitPrice || 0) * (item.Quantity || 0)).toLocaleString(
                                    'hu-HU'
                                  )}{' '}
                                  Ft
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <div style={{ color: '#999', fontSize: '0.9rem' }}>No items in this order</div>
                      )}
                    </div>
                  </div>

                  <div
                    style={{
                      padding: '1rem',
                      backgroundColor: 'white',
                      borderRadius: '4px',
                      textAlign: 'right'
                    }}
                  >
                    <div style={{ fontSize: '1.1rem' }}>
                      <strong>Total: {(order.subtotal || 0).toLocaleString('hu-HU')} Ft</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
