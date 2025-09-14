import {login} from "../account/login";
import {Router} from "express"; 
import {signup} from "../account/signup";
import { mineCoin } from "../mining-coin/coinMine";
import { getUserByUid } from "../account/getUserbuUid";
import { createStack } from "../stakeCoin/stakeCoins";
import { getUsers } from "../account/getUsers";
import { getAllTransactions } from "../transactions/getAlltransaction";
import { getAllTransactionsByUser } from "../transactions/getAllTransactionByUser";
import { getTransaction } from "../transactions/getTransaction";
import { sendCoin } from "../coinTransfer/sendCoin";
import userAuth from "../midelwares/userAuth";
import { passwordReset } from "../account/passwordReset";
import { getUserDataByAddress } from "../account/getuserdataByaddress";

const router = Router();
//auths
router.post("/login", login);
router.post("/signup", signup);

// password change 
router.post("/user/password/change", passwordReset);
// getUserByUid
router.get("/getUserByUid/:uid", getUserByUid);
router.get("/getUsersData",getUsers);
router.get("/getUserByAddress/:address",getUserDataByAddress);

//coin mining 
router.post("/mining/coin",userAuth,mineCoin)


// coin transfer
router.post("/transfer/coin",sendCoin);

//stack coin 
router.post("/stack/coin",createStack);

//transacrions
router.get("/transactions",getAllTransactions);
router.get("/transactions/ua/:userAddress",getAllTransactionsByUser);
router.get("/transactions/txh/:transactionHash",getTransaction);

export default router;