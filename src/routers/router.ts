import {login} from "../account/login";
import {Router} from "express"; 
import {signup} from "../account/signup";
import { mineCoin } from "../mining-coin/coinMine";
import { getUserByUid } from "../account/getUserbuUid";
import { createStack } from "../stakeCoin/stakeCoins";
import { getUsers } from "../account/getUsers";

const router = Router();
//auths
router.post("/login", login);
router.post("/signup", signup);
// getUserByUid
router.get("/getUserByUid/:uid", getUserByUid);
router.get("/getUsersData",getUsers);

//coin mining 
router.post("/mining/coin",mineCoin)

//stack coin 
router.post("/stack/coin",createStack);

export default router;