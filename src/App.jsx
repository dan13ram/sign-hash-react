import React, { useState, useEffect } from "react";
import Web3 from "web3";

export default function App() {
	const [metamaskChange, setMetaMaskChange] = useState("")
	const [hash, setHash] = useState("")
	const [sig, setSig] = useState("")
	const [web3, setWeb3] = useState(undefined);
	const [account, setAccount] = useState("");

	const getWeb3 = () => {
		return new Promise(async (resolve, reject) => {
			if (window.ethereum) {
				const web3 = new Web3(window.ethereum);
				try {
					await window.ethereum.enable();
					resolve(web3);
				} catch (e) {
					reject(e);
				}
			} else if (window.web3) {
				resolve(window.web3);
			} else {
				window.alert("Must install Metamask Extension!\nDApp will not load");
				reject("Must install Metamask Extension!");
			}
		});
	};

	useEffect(() => {
		const init = async () => {
			const web3 = await getWeb3();
			const account = (await web3.eth.getAccounts())[0];
			setWeb3(web3);
			setAccount(account);
		};
		init();
	}, [metamaskChange]);
	useEffect(() => {
		window.ethereum.on("accountsChanged", () => {
			console.warn("Account changed");
			setMetaMaskChange((m) => !m);
		});
	}, []);

	const click = async () => {
		try {
			let result = await web3.eth.sign(hash, account);
			console.log(result);
			result = sig.length !== 0 ? result + sig.slice(2): result
			setSig(result);
		} catch (e) {
			console.log("Error", e);
		}
	};

	const changeHash = (e) => {
		setHash(e.target.value)
	}
  
	return (
		<div>
			<input type="text" placeholder="hash" onChange={(e) => changeHash(e)}/>
			<p>{hash}</p>
			<p>{sig}</p>
			<button onClick={click}>Button</button>
			<p>{account}</p>
		</div>
	);
}