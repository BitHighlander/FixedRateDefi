module.exports = {
    metaData: {
        contractAddress: "0x41e5560054824ea6b0732e656e3ad64e20e94e45",
        BASE: 100000000,
        accountsList: "CVC_accounts",
        from: "from",
        to: "to",
        value: "value"
    },
    ABI: [{
        "constant": true,
        "inputs": [],
        "name": "name",
        "outputs": [{"name": "", "type": "string"}],
        "payable": false,
        "type": "function"
    }, {
        "constant": false,
        "inputs": [{"name": "_spender", "type": "address"}, {"name": "_value", "type": "uint256"}],
        "name": "approve",
        "outputs": [{"name": "success", "type": "bool"}],
        "payable": false,
        "type": "function"
    }, {
        "constant": true,
        "inputs": [],
        "name": "totalSupply",
        "outputs": [{"name": "", "type": "uint256"}],
        "payable": false,
        "type": "function"
    }, {
        "constant": false,
        "inputs": [{"name": "_from", "type": "address"}, {"name": "_to", "type": "address"}, {
            "name": "_value",
            "type": "uint256"
        }],
        "name": "transferFrom",
        "outputs": [{"name": "success", "type": "bool"}],
        "payable": false,
        "type": "function"
    }, {
        "constant": true,
        "inputs": [],
        "name": "decimals",
        "outputs": [{"name": "", "type": "uint256"}],
        "payable": false,
        "type": "function"
    }, {
        "constant": false,
        "inputs": [{"name": "value", "type": "uint256"}],
        "name": "upgrade",
        "outputs": [],
        "payable": false,
        "type": "function"
    }, {
        "constant": false,
        "inputs": [{"name": "_name", "type": "string"}, {"name": "_symbol", "type": "string"}],
        "name": "setTokenInformation",
        "outputs": [],
        "payable": false,
        "type": "function"
    }, {
        "constant": true,
        "inputs": [],
        "name": "upgradeAgent",
        "outputs": [{"name": "", "type": "address"}],
        "payable": false,
        "type": "function"
    }, {
        "constant": true,
        "inputs": [],
        "name": "upgradeMaster",
        "outputs": [{"name": "", "type": "address"}],
        "payable": false,
        "type": "function"
    }, {
        "constant": true,
        "inputs": [{"name": "_owner", "type": "address"}],
        "name": "balanceOf",
        "outputs": [{"name": "balance", "type": "uint256"}],
        "payable": false,
        "type": "function"
    }, {
        "constant": true,
        "inputs": [],
        "name": "getUpgradeState",
        "outputs": [{"name": "", "type": "uint8"}],
        "payable": false,
        "type": "function"
    }, {
        "constant": true,
        "inputs": [],
        "name": "symbol",
        "outputs": [{"name": "", "type": "string"}],
        "payable": false,
        "type": "function"
    }, {
        "constant": true,
        "inputs": [],
        "name": "canUpgrade",
        "outputs": [{"name": "", "type": "bool"}],
        "payable": false,
        "type": "function"
    }, {
        "constant": false,
        "inputs": [{"name": "_to", "type": "address"}, {"name": "_value", "type": "uint256"}],
        "name": "transfer",
        "outputs": [{"name": "success", "type": "bool"}],
        "payable": false,
        "type": "function"
    }, {
        "constant": true,
        "inputs": [],
        "name": "totalUpgraded",
        "outputs": [{"name": "", "type": "uint256"}],
        "payable": false,
        "type": "function"
    }, {
        "constant": false,
        "inputs": [{"name": "agent", "type": "address"}],
        "name": "setUpgradeAgent",
        "outputs": [],
        "payable": false,
        "type": "function"
    }, {
        "constant": true,
        "inputs": [{"name": "_owner", "type": "address"}, {"name": "_spender", "type": "address"}],
        "name": "allowance",
        "outputs": [{"name": "remaining", "type": "uint256"}],
        "payable": false,
        "type": "function"
    }, {
        "constant": true,
        "inputs": [],
        "name": "isToken",
        "outputs": [{"name": "weAre", "type": "bool"}],
        "payable": false,
        "type": "function"
    }, {
        "constant": false,
        "inputs": [{"name": "master", "type": "address"}],
        "name": "setUpgradeMaster",
        "outputs": [],
        "payable": false,
        "type": "function"
    }, {
        "inputs": [{"name": "_owner", "type": "address"}, {"name": "_name", "type": "string"}, {
            "name": "_symbol",
            "type": "string"
        }, {"name": "_totalSupply", "type": "uint256"}, {"name": "_decimals", "type": "uint256"}],
        "payable": false,
        "type": "constructor"
    }, {
        "anonymous": false,
        "inputs": [{"indexed": false, "name": "newName", "type": "string"}, {
            "indexed": false,
            "name": "newSymbol",
            "type": "string"
        }],
        "name": "UpdatedTokenInformation",
        "type": "event"
    }, {
        "anonymous": false,
        "inputs": [{"indexed": true, "name": "_from", "type": "address"}, {
            "indexed": true,
            "name": "_to",
            "type": "address"
        }, {"indexed": false, "name": "_value", "type": "uint256"}],
        "name": "Upgrade",
        "type": "event"
    }, {
        "anonymous": false,
        "inputs": [{"indexed": false, "name": "agent", "type": "address"}],
        "name": "UpgradeAgentSet",
        "type": "event"
    }, {
        "anonymous": false,
        "inputs": [{"indexed": false, "name": "upgradeMaster", "type": "address"}],
        "name": "NewUpgradeMaster",
        "type": "event"
    }, {
        "anonymous": false,
        "inputs": [{"indexed": true, "name": "from", "type": "address"}, {
            "indexed": true,
            "name": "to",
            "type": "address"
        }, {"indexed": false, "name": "value", "type": "uint256"}],
        "name": "Transfer",
        "type": "event"
    }, {
        "anonymous": false,
        "inputs": [{"indexed": true, "name": "owner", "type": "address"}, {
            "indexed": true,
            "name": "spender",
            "type": "address"
        }, {"indexed": false, "name": "value", "type": "uint256"}],
        "name": "Approval",
        "type": "event"
    }]
}




