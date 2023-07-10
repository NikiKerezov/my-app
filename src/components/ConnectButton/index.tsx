import React from "react";
import Button from "react-bootstrap/Button";
import { useConnectWallet } from "@web3-onboard/react";
import { snipAddress } from "../../utils/address";

function ConnectButton() {
  const [
    { wallet, connecting },
    connect,
    disconnect,
    updateBalances,
    setWalletModules,
    setPrimaryWallet,
  ] = useConnectWallet();

  const handleClick = () => {
    connect();
  };

  return (
    <>
      {wallet?.accounts.length ? (
        <p>{snipAddress(wallet.accounts[0].address)}</p>
      ) : (
        <Button href="#" onClick={handleClick}>
          Connect
        </Button>
      )}
    </>
  );
}

export default ConnectButton;
