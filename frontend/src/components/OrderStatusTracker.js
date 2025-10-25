import React from 'react';
import { FaCheck, FaCircle, FaCut, FaTshirt, FaRegClock, FaTruck, FaTimes } from 'react-icons/fa';
import './OrderStatusTracker.css';

const OrderStatusTracker = ({ currentStatus }) => {
  const statuses = [
    { id: 'Order Placed', label: 'Order Placed', icon: FaCheck },
    { id: 'Cutting', label: 'Cutting', icon: FaCut },
    { id: 'Stitching', label: 'Stitching', icon: FaTshirt },
    { id: 'Trial', label: 'Trial', icon: FaRegClock },
    { id: 'Ready', label: 'Ready', icon: FaCheck },
    { id: 'Delivered', label: 'Delivered', icon: FaTruck }
  ];

  const getCurrentIndex = () => {
    const index = statuses.findIndex(s => s.id === currentStatus);
    return index >= 0 ? index : -1;
  };

  const currentIndex = getCurrentIndex();
  const isCancelled = currentStatus === 'Cancelled';

  if (isCancelled) {
    return (
      <div className="order-tracker cancelled">
        <div className="cancelled-status">
          <FaTimes className="cancelled-icon" />
          <span className="cancelled-text">Order Cancelled</span>
        </div>
      </div>
    );
  }

  return (
    <div className="order-tracker">
      <div className="tracker-steps">
        {statuses.map((status, index) => {
          const isCompleted = index <= currentIndex;
          const isCurrent = index === currentIndex;
          const StatusIcon = status.icon;

          return (
            <React.Fragment key={status.id}>
              <div className={`tracker-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}>
                <div className="step-icon">
                  {isCompleted ? <FaCheck /> : <StatusIcon />}
                </div>
                <div className="step-label">{status.label}</div>
              </div>
              {index < statuses.length - 1 && (
                <div className={`tracker-line ${index < currentIndex ? 'completed' : ''}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default OrderStatusTracker;

