const TimeOutSecs = 5 * 60;
const TimeoutRequestsWindowTime = TimeOutSecs * 1000;

class MemPool {
  constructor() {
    this.memPool = [];
    this.timedOutRequests = [];
  }

  listPool() {
    return this.memPool;
  }

  removeRequestValidation(address) {
    this.memPool = this.memPool.filter(item => item.walletAddress !== address);
  }

  addRequestValidation(address) {
    const timeStamp = new Date()
      .getTime()
      .toString()
      .slice(0, -3);
    const res = this.memPool.find(elem => elem.walletAddress === address);
    if (res) {
      res.validationWindow = TimeOutSecs - (timeStamp - res.requestTimeStamp);
      return res;
    }
    const req = {
      walletAddress: address,
      requestTimeStamp: timeStamp,
      message: `${address}:${timeStamp}:starRegistry`,
      validationWindow: TimeOutSecs
    };
    this.memPool.push(req);
    this.timedOutRequests.push(
      setTimeout(() => {
        this.removeRequestValidation(address);
      }, TimeoutRequestsWindowTime)
    );
    return req;
  }
}

module.exports = { MemPool };
