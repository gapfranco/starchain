const express = require("express");
const router = express("router");
const pool = require("../mempool");

const MemPool = new pool.MemPool();

router.get("/list", (req, res) => {
  res.json(MemPool.listPool());
});

router.post("/requestValidation", (req, res) => {
  const { address } = req.body;
  if (address) {
    const reqObj = MemPool.addRequestValidation(address);
    res.send(reqObj);
  } else {
    res.status(400).json({ error: "invalid request validation body" });
  }
});

router.post("/validate", (req, res) => {
  const { address, signature } = req.body;
  if (address && signature) {
    const reqObj = MemPool.addRequestValidation(address);
    res.send(reqObj);
  } else {
    res.status(400).json({ error: "invalid block body" });
  }
});

module.exports = router;
