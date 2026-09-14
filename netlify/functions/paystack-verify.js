export default async (request) => {
  try {
    if (request.method !== "POST") {
      return new Response(
        JSON.stringify({
          status: false,
          message: "Method not allowed",
        }),
        {
          status: 405,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    const body = await request.json();

    const { reference, expectedAmount } = body;

    if (!reference) {
      return new Response(
        JSON.stringify({
          status: false,
          message: "Payment reference is required.",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!secretKey) {
      console.error("PAYSTACK_SECRET_KEY is missing.");

      return new Response(
        JSON.stringify({
          status: false,
          message: "Paystack server configuration is missing.",
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    const paystackResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(
        reference,
      )}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
      },
    );

    const data = await paystackResponse.json();

    if (!paystackResponse.ok || !data.status) {
      console.error("Paystack verification failed:", data);

      return new Response(
        JSON.stringify({
          status: false,
          message: data.message || "Unable to verify payment.",
        }),
        {
          status: paystackResponse.status || 500,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    const transaction = data.data;

    // Paystack reports the transaction amount in kobo.
    const expectedAmountInKobo =
      expectedAmount !== undefined && expectedAmount !== null
        ? Math.round(Number(expectedAmount) * 100)
        : null;

    // Make sure Paystack says the transaction succeeded.
    if (transaction.status !== "success") {
      return new Response(
        JSON.stringify({
          status: false,
          message: "Payment was not successful.",
          data: {
            reference: transaction.reference,
            paymentStatus: transaction.status,
          },
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    // Make sure the currency is correct.
    if (transaction.currency !== "NGN") {
      return new Response(
        JSON.stringify({
          status: false,
          message: "Invalid payment currency.",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    // Make sure the amount paid matches the amount RentEase expected.
    if (
      expectedAmountInKobo !== null &&
      transaction.amount !== expectedAmountInKobo
    ) {
      console.error("Payment amount mismatch:", {
        expected: expectedAmountInKobo,
        received: transaction.amount,
        reference: transaction.reference,
      });

      return new Response(
        JSON.stringify({
          status: false,
          message: "Payment amount does not match the expected amount.",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    return new Response(
      JSON.stringify({
        status: true,
        message: "Payment verified successfully.",
        data: {
          reference: transaction.reference,
          amount: transaction.amount,
          currency: transaction.currency,
          status: transaction.status,
          channel: transaction.channel,
          paidAt: transaction.paid_at,
          customer: {
            email: transaction.customer?.email || "",
          },
          metadata: transaction.metadata || {},
        },
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    console.error("Paystack verification error:", error);

    return new Response(
      JSON.stringify({
        status: false,
        message: "Something went wrong while verifying payment.",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
};
