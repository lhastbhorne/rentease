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

    const { email, amount, reference, metadata = {} } = body;

    if (!email) {
      return new Response(
        JSON.stringify({
          status: false,
          message: "Email is required.",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    if (!amount || Number(amount) <= 0) {
      return new Response(
        JSON.stringify({
          status: false,
          message: "A valid amount is required.",
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

    const transactionReference =
      reference ||
      `RENTEASE-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase()}`;

    const callbackUrl =
      metadata.callbackUrl || `${new URL(request.url).origin}/payment/callback`;

    const paystackResponse = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          amount: Math.round(Number(amount) * 100),
          currency: "NGN",
          reference: transactionReference,
          callback_url: callbackUrl,
          metadata: {
            ...metadata,
            platform: "RentEase",
          },
        }),
      },
    );

    const data = await paystackResponse.json();

    if (!paystackResponse.ok || !data.status) {
      console.error("Paystack initialization failed:", data);

      return new Response(
        JSON.stringify({
          status: false,
          message: data.message || "Failed to initialize Paystack transaction.",
        }),
        {
          status: paystackResponse.status || 500,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    return new Response(
      JSON.stringify({
        status: true,
        message: "Paystack transaction initialized successfully.",
        data: {
          authorization_url: data.data.authorization_url,
          access_code: data.data.access_code,
          reference: data.data.reference,
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
    console.error("Paystack initialization error:", error);

    return new Response(
      JSON.stringify({
        status: false,
        message: "Something went wrong while initializing payment.",
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
