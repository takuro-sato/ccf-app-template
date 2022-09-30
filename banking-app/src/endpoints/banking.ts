import * as ccfapp from "@microsoft/ccf-app";

// TODO: Fix `any`s
type DepositRequest = any;
type DepositResponse = any;

interface AccountData {
  balance: number;
}

const accountMap = ccfapp.typedKv("accounts", ccfapp.string, ccfapp.json<AccountData>());

function validateUserId (userId: any): boolean {
  // TODO: Check type
  // TODO: Check if user exists
  return true;
}

export function deposit(
  request: ccfapp.Request<DepositRequest>
): ccfapp.Response<DepositResponse> {
  if (!validateUserId(request.params.user_id)) {
    return {
      statusCode: 404,
    };
  }

  // TODO: Need validate body (e.g. parse failed, is value integer?)
  let body = request.body.json();
  const value = parseInt(body.value);

  const userId = request.params.user_id;

  // TODO: Check if this is the good way to do transaction with read and write
  let balance = 0;
  if (accountMap.has(userId))
  {
    balance += accountMap.get(userId).balance;
  }

  // Add deposit value to balance
  balance += value;
  

  accountMap.set(userId, { balance });

  console.log('Deposit Completed');

  return { body: "OK" };
}

// TODO: Fix `any`s
type BalanceRequest = any;
type BalanceResponse = any;

interface Caller {
  id: string
}

export function balance(
  request: ccfapp.Request<BalanceRequest>
): ccfapp.Response<BalanceResponse> {
  // TODO: Do it in a proper way
  const caller = request.caller as unknown as Caller;
  const userId = caller.id as string;

  // TODO: Duplicated 'Read current balance'
  let balance = 0;
  if (accountMap.has(userId))
  {
    balance += accountMap.get(userId).balance;
  }

  // DELETEME
  // return { body: { balance, userId } };
  return { body: { balance } };
}

// TODO: Fix `any`s
type TransferRequest = any;
type TransferResponse = any;

interface Caller {
  id: string
}

export function transfer(
  request: ccfapp.Request<BalanceRequest>
): ccfapp.Response<BalanceResponse> {

  // TODO: Do it in a proper way
  const caller = request.caller as unknown as Caller;
  const userId = caller.id as string;

  if (!validateUserId(request.params.user_id)) {
    return {
      statusCode: 404,
    };
  }
  const userIdTo = request.params.user_id;

  // TODO: Need validate body (e.g. parse failed, is value integer?)
  let body = request.body.json();
  const value = parseInt(body.value);

  // TODO: Duplicated 'Read current balance'
  let balance = 0;
  if (accountMap.has(userId))
  {
    balance += accountMap.get(userId).balance;
  }

  if (value > balance)
  {
    return { statusCode: 400, body: "Balance is not enough" };
  }

  accountMap.set(userId, { balance: balance - value });

  let balanceTo = 0;
  if (accountMap.has(userIdTo))
  {
    balanceTo += accountMap.get(userIdTo).balance;
  }

  balanceTo += value;

  accountMap.set(userIdTo, { balance: balanceTo });

  console.log('Transfer Completed');

  return { body: "OK" };
}