import * as ccfapp from "@microsoft/ccf-app";

function validateUserId (userId: string): boolean {
  // TODO: Check if user exists
  return true;
}

function validateAccountName (accountName: string): boolean {
  // TODO: Check if it's valid name
  return true;
}


// TODO: Fix `any`s
type CreateAccountRequest = any;
type CreateAccountResponse = any;

export function createAccount(
  request: ccfapp.Request<CreateAccountRequest>
): ccfapp.Response<CreateAccountResponse> {
  const userId = request.params.user_id;
  if (!validateUserId(userId)) {
    return {
      statusCode: 404
    };
  }

  const accountToBalance = ccfapp.typedKv(`user_accounts:${userId}`, ccfapp.string, ccfapp.uint32);

  const accountName = request.params.account_name;
  if (!validateAccountName(request.params.account_name)) {
    return {
      statusCode: 400
    };
  }

  if (accountToBalance.has(accountName)) {
    // Nothing to do
    return { body: "OK" };
  }

  // Initial balance should be 0.
  accountToBalance.set(accountName, 0);

  console.log('Create Account Completed');

  return { body: "OK" };
}

// TODO: Fix `any`s
type DepositRequest = any;
type DepositResponse = any;

export function deposit(
  request: ccfapp.Request<DepositRequest>
): ccfapp.Response<DepositResponse> {
  // TODO: Need to validate body (e.g. parse failed, is value integer?)
  const body = request.body.json();

  const userId = request.params.user_id;
  if (!validateUserId(userId)) {
    return {
      statusCode: 404
    };
  }

  const accountName = request.params.account_name;
  if (!validateAccountName(accountName)) {
    return {
      statusCode: 400
    };
  }

  const value = parseInt(body.value);

  const accountToBalance = ccfapp.typedKv(`user_accounts:${userId}`, ccfapp.string, ccfapp.uint32);

  if (!accountToBalance.has(accountName)) {
    return { statusCode: 404 }; 
  }

  accountToBalance.set(accountName, accountToBalance.get(accountName) + value);

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

  const accountName = request.params.account_name;
  if (!validateAccountName(accountName)) {
    return {
      statusCode: 400
    };
  }

  // TODO: Duplicated
  const accountToBalance = ccfapp.typedKv(`user_accounts:${userId}`, ccfapp.string, ccfapp.uint32);

  if (!accountToBalance.has(accountName)) {
    return { statusCode: 404 }; 
  }

  return { body: { balance: accountToBalance.get(accountName) } };
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
  // TODO: Need to validate body (e.g. parse failed, is value integer?)
  const body = request.body.json();

  // TODO: Do it in a proper way
  const caller = request.caller as unknown as Caller;
  const userId = caller.id as string;

  const accountName = request.params.account_name;
  if (!validateAccountName(accountName)) {
    return {
      statusCode: 400
    };
  }
  
  const value = parseInt(body.value);

  const accountNameTo = body.account_name_to;

  const userIdTo = body.user_id_to;

  if (!validateUserId(userIdTo)) {
    return {
      statusCode: 404
    };
  }

  // TODO: Duplicated
  const accountToBalance = ccfapp.typedKv(`user_accounts:${userId}`, ccfapp.string, ccfapp.uint32);

  if (!accountToBalance.has(accountName)) {
    return { statusCode: 404 }; 
  }

  // TODO: Duplicated 'Read current balance'
  const balance = accountToBalance.get(accountName);

  if (value > balance)
  {
    return { statusCode: 400, body: "Balance is not enough" };
  }

  accountToBalance.set(accountName, balance - value);

  const accountToBalanceTo = ccfapp.typedKv(`user_accounts:${userIdTo}`, ccfapp.string, ccfapp.uint32);

  if (!accountToBalanceTo.has(accountNameTo)) {
    return { statusCode: 404 }; 
  }

  accountToBalanceTo.set(accountNameTo, accountToBalanceTo.get(accountNameTo) + value);

  console.log('Transfer Completed');

  return { body: "OK" };
}
