// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

contract RumERC20 {
    mapping(address => uint256) private _balances;

    mapping(address => mapping(address => uint256)) private _allowances;

    mapping(string => bool) private _uuidRecord;

    uint256 private _totalSupply;

    string private _name;
    string private _symbol;

    constructor(
        string memory name_,
        string memory symbol_,
        uint256 cap,
        address minter
    ) {
        _name = name_;
        _symbol = symbol_;
        // send all supply to minter
        _mint(minter, cap);
    }

    event Transfer(address indexed from, address indexed to, uint256 value);

    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );

    function name() public view virtual returns (string memory) {
        return _name;
    }

    function symbol() public view virtual returns (string memory) {
        return _symbol;
    }

    function decimals() public view virtual returns (uint8) {
        return 18;
    }

    function totalSupply() public view virtual returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address account) public view virtual returns (uint256) {
        return _balances[account];
    }

    function rumTransfer(
        address recipient,
        uint256 amount,
        string memory uuid
    ) public virtual returns (bool) {
        bytes memory uuidBytes = bytes(uuid);
        require(uuidBytes.length != 0, "RumERC20: uuid is empty");
        require(!_uuidRecord[uuid], "RumERC20: this transfer has done");
        _transfer(_msgSender(), recipient, amount);
        _uuidRecord[uuid] = true;
        return true;
    }

    function rumApprove(
        address spender,
        uint256 amount,
        string memory uuid
    ) public virtual returns (bool) {
        bytes memory uuidBytes = bytes(uuid);
        require(uuidBytes.length != 0, "RumERC20: uuid is empty");
        require(!_uuidRecord[uuid], "RumERC20: this approve has done");
        _approve(_msgSender(), spender, amount);
        _uuidRecord[uuid] = true;
        return true;
    }

    function rumTransferFrom(
        address sender,
        address recipient,
        uint256 amount,
        string memory uuid
    ) public virtual returns (bool) {
        bytes memory uuidBytes = bytes(uuid);
        require(uuidBytes.length != 0, "RumERC20: uuid is empty");
        require(!_uuidRecord[uuid], "RumERC20: this transferFrom has done");
        _transfer(sender, recipient, amount);

        uint256 currentAllowance = _allowances[sender][_msgSender()];
        require(
            currentAllowance >= amount,
            "RumERC20: transfer amount exceeds allowance"
        );
        unchecked {
            _approve(sender, _msgSender(), currentAllowance - amount);
        }

        _uuidRecord[uuid] = true;
        return true;
    }

    function transfer(address recipient, uint256 amount)
        public
        virtual
        returns (bool)
    {
        _transfer(_msgSender(), recipient, amount);
        return true;
    }

    function allowance(address owner, address spender)
        public
        view
        virtual
        returns (uint256)
    {
        return _allowances[owner][spender];
    }

    function approve(address spender, uint256 amount)
        public
        virtual
        returns (bool)
    {
        _approve(_msgSender(), spender, amount);
        return true;
    }

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) public virtual returns (bool) {
        _transfer(sender, recipient, amount);

        uint256 currentAllowance = _allowances[sender][_msgSender()];
        require(
            currentAllowance >= amount,
            "RumERC20: transfer amount exceeds allowance"
        );
        unchecked {
            _approve(sender, _msgSender(), currentAllowance - amount);
        }

        return true;
    }

    function _transfer(
        address sender,
        address recipient,
        uint256 amount
    ) internal virtual {
        require(
            sender != address(0),
            "RumERC20: transfer from the zero address"
        );
        require(
            recipient != address(0),
            "RumERC20: transfer to the zero address"
        );

        uint256 senderBalance = _balances[sender];
        require(
            senderBalance >= amount,
            "RumERC20: transfer amount exceeds balance"
        );
        unchecked {
            _balances[sender] = senderBalance - amount;
        }
        _balances[recipient] += amount;

        emit Transfer(sender, recipient, amount);
    }

    function _mint(address account, uint256 amount) internal virtual {
        require(account != address(0), "RumERC20: mint to the zero address");

        _totalSupply += amount;
        _balances[account] += amount;
        emit Transfer(address(0), account, amount);
    }

    function _approve(
        address owner,
        address spender,
        uint256 amount
    ) internal virtual {
        require(owner != address(0), "RumERC20: approve from the zero address");
        require(spender != address(0), "RumERC20: approve to the zero address");

        _allowances[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }

    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }
}
