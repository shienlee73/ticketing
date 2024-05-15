import { useState, useEffect } from "react";
import StripeCheckout from "react-stripe-checkout";
import Router from "next/router";
import useRequest from "../../hooks/useRequest";

const OrderShow = ({ currentUser, order }) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const { doRequest, errors } = useRequest({
    url: "/api/payments",
    method: "post",
    body: {
      orderId: order.id,
    },
    onSuccess: () => Router.push("/orders"),
  });

  useEffect(() => {
    const findTimeLeft = () => {
      const msLeft = new Date(order.expiresAt) - new Date();
      setTimeLeft(Math.round(msLeft / 1000));
    };

    const timer = setInterval(findTimeLeft, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  if (order.status === 'complete') {
    return <div>Order completed</div>;
  }

  if (timeLeft == 0) {
    return <div>Waiting...</div>
  }

  if (timeLeft < 0) {
    return <div>Order Expired</div>;
  }

  return (
    <div>
      <div>Time left to pay: {timeLeft} seconds</div>
      <StripeCheckout
        token={({ id }) => doRequest({ token: id })}
        stripeKey="pk_test_51Kh6nmFx76K28Lys3mrnWBpeYxJbSAyCX26MYTTC1EdudxAQjQZmSunkzyHS1QIdHvXlYbv7UPGppEK6DfWO1UXp002z0tZlsk"
        amount={order.ticket.price * 100}
        email={currentUser.email}
      />
      {errors}
    </div>
  );
};

OrderShow.getInitialProps = async (context, client) => {
  const { orderId } = context.query;
  const { data } = await client.get(`/api/orders/${orderId}`);

  return { order: data };
};

export default OrderShow;
