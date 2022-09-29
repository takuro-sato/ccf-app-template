import * as ccfapp from "@microsoft/ccf-app";

type DepositRequest = any[];
type DepositResponse = any[];

export function deposit(
  request: ccfapp.Request<DepositRequest>
): ccfapp.Response<DepositResponse> {
  // Example from https://lodash.com.
  let arr = request.body.json();
  return { body: arr.map((n) => n * 2) };
}