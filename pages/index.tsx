import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Web3 from 'web3';


declare global {
  interface Window {
    ethereum?: any;
  }
}

interface NFT {
  token_id: string;
  name: string;
  permalink: string;
  image_url: string;  
}

const OpenSeaNFTs = () => {
  const [nfts, setNFTs] = useState<NFT[]>([]);
  const [web3, setWeb3] = useState<Web3 | null>(null);
  const [accounts, setAccounts] = useState<string[]>([]);
  const [profile, setProfile] = useState<{ name: string; image_url: string } | null>(null);

  useEffect(() => {
    const initializeWeb3 = async () => {
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);

        try {
          await window.ethereum.enable();
          const accounts = await web3Instance.eth.getAccounts();
          setWeb3(web3Instance);
          setAccounts(accounts);
        } catch (error) {
          console.error('Error connecting to MetaMask:', error);
        }
      } else {
        console.error('MetaMask not detected. Please install MetaMask extension.');
      }
    };

    initializeWeb3();
  }, []);

  useEffect(() => {
    const fetchNFTs = async () => {
      if (web3 && accounts.length > 0) {
        try {
          const response = await axios.get('https://api.opensea.io/api/v2/assets', {
            params: {
              owner: accounts[0],
              order_direction: 'asc',
              offset: '0',
              limit: '20',
              collection: 'mystical-wizards',
            },
          });
  
          setNFTs(response.data.assets as NFT[]);
        } catch (error) {
          console.error('Error fetching NFTs:', error);
        }
      }
    };
  
    fetchNFTs();
  }, [web3, accounts]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (web3 && accounts.length > 0) {
        try {
          const profileResponse = await axios.get('https://api.opensea.io/api/v1/account', {
            params: {
              owner: accounts[0],
            },
            headers: {
              'X-API-KEY': process.env.REACT_APP_API_KEY,
            },
          });
  
          console.log('Profile Response:', profileResponse.data);
  
          setProfile({
            name: profileResponse.data.user?.username || 'Unknown',
            image_url: profileResponse.data.user?.profile_img_url || 'default-profile-image-url',
          });
        } catch (error) {
          console.error('Error fetching profile:', error);
  
          console.error('Detailed Error:', error);

          console.error('Error Type:', typeof error);

        }
      }
    };
  
    fetchProfile();
  }, [web3, accounts]);
  

  const handleLogin = async () => {
    try {
      if (web3) {
        await window.ethereum.enable();
        const accounts = await web3.eth.getAccounts();
        setAccounts(accounts);
      } else {
        console.error('Web3 is null. Unable to connect to MetaMask.');
      }
    } catch (error) {
      console.error('Error connecting to MetaMask:', error);
    }
  };

  const handleLogout = () => {
    setAccounts([]);
  };

  return (
    <div className="container">
      <h1>My NFTs</h1>
      {accounts.length > 0 ? (
        <div className="user-info">
          <p>Connected Account: {accounts[0]}</p>
          <p>Name: {profile?.name}</p>
          <img src={profile?.image_url} alt="Profile" className="profile-image" />
          <button onClick={() => handleLogout()} className="logout-button">
            Logout
          </button>
        </div>
      ) : (
        <button onClick={() => handleLogin()} className="login-button">
          Connect with MetaMask 🦊
        </button>
      )}
      <ul className="nft-list">
        {nfts.map((asset) => (
          <li key={asset.token_id} className="nft-item">
            <p>{asset.name}</p>
            <p>{asset.permalink}</p>
            <img src={asset.image_url} alt={asset.name} className="nft-image" />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OpenSeaNFTs;
