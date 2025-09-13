import {login} from "../account/login";
import {Router} from "express"; 
import {signup} from "../account/signup";
import { mineCoin } from "../mining-coin/coinMine";
import { getUserByUid } from "../account/getUserbuUid";
import { createStack } from "../stakeCoin/stakeCoins";

const router = Router();
//auths
router.post("/login", login);
router.post("/signup", signup);
// getUserByUid
router.get("/getUserByUid/:uid", getUserByUid);

//coin mining 
router.post("/mining/coin",mineCoin)

//stack coin 
router.post("/stack/coin",createStack);

export default router;