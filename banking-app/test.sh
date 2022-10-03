#!/bin/bash

# Run prepare_test.sh in another terminal before running this script

# -------------------------- Infra --------------------------
check_eq() {
    local test_name="$1"
    local expected="$2"
    local actual="$3"
    echo -n "$test_name: "
    if [ "$expected" == "$actual" ]; then
        echo "[Pass]"
    else
        echo "[Fail]: $expected expected, but got $actual"
        exit 1
    fi
}


# -------------------------- Preparation --------------------------

cd workspace/sandbox_common

cert_arg() {
    caller="$1"
    echo "--cacert service_cert.pem --cert ${caller}_cert.pem --key ${caller}_privk.pem"
}

server="https://127.0.0.1:8000"
only_status_code="-s -o /dev/null -w %{http_code}"

user0_id=$(openssl x509 -in "user0_cert.pem" -noout -fingerprint -sha256 | cut -d "=" -f 2 | sed 's/://g' | awk '{print tolower($0)}')
user1_id=$(openssl x509 -in "user1_cert.pem" -noout -fingerprint -sha256 | cut -d "=" -f 2 | sed 's/://g' | awk '{print tolower($0)}')

account_type0='current_account'
account_type1='savings_account'

# -------------------------- Test cases --------------------------
check_eq "Create account: user0" "204" "$(curl $server/app/account/$user0_id/$account_type0 -X PUT $(cert_arg "member0") $only_status_code)"
check_eq "Create account: user1" "204" "$(curl $server/app/account/$user1_id/$account_type1 -X PUT $(cert_arg "member0") $only_status_code)"
check_eq "Deposit: user0, 100" "204" "$(curl $server/app/deposit/$user0_id/$account_type0 -X POST $(cert_arg "member0") -H "Content-Type: application/json" --data-binary '{ "value": 100 }' $only_status_code)"
check_eq "Transfer: 40 from user0 to user1" "204" "$(curl $server/app/transfer/$account_type0 -X POST $(cert_arg "user0") -H "Content-Type: application/json" --data-binary "{ \"value\": 40, \"user_id_to\": \"$user1_id\", \"account_name_to\": \"$account_type1\" }" $only_status_code)"
check_eq "Balance: user0, account_type0" "{\"balance\":60}" "$(curl $server/app/balance/$account_type0 -X GET $(cert_arg "user0") -s)"
check_eq "Balance: user1, account_type1" "{\"balance\":40}" "$(curl $server/app/balance/$account_type1 -X GET $(cert_arg "user1") -s)"

# Test cases for error handling
check_eq "Create account: user0 again" "204" "$(curl $server/app/account/$user0_id/$account_type0 -X PUT $(cert_arg "member0") $only_status_code)"
check_eq "Deposit: invalid value (non integer 1)" "400" "$(curl $server/app/deposit/$user0_id/$account_type0 -X POST $(cert_arg "member0") -H "Content-Type: application/json" --data-binary '{ "value": "abc" }' $only_status_code)"
check_eq "Deposit: invalid value (non integer 2)" "400" "$(curl $server/app/deposit/$user0_id/$account_type0 -X POST $(cert_arg "member0") -H "Content-Type: application/json" --data-binary '{ "value": 100.5 }' $only_status_code)"
check_eq "Deposit: invalid value (zero)" "400" "$(curl $server/app/deposit/$user0_id/$account_type0 -X POST $(cert_arg "member0") -H "Content-Type: application/json" --data-binary '{ "value": 0 }' $only_status_code)"
check_eq "Deposit: invalid value (negative value)" "400" "$(curl $server/app/deposit/$user0_id/$account_type0 -X POST $(cert_arg "member0") -H "Content-Type: application/json" --data-binary '{ "value": -100 }' $only_status_code)"
check_eq "Deposit: user not found" "404" "$(curl $server/app/deposit/non-existing-user/$account_type0 -X POST $(cert_arg "member0") -H "Content-Type: application/json" --data-binary '{ "value": 100 }' $only_status_code)"
check_eq "Deposit: account not found" "404" "$(curl $server/app/deposit/$user0_id/"non-existing-account" -X POST $(cert_arg "member0") -H "Content-Type: application/json" --data-binary '{ "value": 100 }' $only_status_code)"
check_eq "Transfer: not enough balance" "400" "$(curl $server/app/transfer/$account_type0 -X POST $(cert_arg "user0") -H "Content-Type: application/json" --data-binary "{ \"value\": 100000, \"user_id_to\": \"$user1_id\", \"account_name_to\": \"$account_type1\" }" $only_status_code)"
check_eq "Transfer: invalid value (non integer 1)" "400" "$(curl $server/app/transfer/$account_type0 -X POST $(cert_arg "user0") -H "Content-Type: application/json" --data-binary "{ \"value\": "abc", \"user_id_to\": \"$user1_id\", \"account_name_to\": \"$account_type1\" }" $only_status_code)"
check_eq "Transfer: invalid value (non integer 2)" "400" "$(curl $server/app/transfer/$account_type0 -X POST $(cert_arg "user0") -H "Content-Type: application/json" --data-binary "{ \"value\": 100.5, \"user_id_to\": \"$user1_id\", \"account_name_to\": \"$account_type1\" }" $only_status_code)"
check_eq "Transfer: invalid value (zero)" "400" "$(curl $server/app/transfer/$account_type0 -X POST $(cert_arg "user0") -H "Content-Type: application/json" --data-binary "{ \"value\": 0, \"user_id_to\": \"$user1_id\", \"account_name_to\": \"$account_type1\" }" $only_status_code)"
check_eq "Transfer: invalid value (negative value)" "400" "$(curl $server/app/transfer/$account_type0 -X POST $(cert_arg "user0") -H "Content-Type: application/json" --data-binary "{ \"value\": -100, \"user_id_to\": \"$user1_id\", \"account_name_to\": \"$account_type1\" }" $only_status_code)"
check_eq "Transfer: account not found" "404" "$(curl $server/app/transfer/non-existing-account -X POST $(cert_arg "user0") -H "Content-Type: application/json" --data-binary "{ \"value\": 40, \"user_id_to\": \"$user1_id\", \"account_name_to\": \"$account_type1\" }" $only_status_code)"
check_eq "Transfer: userTo not found" "404" "$(curl $server/app/transfer/$account_type0 -X POST $(cert_arg "user0") -H "Content-Type: application/json" --data-binary "{ \"value\": 40, \"user_id_to\": \"non-existing-user\", \"account_name_to\": \"$account_type1\" }" $only_status_code)"
check_eq "Transfer: accountTo not found" "404" "$(curl $server/app/transfer/$account_type0 -X POST $(cert_arg "user0") -H "Content-Type: application/json" --data-binary "{ \"value\": 40, \"user_id_to\": \"$user1_id\", \"account_name_to\": \"non-existing-account\" }" $only_status_code)"
check_eq "Balance: account not found" "404" "$(curl $server/app/balance/non-existing-account -X GET $(cert_arg "user0") $only_status_code)"

echo "OK"
exit 0