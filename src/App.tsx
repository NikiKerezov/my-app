import { Web3OnboardProvider, init } from "@web3-onboard/react";
import injectedModule from "@web3-onboard/injected-wallets";
import { useConnectWallet } from "@web3-onboard/react";
import MyNavbar from "./components/Navbar";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import ChainSwitcher from "./components/ChainSwitcher";
import "./App.css";

const ethereumSepolia = {
  id: "0xAA36A7",
  token: "sETH",
  label: "Ethereum Sepolia",
  rpcUrl: `https://eth-sepolia.g.alchemy.com/v2/${process.env.REACT_APP_ALCHEMY_KEY}`,
};

const polygonMumbai = {
  id: "0x13881",
  token: "MATIC",
  label: "Polygon Mumbai Testnet",
  rpcUrl: `https://polygon-mumbai.g.alchemy.com/v2/${process.env.REACT_APP_ALCHEMY_KEY}`,
};

export const chains = [
  ethereumSepolia,
  polygonMumbai,
  {
    id: "0x1",
    token: "ETH",
    label: "Ethereum Mainnet",
  },
  {
    id: "0x5",
    token: "ETH",
    label: "Goerli",
  },
  {
    id: "0x38",
    token: "BNB",
    label: "Binance Smart Chain",
  },
  {
    id: "0x89",
    token: "MATIC",
    label: "Matic Mainnet",
  },
  {
    id: 10,
    token: "OETH",
    label: "Optimism",
  },
  {
    id: 42161,
    token: "ARB-ETH",
    label: "Arbitrum",
  },
  {
    id: 84531,
    token: "ETH",
    label: "Base Goerli",
  },
];
const wallets = [injectedModule()];

type Theme = ThemingMap | BuiltInThemes | "system";

type BuiltInThemes = "default" | "dark" | "light";

type ThemingMap = {
  "--w3o-background-color"?: string;
  "--w3o-font-family"?: string;
  "--w3o-foreground-color"?: string;
  "--w3o-text-color"?: string;
  "--w3o-border-color"?: string;
  "--w3o-action-color"?: string;
  "--w3o-border-radius"?: string;
};

type AppState = {
  wallets: WalletState[];
  chains: Chain[];
  accountCenter: AccountCenter;
};

type Chain = {
  namespace?: "evm";
  id: ChainId;
  rpcUrl: string;
  label: string;
  token: TokenSymbol;
  color?: string;
  icon?: string;
};

type WalletState = {
  label: string;
  icon: string;
  accounts: Account[];
  chains: ConnectedChain[];
  instance?: unknown;
};

type Account = {
  address: string;
  ens: {
    name?: string;
    avatar?: string;
    contentHash?: string;
    getText?: (key: string) => Promise<string | undefined>;
  };
  balance: Record<TokenSymbol, string>;
};

type ConnectedChain = {
  namespace: "evm";
  id: ChainId;
};

type ChainId = string;
type TokenSymbol = string;

type AccountCenter = {
  enabled: boolean;
  position: AccountCenterPosition;
  expanded: boolean;
  minimal: boolean;
};

type AccountCenterPosition =
  | "topRight"
  | "bottomRight"
  | "bottomLeft"
  | "topLeft";

const web3Onboard = init({
  wallets,
  chains: chains,
  appMetadata: {
    name: "Token Swap",
    //icon: myIcon, // svg string icon
    //logo: myLogo, // svg string logo
    description: "Swap tokens for other tokens",
    recommendedInjectedWallets: [
      { name: "MetaMask", url: "https://metamask.io" },
      //{ name: 'Coinbase', url: 'https://wallet.coinbase.com/' }
    ],
  },
  notify: {
    desktop: {
      enabled: true,
      transactionHandler: (transaction) => {
        console.log({ transaction });
        if (transaction.eventCode === "txPool") {
          return {
            type: "success",
            message: "Your transaction from #1 DApp is in the mempool",
          };
        }
      },
      position: "bottomLeft",
    },
    mobile: {
      enabled: true,
      transactionHandler: (transaction) => {
        console.log({ transaction });
        if (transaction.eventCode === "txPool") {
          return {
            type: "success",
            message: "Your transaction from #1 DApp is in the mempool",
          };
        }
      },
      position: "topRight",
    },
  },
  i18n: {
    en: {
      connect: {
        selectingWallet: {
          header: "custom text header",
        },
      },
      notify: {
        transaction: {
          txStuck: "custom text for this notification event",
        },
        watched: {
          // Any words in brackets can be re-ordered or removed to fit your dapps desired verbiage
          txPool:
            "Your account is {verb} {formattedValue} {asset} {preposition} {counterpartyShortened}",
        },
      },
    },
  },
  accountCenter: {
    desktop: {
      enabled: true,
      position: "topRight",
    },
    mobile: {
      enabled: true,
      position: "topRight",
    },
  },
  theme: "dark",
});

function App() {
  console.log(web3Onboard);
  return (
    <Web3OnboardProvider web3Onboard={web3Onboard}>
      <div className="dark-background fullscreen">
        <header className="dark-background">
          <h1>
            <Container className="bg-dark text-light">
              <Row className="bg-dark text-light">
                <div className="col-3"></div>
                <div className="col">Exchange your tokens here!</div>
                <div className="col-3"></div>
              </Row>
            </Container>
          </h1>
          <body className="dark-background">
            <Container className="bg-dark text-light">
              <Row className="bg-dark text-light">
                <div className="col">
                  <MyNavbar />
                </div>
              </Row>
              <div className="row justify-content-center m-5">
                {<ChainSwitcher></ChainSwitcher>}
              </div>
            </Container>
          </body>
        </header>
      </div>
    </Web3OnboardProvider>
  );
}

export default App;
export { web3Onboard };
