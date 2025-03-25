import React from "react";
import PropTypes from "prop-types";
import "../../../style/scss/components/Pos Components/Pos_Payment.scss";

const Pos_Payment = ({
  inputValue,
  resetInput,
  setPaymentMethods,
  totalValue,
  setBalance,
  setIsPaymentStarted,
  paymentMethods, // Added as a prop
}) => {
  const handlePayment = (type) => {
    let amount;
    // Check if inputValue is "0" or empty (no amount entered)
    if (!inputValue || inputValue === "0") {
      const currentTotal = totalValue;
      const totalPaidSoFar = paymentMethods.reduce((sum, method) => sum + method.amount, 0);
      const remainingBalance = currentTotal - totalPaidSoFar;

      // If no payments have been made yet, use the total value
      // Otherwise, use the remaining balance (if negative, take absolute value)
      amount = totalPaidSoFar === 0 ? currentTotal : Math.abs(remainingBalance);
    } else {
      // Use the entered amount if provided
      amount = parseFloat(inputValue) || 0;
    }

    if (amount > 0 && totalValue > 0) {
      const paymentData = { type, amount };
      setPaymentMethods((prevMethods) => {
        const newMethods = [...prevMethods, paymentData];
        const totalPaid = newMethods.reduce((sum, method) => sum + method.amount, 0);
        const newBalance = totalPaid - totalValue;
        setBalance(newBalance);
        setIsPaymentStarted(true);
        return newMethods;
      });
      resetInput();
    }
  };

  return (
    <div className="col-span-3 grid grid-rows-2 gap-1">
      <button
        className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg text-base font-bold transition-colors shadow-md hover:shadow-lg border-0"
        onClick={() => handlePayment("Cash")}
      >
        💵 Cash
      </button>
      <button
        className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg text-base font-bold transition-colors shadow-md hover:shadow-lg border-0"
        onClick={() => handlePayment("Card")}
      >
        💳 Card
      </button>
    </div>
  );
};

Pos_Payment.propTypes = {
  inputValue: PropTypes.string.isRequired,
  resetInput: PropTypes.func.isRequired,
  setPaymentMethods: PropTypes.func.isRequired,
  totalValue: PropTypes.number.isRequired,
  setBalance: PropTypes.func.isRequired,
  setIsPaymentStarted: PropTypes.func.isRequired,
  paymentMethods: PropTypes.arrayOf(
    PropTypes.shape({
      type: PropTypes.string,
      amount: PropTypes.number,
    })
  ).isRequired,
};

export default Pos_Payment;