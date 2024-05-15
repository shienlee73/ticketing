import Link from "next/link";

const OrderList = ({ orders }) => {
  return (
    <ul>
      {orders.map((order) => {
        return (
          <div class="card mt-4">
            <div class="card-header">Order id: {order.id}</div>
            <div class="card-body">
              <h5 class="card-title">Ticket: {order.ticket.title}</h5>
              <p class="card-text">Status: {order.status}</p>
              <Link href={`/orders/${order.id}`} class="btn btn-primary">Detail</Link>
            </div>
          </div>
        );
      })}
    </ul>
  );
};

OrderList.getInitialProps = async (context, client) => {
  const { data } = await client.get("/api/orders");

  return { orders: data };
};

export default OrderList;
