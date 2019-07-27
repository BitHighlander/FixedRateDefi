pragma solidity ^0.4.18;

contract cDAI {
    function mint(uint mintAmount) public returns (uint);
    function redeemUnderlying(uint redeemAmount) public returns (uint);
    function transferFrom(address from, address to, uint tokens) public returns (bool success);
    function transfer(address to, uint tokens) public returns (bool success);
    function balanceOf(address tokenOwner) public view returns (uint balance);
    function exchangeRateCurrent() public returns (uint);
}

contract DAI {
    function transfer(address to, uint tokens) public returns (bool success);
    function balanceOf(address tokenOwner) public view returns (uint balance);
    function transferFrom(address from, address to, uint tokens) public returns (bool success);
}

contract FixedRateDefi {

  address cDaiContractAddress = address(0xF5DCe57282A584D2746FaF1593d3121Fcac444dC);
  address daiContractAddress = address(0x89d24A6b4CcB1B6fAA2625fE562bDD9a23260359);
  cDAI cDaiContract = cDAI(cDaiContractAddress);
  DAI daiContract = DAI(daiContractAddress);

  uint secondsPerYear = 31622400;

  address investor; // investor address
  address marketMaker; // marketMaker address
  uint acceptTime; // when the contract was accepted
  uint settleTime; // when the contract was settled

  uint principal; // required deposit principal amount
  uint interestCollateral; // collateral deposited by the market maker to ensure investor gets paid
  uint length; // how long for the contract to mature

  modifier ensureContractNotAccepted() {
    require(acceptTime == 0);
    _;
  }

  modifier ensureOnlyInvestor() {
    require(msg.sender == investor);
    _;
  }

  modifier ensureOnlyMarketMaker() {
    require(msg.sender == marketMaker);
    _;
  }

  modifier ensureExpiredOrSettled() {
    require(contractExpired() || contractSettled());
    _;
  }

  modifier ensureContractAccepted() {
    require(acceptTime > 0);
    _;
  }

  function divider(uint numerator, uint denominator, uint precision) public pure returns(uint) {
    return numerator*(uint(10)**uint(precision))/denominator;
  }

  // getter function to check when the contract expires
  function endTime() public view returns (uint) {

    if(acceptTime > 0) {
      return length + acceptTime;
    }
    return 0;
  }

  // how long the contract has been active.  capped at length of contract
  function elapsedTime() public view returns (uint) {
    uint calculatedEndTime = (settleTime == 0) ? now : settleTime;
    uint calculatedElapsedTime = ((acceptTime - calculatedEndTime) > length) ? length : (acceptTime - calculatedEndTime);
    return calculatedElapsedTime;
  }

  function contractExpired() public view returns (bool) {
    return elapsedTime() >= length;
  }

  function contractSettled() public view returns (bool) {
    return settleTime > 0;
  }

  // getter function to check apr of this contract
  function apr() public view returns (uint) {
    return divider(secondsPerYear * interestCollateral, length * principal, 4);
  }


  function earnedInvestorInterest() public view returns (uint) {
    return (elapsedTime() * interestCollateral) / length;
  }

  function investorBalance() public view returns (uint) {
    return earnedInvestorInterest() + principal;
  }

  function marketMakerBalance() public returns (uint) {
    return compoundBalance() - investorBalance();
  }

  // balance held by this contract on compound
  function compoundBalance() public returns (uint) {
    return cDaiContract.exchangeRateCurrent() * cDaiContract.balanceOf(this);
  }

  // allows marketMaker to modify this contract if it has not yet been accepted
  function modifyContract(uint _principal, uint _interestCollateral, uint _length) ensureContractNotAccepted ensureOnlyMarketMaker public {
    principal = _principal;
    interestCollateral = _interestCollateral;
    length = _length;
  }

  function acceptContract() ensureContractNotAccepted public {
    // pull in dai from investor
    if(!cDaiContract.transferFrom(msg.sender, cDaiContractAddress, principal)) {
      revert();
    }

    // deposit dai into compound
    if(cDaiContract.mint(principal) != 0) {
      revert();
    }
    acceptTime = now;
  }

  // allows investor to settle the contract and get back their original deposit + interest earned
  function investorSettle() public ensureOnlyInvestor ensureContractAccepted {
    settleTime = now;
    // pull everything out of compound
    cDaiContract.redeemUnderlying(compoundBalance());
    // transfer investor what they are owed
    daiContract.transfer(investor, investorBalance());
  }

  // withdraws marketMaker funds if the contract has expired or settled
  function marketMakerWithdraw() public ensureOnlyMarketMaker ensureExpiredOrSettled {
      // pull everything out of compound
      cDaiContract.redeemUnderlying(compoundBalance());
      // transfer marketMaker what they are owed
      daiContract.transfer(marketMaker, marketMakerBalance());
  }

    // constructor.  Transfer interestCollateral from marketMaker to contract and sets terms
  function FixedRateDefi(uint _principal, uint _interestCollateral, uint _length) public {

    // pull in dai from market maker
    if(!daiContract.transferFrom(msg.sender, this, _interestCollateral)) {
      revert();
    }

    // deposit dai into compound
    if(cDaiContract.mint(_interestCollateral) != 0) {
      revert();
    }
    marketMaker = msg.sender;
    principal = _principal;
    interestCollateral = _interestCollateral;
    length = _length;
  }

}
