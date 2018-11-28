const express = require('express')
const router = express('router')

const pool = require('../mempool')

const MemPool = new pool.MemPool()

router.get('/listRequests', (req, res) => {
  res.json(MemPool.listPool())
})

router.get('/listValidRequests', (req, res) => {
  res.json(MemPool.listPoolValid())
})

router.post('/requestValidation', (req, res) => {
  const { address } = req.body
  if (address) {
    const reqObj = MemPool.addRequestValidation(address)
    res.send(reqObj)
  } else {
    res.status(400).json({ error: 'invalid request validation body' })
  }
})

router.post('/validate', (req, res) => {
  const { address, signature } = req.body
  if (address && signature) {
    const result = MemPool.validateRequestByWallet(address, signature)
    res.send(result)
  } else {
    res.status(400).json({ error: 'invalid validation body' })
  }
})

module.exports = router
