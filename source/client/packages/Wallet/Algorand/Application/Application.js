import {Teal} from '../Teal';

const behavior = {
  callApproval: 0,
  allocateLocalState: 1,
  deallocateLocalState: 2,
  forceDeallocateLocalState: 3,
  update: 4,
  delete: 5
};

class Application {
  static get behavior() {
    return behavior;
  }
  constructor({approvalCode, clearCode, allocation} = {allocation: {}}) {
    this.approvalTeal = new Teal(approvalCode);
    this.clearTeal = new Teal(clearCode);
    this.allocation = allocation;
  }
  async create(behavior) {
    const allocation = {
      global: null,
      local: null
    };
    if (this.allocation.global) {
      allocation.global = {
        nbs: this.allocation.global?.bytes || 0,
        nui: this.allocation.global?.integers || 0
      };
    }
    if (this.allocation.local) {
      allocation.local = {
        nbs: this.allocation.local?.bytes || 0,
        nui: this.allocation.local?.integers || 0
      };
    }

    const payload = {
      type: 'appl',
      appApprovalProgram: await this.approvalTeal.compile(),
      appClearProgram: await this.clearTeal.compile(),
      appGlobalAllocation: allocation.global,
      appLocalAllocation: allocation.local,
      appBehavior: behavior || null
    };

    return payload;
  }
}

export {Application};