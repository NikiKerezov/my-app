import React, { useState, useEffect } from "react";
import { Button, Card, Container, Form, Row } from "react-bootstrap";
import { useConnectWallet } from "@web3-onboard/react";
import { Modal } from "react-bootstrap";
import setChain from "@web3-onboard/core/dist/chain";
import { web3Onboard } from "../../App";
import ExchangeButton from "../ExchangeButton";

interface ChainAssets {
  [key: string]: string[];
}

function ChainSwitcher() {
  const [sendChain, setSendChain] = useState("");
  const [receiveChain, setReceiveChain] = useState("");
  const [sendAsset, setSendAsset] = useState("");
  const [receiveAsset, setReceiveAsset] = useState("");
  const [sendAmount, setSendAmount] = useState<number>(0);
  const [receiveAmount, setReceiveAmount] = useState<number>(0);
  const [{ wallet }] = useConnectWallet();
  const [showSepoliaModal, setShowSepoliaModal] = useState(false);
  const [showMumbaiModal, setShowMumbaiModal] = useState(false);

  type SetChain = (options: SetChainOptions) => Promise<boolean>;

  type SetChainOptions = {
    chainId: string; // hex encoded string
    chainNamespace?: "evm"; // defaults to 'evm' (currently the only valid value, but will add more in future updates)
    wallet?: string; // the wallet.label of the wallet to set chain
    rpcUrl?: string; // if chain was instantiated without rpcUrl, include here. Used for network requests
    token?: string; // if chain was instantiated without token, include here. Used for display, eg Ethereum Mainnet
    label?: string; // if chain was instantiated without label, include here. The native token symbol, eg ETH, BNB, MATIC
  };

  useEffect(() => {
    if (wallet) {
      if (sendChain === "Sepolia" && wallet.chains[0].id !== "0xaa36a7") {
        setShowSepoliaModal(true);
      } else {
        setShowSepoliaModal(false);
      }

      if (sendChain === "Mumbai" && wallet.chains[0].id !== "0x13881") {
        setShowMumbaiModal(true);
      } else {
        setShowMumbaiModal(false);
      }
    }
  }, [wallet, sendChain]);

  const handleSepoliaModalClose = () => {
    setShowSepoliaModal(false);
  };

  const handleMumbaiModalClose = () => {
    setShowMumbaiModal(false);
  };

  const handleNetworkSwitchToSepolia = async () => {
    if (web3Onboard) {
      try {
        web3Onboard.setChain({ chainId: "0xaa36a7" });
        handleSepoliaModalClose();
      } catch (error) {
        console.log("Error switching network:", error);
      }
    }
  };

  const handleNetworkSwitchToMumbai = async () => {
    if (web3Onboard) {
      try {
        web3Onboard.setChain({ chainId: "0x13881" });
        handleMumbaiModalClose();
      } catch (error) {
        console.log("Error switching network:", error);
      }
    }
  };

  const handleSendChainChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedChain = e.target.value;
    setSendChain(selectedChain);
    setSendAsset("");
  };

  const handleReceiveChainChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedChain = e.target.value;
    setReceiveChain(selectedChain);
    setReceiveAsset("");
  };

  const handleSendAssetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSendAsset(e.target.value);
  };

  const handleReceiveAssetChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setReceiveAsset(e.target.value);
  };

  const handleSendAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const amount = parseFloat(e.target.value);
    setSendAmount(amount);
  };

  const calculateReceiveAmount = () => {
    // Add your calculation logic here based on the sendAmount and exchange rate
    // Set the calculated receiveAmount using setReceiveAmount
    // For example:
    const exchangeRate = 2529.243; // Example exchange rate
    const calculatedAmount = sendAmount * exchangeRate;
    setReceiveAmount(calculatedAmount);
  };

  const handleSwitchNetworks = () => {
    const tempSendChain = sendChain;
    const tempReceiveChain = receiveChain;
    const tempSendAsset = sendAsset;
    const tempReceiveAsset = receiveAsset;

    setSendChain(tempReceiveChain);
    setReceiveChain(tempSendChain);
    setSendAsset(tempReceiveAsset);
    setReceiveAsset(tempSendAsset);
  };

  const chainAssets: ChainAssets = {
    Sepolia: ["sETH"],
    Mumbai: ["MATIC"],
  };

  const sendAssets: string[] = chainAssets[sendChain] || [];
  const receiveAssets: string[] = chainAssets[receiveChain] || [];

  useEffect(() => {
    calculateReceiveAmount();
  }, [sendAmount]);

  if (!wallet?.accounts.length) {
    // Render null or alternative UI when wallet is not connected
    return null;
  }

  return (
    <Container className="bg-dark text-light">
      <Card className="bg-dark text-light">
        <Card.Body className="bg-dark text-light">
          <Form.Group className="bg-dark text-light">
            <Form.Label className="bg-dark text-light">
              Select sending network:
            </Form.Label>
            <Form.Select
              value={sendChain}
              onChange={handleSendChainChange}
              className="bg-dark text-light"
            >
              <option value="">Select Chain</option>
              <option value="Sepolia">Sepolia Testnet</option>
              <option value="Mumbai">Polygon Mumbai Testnet</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="bg-dark text-light">
            <Form.Label className="bg-dark text-light">
              Select receiving network:
            </Form.Label>
            <Form.Select
              value={receiveChain}
              onChange={handleReceiveChainChange}
              className="bg-dark text-light"
            >
              <option value="">Select Chain</option>
              <option value="Sepolia">Sepolia Testnet</option>
              <option value="Mumbai">Polygon Mumbai Testnet</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="bg-dark text-light">
            <Form.Label className="bg-dark text-light">
              Choose asset to send:
            </Form.Label>
            <Form.Select
              value={sendAsset}
              onChange={handleSendAssetChange}
              className="bg-dark text-light"
            >
              <option value="">Select Asset</option>
              {sendAssets.map((asset: string, index: number) => (
                <option key={index} value={asset}>
                  {asset}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="bg-dark text-light">
            <Form.Label className="bg-dark text-light">
              Choose asset to receive:
            </Form.Label>
            <Form.Select
              value={receiveAsset}
              onChange={handleReceiveAssetChange}
              className="bg-dark text-light"
            >
              <option value="">Select Asset</option>
              {receiveAssets.map((asset: string, index: number) => (
                <option key={index} value={asset}>
                  {asset}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="bg-dark text-light">
            <Form.Label className="bg-dark text-light">
              Number of tokens to send:
            </Form.Label>
            <Form.Control
              type="number"
              value={sendAmount}
              onChange={handleSendAmountChange}
              className="bg-dark text-light"
            />
          </Form.Group>

          <Form.Group className="bg-dark text-light">
            <Form.Label className="bg-dark text-light">
              Calculated receiving amount:
            </Form.Label>
            <Form.Control
              type="number"
              value={receiveAmount}
              readOnly
              className="bg-dark text-light"
            />
          </Form.Group>
          <Container className="bg-dark text-light">
            <Row className="bg-dark text-light justify-content-center m-5">
              <Button variant="primary" onClick={handleSwitchNetworks}>
                Switch Networks
              </Button>
              <Row className="bg-dark text-light justify-content-center m-1">
                <ExchangeButton />
              </Row>
            </Row>
          </Container>
        </Card.Body>
        <Card.Footer className="bg-dark text-light justify-content-center m-5">
          <Modal show={showSepoliaModal} onHide={handleSepoliaModalClose}>
            <Modal.Header closeButton>
              <Modal.Title>Network Switch Required</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>Please switch your network to Sepolia Network.</p>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="primary" onClick={handleNetworkSwitchToSepolia}>
                Switch Network to Sepolia Testnet
              </Button>
            </Modal.Footer>
          </Modal>
        </Card.Footer>
      </Card>
      <Card.Footer className="bg-dark text-light">
        <Modal show={showMumbaiModal} onHide={handleMumbaiModalClose}>
          <Modal.Header closeButton>
            <Modal.Title>Network Switch Required</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Please switch your network to Polygon Mumbai Network.</p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={handleNetworkSwitchToMumbai}>
              Switch Network to Polygon Mumbai Testnet
            </Button>
          </Modal.Footer>
        </Modal>
      </Card.Footer>
    </Container>
  );
}

export default ChainSwitcher;
