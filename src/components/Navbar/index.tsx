import React, { useState, useEffect, useMemo } from "react";
import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";
import Badge from "react-bootstrap/Badge";
import Stack from "react-bootstrap/Stack";
import { useConnectWallet } from "@web3-onboard/react";
import ConnectButton from "../ConnectButton";
import { chains, web3Onboard } from "../../App";

function MyNavbar() {
  const [{ wallet }] = useConnectWallet();
  const [accountAddress, setAccountAddress] = useState<string>("");
  const [accountBalance, setAccountBalance] = useState<string>("");
  /*
  useEffect(() => {
    console.log(wallet?.accounts);
    if (accountAddress) {
      web3Onboard?.state.actions.updateBalances([accountAddress]);
      if (wallet?.accounts.length && wallet?.accounts[0].balance) {
        for (let i = 0; i < chains.length; i++) {
          if (
            chains[i].id.toString().toLowerCase() ===
            wallet.chains[0].id.toString().toLowerCase()
          ) {
            setAccountBalance(wallet.accounts[0].balance[chains[i].token]);
          }
        }
      }
    }
  }, [accountAddress, wallet?.accounts, wallet?.chains]);
  */

  useEffect(() => {
    if (wallet?.accounts.length) {
      setAccountAddress(wallet.accounts[0].address);
    }
  }, [wallet?.accounts]);

  const getChainName = (chainId: string | undefined) => {
    if (!chainId) return "N/A";
    const chain = chains.find(
      (chain) => chain.id.toString().toLowerCase() === chainId.toLowerCase()
    );
    return chain ? chain.label : "N/A";
  };

  return (
    <Navbar className="bg-dark text-light">
      <Container className="bg-dark text-light">
        <Navbar.Brand href="#home" className="bg-dark text-light">
          Connect to your MetaMask account!
        </Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse className="justify-content-end">
          <Stack direction="horizontal" gap={2}>
            {/*
            <Badge bg="secondary">
              Chain: {getChainName(wallet?.chains[0]?.id)}
            </Badge>
            <Badge bg="secondary">Balance: {accountBalance}</Badge>
  */}

            <ConnectButton />
          </Stack>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default MyNavbar;
