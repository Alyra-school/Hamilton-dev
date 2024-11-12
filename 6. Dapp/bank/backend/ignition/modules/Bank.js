const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("BankModule", (m) => {

  const bank = m.contract("Bank");

  return { bank };
});
