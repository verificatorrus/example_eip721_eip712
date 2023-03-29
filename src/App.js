// import logo from './logo.svg';
import './App.css';
// import WalletCard from "./WalletCard";
import { useState } from "react";
import { ethers } from "ethers";
import { useCookies } from "react-cookie";
const contractABI = require("./abi.json");
const dateNow = Date.now();
const defaultForm = { id: dateNow, price: "100000000000000", name:"NFT TEST", description: "TEST description"};
const contractAddress = "0x37f2723C1f31E5530069A61930EcF6E4A390eb20";

function App() {
  //Using cookies for auth user
  const [cookies, setCookie] = useCookies(["authsign"]);

  const [logged, setLogged] = useState(false);
  const [minted, setMinted] = useState(false);
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState();
  const { utils } = require("ethers");
  const [provider, setProvider] = useState("");
  const [authsign, setAuthsign] = useState("");
  const [formData, setFormData] = useState(defaultForm);
  const [contractInstance, setContractInstance] = useState("");


  const handleLogin = async () => {
    if (window.ethereum && window.ethereum.isMetaMask) {
      console.log("MetaMask Here!");
      const addresses = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setFormData({...formData, address: addresses[0] });
      setProvider(new ethers.providers.Web3Provider(window.ethereum));
      setContractInstance(new ethers.Contract(contractAddress, contractABI, new ethers.providers.Web3Provider(window.ethereum)));

      setAccount(utils.getAddress(addresses[0]));
      const signer = await (new ethers.providers.Web3Provider(window.ethereum)).getSigner();
      const dateUTC = new Date().toUTCString();
      const signature = await signer.signMessage(dateUTC);
      setAuthsign(`${signature}&${dateUTC}`);
      setCookie("authsign", `${signature}&${dateUTC}`, {
        path: "/",
        maxAge: 3600
      });
      setLogged(true);
        
    } else {
      console.log("Need to install MetaMask");
    }
  };

  const hnadleLogout = () => {
    setLogged(false);
    setAccount(null);
    setAuthsign("");
    setFormData(defaultForm);
    setCookie("authsign", "", {
      path: "/",
      maxAge: 0
    });
    setMinted(false);
  };

  const handleBalance = () => {
    window.ethereum
      .request({ method: "eth_getBalance", params: [account, "latest"] })
      .then((balance) => {
        setBalance(ethers.utils.formatEther(balance));
      })
      .catch((error) => {
        console.log("Could not detect the Balance");
      });
  };

  const handleFormChange = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setFormData(values => ({...values, [name]: value}));
  };

  // request mint signature from backend
  const sendMetadata = async (event) => {
    event.preventDefault();
    const requestOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'authsign': authsign
       },
        body: JSON.stringify(formData)
    };
    const response = await fetch('http://localhost:3001/api/sign', requestOptions);

    const vaucher = await response.json();

    const rawTxn = await contractInstance.populateTransaction.safeMint(vaucher);
    await window.ethereum.request({ method: 'eth_sendTransaction' , params: [{ ...rawTxn,  from: account, value: ethers.BigNumber.from(vaucher[1]).toHexString( ) }]});
    setMinted(true);
  }; 
  return (
    <div>
      {!logged ? (
        <div className="App">
          <h1>Log in with Metamask wallet</h1>
          <button onClick={handleLogin}>Connect</button>
        </div>
      ) : (
        <div className="App">
          <h1>Logged from</h1>
          <p>{account}</p>
          <button onClick={hnadleLogout}>Disconnect</button>
          <br></br>
          <br></br>
          <button onClick={handleBalance}>check Balance</button>
          <h2>Balance is {balance}</h2>
          {!minted ? (
            <div style={{ backgroundColor: "#edffa6" }}>
            <form onSubmit={sendMetadata} style={{ display: "grid", justifyContent: "center", justifyItems: "end"}}>
              <label>NFT ID:
              <input 
                size="35"
                type="text" 
                name="id" 
                value={formData.id || ""} 
                readOnly
                disabled
              />
              </label>
              <label>NFT price in WEI:
                <input
                  size="25"
                  type="text" 
                  name="price" 
                  value={formData.price || ""} 
                  onChange={handleFormChange}
                  required
                />
              </label>
              <label>NFT name:
                <input 
                  size="32"
                  type="text" 
                  name="name" 
                  value={formData.name || ""} 
                  onChange={handleFormChange}
                  required
                />
              </label>
              <label>NFT description:
                <textarea 
                  name="description" 
                  value={formData.description || ""} 
                  onChange={handleFormChange}
                  required
                />
              </label>
              <label>NFT image URL:
                <input 
                  size="30"
                  type="url" 
                  name="iamgeURL" 
                  value={formData.iamgeURL || ""} 
                  onChange={handleFormChange}
                  required
                />
              </label>
                <input type="submit" value="Mint"/>
            </form>
          </div>
          ) : (
             <a href={`https://sepolia.etherscan.io/address/${account}#nfttransfers`} target="_blank" rel="noreferrer">MYNFT</a>
          )}
      
        </div>
      )}
    </div>
  );
}

export default App;
