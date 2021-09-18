// Create a Stripe client.
const stripe = Stripe(
  "pk_test_51JMcv4SHpbzoQu4sswnkIzgTgueOauLkg3pZ385yaLMDeEerbLXICs8Ql8yL6yxB9fgu9Cgt8CY7GepAlmxejWo600bhwWqT95"
);
// disabling the button until we have stripe setup on the page
document.getElementById("submit-button").disabled = true;
const token = document.getElementById("token").value;

fetch("/create-payment-intent", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "CSRF-TOKEN": token,
  },
})
  .then((result) => {
    return result.json();
  })
  .then((data) => {
    // Create an instance of Elements.
    const elements = stripe.elements();
    const style = {
      base: {
        color: "#32325d",
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: "antialiased",
        fontSize: "16px",
      },
      invalid: {
        color: "#fa755a",
        iconColor: "#fa755a",
      },
    };
    const card = elements.create("card", { style });
    // stripe injects an i-frame into the dom
    card.mount("#card-element");
    card.on("change", (event) => {
      // disable the pay button if there are no card details in the element
      document.getElementById("submit-button").disabled = event.empty;
      document.getElementById("card-errors").textContent = event.error
        ? event.error.message
        : "";
    });
    const form = document.getElementById("payment-form");
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      // complete the payment when the submit button is clicked
      payWithCard(stripe, card, data.clientSecret);
    });
  });

// calls stripe.confirmCardPayment
// if the card requires authentication ,stripe shows a pop-up modal to prompt the user to enter authentication details without leaving the page

const payWithCard = (stripe, card, clientSecret) => {
  stripe
    .confirmCardPayment(clientSecret, {
      payment_method: {
        card,
      },
    })
    .then((result) => {
      if (result.error) {
        // show error to your customer
        showError(result.error.message);
      } else {
        // The payment succeded
        orderComplete(result.paymentIntent.id);
      }
    });
};

/* ---------UI Helpers------------- */

// shows a success message when the payment is complete
const orderComplete = (paymentIntentId) => {
  const data = {
    paymentIntentId,
    address: document.getElementById("address").value,
  };
  fetch("/checkout", {
    method: "POST",
    headers: {
      "CONTENT-TYPE": "application/json",
      "CSRF-TOKEN": token,
    },
    body: JSON.stringify(data),
  }).then((result) => {
    window.location.replace(result.url);
  });
};
// shows an Error message when the payment fails
const showError = (message) => {
  document.getElementById("card-errors").textContent = message;
};
