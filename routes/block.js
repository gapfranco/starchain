const express = require("express");
const router = express("router");
const chain = require("../simpleChain");

const bc = new chain.Blockchain();

router.get("/height", async (req, res) => {
  bc.getBlockHeight()
    .then(data => res.json({ height: data }))
    .catch(err => res.status(400).json({ error: err }));
});

router.get("/:id", async (req, res) => {
  bc.getBlock(req.params.id)
    .then(data => res.json(data))
    .catch(() => res.status(404).json({ error: "block not found" }));
});

router.post("/", (req, res) => {
  const data = req.body;
  if (data && data.body) {
    bc.addNewBlock(new chain.Block(data.body))
      .then(resp => res.send(resp))
      .catch(err => res.status(400).json({ error: err }));
  } else {
    res.status(400).json({ error: "invalid block body" });
  }
});

module.exports = router;
