const navButtons = document.querySelectorAll('.nav-btn');
const addAccountSection = document.getElementById('addAccountSection');
const manageAccountsSection = document.getElementById('manageAccountsSection');
const banOptionsSection = document.getElementById('banOptionsSection');

const addAccountBtn = document.getElementById('addAccountBtn');
const manageAccountsBtn = document.getElementById('manageAccountsBtn');
const accountButtons = document.getElementById('accountButtons');
const cubecraftBtn = document.getElementById('cubecraftBtn');
const hiveBtn = document.getElementById('hiveBtn');
const lifeboatBtn = document.getElementById('lifeboatBtn');
const customBanBtn = document.getElementById('customBanBtn');
const banStatusEl = document.getElementById('banStatus');
const newAccountName = document.getElementById('newAccountName');

const accountSelect = document.getElementById('accountSelect');
const selectedAccountDisplay = document.getElementById('selectedAccountDisplay');

const customBanModal = document.getElementById('customBanModal');
const closeModal = document.getElementById('closeModal');
const customBanName = document.getElementById('customBanName');
const customBanDuration = document.getElementById('customBanDuration');
const startCustomBanBtn = document.getElementById('startCustomBanBtn');

const cubecraftBanDuration = 30 * 24 * 60 * 60 * 1000;
const hiveBanDuration = 7 * 24 * 60 * 60 * 1000;
const lifeboatBanDuration = 30 * 24 * 60 * 60 * 1000;

let accounts = {};
let selectedAccount = null;

function loadAccounts() {
    try {
        const savedAccounts = localStorage.getItem('accounts');
        accounts = savedAccounts ? JSON.parse(savedAccounts) : {};
    } catch (e) {
        console.error('Error loading accounts:', e);
        accounts = {};
    }
}

function saveAccounts() {
    try {
        localStorage.setItem('accounts', JSON.stringify(accounts));
    } catch (e) {
        alert('Unable to save accounts. Local storage might be full or disabled.');
        console.error('Error saving accounts:', e);
    }
}

function saveSelectedAccount() {
    try {
        localStorage.setItem('selectedAccount', selectedAccount || '');
    } catch (e) {
        console.error('Error saving selected account:', e);
    }
}

function loadSelectedAccount() {
    try {
        selectedAccount = localStorage.getItem('selectedAccount');
        if (selectedAccount === 'null' || selectedAccount === 'undefined') {
            selectedAccount = null;
        }
        if (selectedAccount) {
            updateBanStatus();
            highlightSelectedAccount();
            updateSelectedAccountDisplay();
        }
    } catch (e) {
        console.error('Error loading selected account:', e);
        selectedAccount = null;
    }
}

function updateAccountDropdown() {
    accountSelect.innerHTML = '<option value="">Select an account</option>';
    Object.keys(accounts).sort().forEach(accountName => {
        const option = document.createElement('option');
        option.value = accountName;
        option.textContent = accountName;
        if (accountName === selectedAccount) {
            option.selected = true;
        }
        accountSelect.appendChild(option);
    });
}

function updateSelectedAccountDisplay() {
    selectedAccountDisplay.textContent = selectedAccount || 'None';
}

function calculateRemainingTime(endTime) {
    const now = Date.now();
    const remaining = endTime - now;
    if (remaining <= 0) return 'Expired';
    
    const days = Math.floor(remaining / (24 * 60 * 60 * 1000));
    const hours = Math.floor((remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
    const seconds = Math.floor((remaining % (60 * 1000)) / 1000);
    
    return `${days}d ${hours}h ${minutes}m ${seconds}s remaining`;
}

function updateBanStatus() {
    if (selectedAccount && accounts[selectedAccount]) {
        const accountBans = accounts[selectedAccount];
        const banStatuses = Object.entries(accountBans)
            .filter(([_, endTime]) => endTime > Date.now() || endTime === 0)
            .map(([ban, endTime]) => {
                const status = endTime ? calculateRemainingTime(endTime) : `No ${ban}`;
                return `${ban}: ${status}`;
            });
        
        banStatusEl.textContent = banStatuses.length > 0 
            ? banStatuses.join(" | ")
            : 'No active bans';
    } else {
        banStatusEl.textContent = 'Select an account to view ban status.';
    }
}

function renderAccountButtons() {
    accountButtons.innerHTML = '';
    if (Object.keys(accounts).length === 0) {
        accountButtons.innerHTML = '<p>No accounts available. Please add an account.</p>';
        return;
    }
    
    Object.keys(accounts).sort().forEach(accountName => {
        const button = document.createElement('button');
        button.className = 'account-btn';
        button.textContent = accountName;

        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-btn';
        removeBtn.textContent = '×';
        removeBtn.title = 'Remove Account';
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteAccount(accountName);
        });

        button.appendChild(removeBtn);

        button.addEventListener('click', () => {
            selectedAccount = accountName;
            saveSelectedAccount();
            updateBanStatus();
            highlightSelectedAccount();
            updateSelectedAccountDisplay();
            accountSelect.value = accountName;
        });

        accountButtons.appendChild(button);
    });
    
    highlightSelectedAccount();
}

