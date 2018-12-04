const bitcoinMessage = require('bitcoinjs-message')

const TimeOutSecs = 5 * 60
const TimeoutRequestsWindowTime = TimeOutSecs * 1000

class MemPool {
  constructor () {
    this.memPool = []
    this.memPoolValid = []
    this.timedOutRequests = {}
  }

  listPool () {
    return this.memPool
  }

  listPoolValid () {
    return this.memPoolValid
  }

  removeRequestValidation (address) {
    this.memPool = this.memPool.filter(item => item.walletAddress !== address)
  }

  addRequestValidation (address) {
    const timeStamp = new Date()
      .getTime()
      .toString()
      .slice(0, -3)
    const res = this.memPool.find(elem => elem.walletAddress === address)
    if (res) {
      res.validationWindow = TimeOutSecs - (timeStamp - res.requestTimeStamp)
      return res
    }
    const req = {
      walletAddress: address,
      requestTimeStamp: timeStamp,
      message: `${address}:${timeStamp}:starRegistry`,
      validationWindow: TimeOutSecs
    }
    this.memPool.push(req)
    this.timedOutRequests[address] = setTimeout(() => {
      this.removeRequestValidation(address)
    }, TimeoutRequestsWindowTime)

    return req
  }

  validateRequestByWallet (address, signature) {
    const item = this.memPool.find(item => item.walletAddress === address)
    // find request
    if (!item) {
      return { registerStar: false, error: 'validation request not found' }
    }
    // verify time left
    const timeStamp = new Date()
      .getTime()
      .toString()
      .slice(0, -3)
    const validationWindow = TimeOutSecs - (timeStamp - item.requestTimeStamp)
    if (validationWindow <= 0) {
      return { registerStar: false, error: 'validation request timed-out' }
    }
    // veriry bitcoin message
    if (!bitcoinMessage.verify(item.message, address, signature)) {
      return { registerStar: false, error: 'message failed verification' }
    }
    // remove timeout
    delete this.timedOutRequests[address]
    // add to valid requests
    const validRequest = {
      registerStar: true,
      status: {
        address: address,
        requestTimeStamp: item.requestTimeStamp,
        message: item.message,
        validationWindow: validationWindow,
        messageSignature: signature
      }
    }
    this.memPoolValid.push(validRequest)
    this.removeRequestValidation(address)
    return validRequest
  }

  verifyAddressRequest (address) {
    return this.memPoolValid.find(req => req.registerStar && req.status.address === address)
  }

  deleteAddressRequest (request) {
    this.memPoolValid = this.memPoolValid.filter(req => req.status.address !== request.status.address &&
      req.status.messageSignature !== request.status.messageSignature)
  }
}

module.exports = { MemPool }
