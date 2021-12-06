import currency

nonces = Hash(default_value=0)
proofs = Hash()
metadata = Hash()

token_address = Variable()
token_decimals = Variable()
bridge_address = Variable()

HEX_BYTES = 64


def left_pad(s):
    while len(s) < HEX_BYTES:
        s = f"0{s}"

    if len(s) > HEX_BYTES:
        s = s[:HEX_BYTES]

    return s


def unpack_uint256(uint, decimals):
    i = int(uint, 16)
    reduced_i = i / (10 ** decimals)
    return reduced_i


def pack_amount(amount, decimals):
    i = int(amount * (10 ** decimals))
    h = hex(i)[2:]
    return left_pad(h)


def pack_eth_address(address):
    assert address.startswith("0x"), "Invalid Ethereum prefix"
    a = address[2:]
    assert len(a) == 40, "Invalid address length"

    int(a, 16)  # Throws error if not hex string

    return left_pad(a)


def pack_int(i):
    i = int(i)
    h = hex(i)[2:]
    return left_pad(h)


@construct
def seed():
    metadata["operator"] = ctx.caller


# LST002
@export
def change_metadata(key: str, value: Any):
    assert ctx.caller == metadata["operator"], "Only operator can set metadata!"
    metadata[key] = value


@export
def set_token(eth_contract: str, decimals: int):
    assert ctx.caller == metadata["operator"], "Only the operator can call!"
    token_address.set(eth_contract)
    token_decimals.set(decimals)


@export
def set_bridge(eth_contract: str):
    assert ctx.caller == metadata["operator"], "Only the operator can call!"
    bridge_address.set(eth_contract)


@export
def deposit(amount: float, ethereum_address: str):
    assert token_address.get() is not None, "token_address variable not set"

    currency.transfer_from(amount=amount, to=ctx.this, main_account=ctx.caller)

    packed_token = pack_eth_address(token_address.get())
    packed_amount = pack_amount(amount, token_decimals.get())
    packed_nonce = pack_int(nonces[ethereum_address] + 1)
    packed_address = pack_eth_address(ethereum_address)
    packed_bridge = pack_eth_address(bridge_address.get())

    nonces[ethereum_address] += 1

    abi = packed_token + packed_amount + packed_nonce + packed_address + packed_bridge

    return abi


@export
def withdraw(amount: float, to: str):
    assert ctx.caller == metadata["operator"], "Only the operator can call!"
    assert token_address.get() is not None, "token_address variable not set"
    currency.transfer(amount=amount, to=to)


@export
def post_proof(hashed_abi: str, signed_abi: str):
    assert ctx.caller == metadata["operator"], "Only operator can call!"
    assert token_address.get() is not None, "token_address variable not set"
    proofs[hashed_abi] = signed_abi


@export
def proofs(hashed_abi: str):
    return proofs[hashed_abi]
