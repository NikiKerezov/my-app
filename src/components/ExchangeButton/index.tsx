import React from "react";
import Button from "react-bootstrap/Button";

function ExchangeButton({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="primary" onClick={onClick}>
      BRIDGE
    </Button>
  );
}

export default ExchangeButton;
