import * as ccfapp from "@microsoft/ccf-app";

type DoubleRequest = any[];
type DoubleResponse = any[];

export function double(
  request: ccfapp.Request<DoubleRequest>
): ccfapp.Response<DoubleResponse> {
  // Example from https://lodash.com.
  let arr = request.body.json();
  return { body: arr.map((n) => n * 2) };
}
