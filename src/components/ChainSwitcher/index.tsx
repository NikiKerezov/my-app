import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Button, Card, Col, Container, Form, Row } from "react-bootstrap";
import { useConnectWallet } from "@web3-onboard/react";
import { Modal } from "react-bootstrap";
import setChain from "@web3-onboard/core/dist/chain";
import { web3Onboard } from "../../App";
import ExchangeButton from "../ExchangeButton";
import { ethers } from "ethers";
import { CHAINLINK_TOKEN_ADDRESS } from "../../AddressesAndAbis/chainlink_token_address";
import { ERC20_ABI } from "../../AddressesAndAbis/erc20_abi";
import { sign } from "crypto";
import { BRIDGE_ABI } from "../../AddressesAndAbis/bridge_abi";
import { IoSwapVerticalOutline } from "react-icons/io5";

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
  const [tokenAllowance, setTokenAllowance] = useState<ethers.BigNumber>();
  const [showBridgeButton, setShowBridgeButton] = useState(false);
  const [showSwitchButton, setShowSwitchButton] = useState(false);
  const [bridgeAddress, setBridgeAddress] = useState("");

  type SetChain = (options: SetChainOptions) => Promise<boolean>;

  const tokenDecimals = 18;

  type SetChainOptions = {
    chainId: string; // hex encoded string
    chainNamespace?: "evm"; // defaults to 'evm' (currently the only valid value, but will add more in future updates)
    wallet?: string; // the wallet.label of the wallet to set chain
    rpcUrl?: string; // if chain was instantiated without rpcUrl, include here. Used for network requests
    token?: string; // if chain was instantiated without token, include here. Used for display, eg Ethereum Mainnet
    label?: string; // if chain was instantiated without label, include here. The native token symbol, eg ETH, BNB, MATIC
  };

  const calculateReceiveAmount = useCallback(() => {
    // Add your calculation logic here based on the sendAmount and exchange rate
    // Set the calculated receiveAmount using setReceiveAmount
    // For example:
    let exchangeRate = 1;
    /*
    if (sendChain === "Sepolia" && receiveChain === "Mumbai")
      exchangeRate = 2529.243; // Example exchange rate
    else if (sendChain === "Mumbai" && receiveChain === "Sepolia")
      exchangeRate = 1 / 2529.243; // Example exchange rate
      */
    const calculatedAmount = sendAmount * exchangeRate;

    setReceiveAmount(calculatedAmount);
  }, [sendAmount]);

  const provider = useMemo(() => {
    if (wallet) {
      return new ethers.providers.Web3Provider(wallet.provider);
    } else {
      return new ethers.providers.JsonRpcProvider(
        `https://eth-sepolia.g.alchemy.com/v2/${process.env.REACT_APP_ALCHEMY_KEY}`
      );
    }
  }, [wallet]);

  useEffect(() => {
    if (wallet) {
      if (sendChain === "Sepolia" && wallet.chains[0].id !== "0xaa36a7") {
        console.log("Sepolia1");
        setShowSepoliaModal(true);
        setShowBridgeButton(false);
        setShowSwitchButton(true);
      } else {
        setShowSepoliaModal(false);
        setShowBridgeButton(true);
        setShowSwitchButton(false);
      }

      if (sendChain === "Mumbai" && wallet.chains[0].id !== "0x13881") {
        console.log("Mumbai1");
        setShowMumbaiModal(true);
        setShowBridgeButton(false);
        setShowSwitchButton(true);
      } else {
        setShowMumbaiModal(false);
        setShowBridgeButton(true);
        setShowSwitchButton(false);
      }

      if (sendChain === "Sepolia")
        setBridgeAddress("0x4b960477ec52ea813d8a4d48f787b2960b51f613");
      else if (sendChain === "Mumbai")
        setBridgeAddress("0x747bbdf33146e3b080f9cfbe474996bf2046c0f7");

      console.log("bridgeAddress", bridgeAddress);

      calculateReceiveAmount();
    }
  }, [wallet, sendChain, calculateReceiveAmount]);

  const handleTransactionForCoin = async () => {
    if (wallet) {
      const signer = provider.getSigner();
      const gas_limit = 21000;

      const tx = {
        from: wallet.accounts[0].address,
        to: bridgeAddress,
        value: ethers.utils.parseEther(sendAmount.toString()),
        nonce: await provider.getTransactionCount(wallet.accounts[0].address),
        gasLimit: ethers.utils.hexlify(gas_limit),
        gasPrice: ethers.utils.parseUnits("10", "gwei"),
      };

      try {
        signer
          .sendTransaction(tx)
          .then((tx: ethers.providers.TransactionResponse) => {
            console.log("Transaction hash:", tx.hash);
          })
          .catch((error: Error) => {
            console.log("Error sending transaction:", error);
          });
      } catch (error) {
        console.log("Error sending transaction:", error);
      }
    }
  };

  const handleTransactionForToken = async () => {
    if (wallet) {
      const signer = provider.getSigner();

      const tokenContract = new ethers.Contract(
        CHAINLINK_TOKEN_ADDRESS,
        ERC20_ABI,
        signer
      );

      console.log("TOKEN CONTRACT: ", tokenContract);

      if (!tokenContract) return;

      console.log(tokenAllowance);

      if (tokenAllowance)
        setTokenAllowance(
          ethers.utils.parseUnits(tokenAllowance.toString(), tokenDecimals)
        );

      // Check token allowance
      if (!tokenAllowance || tokenAllowance.gt(sendAmount)) {
        console.log("here");
        console.log("here");
        console.log("here");
        console.log("here");
        try {
          tokenContract
            .allowance(wallet.accounts[0].address, bridgeAddress)
            .then((allowance: ethers.BigNumber) => {
              console.log("ALLOWANCE: ", allowance.toString());
              setTokenAllowance(allowance);
            })
            .catch((error: Error) => {
              console.log("Error fetching token allowance:", error);
            });

          const spenderAddress = bridgeAddress;

          const approveTx = await tokenContract.approve(
            spenderAddress,
            ethers.constants.MaxUint256
          );

          await approveTx.wait();

          console.log("Transaction hash:", approveTx.hash);
        } catch (error) {
          console.log("Error approving transaction:", error);
        }
      }

      try {
        const contract = new ethers.Contract(
          tokenContract.address,
          BRIDGE_ABI,
          signer
        );
        const amount = ethers.utils.parseUnits(
          sendAmount.toString(),
          tokenDecimals
        );
        let targetChain = receiveChain === "Sepolia" ? 0xaa36a7 : 0x13881;

        const data = contract.interface.encodeFunctionData("lock", [
          2,
          amount,
          targetChain,
        ]);

        const tx = {
          from: wallet.accounts[0].address,
          to: bridgeAddress,
          value: ethers.utils.parseUnits("0.000", "ether"),
          data: data,
        };

        const receipt = await signer.sendTransaction(tx);

        console.log("Transaction hash:", receipt.hash);
      } catch (error) {
        console.log("Error sending transaction:", error);
      }
    }
  };

  const handleApproveTransaction = async () => {
    if (wallet && sendAsset === "LINK") {
      handleTransactionForToken();
    } else if (wallet) {
      handleTransactionForCoin();
    }
  };

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

  const handleBridgeButtonClose = () => {
    setShowBridgeButton(false);
  };

  const handleSwitchButtonClose = () => {
    setShowSwitchButton(false);
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

  const handleSwitchNetworksButton = () => {
    if (sendChain === "Sepolia") {
      setShowSepoliaModal(true);
    } else if (sendChain === "Mumbai") {
      setShowMumbaiModal(true);
    }
  };

  const chainAssets: ChainAssets = {
    Sepolia: ["sETH", "LINK"],
    Mumbai: ["wETH", "LINK"],
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
          <Row className="bg-dark text-light justify-content-center m-1">
            <Col className="bg-dark text-light">
              <Button variant="primary" onClick={handleSwitchNetworks}>
                <IoSwapVerticalOutline />
              </Button>
            </Col>
          </Row>
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
              <Row className="bg-dark text-light justify-content-center m-1">
                {(wallet.chains[0].id === "0x13881" &&
                  sendChain === "Mumbai") ||
                (wallet.chains[0].id === "0xaa36a7" &&
                  sendChain === "Sepolia") ? (
                  <ExchangeButton onClick={handleApproveTransaction} />
                ) : (
                  <Button onClick={handleSwitchNetworksButton}>
                    Switch your network!
                  </Button>
                )}
              </Row>
            </Row>
          </Container>
        </Card.Body>
        <Card.Body className="bg-dark text-light justify-content-center m-5">
          <Modal show={showSepoliaModal} onHide={handleSepoliaModalClose}>
            <Modal.Header closeButton onClick={handleSepoliaModalClose}>
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
        </Card.Body>
      </Card>
      <Card.Footer className="bg-dark text-light">
        <Modal show={showMumbaiModal} onHide={handleMumbaiModalClose}>
          <Modal.Header closeButton onClick={handleMumbaiModalClose}>
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
