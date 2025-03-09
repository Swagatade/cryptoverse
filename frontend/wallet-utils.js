/**
 * Shared wallet utilities for MetaMask integration
 * Used across all pages of the application
 */

// Track wallet connection state
let isWalletConnected = false;
let isConnecting = false;

// Initialize wallet functionality
function initWallet() {
    const connectButton = document.querySelector('.nav-buttons .btn-secondary');
    if (!connectButton) return;

    // Check if already connected from localStorage
    const storedConnected = localStorage.getItem('walletConnected');
    const storedAccount = localStorage.getItem('walletAccount');
    
    if (storedConnected === 'true' && storedAccount) {
        isWalletConnected = true;
        updateButtonToConnected(connectButton, storedAccount);
    }
    
    // Add click event listener for connect/disconnect
    connectButton.addEventListener('click', handleWalletConnection);
    
    // Check for active MetaMask connection
    checkActiveConnection();
    
    // Setup MetaMask event listeners
    setupMetaMaskEvents();
}

// Handle wallet connection/disconnection
async function handleWalletConnection() {
    const connectButton = document.querySelector('.nav-buttons .btn-secondary');
    if (!connectButton) return;
    
    if (isWalletConnected) {
        await disconnectWallet(connectButton);
    } else {
        await connectMetaMask(connectButton);
    }
}

// Connect to MetaMask
async function connectMetaMask(connectButton) {
    if (typeof window.ethereum === 'undefined') {
        showNotification('error', 'MetaMask not detected. Please install the extension.');
        if (confirm('MetaMask extension is required. Would you like to install it now?')) {
            window.open('https://metamask.io/download/', '_blank');
        }
        return;
    }
    
    if (isConnecting) {
        showNotification('info', 'Connection already in progress. Please check MetaMask popup.');
        highlightMetaMaskPopup();
        return;
    }
    
    try {
        isConnecting = true;
        connectButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connecting...';
        connectButton.disabled = true;
        
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        if (accounts.length > 0) {
            updateButtonToConnected(connectButton, accounts[0]);
            isWalletConnected = true;
            
            // Save connection state
            localStorage.setItem('walletConnected', 'true');
            localStorage.setItem('walletAccount', accounts[0]);
            
            showNotification('success', 'Successfully connected to MetaMask!');
        }
    } catch (error) {
        console.error("Connection error:", error);
        
        if (error.code === 4001) {
            showNotification('error', 'Connection rejected. Please try again.');
        } else if (error.code === -32002) {
            showNotification('info', 'MetaMask connection pending. Check your MetaMask extension.');
            highlightMetaMaskPopup();
        } else {
            showNotification('error', `Failed to connect: ${error.message}`);
        }
        
        resetButton(connectButton);
    } finally {
        isConnecting = false;
    }
}

// Disconnect wallet
function disconnectWallet(connectButton) {
    // Reset connection state
    isWalletConnected = false;
    localStorage.removeItem('walletConnected');
    localStorage.removeItem('walletAccount');
    
    // Reset button state
    resetButton(connectButton);
    
    // Show notification
    showNotification('info', 'Wallet disconnected');
}

// Check for active MetaMask connection
async function checkActiveConnection() {
    if (typeof window.ethereum !== 'undefined') {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            const connectButton = document.querySelector('.nav-buttons .btn-secondary');
            
            if (accounts.length > 0) {
                updateButtonToConnected(connectButton, accounts[0]);
                isWalletConnected = true;
                localStorage.setItem('walletConnected', 'true');
                localStorage.setItem('walletAccount', accounts[0]);
            }
        } catch (error) {
            console.error("Error checking connection:", error);
        }
    }
}

// Setup MetaMask event listeners
function setupMetaMaskEvents() {
    if (!window.ethereum) return;
    
    // Clean up existing listeners to prevent duplicates
    window.ethereum.removeAllListeners?.('accountsChanged');
    window.ethereum.removeAllListeners?.('chainChanged');
    
    // Listen for account changes
    window.ethereum.on('accountsChanged', function(accounts) {
        const connectButton = document.querySelector('.nav-buttons .btn-secondary');
        
        if (accounts.length === 0) {
            // User disconnected their wallet from another tab/window
            disconnectWallet(connectButton);
            showNotification('info', 'Wallet disconnected');
        } else {
            // User switched accounts
            updateButtonToConnected(connectButton, accounts[0]);
            localStorage.setItem('walletAccount', accounts[0]);
            showNotification('info', 'Account changed');
        }
    });
    
    // Listen for chain changes
    window.ethereum.on('chainChanged', function(chainId) {
        showNotification('info', 'Network changed');
    });
}

// Update button to connected state
function updateButtonToConnected(button, account) {
    if (!button) return;
    
    const shortAddress = shortenAddress(account);
    button.innerHTML = `<i class="fas fa-user-circle"></i> ${shortAddress} <i class="fas fa-sign-out-alt"></i>`;
    button.classList.add('connected');
    button.disabled = false;
}

// Reset button to initial state
function resetButton(button) {
    if (!button) return;
    
    button.innerHTML = '<i class="fas fa-wallet"></i> Connect Metamask';
    button.classList.remove('connected');
    button.disabled = false;
}

// Helper: Shorten wallet address for display
function shortenAddress(address) {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

// Helper: Show notification toast
function showNotification(type, message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    // Choose icon based on notification type
    let icon;
    switch(type) {
        case 'success': icon = 'check-circle'; break;
        case 'error': icon = 'exclamation-circle'; break;
        case 'info': icon = 'info-circle'; break;
        default: icon = 'bell';
    }
    
    notification.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <span>${message}</span>
    `;
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Remove after delay
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Helper: Highlight MetaMask popup
function highlightMetaMaskPopup() {
    const overlay = document.createElement('div');
    overlay.className = 'metamask-helper-overlay';
    
    const arrow = document.createElement('div');
    arrow.className = 'metamask-helper-arrow';
    arrow.innerHTML = '👆';
    
    const text = document.createElement('div');
    text.className = 'metamask-helper-text';
    text.innerText = 'Check MetaMask popup in your browser extension area';
    
    overlay.appendChild(arrow);
    overlay.appendChild(text);
    document.body.appendChild(overlay);
    
    setTimeout(() => {
        document.body.removeChild(overlay);
    }, 5000);
}
