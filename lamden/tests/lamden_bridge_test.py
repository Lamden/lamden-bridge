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
        # print("get_var: ", self.c.get_var("con_lamden_bridge", "S", [self.c.signer]))
        # print("quick read: ", self.contract.quick_read("S", self.c.signer))

    def tearDown(self):
        self.c.flush()

    @unittest.expectedFailure
    def test_pack_eth_address_length(self):
        self.contract.deposit(1, "0x2c6e331E4c96f2BdF2D8973831B225F75c89A27b6")

    # def test_supply(self):
    #     self.assertEqual(self.contract.quick_read("S", self.c.signer), 50)

    # @unittest.expectedFailure
    # def test_balance_sufficient(self):
    #     self.c.set_var("con_strums_test", "S", [self.c.signer], 0)
    #     self.contract.transfer(10, "mock")


if __name__ == "__main__":
    unittest.main()
