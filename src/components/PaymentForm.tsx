"use client";

import { useDispatch, useSelector } from "react-redux";
import { Products, StateProps } from "../../type";
import FormattedPrice from "./FormattedPrice";
import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { useSession } from "next-auth/react";
import { resetCart, saveOrder } from "@/redux/shoppingSlice";

const PaymentForm = () => {
  const dispatch = useDispatch();
  const { productData, userInfo } = useSelector(
    (state: StateProps) => state?.shopping
  );
  const [totalAmt, setTotalAmt] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let amt = 0;
    productData.map((item: Products) => {
      amt += item.price * item.quantity;
      return;
    });
    setTotalAmt(amt);
  }, [productData]);

  // =============  Stripe Payment Start here ==============

  const stripePromise = loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
  );
  const { data: session } = useSession();

  // const handleCheckout = async () => {
  //   setLoading(true);

  //   const stripe = await stripePromise;
  //   const response = await fetch("http://localhost:3000/api/checkout", {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({
  //       items: productData,
  //       email: session?.user?.email,
  //     }),
  //   });
  //   const data = await response.json();

  //   if (response.ok) {
  //     await dispatch(saveOrder({ order: productData, id: data.id }));
  //     stripe?.redirectToCheckout({ sessionId: data.id });
  //     dispatch(resetCart());
  //   } else {
  //     setLoading(false);
  //     throw new Error("Failed to create Stripe Payment");
  //   }
  // };

  const handleCheckout = async () => {
    setLoading(true);

    const stripe = await stripePromise;
    const response = await fetch("http://localhost:3000/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: productData,
        email: session?.user?.email,
      }),
    });
    const data = await response.json();

    if (response.ok) {
      await dispatch(saveOrder({ order: productData, id: data.id }));
      stripe?.redirectToCheckout({ sessionId: data.id })
        .then((result) => {
          if (result.error) {

            throw new Error("Failed to redirect to checkout");
          } else {
            // Payment successfu
            dispatch(resetCart()); // Reset the cart after successful payment
          }
        });
    } else {
      setLoading(false);
      throw new Error("Failed to create Stripe Payment");
    }
  };

  // =============  Stripe Payment End here ================

  return (
    <div className="w-full bg-white p-4">
      <h2>Cart Totals</h2>

      {userInfo ? (
        <button
          onClick={handleCheckout}
          className={`bg-black text-slate-100 mt-4 py-3 px-6 hover:bg-orange-950 cursor-pointer duration-200 ${loading ? 'opacity-75 pointer-events-none' : ''}`}
        >
          {loading ? 'Loading...' : 'Proceed to checkout'}
        </button>
      ) : (
        <div>
          <button className="bg-black text-slate-100 mt-4 py-3 px-6 hover:bg-orange-950 cursor-not-allowed duration-200">
            Proceed to checkout
          </button>
          <p className="text-base mt-1 text-red-500 font-semibold animate-bounce">
            Please login to continue
          </p>
        </div>
      )}
    </div>
  );
};

export default PaymentForm;
