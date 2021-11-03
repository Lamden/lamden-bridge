import unittest
from contracting.client import ContractingClient

with open("../contracts/lamden_bridge.py") as f:
    code = f.read()


class TestContract(unittest.TestCase):
    def setUp(self):
        self.c = ContractingClient()
        self.c.flush()
        self.c.submit(code, name="con_lamden_bridge")
        self.contract = self.c.get_contract("con_lamden_bridge")
        # print(
        #     "get_var: ",
        #     self.c.get_var(
        #         "con_lamden_bridge",
        #         "token_address",
        #     ),
        # )
        # print(
        #     "quick read: ",
        #     self.contract.quick_read(
        #         "token_address",
        #     ),
        # )

    def tearDown(self):
        self.c.flush()

    def test_pack_valid_prefix(self):
        with self.assertRaises(Exception) as cm:
            self.contract.deposit(
                amount=1, ethereum_address="3x2c6e331E4c96f2BdF2D8973831B225F75c89A27b"
            )
        err = cm.exception
        self.assertEqual(str(err), "Invalid Ethereum prefix")

    def test_pack_valid_address_length(self):
        with self.assertRaises(Exception) as cm:
            self.contract.deposit(
                amount=1, ethereum_address="0x2c6e331E4c96f2BdF2D8973831B225F75c89A27b6"
            )
        err = cm.exception
        self.assertEqual(str(err), "Invalid address length")

    def test_pack_is_hex_string(self):
        with self.assertRaises(Exception) as cm:
            self.contract.deposit(
                amount=1, ethereum_address="0x2c6k331E4c96f2BdF2D8973831B225F75c89A27b"
            )
        err = cm.exception
        self.assertEqual(
            str(err),
            "invalid literal for int() with base 16: '2c6k331E4c96f2BdF2D8973831B225F75c89A27b'",
        )

    def test_only_owner_can_call_withdraw(self):
        with self.assertRaises(Exception) as cm:
            self.contract.withdraw(amount=1, to="stu", signer="mocker")
        err = cm.exception
        self.assertEqual(str(err), "Only the owner can call!")

    def test_only_owner_can_call_post_proof(self):
        with self.assertRaises(Exception) as cm:
            self.contract.post_proof(
                hashed_abi="example", signed_abi="sexample", signer="mocker"
            )
        err = cm.exception
        self.assertEqual(str(err), "Only owner can call!")

    # def test_supply(self):
    #     self.assertEqual(self.contract.quick_read("S", self.c.signer), 50)

    # @unittest.expectedFailure
    # def test_balance_sufficient(self):
    #     self.c.set_var("con_strums_test", "S", [self.c.signer], 0)
    #     self.contract.transfer(10, "mock")


if __name__ == "__main__":
    unittest.main()
