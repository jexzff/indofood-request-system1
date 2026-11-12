export const lines = Array.from(
  { length: 11 },
  (_, index) => ({
    id: index + 16,
    status: 'idle',
    request: 0,
    shift: 1,
  })
)

export const dummyRequests = [
  {
    id: 1,
    request_number: 'REQ-0001',
    line: 20,
    shift: 2,
    item_name: 'Bumbu',
    quantity: 10,
    actual: null,
    operator: 'Operator Line 20',
    priority: 'normal',
    status: 'request',
    description: '',
  },
]

export const dummyReturns = [
  {
    id: 1,
    return_number: 'RET-0001',
    line: 23,
    shift: 1,
    item_name: 'Minyak',
    quantity: 5,
    actual: null,
    operator: 'Operator Line 23',
    status: 'return',
    description: '',
  },
]