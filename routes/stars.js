const express = require('express')
const router = express('router')
const hex2ascii = require('hex2ascii')

const pool = require('../mempool')
const chain = require('../simpleChain')

const bc = new chain.Blockchain()

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

router.post('/message-signature/validate', (req, res) => {
  const { address, signature } = req.body
  if (address && signature) {
    const result = MemPool.validateRequestByWallet(address, signature)
    res.send(result)
  } else {
    res.status(400).json({ error: 'invalid validation body' })
  }
})

router.post('/block', (req, res) => {
  const { address, star } = req.body
  if (address && star) {
    const item = MemPool.verifyAddressRequest(address)
    if (item) {
      let body = {
        address: address,
        star: { ...star, story: Buffer.from(star.story || '').toString('hex') }
      }
      bc.addNewBlock(new chain.Block(body))
        .then(resp => res.send(resp))
        .then(() => MemPool.deleteAddressRequest(item))
        .catch(err => res.status(400).json({ error: err }))
    } else {
      res.status(400).json({ error: 'address request not found' })
    }
  } else {
    res.status(400).json({ error: 'invalid body' })
  }
})

router.get('/stars/address::id', async (req, res) => {
  bc.getBlockByWalletAddress(req.params.id)
    .then(data => {
      res.json(data)
    })
    .catch(() => res.status(404).json({ error: 'block not found' }))
})

router.get('/stars/hash::id', async (req, res) => {
  bc.getBlockByHash(req.params.id)
    .then(data => {
      if (data) {
        res.json(data)
      } else {
        res.status(404).json({ error: 'block not found' })
      }
    })
    .catch(() => res.status(404).json({ error: 'block not found' }))
})

router.get('/block/:id', async (req, res) => {
  bc.getBlock(req.params.id)
    .then(data => {
      data.body.star.story = hex2ascii(data.body.star.story)
      res.json(data)
    })
    .catch(() => res.status(404).json({ error: 'block not found' }))
})

module.exports = router
