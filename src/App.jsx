import React, { useState, useEffect } from "react";
import Web3 from "web3";

const SIGNATURE_DECODE_ADDRESS = "0x704DCfaFC27B5cc733601e4B0F1EC4C68F25eC25";
const SIGNATURE_DECODE_ABI = [
    {
        inputs: [
            { internalType: "bytes32", name: "messageHash", type: "bytes32" },
            { internalType: "bytes", name: "messageSignatures", type: "bytes" },
            { internalType: "uint256", name: "pos", type: "uint256" }
        ],
        name: "recoverKey",
        outputs: [{ internalType: "address", name: "", type: "address" }],
        stateMutability: "pure",
        type: "function"
    }
];

export default function App() {
    const [string, setString] = useState("");
    const [integer, setInteger] = useState("");
    const [hash, setHash] = useState("");
    const [sig, setSig] = useState("");
    const [web3, setWeb3] = useState(undefined);
    const [account, setAccount] = useState("");
    const [chainId, setChainId] = useState();
    const [signatureDecoder, setSignatureDecoder] = useState({ address: "" });
    const [recoverredAccounts, setRecoverredAccounts] = useState([]);

    const numSignatures = (sig || "").slice(2).length / 130;

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
                window.alert(
                    "Must install Metamask Extension!\nDApp will not load"
                );
                reject("Must install Metamask Extension!");
            }
        });
    };

    const clear = () => {
        setString('');
        setInteger('');
        setHash('');
        setSig('');
        setRecoverredAccounts([]);
    }

    useEffect(() => {
        const init = async () => {
            const web3 = await getWeb3();
            const account = (await web3.eth.getAccounts())[0];
            setWeb3(web3);
            setAccount(account);
            setChainId(await web3.eth.getChainId());

            const contract = new web3.eth.Contract(
                SIGNATURE_DECODE_ABI,
                SIGNATURE_DECODE_ADDRESS
            );
            setSignatureDecoder(contract);

            window.ethereum.on("accountsChanged", async accounts => {
                setAccount(accounts[0]);
            });
            window.ethereum.on("networkChanged", async chainId => {
                setChainId(chainId);
                clear();
            });
        };
        init();
    }, []);

    const computeHash = async () => {
        try {
            const data = await web3.eth.abi.encodeParameters(
                ["uint256", "string"],
                [integer, string]
            );
            const _hash = web3.utils.keccak256(data);
            setHash(_hash);
        } catch (e) {
            console.log("Error", e);
        }
    };

    const signHash = async () => {
        try {
            let result = await web3.eth.personal.sign(hash, account);
            result = sig.length !== 0 ? sig + result.slice(2) : result;
            setSig(result);
        } catch (e) {
            console.log("Error", e);
        }
    };

    const verifySignature = async () => {
        let accounts = [];
        for (let i = 0; i < numSignatures; ++i) {
            let recoverredAccount = await signatureDecoder.methods
                .recoverKey(hash ? hash : "0x", sig, i)
                .call();
            accounts.push(recoverredAccount);
        }

        setRecoverredAccounts(accounts);
    };

    return (
        <div>
            <p> Logged in as: {account} </p>
            <p>
                Rinkeby SignatureDecode:{" "}
                <a
                    href="https://rinkeby.etherscan.io/address/0x704DCfaFC27B5cc733601e4B0F1EC4C68F25eC25#code"
                    target="_blank"
                    rel="noreferrer"
                >
                    {signatureDecoder._address}
                </a>
            </p>
            {chainId !== 4 ? (
                <p> Please switch to rinkeby network on Metamask ! </p>
            ) : (
                <>
                    <button onClick={clear}>CLEAR</button>
                    <br />
                    <br />
                    <input
                        type="number"
                        placeholder="integer"
                        value={integer}
                        onChange={e => setInteger(e.target.value)}
                    />
                    <p> Input integer: {integer} </p>
                    <input
                        type="text"
                        placeholder="string"
                        value={string}
                        onChange={e => setString(e.target.value)}
                    />
                    <p> Input string: {string} </p>
                    <button onClick={computeHash}>Compute Hash</button>
                    <p>Computed Hash: {hash}</p>
                    <button onClick={signHash}>Sign Hash</button>
                    <p>Number of Signs: {numSignatures}</p>
                    <p>Signatures: {sig}</p>
                    <button onClick={verifySignature}>Verify Signatures</button>
                    {recoverredAccounts.map((a, index) => (
                        <p>
                            Recoverred Address {index}: {a}
                        </p>
                    ))}
                </>
            )}
        </div>
    );
}