function highlightSelectedAccount() {
    const buttons = document.querySelectorAll('.account-btn');
    buttons.forEach(btn => {
        if (btn.textContent.replace('×', '').trim() === selectedAccount) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

addAccountBtn.addEventListener('click', () => {
    const accountName = newAccountName.value.trim();
    if (accountName === '') {
        alert('Account name cannot be empty.');
        return;
    }
    if (accounts[accountName]) {
        alert('Account already exists.');
        return;
    }
    accounts[accountName] = {};
    saveAccounts();
    renderAccountButtons();
    updateAccountDropdown();
    newAccountName.value = '';
});

newAccountName.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addAccountBtn.click();
    }
});

function deleteAccount(accountName) {
    if (confirm(`Are you sure you want to delete the account "${accountName}"?`)) {
        delete accounts[accountName];
        saveAccounts();
        if (selectedAccount === accountName) {
            selectedAccount = null;
            saveSelectedAccount();
        }
        renderAccountButtons();
        updateAccountDropdown();
        updateSelectedAccountDisplay();
        updateBanStatus();
    }
}

function applyBan(banType, duration) {
    if (!selectedAccount) {
        alert('Please select an account first.');
        return;
    }
    const endTime = Date.now() + duration;
    accounts[selectedAccount][banType] = endTime;
    saveAccounts();
    updateBanStatus();
}

function cleanExpiredBans() {
    let changed = false;
    Object.keys(accounts).forEach(account => {
        Object.entries(accounts[account]).forEach(([ban, endTime]) => {
            if (endTime && endTime < Date.now()) {
                delete accounts[account][ban];
                changed = true;
            }
        });
    });
    if (changed) {
        saveAccounts();
        updateBanStatus();
    }
}

accountSelect.addEventListener('change', (e) => {
    selectedAccount = e.target.value;
    saveSelectedAccount();
    updateBanStatus();
    highlightSelectedAccount();
    updateSelectedAccountDisplay();
});

cubecraftBtn.addEventListener('click', () => applyBan('Cubecraft Ban', cubecraftBanDuration));
hiveBtn.addEventListener('click', () => applyBan('Hive Ban', hiveBanDuration));
lifeboatBtn.addEventListener('click', () => applyBan('Lifeboat Ban', lifeboatBanDuration));
customBanBtn.addEventListener('click', () => {
    if (!selectedAccount) {
        alert('Please select an account first.');
        return;
    }
    customBanModal.style.display = 'flex';
    customBanName.focus();
});

closeModal.addEventListener('click', () => {
    customBanModal.style.display = 'none';
    customBanName.value = '';
    customBanDuration.value = '';
});

startCustomBanBtn.addEventListener('click', () => {
    const banName = customBanName.value.trim();
    const durationDays = parseInt(customBanDuration.value);

    if (banName === '') {
        alert('Please enter a ban name.');
        return;
    }
    if (isNaN(durationDays) || durationDays <= 0 || durationDays > 365) {
        alert('Please enter a valid duration between 1 and 365 days.');
        return;
    }

    const durationMs = durationDays * 24 * 60 * 60 * 1000;
    const endTime = Date.now() + durationMs;

    accounts[selectedAccount][banName] = endTime;
    saveAccounts();
    updateBanStatus();

    customBanName.value = '';
    customBanDuration.value = '';
    customBanModal.style.display = 'none';
});

navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        navButtons.forEach(button => button.classList.remove('active'));
        
        btn.classList.add('active');

        document.querySelectorAll('.content-section').forEach(section => section.classList.add('hidden'));

        const target = btn.getAttribute('data-target');
        if (target === 'addAccount') {
            addAccountSection.classList.remove('hidden');
        } else if (target === 'manageAccounts') {
            manageAccountsSection.classList.remove('hidden');
        } else if (target === 'banOptions') {
            banOptionsSection.classList.remove('hidden');
        }
    });
});

window.addEventListener('click', (e) => {
    if (e.target === customBanModal) {
        customBanModal.style.display = 'none';
        customBanName.value = '';
        customBanDuration.value = '';
    }
});

customBanDuration.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        startCustomBanBtn.click();
    }
});

loadAccounts();
renderAccountButtons();
loadSelectedAccount();
updateAccountDropdown();
updateBanStatus();
cleanExpiredBans();

// Set up periodic updates
setInterval(updateBanStatus, 1000); // Update timer every second
setInterval(cleanExpiredBans, 60000); // Clean expired bans every minute
