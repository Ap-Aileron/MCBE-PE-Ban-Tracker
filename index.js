 
    const addAccountBtn = document.getElementById('addAccountBtn');
    const manageAccountsBtn = document.getElementById('manageAccountsBtn');
    const accountButtons = document.getElementById('accountButtons');
    const cubecraftBtn = document.getElementById('cubecraftBtn');
    const hiveBtn = document.getElementById('hiveBtn');
    const lifeBtn = document.getElementById('lifeboatBtn')
    const banStatusEl = document.getElementById('banStatus');
    const newAccountName = document.getElementById('newAccountName');
    
    // Ban durations
    const cubecraftBanDuration = 30 * 24 * 60 * 60 * 1000; 
    const hiveBanDuration = 7 * 24 * 60 * 60 * 1000; 
    const lifeboatBanDuration = 30 * 24 * 60 * 60 * 1000; 
    
  
     let accounts = JSON.parse(localStorage.getItem('accounts')) || {};
     let selectedAccount = null;
    

    function saveAccounts() {
        localStorage.setItem('accounts', JSON.stringify(accounts));
    }
    
 
    function loadAccounts() {
        accountButtons.innerHTML = ''; 
        for (let account in accounts) {
            let button = document.createElement('button');
            button.className = 'account-btn';
            button.textContent = account;
    
  
            let removeBtn = document.createElement('button');
            removeBtn.className = 'remove-btn';
            removeBtn.textContent = 'X';
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteAccount(account);
            });
            button.appendChild(removeBtn);
            button.addEventListener('click', () => selectAccount(account));
            accountButtons.appendChild(button);
        }
    }
    
   
    function selectAccount(account) {
        selectedAccount = account;
        updateBanStatus();
        document.querySelectorAll('.account-btn').forEach(btn => {
            btn.classList.remove('active-account');
        });
        event.target.classList.add('active-account');
     }
    addAccountBtn.addEventListener('click', () => {
        const accountName = newAccountName.value.trim();
        if (accountName && !accounts[accountName]) {
            accounts[accountName] = { cubecraftBan: null, hiveBan: null };
            saveAccounts();
            loadAccounts();
            newAccountName.value = ''; 
        } else {
            alert('Account already exists or name is empty');
        }
    });
    
    function deleteAccount(account) {
        delete accounts[account];
        saveAccounts();
        loadAccounts();
        if (selectedAccount === account) {
            selectedAccount = null;
            updateBanStatus();
        }
    }
  
    function calculateRemainingTime(endTime) {
        const now = new Date().getTime();
        const distance = endTime - now;
        if (distance < 0) {
            return "Ban is over.";
        }
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        return `${days}d ${hours}h ${minutes}m ${seconds}s remaining`;
    }

    function startBan(banType, duration) {
        if (selectedAccount) {
            const endTime = new Date().getTime() + duration;
            accounts[selectedAccount][banType] = endTime;
            saveAccounts();
            updateBanStatus();
        } else {
            alert('Please select an account first.');
        }
    }

    function updateBanStatus() {
        if (selectedAccount) {
            const cubecraftBanEnd = accounts[selectedAccount].cubecraftBan;
            const lifeboatBanEnd = accounts[selectedAccount].lifeboatBan;
            const hiveBanEnd = accounts[selectedAccount].hiveBan;
            const cubecraftStatus = cubecraftBanEnd ? calculateRemainingTime(cubecraftBanEnd) : 'No Cubecraft ban';
            const lifeboatStatus = lifeboatBanEnd ? calculateRemainingTime(lifeboatBanEnd) : 'No Lifeboat ban';
            const hiveStatus = hiveBanEnd ? calculateRemainingTime(hiveBanEnd) : 'No Hive ban';
            banStatusEl.textContent = `Cubecraft: ${cubecraftStatus} | Hive: ${hiveStatus} | Lifeboat: ${lifeboatStatus}`;
        } else {
            banStatusEl.textContent = 'Select an account to view ban status.';
        }
    }
  
    cubecraftBtn.addEventListener('click', () => startBan('cubecraftBan', cubecraftBanDuration));
    hiveBtn.addEventListener('click', () => startBan('hiveBan', hiveBanDuration));
    lifeBtn.addEventListener('click', () => startBan('lifeboatBan', lifeboatBanDuration));

    manageAccountsBtn.addEventListener('click', () => {
        accountButtons.classList.toggle('active');
    });

    loadAccounts();