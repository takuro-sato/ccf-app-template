import * as ccfapp from "@microsoft/ccf-app";

// TODO: Fix `any`s
type DepositRequest = any;
type DepositResponse = any;

interface LogItem {
  balance: number;
}

interface LogEntry extends LogItem {
  id: string;
}

// TODO: is this private?
const logMap = ccfapp.typedKv("accounts", ccfapp.string, ccfapp.json<LogItem>());

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
  if (logMap.has(userId))
  {
    balance += logMap.get(userId).balance;
  }

  // Add deposit value to balance
  balance += value;
  

  logMap.set(userId, { balance });

  // DELETE_ME: debug
  // const strUserId = request.params.user_id
  // return { body: { userId, strUserId } };

  return { body: "OK" };

  // DELETE_ME: Just memo
  // return { body: JSON.stringify(request) + "!!!" +  request.params.user_id };
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
  if (logMap.has(userId))
  {
    balance += logMap.get(userId).balance;
  }

  // DELETEME
  // return { body: { balance, userId } };
  return { body: { balance } };
}
