import { useState, useEffect } from "react";

const TestComponent = ({ isOpen, onClose, order }) => {
  const [localOrder, setLocalOrder] = useState(order);

  if (!localOrder) return null;

  const renderDetails = () => (
    <div className="space-y-4">
      <p>Test</p>
    </div>
  );

  return (
    <>
      <div>{renderDetails()}</div>
    </>
  );
};

export default TestComponent;
