// Persist with LevelDB
const level = require('level')

// SHA256 with Crypto-js
const SHA256 = require('crypto-js/sha256')

// Decode HEX to ASCII
const hex2ascii = require('hex2ascii')

/**
 * Block class
 *
 * Represents a single block in a blockchain
 */
class Block {
  constructor (data) {
    this.hash = ''
    this.height = 0
    this.body = data
    this.time = 0
    this.previousBlockHash = ''
  }
}

/**
 * Blockchain
 *
 * Blockchain class with data persistence in levelDB
 */
class Blockchain {
  constructor () {
    this.db = level('./chaindata')
    // REVIEW: getNextBlockHeight retrieves the next height insert point. 0 = genesis block
    this.getNextBlockHeight().then(height => {
      if (height === 0) {
        this.addNewBlock(new Block('First block in the chain - Genesis block'))
      }
    })
  }

  /**
   * Adds a data value in a block in the blockchain
   * @param {any} value
   */
  addDataToLevelDB (block) {
    // REVIEW: block already has height when called from addNewBlock
    return this.db
      .put(block.height, JSON.stringify(block))
      .then(() => JSON.stringify(block))
      .catch(err => console.log('Block submission failed: ', err))
  }

  /**
   * Adds a new block in the blockchain
   * @param {Block} newBlock
   */
  addNewBlock (newBlock) {
    return this.getNextBlockHeight()
      .then(height => {
        newBlock.height = height
        newBlock.time = new Date()
          .getTime()
          .toString()
          .slice(0, -3)
        if (height > 0) {
          return this.getBlock(height - 1).then(block => {
            newBlock.previousBlockHash = block.hash
            newBlock.hash = SHA256(JSON.stringify(newBlock)).toString()
          })
        } else {
          newBlock.hash = SHA256(JSON.stringify(newBlock)).toString()
        }
      })
      .then(() => this.addDataToLevelDB(newBlock))
  }

  /**
   * Returns the total height of the blockchain in a promise
   */
  getBlockHeight () {
    let i = 0
    return new Promise((resolve, reject) => {
      this.db
        .createReadStream()
        .on('data', data => {
          i++
        })
        .on('error', err => {
          reject(err)
        })
        .on('close', () => {
          resolve(i === 0 ? 0 : i - 1) // REVIEW: height must not count genesis block
        })
    })
  }

  /**
   * Returns the next height of the blockchain in a promise
   * REVIEW: get next height to insert block. Simplifies addNewBlock logic independently of getBlockHeight()
   */
  getNextBlockHeight () {
    let i = 0
    return new Promise((resolve, reject) => {
      this.db
        .createReadStream()
        .on('data', data => {
          i++
        })
        .on('error', err => {
          reject(err)
        })
        .on('close', () => {
          resolve(i)
        })
    })
  }

  /**
   * Returns a block in a promise by its height
   * @param {Number} height
   */
  getBlock (height) {
    return this.db.get(height).then(value => JSON.parse(value))
  }

  /**
   * Inject an error in a block for testing
   * @param {Number} height
   */
  errorBlock (height) {
    this.getBlock(height).then(block => {
      block.body = 'Error data'
      this.db.put(height, JSON.stringify(block))
    })
  }

  /**
   * Validate a block by its height
   * @param {Number} blockHeight
   */
  validateBlock (blockHeight) {
    return this.getBlock(blockHeight).then(block => {
      let blockHash = block.hash
      block.hash = ''
      // generate block hash
      let validBlockHash = SHA256(JSON.stringify(block)).toString()
      // Compare
      if (blockHash === validBlockHash) {
        return true
      } else {
        return false
      }
    })
  }

  /**
   * Validate all the blockchain
   */
  validateChain () {
    let list = []
    let errorLog = []

    // REVIEW: simplify logic with async/await
    // takes care of last block case (has no block after) and of invalid previousBlockHash
    const valid = async (i, height) => {
      const val = await this.validateBlock(i)
      if (!val) {
        errorLog.push(i)
        return
      }
      if (i < height) {
        const block1 = await this.getBlock(i)
        const block2 = await this.getBlock(i + 1)
        if (block1.hash !== block2.previousBlockHash) {
          errorLog.push(i + 1)
        }
      }
    }

    this.getBlockHeight().then(height => {
      for (let i = 0; i <= height; ++i) {
        list.push(valid(i, height)) // REVIEW: Pass total height to mark end of list
      }
      Promise.all(list).then(() => {
        if (errorLog.length > 0) {
          console.log('Block errors = ' + errorLog.length)
          console.log('Blocks: ' + errorLog)
        } else {
          console.log('No errors detected')
        }
      })
    })
  }

  /**
   * Get array of blocks by wallet address
   */
  getBlockByWalletAddress (address) {
    let list = []
    let blk
    return new Promise((resolve, reject) => {
      this.db
        .createReadStream()
        .on('data', ({ value }) => {
          blk = JSON.parse(value)
          if (blk.body.address === address) {
            blk.body.star.story = hex2ascii(blk.body.star.story)
            list.push(blk)
          }
        })
        .on('error', err => {
          reject(err)
        })
        .on('close', () => {
          resolve(list)
        })
    })
  }

  /**
   * Get block by hash valus
   */
  getBlockByHash (hash) {
    let blk
    let blkOut
    return new Promise((resolve, reject) => {
      const stream = this.db.createReadStream()
      stream
        .on('data', ({ value }) => {
          blk = JSON.parse(value)
          if (blk.hash === hash) {
            blkOut = blk
            blkOut.body.star.story = hex2ascii(blkOut.body.star.story)
            stream.destroy()
          }
        })
        .on('error', err => {
          reject(err)
        })
        .on('close', () => {
          resolve(blkOut)
        })
    })
  }
}

/**
 * testChain - Generates test data in the private blockchain
 * @param {Blockchain} blkChain blockchain object
 * @param {Number} qtd number of blocks to create
 */
function testChain (blkChain, qtd) {
  console.log('Start test data creation');
  (function theLoop (i) {
    setTimeout(function () {
      let blockTest = new Block('Test Block - ' + (i + 1))
      blkChain.addNewBlock(blockTest).then(result => {
        console.log(result)
        i++
        if (i < qtd) {
          theLoop(i)
        } else {
          console.log('End test data creation')
        }
      })
    }, 10000)
  })(0)
}

module.exports = { Block, Blockchain, testChain }
